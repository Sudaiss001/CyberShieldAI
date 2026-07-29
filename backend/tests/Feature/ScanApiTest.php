<?php

namespace Tests\Feature;

use App\Jobs\ProcessScanJob;
use App\Models\Report;
use App\Models\Role;
use App\Models\Scan;
use App\Models\ScanStep;
use App\Models\User;
use App\Services\Scans\ScanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ScanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_authenticated_user_can_create_scan(): void
    {
        Queue::fake();

        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/scans', [
                'scan_type' => Scan::TYPE_URL,
                'target' => 'https://example.com/login',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_URL)
            ->assertJsonPath('data.scan.status', Scan::STATUS_QUEUED)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'scan' => [
                        'id',
                        'scan_type',
                        'target',
                        'status',
                        'steps',
                        'events',
                    ],
                ],
            ]);

        $scanId = $response->json('data.scan.id');

        $this->assertDatabaseHas('scans', [
            'id' => $scanId,
            'user_id' => $user->id,
            'status' => Scan::STATUS_QUEUED,
        ]);
        $this->assertDatabaseCount('scan_steps', 4);

        Queue::assertPushed(ProcessScanJob::class, fn (ProcessScanJob $job): bool => $job->scanId === $scanId);
    }

    public function test_authenticated_user_can_view_scan_history(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $otherUser = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);

        Scan::factory()->for($user)->count(2)->create();
        Scan::factory()->for($otherUser)->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/scans');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.pagination.total', 2)
            ->assertJsonCount(2, 'data.scans');
    }

    public function test_authenticated_user_can_view_owned_scan_details_and_status(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $scan = Scan::factory()->for($user)->completed()->create([
            'scan_type' => Scan::TYPE_EMAIL,
        ]);
        ScanStep::factory()->for($scan)->create([
            'status' => ScanStep::STATUS_COMPLETED,
            'progress' => 100,
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/scans/{$scan->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.id', $scan->id)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_EMAIL)
            ->assertJsonCount(1, 'data.scan.steps');

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/scans/{$scan->id}/status")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.status', Scan::STATUS_COMPLETED)
            ->assertJsonPath('data.scan.progress', 100);
    }

    public function test_scan_routes_are_protected_and_scans_are_user_scoped(): void
    {
        $owner = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $otherUser = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $scan = Scan::factory()->for($owner)->create();

        $this->getJson('/api/v1/scans')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);

        $this->actingAs($otherUser, 'sanctum')
            ->getJson("/api/v1/scans/{$scan->id}")
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_process_scan_job_completes_simulated_workflow_and_creates_report(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $scan = app(ScanService::class)->createScan($user, [
            'scan_type' => Scan::TYPE_DOCUMENT,
            'target' => 'incident-report.pdf',
        ]);

        app(ProcessScanJob::class, ['scanId' => $scan->id])->handle(app(ScanService::class));

        $scan->refresh()->load(['steps', 'report']);

        $this->assertSame(Scan::STATUS_COMPLETED, $scan->status);
        $this->assertNotNull($scan->risk_level);
        $this->assertTrue($scan->steps->every(fn (ScanStep $step): bool => $step->status === ScanStep::STATUS_COMPLETED));
        $this->assertDatabaseHas('reports', [
            'scan_id' => $scan->id,
            'user_id' => $user->id,
        ]);
        $this->assertInstanceOf(Report::class, $scan->report);
    }
}
