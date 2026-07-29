<?php

namespace App\Jobs;

use App\Services\AI\AiAnalysisService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessAiAnalysisJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $aiRequestId)
    {
    }

    public function handle(AiAnalysisService $aiAnalysisService): void
    {
        $aiAnalysisService->processAiRequest($this->aiRequestId);
    }
}
