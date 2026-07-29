<?php

namespace App\Services\Scans;

use App\Models\Report;
use App\Models\Scan;
use App\Models\ScanStep;
use App\Models\User;
use App\Services\Scans\Contracts\ScannerInterface;
use App\Services\Scans\DTO\ScanResult;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class ScanService
{
    private const WORKFLOW_STEPS = [
        'Queued for analysis',
        'Preparing scanner context',
        'Running simulated threat checks',
        'Generating report',
    ];

    public function __construct(private readonly ScannerFactory $scannerFactory)
    {
    }

    public function createScan(User $user, array $data): Scan
    {
        return DB::transaction(function () use ($user, $data): Scan {
            $scan = $user->scans()->create([
                'scan_type' => $data['scan_type'],
                'target' => $data['target'],
                'status' => Scan::STATUS_QUEUED,
                'risk_level' => null,
                'started_at' => null,
                'completed_at' => null,
            ]);

            $this->createWorkflowSteps($scan);

            $scan->events()->create([
                'event_type' => 'scan.created',
                'event_data' => [
                    'scan_type' => $scan->scan_type,
                    'target' => $scan->target,
                ],
            ]);

            return $scan->load(['steps', 'events']);
        });
    }

    public function createEmailScan(User $user, array $input): Scan
    {
        return DB::transaction(function () use ($user, $input): Scan {
            $scan = $user->scans()->create([
                'scan_type' => Scan::TYPE_EMAIL,
                'target' => $input['target'],
                'status' => Scan::STATUS_QUEUED,
                'risk_level' => null,
                'started_at' => null,
                'completed_at' => null,
            ]);

            $this->createWorkflowSteps($scan);

            $path = 'scans/'.$scan->id.'/email-source-'.substr((string) $input['hash'], 0, 12).'.eml';

            if (! Storage::disk('local')->put($path, $input['content'])) {
                throw new RuntimeException('Unable to store email source for scanning.');
            }

            $scan->files()->create([
                'file_name' => $input['file_name'],
                'file_path' => $path,
                'mime_type' => $input['mime_type'],
                'file_size' => $input['file_size'],
                'hash' => $input['hash'],
            ]);

            $scan->events()->create([
                'event_type' => 'scan.created',
                'event_data' => [
                    'scan_type' => $scan->scan_type,
                    'target' => $scan->target,
                    'email_source_type' => $input['source_type'],
                    'file_name' => $input['file_name'],
                    'hash' => $input['hash'],
                ],
            ]);

            return $scan->load(['files', 'steps', 'events']);
        });
    }

    public function listUserScans(User $user, int $perPage = 15, ?string $scanType = null): LengthAwarePaginator
    {
        return $user->scans()
            ->with('report')
            ->when($scanType !== null, fn ($query) => $query->where('scan_type', $scanType))
            ->latest()
            ->paginate($perPage);
    }

    public function findUserScan(User $user, int|string $scanId, ?string $scanType = null): ?Scan
    {
        return $user->scans()
            ->with([
                'steps',
                'events',
                'report.indicators',
                'report.evidence',
                'report.recommendations',
                'report.tags',
            ])
            ->when($scanType !== null, fn ($query) => $query->where('scan_type', $scanType))
            ->find($scanId);
    }

    public function findUserScanStatus(User $user, int|string $scanId, ?string $scanType = null): ?Scan
    {
        return $user->scans()
            ->with('steps')
            ->when($scanType !== null, fn ($query) => $query->where('scan_type', $scanType))
            ->find($scanId);
    }

    public function processScan(int $scanId): ?Scan
    {
        $scan = Scan::query()->with(['steps', 'files', 'events'])->find($scanId);

        if (! $scan) {
            return null;
        }

        try {
            $scan->update([
                'status' => Scan::STATUS_PROCESSING,
                'started_at' => $scan->started_at ?? now(),
            ]);

            $scan->events()->create([
                'event_type' => 'scan.processing_started',
                'event_data' => [
                    'workflow' => $this->scannerFactory->getScanner($scan->scan_type) ? $scan->scan_type.'_scanner' : 'simulated',
                ],
            ]);

            if ($scan->steps->isEmpty()) {
                $this->createWorkflowSteps($scan);
                $scan->load('steps');
            }

            foreach ($scan->steps as $step) {
                $step->update([
                    'status' => ScanStep::STATUS_RUNNING,
                    'progress' => 50,
                    'message' => 'Processing scanner step.',
                ]);

                $scan->events()->create([
                    'event_type' => 'scan.step_running',
                    'event_data' => [
                        'step_name' => $step->step_name,
                    ],
                ]);

                $step->update([
                    'status' => ScanStep::STATUS_COMPLETED,
                    'progress' => 100,
                    'message' => 'Step completed.',
                ]);
            }

            $scanResult = $this->runScanner($scan);
            $this->persistScanResult($scan, $scanResult);

            $scan->update([
                'status' => Scan::STATUS_COMPLETED,
                'risk_level' => $scanResult->riskLevel,
                'completed_at' => now(),
            ]);

            $scan->events()->create([
                'event_type' => 'scan.completed',
                'event_data' => [
                    'risk_score' => $scanResult->riskScore,
                    'risk_level' => $scanResult->riskLevel,
                ],
            ]);

            return $scan->refresh()->load([
                'steps',
                'events',
                'files',
                'report.indicators',
                'report.evidence',
                'report.recommendations',
                'report.tags',
            ]);
        } catch (Throwable $exception) {
            $scan->update([
                'status' => Scan::STATUS_FAILED,
                'completed_at' => now(),
            ]);

            $scan->events()->create([
                'event_type' => 'scan.failed',
                'event_data' => [
                    'message' => $exception->getMessage(),
                ],
            ]);

            throw $exception;
        }
    }

    private function runScanner(Scan $scan): ScanResult
    {
        return $this->scannerFactory->getScanner($scan->scan_type)->scan($scan);
    }

    private function persistScanResult(Scan $scan, ScanResult $scanResult): Report
    {
        $report = Report::query()->updateOrCreate(
            ['scan_id' => $scan->id],
            [
                'user_id' => $scan->user_id,
                'title' => $scanResult->title,
                'summary' => $scanResult->summary,
                'risk_score' => $scanResult->riskScore,
                'report_data' => $scanResult->reportData,
            ]
        );

        $report->indicators()->delete();
        $report->evidence()->delete();
        $report->recommendations()->delete();
        $report->tags()->delete();

        foreach ($scanResult->indicators as $indicator) {
            $report->indicators()->create([
                'label' => (string) ($indicator['label'] ?? 'Indicator'),
                'value' => isset($indicator['value']) ? (string) $indicator['value'] : null,
                'severity' => (string) ($indicator['severity'] ?? 'info'),
            ]);
        }

        foreach ($scanResult->evidence as $evidence) {
            $report->evidence()->create([
                'title' => (string) ($evidence['title'] ?? 'Evidence'),
                'description' => $evidence['description'] ?? null,
                'snippet' => $evidence['snippet'] ?? null,
                'severity' => (string) ($evidence['severity'] ?? 'info'),
                'metadata' => $evidence['metadata'] ?? null,
            ]);
        }

        foreach ($scanResult->recommendations as $index => $recommendation) {
            $report->recommendations()->create([
                'recommendation' => is_array($recommendation)
                    ? (string) ($recommendation['recommendation'] ?? $recommendation['text'] ?? 'Review scan findings.')
                    : (string) $recommendation,
                'sort_order' => is_array($recommendation)
                    ? (int) ($recommendation['sort_order'] ?? $index)
                    : $index,
            ]);
        }

        foreach (array_unique($scanResult->tags) as $tag) {
            $report->tags()->create([
                'tag' => (string) $tag,
            ]);
        }

        return $report;
    }

    private function createWorkflowSteps(Scan $scan): void
    {
        foreach (self::WORKFLOW_STEPS as $stepName) {
            $scan->steps()->create([
                'step_name' => $stepName,
                'status' => ScanStep::STATUS_PENDING,
                'progress' => 0,
                'message' => null,
            ]);
        }
    }

    private function simulatedScanResult(Scan $scan): ScanResult
    {
        $riskScore = $this->simulatedRiskScore($scan);
        $riskLevel = $this->riskLevelFromScore($riskScore);

        return ScanResult::create(
            riskScore: $riskScore,
            riskLevel: $riskLevel,
            title: 'Cyber Guardian AI '.$scan->scan_type.' scan report',
            summary: 'Initial simulated scan workflow completed. External scanner and AI integrations are not connected yet.',
            reportData: [
                'workflow' => 'simulated',
                'schema_version' => 1,
                'external_integrations_enabled' => false,
            ]
        );
    }

    private function simulatedRiskScore(Scan $scan): int
    {
        return hexdec(substr(hash('sha256', $scan->scan_type.'|'.$scan->target), 0, 8)) % 101;
    }

    private function riskLevelFromScore(int $riskScore): string
    {
        return match (true) {
            $riskScore >= 85 => Scan::RISK_CRITICAL,
            $riskScore >= 65 => Scan::RISK_HIGH,
            $riskScore >= 40 => Scan::RISK_MEDIUM,
            $riskScore >= 15 => Scan::RISK_LOW,
            default => Scan::RISK_SAFE,
        };
    }
}
