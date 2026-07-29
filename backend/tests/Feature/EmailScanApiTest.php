<?php

namespace Tests\Feature;

use App\Jobs\ProcessScanJob;
use App\Models\Role;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\EmailScannerService;
use App\Services\Scans\ScanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EmailScanApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_authenticated_user_can_create_raw_email_scan(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->user();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/email-scans', [
                'raw_email' => $this->safeEmail(),
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_EMAIL)
            ->assertJsonPath('data.scan.status', Scan::STATUS_QUEUED);

        $scan = Scan::query()->with('files')->findOrFail($response->json('data.scan.id'));

        $this->assertSame($user->id, $scan->user_id);
        $this->assertSame('raw-email.eml', $scan->files->first()->file_name);
        Storage::disk('local')->assertExists($scan->files->first()->file_path);

        Queue::assertPushed(ProcessScanJob::class, fn (ProcessScanJob $job): bool => $job->scanId === $scan->id);
    }

    public function test_authenticated_user_can_create_eml_file_scan_and_list_email_scans(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->user();
        Scan::factory()->for($user)->create(['scan_type' => Scan::TYPE_URL]);

        $response = $this->actingAs($user, 'sanctum')
            ->post('/api/v1/email-scans', [
                'email_file' => UploadedFile::fake()->createWithContent('sample.eml', $this->safeEmail()),
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_EMAIL);

        $scan = Scan::query()->with(['files', 'events'])->findOrFail($response->json('data.scan.id'));

        $this->assertSame('sample.eml', $scan->files->first()->file_name);
        $this->assertSame('eml_upload', $scan->events->firstWhere('event_type', 'scan.created')->event_data['email_source_type']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/email-scans')
            ->assertOk()
            ->assertJsonPath('data.pagination.total', 1)
            ->assertJsonPath('data.scans.0.scan_type', Scan::TYPE_EMAIL);
    }

    public function test_email_scan_processes_safe_email_and_generates_report(): void
    {
        Storage::fake('local');

        $scan = $this->createAndProcessEmailScan($this->user(), $this->safeEmail());

        $this->assertSame(Scan::STATUS_COMPLETED, $scan->status);
        $this->assertSame(Scan::RISK_SAFE, $scan->risk_level);
        $this->assertSame(0, $scan->report->risk_score);
        $this->assertSame('email_scanner', $scan->report->report_data['workflow']);
        $this->assertSame('security@example.com', $scan->report->report_data['email']['sender']['address']);
        $this->assertCount(1, $scan->report->report_data['email']['urls']);
        $this->assertTrue($scan->report->tags->contains('tag', 'email'));
    }

    public function test_email_scan_detects_phishing_sample_and_scores_critical_risk(): void
    {
        Storage::fake('local');

        $scan = $this->createAndProcessEmailScan($this->user(), $this->phishingEmail());
        $reportData = $scan->report->report_data['email'];

        $this->assertSame(Scan::STATUS_COMPLETED, $scan->status);
        $this->assertSame(Scan::RISK_CRITICAL, $scan->risk_level);
        $this->assertGreaterThanOrEqual(85, $scan->report->risk_score);
        $this->assertSame('fail', $reportData['authentication']['dmarc']['result']);
        $this->assertNotEmpty($reportData['phishing_indicators']);
        $this->assertNotEmpty($reportData['spoofing_indicators']);
        $this->assertTrue($scan->report->tags->contains('tag', 'phishing'));
        $this->assertTrue($scan->report->tags->contains('tag', 'spoofing'));
        $this->assertTrue($scan->report->tags->contains('tag', 'attachment-risk'));
        $this->assertTrue($scan->report->evidence->contains('title', 'Suspicious attachment metadata'));
    }

    public function test_email_scan_detects_spoofed_sender_indicators(): void
    {
        Storage::fake('local');

        $scan = $this->createAndProcessEmailScan($this->user(), $this->spoofedEmail());
        $indicatorTypes = collect($scan->report->report_data['email']['spoofing_indicators'])->pluck('type');

        $this->assertTrue($indicatorTypes->contains('reply_to_mismatch'));
        $this->assertTrue($indicatorTypes->contains('return_path_mismatch'));
        $this->assertTrue($indicatorTypes->contains('dmarc_failure'));
        $this->assertContains($scan->risk_level, [Scan::RISK_HIGH, Scan::RISK_CRITICAL]);
    }

    public function test_email_scan_extracts_urls_and_uses_url_scanner_signals(): void
    {
        Storage::fake('local');

        $scan = $this->createAndProcessEmailScan($this->user(), $this->emailWithMultipleUrls());
        $urls = collect($scan->report->report_data['email']['urls']);

        $this->assertCount(2, $urls);
        $this->assertTrue($urls->contains('normalized_url', 'https://example.com/reset'));
        $this->assertTrue($urls->contains('host', 'security-login.top'));
        $this->assertTrue($urls->firstWhere('host', 'security-login.top')['signals']['has_userinfo_obfuscation']);
    }

    public function test_email_scan_report_can_be_retrieved_from_email_endpoint(): void
    {
        Storage::fake('local');

        $user = $this->user();
        $scan = $this->createAndProcessEmailScan($user, $this->phishingEmail());

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/email-scans/{$scan->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.scan.scan_type', Scan::TYPE_EMAIL)
            ->assertJsonPath('data.scan.report.report_data.workflow', 'email_scanner')
            ->assertJsonFragment(['tag' => 'email']);
    }

    public function test_email_scan_rejects_invalid_corrupted_missing_header_and_unsupported_inputs(): void
    {
        Queue::fake();
        Storage::fake('local');

        $user = $this->user();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/email-scans', [
                'raw_email' => 'This is not an RFC 822 style email.',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Invalid email format. The email headers could not be parsed.');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/email-scans', [
                'raw_email' => "Subject: Missing From\n\nBody",
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Missing headers. Email scans require a From header.');

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/email-scans', [
                'email_file' => UploadedFile::fake()->createWithContent('sample.txt', $this->safeEmail()),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('data.errors.email_file.0', 'Unsupported file type. Only .eml files are supported.');

        $this->actingAs($user, 'sanctum')
            ->post('/api/v1/email-scans', [
                'email_file' => UploadedFile::fake()->createWithContent('corrupted.eml', "From: Security <security@example.com>\0"),
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Corrupted .eml file. Binary null bytes were found in the email content.');
    }

    private function createAndProcessEmailScan(User $user, string $email): Scan
    {
        $input = app(EmailScannerService::class)->prepareInput([
            'raw_email' => $email,
        ]);

        $scan = app(ScanService::class)->createEmailScan($user, $input);

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

    private function safeEmail(): string
    {
        return <<<'EML'
From: Security Team <security@example.com>
To: User <user@example.com>
Subject: Weekly security update
Date: Wed, 29 Jul 2026 08:00:00 +0000
Message-ID: <safe-123@example.com>
Authentication-Results: mx.example.com; spf=pass smtp.mailfrom=example.com; dkim=pass header.d=example.com; dmarc=pass header.from=example.com
Received-SPF: pass (example.com: domain of security@example.com designates 203.0.113.10 as permitted sender)
DKIM-Signature: v=1; a=rsa-sha256; d=example.com; s=mail;

Hello,

Your weekly security update is available at https://example.com/status
EML;
    }

    private function phishingEmail(): string
    {
        return <<<'EML'
From: PayPal Support <security@paypaI-security.top>
Reply-To: Account Review <review@credential-reset.xyz>
Return-Path: <bounce@credential-reset.xyz>
To: User <user@example.com>
Subject: Urgent: account suspended, verify your password immediately
Date: Wed, 29 Jul 2026 09:00:00 +0000
Message-ID: <phish-123@credential-reset.xyz>
Authentication-Results: mx.example.com; spf=fail smtp.mailfrom=credential-reset.xyz; dkim=fail header.d=credential-reset.xyz; dmarc=fail header.from=paypaI-security.top
Received-SPF: fail (credential-reset.xyz: domain does not designate sender)
Content-Type: multipart/mixed; boundary="scan-boundary"

--scan-boundary
Content-Type: text/html; charset=UTF-8

<p>PayPal security alert: urgent immediate action required. Verify your account and password now.</p>
<p><a href="http://paypal.com@security-login.top/verify/account/password">https://paypal.com/login</a></p>
<form action="http://paypal.com@security-login.top/collect"><input name="password"></form>

--scan-boundary
Content-Type: text/html; name="invoice.html"
Content-Disposition: attachment; filename="invoice.html"
Content-Transfer-Encoding: base64

PGh0bWw+PC9odG1sPg==
--scan-boundary--
EML;
    }

    private function spoofedEmail(): string
    {
        return <<<'EML'
From: CEO <ceo@company.com>
Reply-To: CEO <ceo@evil.example>
Return-Path: <bounce@evil.example>
To: Finance <finance@company.com>
Subject: Wire transfer request
Date: Wed, 29 Jul 2026 10:00:00 +0000
Message-ID: <spoof-123@evil.example>
Authentication-Results: mx.company.com; spf=fail smtp.mailfrom=evil.example; dkim=pass header.d=company.com; dmarc=fail header.from=company.com

Please prepare a wire transfer before close of business.
EML;
    }

    private function emailWithMultipleUrls(): string
    {
        return <<<'EML'
From: Help Desk <helpdesk@example.com>
To: User <user@example.com>
Subject: Password reset links
Date: Wed, 29 Jul 2026 11:00:00 +0000
Message-ID: <links-123@example.com>
Authentication-Results: mx.example.com; spf=pass smtp.mailfrom=example.com; dkim=pass header.d=example.com; dmarc=pass header.from=example.com

Use https://example.com/reset if you requested the reset.
Ignore http://example.com@security-login.top/verify/account/password.
EML;
    }
}
