<?php

namespace App\Services\Scans;

use App\Models\Report;
use App\Models\Scan;
use App\Models\ScanStep;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Throwable;

class ScanService
{
    private const WORKFLOW_STEPS = [
        'Queued for analysis',
        'Preparing scanner context',
        'Running simulated threat checks',
        'Generating report',
    ];

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

    public function listUserScans(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $user->scans()
            ->with('report')
            ->latest()
            ->paginate($perPage);
    }

    public function findUserScan(User $user, int|string $scanId): ?Scan
    {
        return $user->scans()
            ->with(['steps', 'events', 'report'])
            ->find($scanId);
    }

    public function findUserScanStatus(User $user, int|string $scanId): ?Scan
    {
        return $user->scans()
            ->with('steps')
            ->find($scanId);
    }

    public function processScan(int $scanId): ?Scan
    {
        $scan = Scan::query()->with('steps')->find($scanId);

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
                    'workflow' => 'simulated',
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
                    'message' => 'Processing simulated scanner step.',
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
                    'message' => 'Step completed by simulated workflow.',
                ]);
            }

            $riskScore = $this->simulatedRiskScore($scan);
            $riskLevel = $this->riskLevelFromScore($riskScore);

            Report::query()->updateOrCreate(
                ['scan_id' => $scan->id],
                [
                    'user_id' => $scan->user_id,
                    'title' => 'Cyber Guardian AI '.$scan->scan_type.' scan report',
                    'summary' => 'Initial simulated scan workflow completed. External scanner and AI integrations are not connected yet.',
                    'risk_score' => $riskScore,
                    'report_data' => [
                        'workflow' => 'simulated',
                        'schema_version' => 1,
                        'external_integrations_enabled' => false,
                    ],
                ]
            );

            $scan->update([
                'status' => Scan::STATUS_COMPLETED,
                'risk_level' => $riskLevel,
                'completed_at' => now(),
            ]);

            $scan->events()->create([
                'event_type' => 'scan.completed',
                'event_data' => [
                    'risk_score' => $riskScore,
                    'risk_level' => $riskLevel,
                ],
            ]);

            return $scan->refresh()->load(['steps', 'events', 'report']);
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
