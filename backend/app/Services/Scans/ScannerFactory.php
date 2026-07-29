<?php

namespace App\Services\Scans;

use App\Models\Scan;
use App\Services\Scans\Contracts\ScannerInterface;
use App\Services\Scans\Scanners\UrlScannerService;
use InvalidArgumentException;

class ScannerFactory
{
    /**
     * List of registered scanner implementations.
     *
     * @var array<class-string<ScannerInterface>>
     */
    private array $scanners = [
        UrlScannerService::class,
        \App\Services\Scans\EmailScannerService::class,
    ];

    /**
     * Resolve the appropriate scanner instance for the scan type.
     */
    public function getScanner(string $scanType): ScannerInterface
    {
        $normalizedType = strtolower($scanType);

        foreach ($this->scanners as $scannerClass) {
            /** @var ScannerInterface $scanner */
            $scanner = app($scannerClass);
            if ($scanner->supports($normalizedType)) {
                return $scanner;
            }
        }

        // Fallback for types not yet integrated with dedicated engines
        if (in_array($normalizedType, [
            Scan::TYPE_AI,
            Scan::TYPE_EMAIL,
            Scan::TYPE_IMAGE,
            Scan::TYPE_DOCUMENT,
            Scan::TYPE_AUDIO,
            Scan::TYPE_VIDEO,
            Scan::TYPE_QR,
        ], true)) {
            // For now, if a scanner type does not have a dedicated scanner registered yet,
            // return UrlScannerService or fallback gracefully.
            return app(UrlScannerService::class);
        }

        throw new InvalidArgumentException("No scanner registered for scan type: {$scanType}");
    }
}
