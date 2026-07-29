<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\ReportEvidence;
use App\Models\ReportIndicator;
use App\Models\ReportRecommendation;
use App\Models\ReportTag;
use App\Models\Role;
use App\Models\Scan;
use App\Models\ScanEvent;
use App\Models\ScanFile;
use App\Models\ScanStep;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CoreDatabaseModulesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_scanner_and_report_tables_have_api_ready_columns(): void
    {
        $this->assertTrue(Schema::hasColumns('scans', [
            'id',
            'user_id',
            'scan_type',
            'target',
            'status',
            'risk_level',
            'started_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('scan_files', [
            'id',
            'scan_id',
            'file_name',
            'file_path',
            'mime_type',
            'file_size',
            'hash',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('scan_steps', [
            'id',
            'scan_id',
            'step_name',
            'status',
            'progress',
            'message',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('scan_events', [
            'id',
            'scan_id',
            'event_type',
            'event_data',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('reports', [
            'id',
            'scan_id',
            'user_id',
            'title',
            'summary',
            'risk_score',
            'report_data',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('report_indicators', [
            'id',
            'report_id',
            'label',
            'value',
            'severity',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('report_evidence', [
            'id',
            'report_id',
            'title',
            'description',
            'snippet',
            'severity',
            'metadata',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('report_recommendations', [
            'id',
            'report_id',
            'recommendation',
            'sort_order',
            'created_at',
            'updated_at',
        ]));

        $this->assertTrue(Schema::hasColumns('report_tags', [
            'id',
            'report_id',
            'tag',
            'created_at',
            'updated_at',
        ]));
    }

    public function test_scan_relationships_can_be_persisted_and_loaded(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);

        $scan = Scan::factory()
            ->for($user)
            ->completed()
            ->create([
                'scan_type' => Scan::TYPE_DOCUMENT,
                'target' => 'contract_final.pdf',
            ]);

        ScanFile::factory()->for($scan)->create();
        ScanStep::factory()->for($scan)->create([
            'step_name' => 'Generating Report',
            'status' => ScanStep::STATUS_COMPLETED,
            'progress' => 100,
        ]);
        ScanEvent::factory()->for($scan)->create([
            'event_type' => 'completed',
            'event_data' => ['risk_level' => Scan::RISK_HIGH],
        ]);

        $scan->refresh()->load(['user', 'files', 'steps', 'events']);

        $this->assertTrue($scan->user->is($user));
        $this->assertCount(1, $scan->files);
        $this->assertCount(1, $scan->steps);
        $this->assertCount(1, $scan->events);
        $this->assertSame(['risk_level' => Scan::RISK_HIGH], $scan->events->first()->event_data);
    }

    public function test_report_relationships_can_be_persisted_and_loaded(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $scan = Scan::factory()->for($user)->completed()->create();

        $report = Report::factory()
            ->for($scan)
            ->for($user)
            ->create([
                'risk_score' => 84,
                'report_data' => ['summary_version' => 1],
            ]);

        ReportIndicator::factory()->for($report)->create(['severity' => Scan::RISK_HIGH]);
        ReportEvidence::factory()->for($report)->create([
            'metadata' => ['source' => 'test'],
        ]);
        ReportRecommendation::factory()->for($report)->create([
            'recommendation' => 'Block the suspicious domain.',
            'sort_order' => 1,
        ]);
        ReportTag::factory()->for($report)->create(['tag' => 'phishing']);

        $report->refresh()->load([
            'scan',
            'user',
            'indicators',
            'evidence',
            'recommendations',
            'tags',
        ]);

        $this->assertTrue($report->scan->is($scan));
        $this->assertTrue($report->user->is($user));
        $this->assertSame(['summary_version' => 1], $report->report_data);
        $this->assertSame(['source' => 'test'], $report->evidence->first()->metadata);
        $this->assertSame('Block the suspicious domain.', $report->recommendations->first()->recommendation);
        $this->assertSame('phishing', $report->tags->first()->tag);
    }

    public function test_report_factory_creates_a_matching_scan_and_user(): void
    {
        $report = Report::factory()->create();

        $report->refresh()->load(['scan.user', 'user']);

        $this->assertTrue($report->user->is($report->scan->user));
    }

    public function test_scan_delete_cascades_to_files_steps_events_and_report_tree(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $scan = Scan::factory()->for($user)->completed()->create();
        $report = Report::factory()->for($scan)->for($user)->create();

        ScanFile::factory()->for($scan)->create();
        ScanStep::factory()->for($scan)->create();
        ScanEvent::factory()->for($scan)->create();
        ReportIndicator::factory()->for($report)->create();
        ReportEvidence::factory()->for($report)->create();
        ReportRecommendation::factory()->for($report)->create();
        ReportTag::factory()->for($report)->create();

        $scan->delete();

        $this->assertDatabaseCount('scans', 0);
        $this->assertDatabaseCount('scan_files', 0);
        $this->assertDatabaseCount('scan_steps', 0);
        $this->assertDatabaseCount('scan_events', 0);
        $this->assertDatabaseCount('reports', 0);
        $this->assertDatabaseCount('report_indicators', 0);
        $this->assertDatabaseCount('report_evidence', 0);
        $this->assertDatabaseCount('report_recommendations', 0);
        $this->assertDatabaseCount('report_tags', 0);
    }
}
