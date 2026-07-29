<?php

namespace Tests\Unit;

use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\Exceptions\ImageScanException;
use App\Services\Scans\ImageScannerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageScannerServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_it_supports_image_and_qr_scans(): void
    {
        $scanner = app(ImageScannerService::class);

        $this->assertTrue($scanner->supports(Scan::TYPE_IMAGE));
        $this->assertTrue($scanner->supports(Scan::TYPE_QR));
        $this->assertFalse($scanner->supports(Scan::TYPE_DOCUMENT));
    }

    public function test_it_prepares_valid_image_upload_input(): void
    {
        $scanner = app(ImageScannerService::class);
        $input = $scanner->prepareInput(
            UploadedFile::fake()->createWithContent('pixel.png', $this->png())
        );

        $this->assertSame(Scan::TYPE_IMAGE, $input['scan_type']);
        $this->assertSame('pixel.png', $input['file_name']);
        $this->assertSame('png', $input['extension']);
        $this->assertSame('image/png', $input['mime_type']);
    }

    public function test_it_rejects_unsupported_image_upload_input(): void
    {
        $this->expectException(ImageScanException::class);
        $this->expectExceptionMessage('Unsupported file type.');

        app(ImageScannerService::class)->prepareInput(
            UploadedFile::fake()->createWithContent('image.gif', 'GIF89a')
        );
    }

    public function test_it_scans_qr_metadata_payload_and_delegates_url_analysis(): void
    {
        Storage::fake('local');
        Http::fake([
            'http://security-login.top/*' => Http::response('Login', 200, []),
        ]);

        $content = $this->png([
            'QR_CONTENT' => 'http://example.com@security-login.top/verify/account/password',
        ]);
        $scan = $this->storedImageScan('qr.png', $content);
        $result = app(ImageScannerService::class)->scan($scan);

        $this->assertSame('image_scanner', $result->reportData['workflow']);
        $this->assertTrue($result->reportData['image']['qr']['detected']);
        $this->assertSame('url', $result->reportData['image']['qr']['decoded'][0]['type']);
        $this->assertSame('security-login.top', $result->reportData['image']['qr']['decoded'][0]['url_analysis']['report_data']['url_info']['host']);
        $this->assertContains('qr', $result->tags);
        $this->assertContains('suspicious-url', $result->tags);
    }

    private function storedImageScan(string $fileName, string $content): Scan
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $scan = Scan::factory()->for($user)->create([
            'scan_type' => Scan::TYPE_IMAGE,
            'target' => $fileName,
        ]);
        $path = 'scans/'.$scan->id.'/'.$fileName;
        Storage::disk('local')->put($path, $content);
        $scan->files()->create([
            'file_name' => $fileName,
            'file_path' => $path,
            'mime_type' => 'image/png',
            'file_size' => strlen($content),
            'hash' => hash('sha256', $content),
        ]);

        return $scan->refresh()->load('files');
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
