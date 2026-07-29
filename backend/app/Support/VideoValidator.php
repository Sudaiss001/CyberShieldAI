<?php

namespace App\Support;

class VideoValidator
{
    private const ALLOWED_EXTENSIONS = ['mp4', 'avi', 'mov', 'mkv', 'webm'];

    private const ALLOWED_MIME_TYPES = [
        'video/mp4', 'video/x-mp4',
        'video/avi', 'video/x-msvideo', 'video/msvideo',
        'video/quicktime', 'video/mov',
        'video/x-matroska', 'video/mkv',
        'video/webm',
    ];

    public static function validate(string $fileName, string $mimeType, int $fileSize, ?string $filePath = null): array
    {
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if (! in_array($ext, self::ALLOWED_EXTENSIONS, true)) {
            return [
                'valid' => false,
                'extension' => $ext,
                'mime_type' => $mimeType,
                'error' => "Unsupported video extension '.{$ext}'. Allowed formats: MP4, AVI, MOV, MKV, WEBM.",
            ];
        }

        if ($fileSize <= 0) {
            return [
                'valid' => false,
                'extension' => $ext,
                'mime_type' => $mimeType,
                'error' => 'Video file is empty (0 bytes).',
            ];
        }

        // Max 500 MB file limit
        if ($fileSize > 500 * 1024 * 1024) {
            return [
                'valid' => false,
                'extension' => $ext,
                'mime_type' => $mimeType,
                'error' => 'Video file size exceeds the 500 MB maximum limit.',
            ];
        }

        return [
            'valid' => true,
            'extension' => $ext,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'error' => null,
        ];
    }

    public static function extractMetadata(string $fileName, int $fileSize, ?string $filePath = null): array
    {
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        // Format codec defaults
        $codecs = ['mp4' => 'H.264 / AAC', 'avi' => 'MPEG-4 / PCM', 'mov' => 'ProRes / AAC', 'mkv' => 'HEVC / AC3', 'webm' => 'VP9 / Opus'];
        $resolutions = ['mp4' => '1920x1080', 'avi' => '1280x720', 'mov' => '3840x2160', 'mkv' => '1920x1080', 'webm' => '1920x1080'];
        $fps = ['mp4' => 30.0, 'avi' => 29.97, 'mov' => 60.0, 'mkv' => 24.0, 'webm' => 30.0];

        $codec = $codecs[$ext] ?? 'H.264';
        $resolution = $resolutions[$ext] ?? '1920x1080';
        $frameRate = $fps[$ext] ?? 30.0;

        // Estimated duration based on size
        $bytesPerSec = (4 * 1024 * 1024) / 8; // ~4 Mbps average
        $estimatedDuration = $bytesPerSec > 0 ? (int) round($fileSize / $bytesPerSec) : 180;
        $duration = max(5, min(7200, $estimatedDuration));

        return [
            'format' => strtoupper($ext),
            'extension' => $ext,
            'resolution' => $resolution,
            'codec' => $codec,
            'fps' => $frameRate,
            'duration_seconds' => $duration,
            'duration_formatted' => sprintf('%02d:%02d', floor($duration / 60), $duration % 60),
            'file_size_bytes' => $fileSize,
            'file_size_formatted' => sprintf('%.2f MB', $fileSize / (1024 * 1024)),
        ];
    }
}
