<?php

namespace App\Services\AI;

use App\Models\Scan;
use App\Services\AI\Contracts\AiProviderInterface;
use App\Services\AI\Exceptions\AiProviderException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GemmaService implements AiProviderInterface
{
    private const REQUIRED_FIELDS = [
        'security_summary',
        'threat_explanation',
        'threat_category',
        'risk_level',
        'improved_risk_score',
        'indicators_of_compromise',
        'possible_attack_techniques',
        'security_recommendations',
        'immediate_actions',
        'long_term_mitigation_steps',
        'confidence_score',
    ];

    public function modelName(): string
    {
        return (string) config('services.gemma.model', 'gemma-3-27b-it');
    }

    public function buildPrompt(array $scannerFindings): string
    {
        $findingsJson = json_encode(
            $this->sanitizeForStorage($scannerFindings),
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );

        if (! is_string($findingsJson)) {
            throw new AiProviderException('Unable to build Gemma prompt from scanner findings.');
        }

        $findingsJson = Str::limit($findingsJson, $this->maxPromptCharacters(), '... [TRUNCATED]');

        return implode("\n", [
            'You are Gemma AI acting as a cybersecurity analyst for Cyber Guardian AI.',
            'Analyze the scanner findings and return ONLY valid JSON with the required schema.',
            'Do not include markdown, prose outside JSON, or secrets.',
            'Required JSON fields:',
            '- security_summary: string',
            '- threat_explanation: string',
            '- threat_category: string',
            '- risk_level: one of safe, low, medium, high, critical',
            '- improved_risk_score: integer from 0 to 100',
            '- indicators_of_compromise: array of strings',
            '- possible_attack_techniques: array of strings',
            '- security_recommendations: array of strings',
            '- immediate_actions: array of strings',
            '- long_term_mitigation_steps: array of strings',
            '- confidence_score: integer from 0 to 100',
            '',
            'Scanner findings JSON:',
            $findingsJson,
        ]);
    }

    public function analyze(string $prompt): array
    {
        $apiKey = $this->apiKey();
        $endpoint = $this->endpoint();
        $attempts = max(1, $this->retries() + 1);
        $startedAt = microtime(true);
        $lastError = null;

        Log::info('Gemma AI analysis request started.', [
            'model' => $this->modelName(),
            'endpoint_host' => parse_url($endpoint, PHP_URL_HOST),
            'max_attempts' => $attempts,
        ]);

        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            try {
                $response = Http::timeout($this->timeoutSeconds())
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $apiKey,
                    ])
                    ->post($endpoint, $this->payload($prompt));

                if ($response->successful()) {
                    $analysis = $this->validateAnalysis(
                        $this->decodeModelText($response->json())
                    );
                    $processingTime = round(microtime(true) - $startedAt, 3);

                    Log::info('Gemma AI analysis request completed.', [
                        'model' => $this->modelName(),
                        'attempts' => $attempt,
                        'processing_time' => $processingTime,
                    ]);

                    return [
                        'provider' => 'gemma',
                        'model_name' => $this->modelName(),
                        'analysis' => $this->sanitizeForStorage($analysis),
                        'provider_metadata' => $this->sanitizeForStorage([
                            'attempts' => $attempt,
                            'processing_time' => $processingTime,
                            'usage_metadata' => $response->json('usageMetadata'),
                        ]),
                    ];
                }

                $lastError = 'Gemma API returned HTTP '.$response->status();

                if (! $this->shouldRetryStatus($response->status()) || $attempt === $attempts) {
                    throw new AiProviderException($lastError);
                }
            } catch (ConnectionException $exception) {
                $lastError = 'Gemma API connection failed.';

                if ($attempt === $attempts) {
                    throw new AiProviderException($lastError, previous: $exception);
                }
            }

            usleep($this->retrySleepMilliseconds() * 1000);
        }

        throw new AiProviderException($lastError ?: 'Gemma API request failed.');
    }

    public function sanitizeForStorage(mixed $value): mixed
    {
        if (is_array($value)) {
            $sanitized = [];

            foreach ($value as $key => $item) {
                if (is_string($key) && preg_match('/api[_-]?key|authorization|bearer|secret|token/i', $key) === 1) {
                    $sanitized[$key] = '[REDACTED]';
                    continue;
                }

                $sanitized[$key] = $this->sanitizeForStorage($item);
            }

            return $sanitized;
        }

        if (is_string($value)) {
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

        return $value;
    }

    private function payload(string $prompt): array
    {
        return [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => (float) config('services.gemma.temperature', 0.2),
                'maxOutputTokens' => (int) config('services.gemma.max_output_tokens', 2048),
                'responseMimeType' => 'application/json',
            ],
        ];
    }

    private function endpoint(): string
    {
        $baseUrl = rtrim((string) config('services.gemma.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        return $baseUrl.'/models/'.$this->modelName().':generateContent';
    }

    private function decodeModelText(array $response): array
    {
        $parts = $response['candidates'][0]['content']['parts'] ?? [];
        $text = '';

        foreach ($parts as $part) {
            if (isset($part['text']) && is_string($part['text'])) {
                $text .= $part['text'];
            }
        }

        $text = trim($text);

        if ($text === '') {
            throw new AiProviderException('Gemma API response did not contain analysis text.');
        }

        $json = $this->extractJsonObject($text);
        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            throw new AiProviderException('Gemma API response was not valid JSON.');
        }

        return $decoded;
    }

    private function extractJsonObject(string $text): string
    {
        $text = trim($text);
        $text = preg_replace('/^```(?:json)?\s*/i', '', $text) ?? $text;
        $text = preg_replace('/\s*```$/', '', $text) ?? $text;

        $first = strpos($text, '{');
        $last = strrpos($text, '}');

        if ($first === false || $last === false || $last <= $first) {
            throw new AiProviderException('Gemma API response did not include a JSON object.');
        }

        return substr($text, $first, $last - $first + 1);
    }

    private function validateAnalysis(array $analysis): array
    {
        foreach (self::REQUIRED_FIELDS as $field) {
            if (! array_key_exists($field, $analysis)) {
                throw new AiProviderException("Gemma API response is missing required field: {$field}.");
            }
        }

        return [
            'security_summary' => $this->stringValue($analysis['security_summary']),
            'threat_explanation' => $this->stringValue($analysis['threat_explanation']),
            'threat_category' => $this->stringValue($analysis['threat_category']),
            'risk_level' => $this->normalizeRiskLevel($analysis['risk_level']),
            'improved_risk_score' => $this->boundedInteger($analysis['improved_risk_score']),
            'indicators_of_compromise' => $this->stringList($analysis['indicators_of_compromise']),
            'possible_attack_techniques' => $this->stringList($analysis['possible_attack_techniques']),
            'security_recommendations' => $this->stringList($analysis['security_recommendations']),
            'immediate_actions' => $this->stringList($analysis['immediate_actions']),
            'long_term_mitigation_steps' => $this->stringList($analysis['long_term_mitigation_steps']),
            'confidence_score' => $this->boundedInteger($analysis['confidence_score']),
        ];
    }

    private function normalizeRiskLevel(mixed $value): string
    {
        $riskLevel = strtolower(trim((string) $value));
        $riskLevel = str_replace([' risk', '_risk'], '', $riskLevel);

        return match ($riskLevel) {
            Scan::RISK_SAFE => Scan::RISK_SAFE,
            Scan::RISK_LOW => Scan::RISK_LOW,
            Scan::RISK_MEDIUM => Scan::RISK_MEDIUM,
            Scan::RISK_HIGH => Scan::RISK_HIGH,
            Scan::RISK_CRITICAL => Scan::RISK_CRITICAL,
            default => throw new AiProviderException('Gemma API response contains an invalid risk level.'),
        };
    }

    private function stringValue(mixed $value): string
    {
        if (is_array($value)) {
            $value = implode(' ', array_map(fn (mixed $item): string => (string) $item, $value));
        }

        $value = trim((string) $value);

        if ($value === '') {
            throw new AiProviderException('Gemma API response contains an empty required text field.');
        }

        return $value;
    }

    private function stringList(mixed $value): array
    {
        if (is_string($value)) {
            $value = array_filter(array_map('trim', preg_split('/\r\n|\r|\n|;/', $value) ?: []));
        }

        if (! is_array($value)) {
            $value = [(string) $value];
        }

        return array_values(array_filter(array_map(
            fn (mixed $item): string => trim((string) $item),
            $value
        ), fn (string $item): bool => $item !== ''));
    }

    private function boundedInteger(mixed $value): int
    {
        $number = (float) $value;

        if ($number <= 1 && $number > 0) {
            $number *= 100;
        }

        return min(100, max(0, (int) round($number)));
    }

    private function shouldRetryStatus(int $status): bool
    {
        return $status === 429 || $status >= 500;
    }

    private function apiKey(): string
    {
        $apiKey = (string) config('services.gemma.key');

        if ($apiKey === '') {
            throw new AiProviderException('Gemma API key is not configured.');
        }

        return $apiKey;
    }

    private function timeoutSeconds(): int
    {
        return max(1, (int) config('services.gemma.timeout', 20));
    }

    private function retries(): int
    {
        return max(0, (int) config('services.gemma.retries', 2));
    }

    private function retrySleepMilliseconds(): int
    {
        return max(0, (int) config('services.gemma.retry_sleep_ms', 250));
    }

    private function maxPromptCharacters(): int
    {
        return max(2000, (int) config('services.gemma.max_prompt_chars', 12000));
    }
}
