<?php

namespace Tests\Unit;

use App\Models\Scan;
use App\Services\Scans\ScannerFactory;
use App\Services\Scans\Scanners\AudioScannerService;
use App\Services\Scans\Scanners\VideoScannerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VideoScannerServiceTest extends TestCase
{
    use RefreshDatabase;

    private VideoScannerService $scanner;

    protected function setUp(): void
    {
        parent::setUp();
        $factory = app(ScannerFactory::class);
        $audioScanner = app(AudioScannerService::class);
        $this->scanner = new VideoScannerService($factory, $audioScanner);
    }

    public function test_video_scanner_detects_qr_codes_and_cross_scans_urls(): void
    {
        Http::fake([
            '*phishing-qr-login-verify.top*' => Http::response('Phishing Page', 200, []),
        ]);

        $scan = new Scan([
            'scan_type' => Scan::TYPE_VIDEO,
            'target' => 'qr_code_video_sample.mp4',
        ]);
        $scan->id = 1;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertGreaterThanOrEqual(15, $result->riskScore);
        $this->assertNotEmpty($result->reportData['qr_codes_detected']);
        $this->assertNotEmpty($result->reportData['qr_url_scans']);
        $this->assertContains('QR Code Detected', $result->tags);
    }

    public function test_video_scanner_scans_safe_clean_video(): void
    {
        $scan = new Scan([
            'scan_type' => Scan::TYPE_VIDEO,
            'target' => 'clean_nature_clip.mp4',
        ]);
        $scan->id = 2;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertSame(Scan::RISK_SAFE, $result->riskLevel);
        $this->assertSame(0, $result->riskScore);
    }

    public function test_video_scanner_rejects_corrupted_file_input(): void
    {
        $scan = new Scan([
            'scan_type' => Scan::TYPE_VIDEO,
            'target' => 'corrupted_video.dat',
        ]);
        $scan->id = 3;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertSame(Scan::RISK_CRITICAL, $result->riskLevel);
        $this->assertGreaterThanOrEqual(85, $result->riskScore);
    }
}
