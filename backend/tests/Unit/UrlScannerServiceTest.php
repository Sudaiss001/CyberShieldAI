<?php

namespace Tests\Unit;

use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\Scanners\UrlScannerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UrlScannerServiceTest extends TestCase
{
    use RefreshDatabase;

    private UrlScannerService $scanner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scanner = new UrlScannerService();
    }

    public function test_it_scans_safe_https_url_with_all_security_headers(): void
    {
        Http::fake([
            '*safe-bank.com*' => Http::response('OK', 200, [
                'Strict-Transport-Security' => 'max-age=31536000',
                'Content-Security-Policy' => "default-src 'self'",
                'X-Frame-Options' => 'DENY',
                'X-Content-Type-Options' => 'nosniff',
                'Referrer-Policy' => 'strict-origin-when-cross-origin',
            ]),
        ]);

        $scan = new Scan([
            'scan_type' => Scan::TYPE_URL,
            'target' => 'https://safe-bank.com/portal',
        ]);
        $scan->id = 1;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertSame(Scan::RISK_SAFE, $result->riskLevel);
        $this->assertLessThan(15, $result->riskScore);
        $this->assertNotEmpty($result->indicators);
        $this->assertNotEmpty($result->recommendations);
    }

    public function test_it_detects_risk_for_unencrypted_http_and_missing_headers(): void
    {
        Http::fake([
            'http://insecure-site.com/*' => Http::response('Welcome', 200, []),
        ]);

        $scan = new Scan([
            'scan_type' => Scan::TYPE_URL,
            'target' => 'http://insecure-site.com/home',
        ]);
        $scan->id = 2;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertGreaterThanOrEqual(20, $result->riskScore);
        $this->assertContains('Unencrypted', $result->tags);
    }

    public function test_it_handles_redirect_chains(): void
    {
        Http::fake([
            'http://short.url/abc' => Http::response(null, 301, ['Location' => 'https://final-dest.com/login']),
            'https://final-dest.com/login' => Http::response('Login Page', 200, [
                'Strict-Transport-Security' => 'max-age=31536000',
            ]),
        ]);

        $scan = new Scan([
            'scan_type' => Scan::TYPE_URL,
            'target' => 'http://short.url/abc',
        ]);
        $scan->id = 3;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertSame(1, $result->reportData['http_result']['redirect_count']);
        $this->assertTrue($result->reportData['http_result']['reachable']);
    }

    public function test_it_gracefully_handles_unreachable_hosts(): void
    {
        Http::fake([
            'https://unreachable-domain-12345.com/*' => Http::failedConnection('DNS query failed'),
        ]);

        $scan = new Scan([
            'scan_type' => Scan::TYPE_URL,
            'target' => 'https://unreachable-domain-12345.com',
        ]);
        $scan->id = 4;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertFalse($result->reportData['http_result']['reachable']);
        $this->assertGreaterThanOrEqual(20, $result->riskScore);
    }

    public function test_it_flags_high_risk_for_ip_address_and_obfuscation(): void
    {
        Http::fake([
            'http://192.168.1.1/*' => Http::response('Unauthorized', 401),
        ]);

        $scan = new Scan([
            'scan_type' => Scan::TYPE_URL,
            'target' => 'http://user@192.168.1.1/login-verify-account',
        ]);
        $scan->id = 5;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertGreaterThanOrEqual(65, $result->riskScore);
        $this->assertContains($result->riskLevel, [Scan::RISK_HIGH, Scan::RISK_CRITICAL]);
    }
}
