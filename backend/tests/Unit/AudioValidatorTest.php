<?php

namespace Tests\Unit;

use App\Support\AudioValidator;
use PHPUnit\Framework\TestCase;

class AudioValidatorTest extends TestCase
{
    public function test_validates_supported_audio_formats(): void
    {
        $res = AudioValidator::validate('recording.mp3', 'audio/mpeg', 1024 * 500);

        $this->assertTrue($res['valid']);
        $this->assertSame('mp3', $res['extension']);
        $this->assertNull($res['error']);
    }

    public function test_rejects_unsupported_audio_extensions(): void
    {
        $res = AudioValidator::validate('malicious.exe', 'application/x-msdownload', 1024);

        $this->assertFalse($res['valid']);
        $this->assertNotNull($res['error']);
    }

    public function test_extracts_audio_metadata(): void
    {
        $meta = AudioValidator::extractMetadata('voicemail.wav', 1411000);

        $this->assertSame('WAV', $meta['format']);
        $this->assertSame(48000, $meta['sample_rate_hz']);
        $this->assertSame(1411, $meta['bitrate_kbps']);
        $this->assertGreaterThan(0, $meta['duration_seconds']);
    }
}
