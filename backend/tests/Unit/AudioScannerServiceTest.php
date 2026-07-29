<?php

namespace Tests\Unit;

use App\Models\Scan;
use App\Services\Scans\Scanners\AudioScannerService;
use PHPUnit\Framework\TestCase;

class AudioScannerServiceTest extends TestCase
{
    private AudioScannerService $scanner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scanner = new AudioScannerService();
    }

    public function test_audio_scanner_analyzes_vishing_transcript_and_detects_keywords_and_phone(): void
    {
        $scan = new Scan([
            'scan_type' => Scan::TYPE_AUDIO,
            'target' => 'vishing_scam_call.mp3',
        ]);
        $scan->id = 1;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertGreaterThanOrEqual(40, $result->riskScore);
        $this->assertNotEmpty($result->indicators);
        $this->assertNotEmpty($result->evidence);
        $this->assertContains('Vishing Alert', $result->tags);
    }

    public function test_audio_scanner_analyzes_clean_audio(): void
    {
        $scan = new Scan([
            'scan_type' => Scan::TYPE_AUDIO,
            'target' => 'clean_lecture.mp3',
        ]);
        $scan->id = 2;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertSame(Scan::RISK_SAFE, $result->riskLevel);
        $this->assertSame(0, $result->riskScore);
    }

    public function test_audio_scanner_rejects_corrupted_file_input(): void
    {
        $scan = new Scan([
            'scan_type' => Scan::TYPE_AUDIO,
            'target' => 'corrupted.xyz',
        ]);
        $scan->id = 3;
        $scan->user_id = 1;

        $result = $this->scanner->scan($scan);

        $this->assertSame(Scan::RISK_CRITICAL, $result->riskLevel);
        $this->assertGreaterThanOrEqual(85, $result->riskScore);
    }
}
