<?php

namespace App\Services\Scans\Contracts;

use App\Models\Scan;
use App\Services\Scans\DTO\ScanResult;

interface ScannerInterface
{
    /**
     * Determine if this scanner supports the given scan type.
     */
    public function supports(string $scanType): bool;

    /**
     * Execute the scan and return a structured ScanResult DTO.
     */
    public function scan(Scan $scan): ScanResult;
}
