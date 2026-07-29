<?php

namespace App\Services\AI;

use App\Jobs\ProcessAiAnalysisJob;
use App\Models\AiRequest;
use App\Models\Report;
use App\Models\Scan;
use App\Models\User;
use App\Services\AI\Contracts\AiProviderInterface;
use App\Services\AI\Exceptions\AiAnalysisException;
use App\Services\AI\Exceptions\AiProviderException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiAnalysisService
{
    public function __construct(private readonly AiProviderInterface $aiProvider)
    {
    }

    public function requestAnalysis(User $user, Scan $scan): array
    {
        $scan->loadMissing([
            'report.indicators',
            'report.evidence',
            'report.recommendations',
            'report.tags',
            'events',
            'files',
        ]);

        if ($scan->status !== Scan::STATUS_COMPLETED) {
            throw new AiAnalysisException('Gemma AI analysis requires a completed scan.');
        }

        if (! $scan->report) {
            throw new AiAnalysisException('Gemma AI analysis requires an existing scanner report.');
        }

        $result = DB::transaction(function () use ($user, $scan): array {
            $lockedScan = Scan::query()
                ->whereKey($scan->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedScan->load([
                'report.indicators',
                'report.evidence',
                'report.recommendations',
                'report.tags',
                'events',
                'files',
            ]);

            if ($lockedScan->status !== Scan::STATUS_COMPLETED) {
                throw new AiAnalysisException('Gemma AI analysis requires a completed scan.');
            }

            if (! $lockedScan->report) {
                throw new AiAnalysisException('Gemma AI analysis requires an existing scanner report.');
            }

            $existing = $this->activeOrCompletedRequest($lockedScan);

            if ($existing) {
                return [
                    'ai_request' => $existing,
                    'created' => false,
                ];
            }

            $findings = $this->collectScannerFindings($lockedScan);
            $prompt = $this->sanitizePrompt($this->aiProvider->buildPrompt($findings));

            return [
                'ai_request' => AiRequest::query()->create([
                    'user_id' => $user->id,
                    'scan_id' => $lockedScan->id,
                    'model_name' => $this->aiProvider->modelName(),
                    'prompt' => $prompt,
                    'response' => null,
                    'status' => AiRequest::STATUS_PENDING,
                    'processing_time' => null,
                ]),
                'created' => true,
            ];
        });

        if ($result['created']) {
            ProcessAiAnalysisJob::dispatch($result['ai_request']->id);
        }

        return [
            'ai_request' => $result['ai_request']->refresh(),
            'created' => $result['created'],
        ];
    }

    public function getExistingAnalysis(User $user, Scan $scan): ?AiRequest
    {
        return $scan->aiRequests()
            ->where('user_id', $user->id)
            ->latest()
            ->first();
    }

    public function processAiRequest(int $aiRequestId): ?AiRequest
    {
        $aiRequest = AiRequest::query()
            ->with([
                'scan.report.indicators',
                'scan.report.evidence',
                'scan.report.recommendations',
                'scan.report.tags',
                'scan.events',
                'scan.files',
            ])
            ->find($aiRequestId);

        if (! $aiRequest) {
            return null;
        }

        if ($aiRequest->status === AiRequest::STATUS_COMPLETED) {
            return $aiRequest;
        }

        $startedAt = microtime(true);
        $aiRequest->update(['status' => AiRequest::STATUS_PROCESSING]);

        Log::info('AI analysis job started.', [
            'ai_request_id' => $aiRequest->id,
            'scan_id' => $aiRequest->scan_id,
            'model' => $aiRequest->model_name,
        ]);

        try {
            $providerResponse = $this->aiProvider->analyze($aiRequest->prompt);
            $processingTime = round(microtime(true) - $startedAt, 3);

            $aiRequest->update([
                'response' => $this->sanitizeResponse($providerResponse),
                'status' => AiRequest::STATUS_COMPLETED,
                'processing_time' => $providerResponse['provider_metadata']['processing_time'] ?? $processingTime,
            ]);

            $this->enhanceReport($aiRequest->refresh());

            $aiRequest->scan?->events()->create([
                'event_type' => 'scan.ai_analysis_completed',
                'event_data' => [
                    'ai_request_id' => $aiRequest->id,
                    'model_name' => $aiRequest->model_name,
                    'processing_time' => $aiRequest->processing_time,
                ],
            ]);

            Log::info('AI analysis job completed.', [
                'ai_request_id' => $aiRequest->id,
                'scan_id' => $aiRequest->scan_id,
                'model' => $aiRequest->model_name,
                'processing_time' => $aiRequest->processing_time,
            ]);
        } catch (AiProviderException $exception) {
            $aiRequest->update([
                'response' => [
                    'error' => $this->safeErrorMessage($exception->getMessage()),
                ],
                'status' => AiRequest::STATUS_FAILED,
                'processing_time' => round(microtime(true) - $startedAt, 3),
            ]);

            $aiRequest->scan?->events()->create([
                'event_type' => 'scan.ai_analysis_failed',
                'event_data' => [
                    'ai_request_id' => $aiRequest->id,
                    'model_name' => $aiRequest->model_name,
                    'message' => $this->safeErrorMessage($exception->getMessage()),
                ],
            ]);

            Log::warning('AI analysis job failed.', [
                'ai_request_id' => $aiRequest->id,
                'scan_id' => $aiRequest->scan_id,
                'model' => $aiRequest->model_name,
                'message' => $this->safeErrorMessage($exception->getMessage()),
            ]);
        }

        return $aiRequest->refresh();
    }

    private function activeOrCompletedRequest(Scan $scan): ?AiRequest
    {
        return $scan->aiRequests()
            ->whereIn('status', [
                AiRequest::STATUS_PENDING,
                AiRequest::STATUS_PROCESSING,
                AiRequest::STATUS_COMPLETED,
            ])
            ->latest()
            ->first();
    }

    private function collectScannerFindings(Scan $scan): array
    {
        $report = $scan->report;
        $indicators = $report ? $report->indicators->map(fn ($indicator): array => [
            'label' => $indicator->label,
            'value' => $indicator->value,
            'severity' => $indicator->severity,
        ])->values()->all() : [];
        $evidence = $report ? $report->evidence->map(fn ($evidence): array => [
            'title' => $evidence->title,
            'description' => $evidence->description,
            'snippet' => $evidence->snippet,
            'severity' => $evidence->severity,
            'metadata' => $evidence->metadata,
        ])->values()->all() : [];
        $recommendations = $report ? $report->recommendations->map(fn ($recommendation): array => [
            'recommendation' => $recommendation->recommendation,
            'sort_order' => $recommendation->sort_order,
        ])->values()->all() : [];
        $tags = $report ? $report->tags->pluck('tag')->values()->all() : [];

        return $this->compactForPrompt([
            'scan' => [
                'id' => $scan->id,
                'type' => $scan->scan_type,
                'target' => $scan->target,
                'status' => $scan->status,
                'risk_level' => $scan->risk_level,
                'created_at' => $scan->created_at?->toISOString(),
                'completed_at' => $scan->completed_at?->toISOString(),
            ],
            'files' => $scan->files->map(fn ($file): array => [
                'file_name' => $file->file_name,
                'mime_type' => $file->mime_type,
                'file_size' => $file->file_size,
                'sha256' => $file->hash,
            ])->values()->all(),
            'scanner_report' => [
                'title' => $report?->title,
                'summary' => $report?->summary,
                'risk_score' => $report?->risk_score,
                'report_data' => $report?->report_data,
                'indicators' => $indicators,
                'evidence' => $evidence,
                'recommendations' => $recommendations,
                'tags' => $tags,
            ],
        ]);
    }

    private function compactForPrompt(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map(fn (mixed $item): mixed => $this->compactForPrompt($item), $value);
        }

        if (is_string($value)) {
            return Str::limit($this->sanitizePrompt($value), 1800, '... [TRUNCATED]');
        }

        return $value;
    }

    private function enhanceReport(AiRequest $aiRequest): void
    {
        $aiRequest->loadMissing('scan.report');
        $scan = $aiRequest->scan;
        $report = $scan?->report;

        if (! $scan || ! $report) {
            return;
        }

        $analysis = $aiRequest->response['analysis'] ?? null;

        if (! is_array($analysis)) {
            return;
        }

        $originalReportData = $report->report_data ?? [];
        $originalReportData['ai_analysis'] = [
            'ai_request_id' => $aiRequest->id,
            'provider' => $aiRequest->response['provider'] ?? 'gemma',
            'model_name' => $aiRequest->model_name,
            'generated_at' => now()->toISOString(),
            'scanner_risk_score' => $report->risk_score,
            'scanner_risk_level' => $scan->risk_level,
            'analysis' => $analysis,
        ];

        DB::transaction(function () use ($report, $scan, $analysis, $originalReportData): void {
            $report->update([
                'summary' => $analysis['security_summary'],
                'risk_score' => (int) $analysis['improved_risk_score'],
                'report_data' => $originalReportData,
            ]);

            $scan->update([
                'risk_level' => $analysis['risk_level'],
            ]);

            $this->appendAiReportDetails($report, $analysis);
        });
    }

    private function appendAiReportDetails(Report $report, array $analysis): void
    {
        $report->indicators()->create([
            'label' => 'Gemma Threat Category',
            'value' => $analysis['threat_category'],
            'severity' => $analysis['risk_level'],
        ]);

        $report->indicators()->create([
            'label' => 'Gemma Confidence',
            'value' => $analysis['confidence_score'].'/100',
            'severity' => 'info',
        ]);

        foreach ($analysis['indicators_of_compromise'] as $ioc) {
            $report->evidence()->create([
                'title' => 'Gemma Indicator of Compromise',
                'description' => $analysis['threat_explanation'],
                'snippet' => $ioc,
                'severity' => $analysis['risk_level'],
                'metadata' => ['source' => 'gemma_ai'],
            ]);
        }

        foreach ($analysis['possible_attack_techniques'] as $technique) {
            $report->evidence()->create([
                'title' => 'Gemma Attack Technique',
                'description' => $technique,
                'snippet' => null,
                'severity' => $analysis['risk_level'],
                'metadata' => ['source' => 'gemma_ai'],
            ]);
        }

        $startOrder = (int) ($report->recommendations()->max('sort_order') ?? 0) + 1;
        $recommendations = array_merge(
            $analysis['security_recommendations'],
            $analysis['immediate_actions'],
            $analysis['long_term_mitigation_steps']
        );

        foreach (array_values(array_unique($recommendations)) as $index => $recommendation) {
            $report->recommendations()->create([
                'recommendation' => $recommendation,
                'sort_order' => $startOrder + $index,
            ]);
        }

        foreach ([
            'ai-enhanced',
            'gemma',
            'threat-'.Str::slug((string) $analysis['threat_category']),
            'risk-'.$analysis['risk_level'],
        ] as $tag) {
            $report->tags()->firstOrCreate(['tag' => $tag]);
        }
    }

    private function sanitizeResponse(array $response): array
    {
        return $this->sanitizeArray($response);
    }

    private function sanitizeArray(array $value): array
    {
        $sanitized = [];

        foreach ($value as $key => $item) {
            if (is_string($key) && preg_match('/api[_-]?key|authorization|bearer|secret|token/i', $key) === 1) {
                $sanitized[$key] = '[REDACTED]';
                continue;
            }

            if (is_array($item)) {
                $sanitized[$key] = $this->sanitizeArray($item);
                continue;
            }

            $sanitized[$key] = is_string($item) ? $this->sanitizePrompt($item) : $item;
        }

        return $sanitized;
    }

    private function sanitizePrompt(string $value): string
    {
        $apiKey = (string) config('services.gemma.key');

        if ($apiKey !== '') {
            $value = str_replace($apiKey, '[REDACTED]', $value);
        }

        return preg_replace(
            '/\b(api[_-]?key|authorization|bearer|secret|token)\b\s*[:=]\s*[A-Za-z0-9._\-]+/i',
            '$1=[REDACTED]',
            $value
        ) ?? $value;
    }

    private function safeErrorMessage(string $message): string
    {
        return Str::limit($this->sanitizePrompt($message), 500);
    }
}
