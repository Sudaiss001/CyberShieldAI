<?php

namespace Tests\Unit;

use App\Support\VideoValidator;
use PHPUnit\Framework\TestCase;

class VideoValidatorTest extends TestCase
{
    public function test_validates_supported_video_containers(): void
    {
        $res = VideoValidator::validate('presentation.mp4', 'video/mp4', 5 * 1024 * 1024);

        $this->assertTrue($res['valid']);
        $this->assertSame('mp4', $res['extension']);
        $this->assertNull($res['error']);
    }

    public function test_rejects_unsupported_video_containers(): void
    {
        $res = VideoValidator::validate('script.sh', 'application/x-sh', 1024);

        $this->assertFalse($res['valid']);
        $this->assertNotNull($res['error']);
    }

    public function test_extracts_video_metadata(): void
    {
        $meta = VideoValidator::extractMetadata('webinar.webm', 10 * 1024 * 1024);

        $this->assertSame('WEBM', $meta['format']);
        $this->assertSame('1920x1080', $meta['resolution']);
        $this->assertSame('VP9 / Opus', $meta['codec']);
        $this->assertGreaterThan(0, $meta['duration_seconds']);
    }
}
