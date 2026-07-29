<?php

namespace Tests\Feature;

use App\Jobs\ProcessAiAnalysisJob;
use App\Models\AiRequest;
use App\Models\Report;
use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\AI\AiAnalysisService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AiAnalysisApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);

        config([
            'services.gemma.key' => 'test-gemma-key',
            'services.gemma.base_url' => 'https://generativelanguage.googleapis.com/v1beta',
            'services.gemma.model' => 'gemma-test',
            'services.gemma.timeout' => 5,
            'services.gemma.retries' => 2,
            'services.gemma.retry_sleep_ms' => 0,
        ]);
    }

    public function test_authenticated_user_can_queue_gemma_analysis_for_completed_scan(): void
    {
        Queue::fake();

        [$user, $scan] = $this->completedScanWithReport();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/scans/{$scan->id}/analyze-ai");

        $response
            ->assertAccepted()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Gemma AI analysis queued.')
            ->assertJsonPath('data.ai_request.status', AiRequest::STATUS_PENDING)
            ->assertJsonPath('data.ai_request.model_name', 'gemma-test')
            ->assertJsonPath('data.already_exists', false)
            ->assertJsonMissingPath('data.ai_request.prompt');

        $aiRequestId = $response->json('data.ai_request.id');

        $this->assertDatabaseHas('ai_requests', [
            'id' => $aiRequestId,
            'user_id' => $user->id,
            'scan_id' => $scan->id,
            'status' => AiRequest::STATUS_PENDING,
        ]);

        Queue::assertPushed(ProcessAiAnalysisJob::class, fn (ProcessAiAnalysisJob $job): bool => $job->aiRequestId === $aiRequestId);
    }

    public function test_duplicate_gemma_analysis_requests_return_existing_record(): void
    {
        Queue::fake();

        [$user, $scan] = $this->completedScanWithReport();

        $first = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/scans/{$scan->id}/analyze-ai");
        $second = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/scans/{$scan->id}/analyze-ai");

        $first->assertAccepted();
        $second
            ->assertOk()
            ->assertJsonPath('message', 'Existing Gemma AI analysis returned.')
            ->assertJsonPath('data.already_exists', true)
            ->assertJsonPath('data.ai_request.id', $first->json('data.ai_request.id'));

        $this->assertDatabaseCount('ai_requests', 1);
        Queue::assertPushed(ProcessAiAnalysisJob::class, 1);
    }

    public function test_completed_gemma_analysis_can_be_retrieved(): void
    {
        [$user, $scan] = $this->completedScanWithReport();
        $aiRequest = AiRequest::query()->create([
            'user_id' => $user->id,
            'scan_id' => $scan->id,
            'model_name' => 'gemma-test',
            'prompt' => 'stored prompt',
            'response' => [
                'provider' => 'gemma',
                'analysis' => $this->analysisPayload(),
            ],
            'status' => AiRequest::STATUS_COMPLETED,
            'processing_time' => 1.25,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/scans/{$scan->id}/ai-analysis")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.ai_request.id', $aiRequest->id)
            ->assertJsonPath('data.ai_request.status', AiRequest::STATUS_COMPLETED)
            ->assertJsonPath('data.ai_request.analysis.threat_category', 'credential phishing')
            ->assertJsonMissingPath('data.ai_request.prompt');
    }

    public function test_ai_job_stores_successful_result_and_enhances_report(): void
    {
        Queue::fake();
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response($this->gemmaResponse(), 200),
        ]);

        [$user, $scan] = $this->completedScanWithReport();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/scans/{$scan->id}/analyze-ai");
        $aiRequestId = $response->json('data.ai_request.id');

        app(ProcessAiAnalysisJob::class, ['aiRequestId' => $aiRequestId])->handle(app(AiAnalysisService::class));

        $aiRequest = AiRequest::query()->findOrFail($aiRequestId);
        $scan->refresh()->load('report.tags', 'report.indicators', 'report.evidence', 'report.recommendations');

        $this->assertSame(AiRequest::STATUS_COMPLETED, $aiRequest->status);
        $this->assertSame('credential phishing', $aiRequest->response['analysis']['threat_category']);
        $this->assertSame(82, $scan->report->risk_score);
        $this->assertSame(Scan::RISK_HIGH, $scan->risk_level);
        $this->assertSame($aiRequest->id, $scan->report->report_data['ai_analysis']['ai_request_id']);
        $this->assertTrue($scan->report->tags->contains('tag', 'ai-enhanced'));
        $this->assertTrue($scan->report->indicators->contains('label', 'Gemma Threat Category'));
        $this->assertTrue($scan->report->evidence->contains('title', 'Gemma Indicator of Compromise'));
        $this->assertTrue($scan->report->recommendations->contains('recommendation', 'Quarantine the message.'));
    }

    public function test_ai_job_stores_failed_api_response_gracefully(): void
    {
        Queue::fake();
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response(['error' => ['message' => 'service down']], 503),
        ]);

        [$user, $scan] = $this->completedScanWithReport();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/scans/{$scan->id}/analyze-ai");
        $aiRequestId = $response->json('data.ai_request.id');

        app(ProcessAiAnalysisJob::class, ['aiRequestId' => $aiRequestId])->handle(app(AiAnalysisService::class));

        $aiRequest = AiRequest::query()->findOrFail($aiRequestId);

        $this->assertSame(AiRequest::STATUS_FAILED, $aiRequest->status);
        $this->assertSame('Gemma API returned HTTP 503', $aiRequest->response['error']);
        $this->assertDatabaseHas('scan_events', [
            'scan_id' => $scan->id,
            'event_type' => 'scan.ai_analysis_failed',
        ]);
    }

    public function test_ai_analysis_authorization_and_scan_state_are_enforced(): void
    {
        [$owner, $scan] = $this->completedScanWithReport();
        $otherUser = $this->user();
        $queuedScan = Scan::factory()->for($owner)->create([
            'scan_type' => Scan::TYPE_URL,
            'status' => Scan::STATUS_QUEUED,
            'target' => 'https://example.com',
        ]);

        $this->postJson("/api/v1/scans/{$scan->id}/analyze-ai")
            ->assertUnauthorized()
            ->assertJsonPath('success', false);

        $this->actingAs($otherUser, 'sanctum')
            ->postJson("/api/v1/scans/{$scan->id}/analyze-ai")
            ->assertNotFound()
            ->assertJsonPath('success', false);

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/scans/{$queuedScan->id}/analyze-ai")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Gemma AI analysis requires a completed scan.');

        $this->actingAs($otherUser, 'sanctum')
            ->getJson("/api/v1/scans/{$scan->id}/ai-analysis")
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    private function completedScanWithReport(): array
    {
        $user = $this->user();
        $scan = Scan::factory()->for($user)->completed()->create([
            'scan_type' => Scan::TYPE_URL,
            'target' => 'http://example.com@security-login.top/verify',
            'risk_level' => Scan::RISK_HIGH,
        ]);
        $report = Report::factory()->for($scan)->for($user)->create([
            'summary' => 'URL scanner found obfuscation.',
            'risk_score' => 76,
            'report_data' => [
                'workflow' => 'url_scanner',
                'url_info' => [
                    'host' => 'security-login.top',
                    'has_userinfo_obfuscation' => true,
                ],
            ],
        ]);
        $report->indicators()->create([
            'label' => 'URL Obfuscation',
            'value' => 'UserInfo @ token detected',
            'severity' => Scan::RISK_CRITICAL,
        ]);
        $report->evidence()->create([
            'title' => 'Suspicious URL',
            'description' => 'URL hides destination using userinfo syntax.',
            'snippet' => $scan->target,
            'severity' => Scan::RISK_CRITICAL,
            'metadata' => ['host' => 'security-login.top'],
        ]);
        $report->recommendations()->create([
            'recommendation' => 'Block the destination domain.',
            'sort_order' => 1,
        ]);
        $report->tags()->create(['tag' => 'url']);

        return [$user, $scan->refresh()->load('report.indicators', 'report.evidence', 'report.recommendations', 'report.tags')];
    }

    private function user(): User
    {
        return User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
    }

    private function gemmaResponse(): array
    {
        return [
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => json_encode($this->analysisPayload())],
                        ],
                    ],
                ],
            ],
            'usageMetadata' => [
                'promptTokenCount' => 240,
                'candidatesTokenCount' => 120,
            ],
        ];
    }

    private function analysisPayload(): array
    {
        return [
            'security_summary' => 'Gemma identified likely credential phishing.',
            'threat_explanation' => 'The URL uses userinfo obfuscation and a high-risk domain.',
            'threat_category' => 'credential phishing',
            'risk_level' => 'high',
            'improved_risk_score' => 82,
            'indicators_of_compromise' => ['security-login.top', 'userinfo obfuscation'],
            'possible_attack_techniques' => ['Credential harvesting', 'Social engineering'],
            'security_recommendations' => ['Block the destination domain.'],
            'immediate_actions' => ['Quarantine the message.'],
            'long_term_mitigation_steps' => ['Train users to inspect link destinations.'],
            'confidence_score' => 91,
        ];
    }
}
