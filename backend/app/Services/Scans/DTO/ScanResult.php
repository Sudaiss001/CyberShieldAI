<?php

namespace App\Services\Scans\DTO;

class ScanResult
{
    public function __construct(
        public readonly int $riskScore,
        public readonly string $riskLevel,
        public readonly string $title,
        public readonly string $summary,
        public readonly array $reportData = [],
        public readonly array $indicators = [],
        public readonly array $evidence = [],
        public readonly array $recommendations = [],
        public readonly array $tags = []
    ) {
    }

    public static function create(
        int $riskScore,
        string $riskLevel,
        string $title,
        string $summary,
        array $reportData = [],
        array $indicators = [],
        array $evidence = [],
        array $recommendations = [],
        array $tags = []
    ): self {
        return new self(
            riskScore: min(100, max(0, $riskScore)),
            riskLevel: $riskLevel,
            title: $title,
            summary: $summary,
            reportData: $reportData,
            indicators: $indicators,
            evidence: $evidence,
            recommendations: $recommendations,
            tags: $tags
        );
    }
}
