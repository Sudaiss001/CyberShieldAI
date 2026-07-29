<?php

namespace Tests\Feature;

use App\Jobs\ProcessScanJob;
use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\ImageScannerService;
use App\Services\Scans\ScanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageScanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_authenticated_user_can_create_image_scan(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->user();

        $response = $this->actingAs($user, 'sanctum')
            ->post('/api/v1/image-scans', [
                'image_file' => UploadedFile::fake()->createWithContent('pixel.png', $this->png()),
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_IMAGE)
            ->assertJsonPath('data.scan.status', Scan::STATUS_QUEUED);

        $scan = Scan::query()->with('files')->findOrFail($response->json('data.scan.id'));

        $this->assertSame('pixel.png', $scan->files->first()->file_name);
        Storage::disk('local')->assertExists($scan->files->first()->file_path);
        Queue::assertPushed(ProcessScanJob::class, fn (ProcessScanJob $job): bool => $job->scanId === $scan->id);
    }

    public function test_image_scan_extracts_metadata_and_generates_safe_report(): void
    {
        Storage::fake('local');
        Http::fake();

        $scan = $this->createAndProcessImageScan($this->user(), 'pixel.png', $this->png());
        $image = $scan->report->report_data['image'];

        $this->assertSame(Scan::STATUS_COMPLETED, $scan->status);
        $this->assertSame(Scan::RISK_SAFE, $scan->risk_level);
        $this->assertSame('image_scanner', $scan->report->report_data['workflow']);
        $this->assertSame(1, $image['metadata']['width']);
        $this->assertSame(1, $image['metadata']['height']);
        $this->assertFalse($image['qr']['detected']);
        $this->assertSame('unavailable', $image['ocr']['status']);
        $this->assertTrue($scan->report->tags->contains('tag', 'image'));
    }

    public function test_image_scan_decodes_qr_payload_and_scans_url(): void
    {
        Storage::fake('local');
        Http::fake([
            'http://security-login.top/*' => Http::response('Login', 200, []),
        ]);

        $png = $this->png([
            'QR_CONTENT' => 'http://example.com@security-login.top/verify/account/password',
            'OCR_TEXT' => 'Urgent verify password now',
        ]);

        $scan = $this->createAndProcessImageScan($this->user(), 'qr.png', $png);
        $image = $scan->report->report_data['image'];

        $this->assertTrue($image['qr']['detected']);
        $this->assertSame('url', $image['qr']['decoded'][0]['type']);
        $this->assertSame('security-login.top', $image['qr']['decoded'][0]['url_analysis']['report_data']['url_info']['host']);
        $this->assertSame('metadata_text_extracted', $image['ocr']['status']);
        $this->assertNotEmpty($image['ocr']['sensitive_terms']);
        $this->assertContains($scan->risk_level, [Scan::RISK_HIGH, Scan::RISK_CRITICAL]);
        $this->assertTrue($scan->report->tags->contains('tag', 'qr'));
        $this->assertTrue($scan->report->tags->contains('tag', 'suspicious-url'));
        $this->assertTrue($scan->report->tags->contains('tag', 'ocr-sensitive-text'));
    }

    public function test_image_scan_detects_embedded_script_markers(): void
    {
        Storage::fake('local');
        Http::fake();

        $png = $this->png([
            'Comment' => '<script>alert(1)</script>',
        ]);

        $scan = $this->createAndProcessImageScan($this->user(), 'scripted.png', $png);
        $image = $scan->report->report_data['image'];

        $this->assertNotEmpty($image['embedded_content']);
        $this->assertTrue($scan->report->tags->contains('tag', 'embedded-content-risk'));
        $this->assertTrue($scan->report->evidence->contains('title', 'Embedded script-like content'));
    }

    public function test_image_scan_report_can_be_retrieved_from_image_endpoint(): void
    {
        Storage::fake('local');
        Http::fake();

        $user = $this->user();
        $scan = $this->createAndProcessImageScan($user, 'pixel.png', $this->png());

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/image-scans/{$scan->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_IMAGE)
            ->assertJsonPath('data.scan.report.report_data.workflow', 'image_scanner')
            ->assertJsonFragment(['tag' => 'image']);
    }

    public function test_image_scan_rejects_unsupported_and_corrupted_inputs(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->user();

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/image-scans', [
                'image_file' => UploadedFile::fake()->createWithContent('notes.txt', 'hello'),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('data.errors.image_file.0', 'Unsupported file type. Supported image types are PNG, JPG, JPEG, and WEBP.');

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/image-scans', [
                'image_file' => UploadedFile::fake()->createWithContent('broken.png', 'not a png'),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Invalid image format. The uploaded image is malformed or corrupted.');
    }

    private function createAndProcessImageScan(User $user, string $fileName, string $content): Scan
    {
        $input = app(ImageScannerService::class)->prepareInput(
            UploadedFile::fake()->createWithContent($fileName, $content)
        );

        $scan = app(ScanService::class)->createImageScan($user, $input);

        app(ProcessScanJob::class, ['scanId' => $scan->id])->handle(app(ScanService::class));

        return $scan->refresh()->load([
            'files',
            'steps',
            'events',
            'report.indicators',
            'report.evidence',
            'report.recommendations',
            'report.tags',
        ]);
    }

    private function user(): User
    {
        return User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
    }

    private function png(array $textChunks = []): string
    {
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=');

        if ($textChunks === []) {
            return $png;
        }

        $iendOffset = strpos($png, $this->pngChunk('IEND', ''));
        $beforeIend = substr($png, 0, $iendOffset);
        $iend = substr($png, $iendOffset);
        $chunks = '';

        foreach ($textChunks as $keyword => $value) {
            $chunks .= $this->pngChunk('tEXt', $keyword."\0".$value);
        }

        return $beforeIend.$chunks.$iend;
    }

    private function pngChunk(string $type, string $data): string
    {
        return pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
    }
}
