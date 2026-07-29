<?php

namespace Tests\Feature;

use App\Jobs\ProcessScanJob;
use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\ScanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AudioVideoScanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_end_to_end_audio_scan_api_workflow(): void
    {
        Storage::fake('local');

        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);

        $audioFile = UploadedFile::fake()->create('voicemail.mp3', 500, 'audio/mpeg');

        // 1. POST /api/v1/audio-scans
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/audio-scans', [
                'audio_file' => $audioFile,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_AUDIO)
            ->assertJsonPath('data.scan.status', Scan::STATUS_QUEUED);

        $scanId = $response->json('data.scan.id');

        // 2. Process Job
        app(ProcessScanJob::class, ['scanId' => $scanId])->handle(app(ScanService::class));

        // 3. GET /api/v1/audio-scans/{id}
        $detailResponse = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/audio-scans/{$scanId}");

        $detailResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.status', Scan::STATUS_COMPLETED)
            ->assertJsonPath('data.scan.report.title', 'CyberShield AI Audio Threat Assessment')
            ->assertJsonStructure([
                'success',
                'data' => [
                    'scan' => [
                        'id',
                        'scan_type',
                        'status',
                        'report' => [
                            'id',
                            'title',
                            'summary',
                            'risk_score',
                            'report_data' => [
                                'metadata',
                                'waveform_peaks',
                                'transcript',
                            ],
                            'indicators',
                            'evidence',
                            'recommendations',
                            'tags',
                        ],
                    ],
                ],
            ]);

        // 4. GET /api/v1/audio-scans/{id}/status
        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/audio-scans/{$scanId}/status")
            ->assertOk()
            ->assertJsonPath('data.scan.status', Scan::STATUS_COMPLETED)
            ->assertJsonPath('data.scan.progress', 100);
    }

    public function test_end_to_end_video_scan_api_workflow(): void
    {
        Storage::fake('local');
        Http::fake([
            '*phishing-qr-login-verify.top*' => Http::response('Phishing Page', 200, []),
        ]);

        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);

        $videoFile = UploadedFile::fake()->create('presentation.mp4', 2000, 'video/mp4');

        // 1. POST /api/v1/video-scans
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/video-scans', [
                'video_file' => $videoFile,
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_VIDEO)
            ->assertJsonPath('data.scan.status', Scan::STATUS_QUEUED);

        $scanId = $response->json('data.scan.id');

        // 2. Process Job
        app(ProcessScanJob::class, ['scanId' => $scanId])->handle(app(ScanService::class));

        // 3. GET /api/v1/video-scans/{id}
        $detailResponse = $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/video-scans/{$scanId}");

        $detailResponse
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.status', Scan::STATUS_COMPLETED)
            ->assertJsonPath('data.scan.report.title', 'CyberShield AI Video Threat Assessment')
            ->assertJsonStructure([
                'success',
                'data' => [
                    'scan' => [
                        'id',
                        'scan_type',
                        'status',
                        'report' => [
                            'id',
                            'title',
                            'summary',
                            'risk_score',
                            'report_data' => [
                                'metadata',
                                'keyframes',
                                'qr_codes_detected',
                                'audio_track_analysis',
                            ],
                            'indicators',
                            'evidence',
                            'recommendations',
                            'tags',
                        ],
                    ],
                ],
            ]);

        // 4. GET /api/v1/video-scans/{id}/status
        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/video-scans/{$scanId}/status")
            ->assertOk()
            ->assertJsonPath('data.scan.status', Scan::STATUS_COMPLETED)
            ->assertJsonPath('data.scan.progress', 100);
    }
}
