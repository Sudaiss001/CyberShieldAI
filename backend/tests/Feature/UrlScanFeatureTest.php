<?php

namespace Tests\Feature;

use App\Jobs\ProcessScanJob;
use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\ScanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UrlScanFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_end_to_end_real_url_scan_workflow(): void
    {
        Http::fake([
            '*cyber-test-site.org*' => Http::response('Welcome', 200, [
                'Strict-Transport-Security' => 'max-age=31536000',
                'Content-Security-Policy' => "default-src 'self'",
                'X-Frame-Options' => 'DENY',
                'X-Content-Type-Options' => 'nosniff',
                'Referrer-Policy' => 'strict-origin-when-cross-origin',
            ]),
        ]);

        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);

        // 1. POST /api/v1/scans
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/scans', [
                'scan_type' => Scan::TYPE_URL,
                'target' => 'https://cyber-test-site.org/company-info',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_URL)
            ->assertJsonPath('data.scan.status', Scan::STATUS_QUEUED);

        $scanId = $response->json('data.scan.id');

        // 2. Process Job
        app(ProcessScanJob::class, ['scanId' => $scanId])->handle(app(ScanService::class));

        // 3. GET /api/v1/scans/{id}
        $detailResponse = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/scans/{$scanId}");

        $detailResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.status', Scan::STATUS_COMPLETED)
            ->assertJsonPath('data.scan.risk_level', Scan::RISK_SAFE)
            ->assertJsonPath('data.scan.report.title', 'CyberShield AI URL Security Assessment')
            ->assertJsonStructure([
                'success',
                'data' => [
                    'scan' => [
                        'id',
                        'scan_type',
                        'target',
                        'status',
                        'risk_level',
                        'report' => [
                            'id',
                            'title',
                            'summary',
                            'risk_score',
                            'indicators',
                            'evidence',
                            'recommendations',
                            'tags',
                        ],
                    ],
                ],
            ]);

        $this->assertNotEmpty($detailResponse->json('data.scan.report.indicators'));

        // 4. GET /api/v1/scans/{id}/status
        $statusResponse = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/scans/{$scanId}/status");

        $statusResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.status', Scan::STATUS_COMPLETED)
            ->assertJsonPath('data.scan.progress', 100);
    }
}
