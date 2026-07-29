<?php

namespace App\Support;

class AudioValidator
{
    private const ALLOWED_EXTENSIONS = ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a'];

    private const ALLOWED_MIME_TYPES = [
        'audio/mpeg', 'audio/mp3', 'audio/x-mpeg',
        'audio/wav', 'audio/x-wav',
        'audio/aac', 'audio/x-aac',
        'audio/ogg', 'audio/vorbis', 'application/ogg',
        'audio/flac', 'audio/x-flac',
        'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'video/mp4',
    ];

    public static function validate(string $fileName, string $mimeType, int $fileSize, ?string $filePath = null): array
    {
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if (! in_array($ext, self::ALLOWED_EXTENSIONS, true)) {
            return [
                'valid' => false,
                'extension' => $ext,
                'mime_type' => $mimeType,
                'error' => "Unsupported audio extension '.{$ext}'. Allowed formats: MP3, WAV, AAC, OGG, FLAC, M4A.",
            ];
        }

        if ($fileSize <= 0) {
            return [
                'valid' => false,
                'extension' => $ext,
                'mime_type' => $mimeType,
                'error' => 'Audio file is empty (0 bytes).',
            ];
        }

        // Max 100 MB file limit
        if ($fileSize > 100 * 1024 * 1024) {
            return [
                'valid' => false,
                'extension' => $ext,
                'mime_type' => $mimeType,
                'error' => 'Audio file size exceeds the 100 MB maximum limit.',
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

        // Format-specific metadata defaults
        $sampleRates = ['mp3' => 44100, 'wav' => 48000, 'flac' => 96000, 'aac' => 44100, 'ogg' => 44100, 'm4a' => 44100];
        $bitrates = ['mp3' => 320, 'wav' => 1411, 'flac' => 1024, 'aac' => 256, 'ogg' => 192, 'm4a' => 256];

        $sampleRate = $sampleRates[$ext] ?? 44100;
        $bitrate = $bitrates[$ext] ?? 256;
        $channels = ($ext === 'wav' || $ext === 'flac') ? 2 : 2;

        // Estimated duration based on file size and bitrate
        $bytesPerSec = ($bitrate * 1000) / 8;
        $estimatedDuration = $bytesPerSec > 0 ? (int) round($fileSize / $bytesPerSec) : 120;
        $duration = max(5, min(3600, $estimatedDuration));

        return [
            'format' => strtoupper($ext),
            'extension' => $ext,
            'duration_seconds' => $duration,
            'duration_formatted' => sprintf('%02d:%02d', floor($duration / 60), $duration % 60),
            'bitrate_kbps' => $bitrate,
            'sample_rate_hz' => $sampleRate,
            'channels' => $channels,
            'channels_name' => $channels === 1 ? 'Mono' : 'Stereo',
            'file_size_bytes' => $fileSize,
            'file_size_formatted' => sprintf('%.2f MB', $fileSize / (1024 * 1024)),
        ];
    }
}
