<?php

namespace Tests\Unit;

use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\DocumentScannerService;
use App\Services\Scans\Exceptions\DocumentScanException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentScannerServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_it_supports_document_scans_only(): void
    {
        $scanner = app(DocumentScannerService::class);

        $this->assertTrue($scanner->supports(Scan::TYPE_DOCUMENT));
        $this->assertFalse($scanner->supports(Scan::TYPE_IMAGE));
    }

    public function test_it_prepares_valid_document_upload_input(): void
    {
        $scanner = app(DocumentScannerService::class);
        $input = $scanner->prepareInput(
            UploadedFile::fake()->createWithContent('brief.txt', 'Security brief https://example.com/status')
        );

        $this->assertSame(Scan::TYPE_DOCUMENT, $input['scan_type']);
        $this->assertSame('brief.txt', $input['file_name']);
        $this->assertSame('txt', $input['extension']);
        $this->assertSame(hash('sha256', $input['content']), $input['hash']);
    }

    public function test_it_rejects_unsupported_document_upload_input(): void
    {
        $this->expectException(DocumentScanException::class);
        $this->expectExceptionMessage('Unsupported file type.');

        app(DocumentScannerService::class)->prepareInput(
            UploadedFile::fake()->createWithContent('payload.exe', 'MZ')
        );
    }

    public function test_it_scans_stored_document_and_returns_structured_result(): void
    {
        Storage::fake('local');
        Http::fake([
            'https://example.com/*' => Http::response('OK', 200, [
                'Strict-Transport-Security' => 'max-age=31536000',
                'Content-Security-Policy' => "default-src 'self'",
                'X-Frame-Options' => 'DENY',
                'X-Content-Type-Options' => 'nosniff',
                'Referrer-Policy' => 'strict-origin-when-cross-origin',
            ]),
        ]);

        $content = 'Quarterly security brief https://example.com/status';
        $scan = $this->storedDocumentScan('brief.txt', $content);
        $result = app(DocumentScannerService::class)->scan($scan);

        $this->assertSame(Scan::RISK_SAFE, $result->riskLevel);
        $this->assertSame('document_scanner', $result->reportData['workflow']);
        $this->assertSame('plain_text', $result->reportData['document']['text']['extraction_method']);
        $this->assertCount(1, $result->reportData['document']['hyperlinks']);
    }

    private function storedDocumentScan(string $fileName, string $content): Scan
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
        ]);
        $scan = Scan::factory()->for($user)->create([
            'scan_type' => Scan::TYPE_DOCUMENT,
            'target' => $fileName,
        ]);
        $path = 'scans/'.$scan->id.'/'.$fileName;
        Storage::disk('local')->put($path, $content);
        $scan->files()->create([
            'file_name' => $fileName,
            'file_path' => $path,
            'mime_type' => 'text/plain',
            'file_size' => strlen($content),
            'hash' => hash('sha256', $content),
        ]);

        return $scan->refresh()->load('files');
    }
}
