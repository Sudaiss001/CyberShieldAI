<?php

namespace Tests\Feature;

use App\Jobs\ProcessScanJob;
use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\DocumentScannerService;
use App\Services\Scans\ScanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

class DocumentScanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_authenticated_user_can_create_document_scan(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->user();

        $response = $this->actingAs($user, 'sanctum')
            ->post('/api/v1/document-scans', [
                'document_file' => UploadedFile::fake()->createWithContent('brief.txt', $this->safeTxt()),
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_DOCUMENT)
            ->assertJsonPath('data.scan.status', Scan::STATUS_QUEUED);

        $scan = Scan::query()->with('files')->findOrFail($response->json('data.scan.id'));

        $this->assertSame('brief.txt', $scan->files->first()->file_name);
        Storage::disk('local')->assertExists($scan->files->first()->file_path);
        Queue::assertPushed(ProcessScanJob::class, fn (ProcessScanJob $job): bool => $job->scanId === $scan->id);
    }

    public function test_document_scan_extracts_text_hyperlinks_and_generates_safe_report(): void
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

        $scan = $this->createAndProcessDocumentScan($this->user(), 'brief.txt', $this->safeTxt());
        $document = $scan->report->report_data['document'];

        $this->assertSame(Scan::STATUS_COMPLETED, $scan->status);
        $this->assertSame(Scan::RISK_SAFE, $scan->risk_level);
        $this->assertSame('document_scanner', $scan->report->report_data['workflow']);
        $this->assertSame('plain_text', $document['text']['extraction_method']);
        $this->assertStringContainsString('Quarterly security brief', $document['text']['excerpt']);
        $this->assertCount(1, $document['hyperlinks']);
        $this->assertTrue($scan->report->tags->contains('tag', 'document'));
    }

    public function test_document_scan_detects_password_protected_pdf(): void
    {
        Storage::fake('local');
        Http::fake();

        $scan = $this->createAndProcessDocumentScan($this->user(), 'locked.pdf', $this->passwordProtectedPdf());
        $document = $scan->report->report_data['document'];

        $this->assertTrue($document['password_protected']);
        $this->assertSame('skipped_password_protected', $document['text']['extraction_method']);
        $this->assertTrue($scan->report->tags->contains('tag', 'password-protected'));
        $this->assertTrue($scan->report->evidence->contains('title', 'Password-protected document'));
    }

    public function test_document_scan_detects_docx_macros_and_suspicious_links(): void
    {
        Storage::fake('local');
        Http::fake([
            'http://evil.top/*' => Http::response('Login', 200, []),
        ]);

        $scan = $this->createAndProcessDocumentScan($this->user(), 'invoice.docx', $this->suspiciousDocx());
        $document = $scan->report->report_data['document'];

        $this->assertSame(Scan::RISK_CRITICAL, $scan->risk_level);
        $this->assertGreaterThanOrEqual(85, $scan->report->risk_score);
        $this->assertNotEmpty($document['scripts_and_macros']);
        $this->assertCount(1, $document['hyperlinks']);
        $this->assertTrue($scan->report->tags->contains('tag', 'macro-script-risk'));
        $this->assertTrue($scan->report->tags->contains('tag', 'suspicious-url'));
    }

    public function test_document_scan_report_can_be_retrieved_from_document_endpoint(): void
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

        $user = $this->user();
        $scan = $this->createAndProcessDocumentScan($user, 'brief.txt', $this->safeTxt());

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/document-scans/{$scan->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_DOCUMENT)
            ->assertJsonPath('data.scan.report.report_data.workflow', 'document_scanner')
            ->assertJsonFragment(['tag' => 'document']);
    }

    public function test_document_scan_rejects_unsupported_and_corrupted_inputs(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->user();

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/document-scans', [
                'document_file' => UploadedFile::fake()->createWithContent('malware.exe', 'MZ'),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('data.errors.document_file.0', 'Unsupported file type. Supported document types are PDF, DOC, DOCX, and TXT.');

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/document-scans', [
                'document_file' => UploadedFile::fake()->createWithContent('broken.pdf', 'not a pdf'),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Invalid document format. The uploaded PDF is malformed or corrupted.');
    }

    private function createAndProcessDocumentScan(User $user, string $fileName, string $content): Scan
    {
        $input = app(DocumentScannerService::class)->prepareInput(
            UploadedFile::fake()->createWithContent($fileName, $content)
        );

        $scan = app(ScanService::class)->createDocumentScan($user, $input);

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

    private function safeTxt(): string
    {
        return "Quarterly security brief\nReview status at https://example.com/status\nNo scripts or macros are included.";
    }

    private function passwordProtectedPdf(): string
    {
        return "%PDF-1.7\n1 0 obj << /Type /Catalog /Encrypt 2 0 R >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF";
    }

    private function suspiciousDocx(): string
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'cybershield-test-docx-');
        $zip = new ZipArchive();
        $zip->open($tempPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
        $zip->addFromString('word/document.xml', '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Urgent invoice login document</w:t></w:r></w:p></w:body></w:document>');
        $zip->addFromString('word/_rels/document.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="http://evil.top/login" TargetMode="External"/></Relationships>');
        $zip->addFromString('word/vbaProject.bin', 'AutoOpen CreateObject WScript.Shell powershell');
        $zip->close();

        $content = (string) file_get_contents($tempPath);
        @unlink($tempPath);

        return $content;
    }
}
