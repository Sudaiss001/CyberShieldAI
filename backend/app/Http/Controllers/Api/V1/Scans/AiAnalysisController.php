<?php

namespace App\Http\Controllers\Api\V1\Scans;

use App\Http\Controllers\Controller;
use App\Http\Resources\AiRequestResource;
use App\Http\Resources\ScanResource;
use App\Models\User;
use App\Services\AI\AiAnalysisService;
use App\Services\AI\Exceptions\AiAnalysisException;
use App\Services\Scans\ScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAnalysisController extends Controller
{
    public function __construct(
        private readonly ScanService $scanService,
        private readonly AiAnalysisService $aiAnalysisService
    ) {
    }

    public function store(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScan($user, $id);

        if (! $scan) {
            return $this->error('Scan not found.', [], 404);
        }

        try {
            $result = $this->aiAnalysisService->requestAnalysis($user, $scan);
        } catch (AiAnalysisException $exception) {
            return $this->error($exception->getMessage(), [], 422);
        }

        $aiRequest = $result['ai_request'];
        $created = (bool) $result['created'];

        return $this->success([
            'ai_request' => new AiRequestResource($aiRequest),
            'scan' => new ScanResource($scan->refresh()->load([
                'steps',
                'events',
                'report.indicators',
                'report.evidence',
                'report.recommendations',
                'report.tags',
            ])),
            'already_exists' => ! $created,
        ], $created ? 'Gemma AI analysis queued.' : 'Existing Gemma AI analysis returned.', $created ? 202 : 200);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScan($user, $id);

        if (! $scan) {
            return $this->error('Scan not found.', [], 404);
        }

        $aiRequest = $this->aiAnalysisService->getExistingAnalysis($user, $scan);

        if (! $aiRequest) {
            return $this->error('Gemma AI analysis not found for this scan.', [], 404);
        }

        return $this->success([
            'ai_request' => new AiRequestResource($aiRequest),
        ], 'Gemma AI analysis retrieved.');
    }
}
