<?php

namespace App\Services\AI\Contracts;

interface AiProviderInterface
{
    public function modelName(): string;

    public function buildPrompt(array $scannerFindings): string;

    public function analyze(string $prompt): array;
}
