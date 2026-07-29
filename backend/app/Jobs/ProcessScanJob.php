<?php

namespace App\Jobs;

use App\Services\Scans\ScanService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessScanJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $scanId)
    {
    }

    public function handle(ScanService $scanService): void
    {
        $scanService->processScan($this->scanId);
    }
}
