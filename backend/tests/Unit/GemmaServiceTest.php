<?php

namespace Tests\Unit;

use App\Models\Scan;
use App\Services\AI\Exceptions\AiProviderException;
use App\Services\AI\GemmaService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GemmaServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.gemma.key' => 'test-gemma-key',
            'services.gemma.base_url' => 'https://generativelanguage.googleapis.com/v1beta',
            'services.gemma.model' => 'gemma-test',
            'services.gemma.timeout' => 5,
            'services.gemma.retries' => 2,
            'services.gemma.retry_sleep_ms' => 0,
            'services.gemma.max_prompt_chars' => 12000,
        ]);
    }

    public function test_it_sends_prompt_to_gemma_and_validates_successful_response(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->gemmaResponse(), 200),
        ]);

        $result = app(GemmaService::class)->analyze('Analyze this scan.');

        $this->assertSame('gemma', $result['provider']);
        $this->assertSame('gemma-test', $result['model_name']);
        $this->assertSame(Scan::RISK_HIGH, $result['analysis']['risk_level']);
        $this->assertSame(82, $result['analysis']['improved_risk_score']);
        $this->assertSame(91, $result['analysis']['confidence_score']);

        Http::assertSent(function ($request): bool {
            return $request->hasHeader('x-goog-api-key', 'test-gemma-key')
                && str_contains($request->url(), '/models/gemma-test:generateContent')
                && $request['contents'][0]['parts'][0]['text'] === 'Analyze this scan.';
        });
    }

    public function test_it_retries_failed_retryable_requests(): void
    {
        Http::fakeSequence()
            ->push(['error' => ['message' => 'temporarily unavailable']], 503)
            ->push($this->gemmaResponse(), 200);

        $result = app(GemmaService::class)->analyze('Analyze retry behavior.');

        $this->assertSame(2, $result['provider_metadata']['attempts']);
        $this->assertSame('credential phishing', $result['analysis']['threat_category']);
        Http::assertSentCount(2);
    }

    public function test_it_throws_for_failed_non_retryable_api_response(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response(['error' => ['message' => 'bad request']], 400),
        ]);

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('Gemma API returned HTTP 400');

        app(GemmaService::class)->analyze('Bad prompt.');
    }

    public function test_it_rejects_invalid_model_response_schema(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => '{"security_summary":"missing required fields"}'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $this->expectException(AiProviderException::class);
        $this->expectExceptionMessage('missing required field');

        app(GemmaService::class)->analyze('Analyze invalid schema.');
    }

    public function test_it_redacts_sensitive_values_from_prompts(): void
    {
        config(['services.gemma.key' => 'super-secret-key']);

        $prompt = app(GemmaService::class)->buildPrompt([
            'scan' => [
                'target' => 'https://example.com',
                'api_key' => 'super-secret-key',
                'token' => 'abc123',
            ],
        ]);

        $this->assertStringNotContainsString('super-secret-key', $prompt);
        $this->assertStringNotContainsString('abc123', $prompt);
        $this->assertStringContainsString('[REDACTED]', $prompt);
    }

    private function gemmaResponse(): array
    {
        return [
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            [
                                'text' => json_encode([
                                    'security_summary' => 'High-risk phishing behavior detected.',
                                    'threat_explanation' => 'The scan contains credential theft indicators.',
                                    'threat_category' => 'credential phishing',
                                    'risk_level' => 'high',
                                    'improved_risk_score' => 82,
                                    'indicators_of_compromise' => ['security-login.top', 'userinfo URL obfuscation'],
                                    'possible_attack_techniques' => ['Phishing', 'Credential harvesting'],
                                    'security_recommendations' => ['Block the destination domain.'],
                                    'immediate_actions' => ['Quarantine the message.'],
                                    'long_term_mitigation_steps' => ['Improve user training.'],
                                    'confidence_score' => 91,
                                ]),
                            ],
                        ],
                    ],
                ],
            ],
            'usageMetadata' => [
                'promptTokenCount' => 100,
                'candidatesTokenCount' => 80,
            ],
        ];
    }
}
