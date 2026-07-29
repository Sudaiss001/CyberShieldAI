<?php

namespace App\Services\Scans;

use App\Models\Scan;
use App\Models\ScanFile;
use App\Services\Scans\Contracts\ScannerInterface;
use App\Services\Scans\DTO\ScanResult;
use App\Services\Scans\Exceptions\ImageScanException;
use App\Services\Scans\Scanners\UrlScannerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageScannerService implements ScannerInterface
{
    private const MAX_IMAGE_BYTES = 10_485_760;

    private const SUPPORTED_EXTENSIONS = [
        'png',
        'jpg',
        'jpeg',
        'webp',
    ];

    private const SENSITIVE_TEXT_TERMS = [
        'login',
        'password',
        'verify',
        'account suspended',
        'urgent',
        'payment failed',
        'seed phrase',
        'wallet',
        'wire transfer',
    ];

    private const EMBEDDED_SCRIPT_MARKERS = [
        '<?php',
        '<script',
        'powershell',
        'cmd.exe',
        'wscript.shell',
        'eval(',
        'javascript:',
    ];

    public function __construct(private readonly UrlScannerService $urlScannerService)
    {
    }

    public function supports(string $scanType): bool
    {
        return in_array(strtolower($scanType), [Scan::TYPE_IMAGE, Scan::TYPE_QR], true);
    }

    public function prepareInput(UploadedFile $file, string $scanType = Scan::TYPE_IMAGE): array
    {
        $extension = strtolower((string) $file->getClientOriginalExtension());

        if (! in_array($extension, self::SUPPORTED_EXTENSIONS, true)) {
            throw new ImageScanException('Unsupported file type. Supported image types are PNG, JPG, JPEG, and WEBP.');
        }

        $content = file_get_contents($file->getRealPath());

        if ($content === false || $content === '') {
            throw new ImageScanException('Invalid image format. The uploaded image could not be read.');
        }

        if (strlen($content) > self::MAX_IMAGE_BYTES) {
            throw new ImageScanException('Invalid image format. Image exceeds the 10 MB scanning limit.');
        }

        $imageInfo = @getimagesizefromstring($content);

        if ($imageInfo === false) {
            throw new ImageScanException('Invalid image format. The uploaded image is malformed or corrupted.');
        }

        $detectedMime = $imageInfo['mime'] ?? null;
        $expectedMime = $this->mimeTypeForExtension($extension);

        if ($detectedMime !== null && $expectedMime !== null && ! $this->mimeMatchesExtension($detectedMime, $extension)) {
            throw new ImageScanException('Invalid image format. File extension does not match detected image type.');
        }

        return [
            'scan_type' => $scanType,
            'target' => Str::limit($file->getClientOriginalName(), 240, ''),
            'content' => $content,
            'source_type' => 'image_upload',
            'file_name' => $file->getClientOriginalName(),
            'extension' => $extension,
            'mime_type' => $detectedMime ?: $expectedMime ?: $file->getClientMimeType(),
            'file_size' => strlen($content),
            'hash' => hash('sha256', $content),
        ];
    }

    public function scan(Scan $scan): ScanResult
    {
        $source = $this->loadScanSource($scan);

        if ($source === null) {
            return $this->missingSourceResult($scan);
        }

        [$file, $content, $extension] = $source;
        $analysis = $this->analyzeImage($file, $content, $extension);
        $riskScore = $this->calculateRiskScore($analysis);
        $riskLevel = $this->riskLevelFromScore($riskScore);

        return ScanResult::create(
            riskScore: $riskScore,
            riskLevel: $riskLevel,
            title: 'Cyber Guardian AI image and QR scan report',
            summary: $this->buildSummary($riskLevel, $riskScore, $analysis),
            reportData: [
                'workflow' => 'image_scanner',
                'schema_version' => 1,
                'ai_analysis_enabled' => false,
                'image' => [
                    'metadata' => $analysis['metadata'],
                    'exif' => $analysis['exif'],
                    'qr' => $analysis['qr'],
                    'ocr' => $analysis['ocr'],
                    'embedded_content' => $analysis['embedded_content'],
                    'capabilities' => [
                        'metadata_extraction' => true,
                        'exif_extraction' => function_exists('exif_read_data'),
                        'native_ocr_available' => false,
                        'native_qr_pixel_decoder_available' => false,
                        'metadata_qr_decoder_available' => true,
                    ],
                ],
            ],
            indicators: $this->buildIndicators($analysis),
            evidence: $this->buildEvidence($analysis),
            recommendations: $this->buildRecommendations($analysis),
            tags: $this->buildTags($riskLevel, $analysis)
        );
    }

    private function loadScanSource(Scan $scan): ?array
    {
        $scan->loadMissing('files');
        $file = $scan->files->first();

        if (! $file || ! Storage::disk('local')->exists($file->file_path)) {
            return null;
        }

        $content = Storage::disk('local')->get($file->file_path);

        if (! is_string($content) || $content === '') {
            return null;
        }

        $extension = strtolower(pathinfo($file->file_name, PATHINFO_EXTENSION));

        if (! in_array($extension, self::SUPPORTED_EXTENSIONS, true)) {
            $extension = strtolower(pathinfo($file->file_path, PATHINFO_EXTENSION));
        }

        return [$file, $content, $extension];
    }

    private function analyzeImage(ScanFile $file, string $content, string $extension): array
    {
        $imageInfo = @getimagesizefromstring($content);

        if ($imageInfo === false) {
            throw new ImageScanException('Invalid image format. The stored image is malformed or corrupted.');
        }

        $metadata = $this->baseMetadata($file, $extension, $content, $imageInfo);
        $exif = $this->extractExif($file);
        $pngTextChunks = $extension === 'png' ? $this->extractPngTextChunks($content) : [];
        $metadataText = $this->extractMetadataText($content, $pngTextChunks, $exif);
        $qrPayloads = $this->extractQrPayloads($content, $pngTextChunks, $metadataText);
        $decodedQr = $this->decodeQrPayloads($qrPayloads);
        $ocr = $this->extractVisibleTextWhenPossible($metadataText, $exif);
        $embeddedContent = $this->detectEmbeddedContent($content);

        return [
            'metadata' => $metadata,
            'exif' => $exif,
            'qr' => [
                'detected' => $decodedQr !== [],
                'method' => $decodedQr !== [] ? 'embedded_metadata_payload' : null,
                'decoded' => $decodedQr,
                'url_count' => count(array_filter($decodedQr, fn (array $qr): bool => $qr['type'] === 'url')),
            ],
            'ocr' => $ocr,
            'embedded_content' => $embeddedContent,
        ];
    }

    private function baseMetadata(ScanFile $file, string $extension, string $content, array $imageInfo): array
    {
        $detectedExtension = isset($imageInfo[2]) ? ltrim((string) image_type_to_extension((int) $imageInfo[2], false), '.') : null;

        return [
            'file_name' => $file->file_name,
            'format' => $detectedExtension ?: $extension,
            'extension' => $extension,
            'mime_type' => $imageInfo['mime'] ?? $file->mime_type,
            'file_size' => $file->file_size,
            'sha256' => $file->hash,
            'width' => (int) ($imageInfo[0] ?? 0),
            'height' => (int) ($imageInfo[1] ?? 0),
            'bits' => $imageInfo['bits'] ?? null,
            'channels' => $imageInfo['channels'] ?? null,
            'extension_matches_mime' => $this->mimeMatchesExtension((string) ($imageInfo['mime'] ?? ''), $extension),
            'contains_trailing_data' => $this->hasTrailingData($content, $extension),
        ];
    }

    private function extractExif(ScanFile $file): array
    {
        if (! function_exists('exif_read_data')) {
            return [
                'available' => false,
                'data' => [],
                'gps_detected' => false,
            ];
        }

        $path = null;

        try {
            $path = Storage::disk('local')->path($file->file_path);
        } catch (\Throwable) {
            $path = null;
        }

        if (! $path || ! is_file($path)) {
            return [
                'available' => true,
                'data' => [],
                'gps_detected' => false,
            ];
        }

        $rawExif = @exif_read_data($path, null, true, false);

        if (! is_array($rawExif)) {
            return [
                'available' => true,
                'data' => [],
                'gps_detected' => false,
            ];
        }

        $flattened = [];

        foreach ($rawExif as $section => $values) {
            if (! is_array($values)) {
                continue;
            }

            foreach ($values as $key => $value) {
                if (is_scalar($value)) {
                    $flattened[$section.'.'.$key] = (string) $value;
                }
            }
        }

        return [
            'available' => true,
            'data' => array_slice($flattened, 0, 50, true),
            'gps_detected' => isset($rawExif['GPS']) && $rawExif['GPS'] !== [],
        ];
    }

    private function extractPngTextChunks(string $content): array
    {
        $chunks = [];

        if (! str_starts_with($content, "\x89PNG\r\n\x1A\n")) {
            return [];
        }

        $offset = 8;
        $length = strlen($content);

        while ($offset + 8 <= $length) {
            $chunkLength = unpack('N', substr($content, $offset, 4))[1] ?? 0;
            $type = substr($content, $offset + 4, 4);
            $dataStart = $offset + 8;
            $data = substr($content, $dataStart, $chunkLength);

            if ($type === 'tEXt') {
                [$keyword, $text] = array_pad(explode("\0", $data, 2), 2, '');
                $chunks[$keyword] = $text;
            }

            if ($type === 'iTXt') {
                $parts = explode("\0", $data, 6);
                $keyword = $parts[0] ?? '';
                $text = $parts[5] ?? '';

                if ($keyword !== '') {
                    $chunks[$keyword] = $text;
                }
            }

            $offset = $dataStart + $chunkLength + 4;

            if ($type === 'IEND') {
                break;
            }
        }

        return $chunks;
    }

    private function extractMetadataText(string $content, array $pngTextChunks, array $exif): array
    {
        $texts = [];

        foreach ($pngTextChunks as $keyword => $value) {
            if (trim((string) $value) !== '') {
                $texts[] = [
                    'source' => 'png_text:'.$keyword,
                    'text' => trim((string) $value),
                ];
            }
        }

        foreach ($exif['data'] ?? [] as $key => $value) {
            if (preg_match('/comment|description|usercomment|imagedescription/i', (string) $key) === 1 && trim((string) $value) !== '') {
                $texts[] = [
                    'source' => 'exif:'.$key,
                    'text' => trim((string) $value),
                ];
            }
        }

        foreach (['CYBERSHIELD_QR', 'QR_CONTENT', 'CYBERSHIELD_OCR', 'OCR_TEXT'] as $marker) {
            if (preg_match('/'.preg_quote($marker, '/').'\s*[:=]\s*([^\r\n\0]+)/i', $content, $match) === 1) {
                $texts[] = [
                    'source' => 'binary_marker:'.$marker,
                    'text' => trim($match[1]),
                ];
            }
        }

        return $texts;
    }

    private function extractQrPayloads(string $content, array $pngTextChunks, array $metadataText): array
    {
        $payloads = [];

        foreach ($pngTextChunks as $keyword => $value) {
            if (preg_match('/qr|barcode|code/i', (string) $keyword) === 1 && trim((string) $value) !== '') {
                $payloads[] = trim((string) $value);
            }
        }

        foreach ($metadataText as $textEntry) {
            if (preg_match('/qr|barcode|code/i', (string) $textEntry['source']) === 1) {
                $payloads[] = $textEntry['text'];
            }
        }

        foreach (['CYBERSHIELD_QR', 'QR_CONTENT'] as $marker) {
            if (preg_match_all('/'.preg_quote($marker, '/').'\s*[:=]\s*([^\r\n\0]+)/i', $content, $matches) >= 1) {
                foreach ($matches[1] ?? [] as $payload) {
                    $payloads[] = trim($payload);
                }
            }
        }

        return array_values(array_unique(array_filter($payloads)));
    }

    private function decodeQrPayloads(array $payloads): array
    {
        $decoded = [];

        foreach ($payloads as $payload) {
            $payload = trim((string) $payload);

            if ($payload === '') {
                continue;
            }

            $url = $this->firstUrlInText($payload);

            $decoded[] = [
                'content' => $payload,
                'type' => $url ? 'url' : 'text',
                'url' => $url,
                'url_analysis' => $url ? $this->analyzeUrl($url) : null,
            ];
        }

        return $decoded;
    }

    private function extractVisibleTextWhenPossible(array $metadataText, array $exif): array
    {
        $texts = [];

        foreach ($metadataText as $textEntry) {
            if (preg_match('/ocr|visible|text|description|comment/i', (string) $textEntry['source']) === 1) {
                $texts[] = $textEntry['text'];
            }
        }

        $text = trim(implode("\n", array_values(array_unique($texts))));

        return [
            'status' => $text !== '' ? 'metadata_text_extracted' : 'unavailable',
            'method' => $text !== '' ? 'embedded_text_metadata' : null,
            'text' => $text,
            'sensitive_terms' => $this->sensitiveTerms($text),
            'note' => $text === '' ? 'No native OCR engine is configured in this environment.' : null,
            'exif_text_fields_present' => $exif['data'] !== [],
        ];
    }

    private function detectEmbeddedContent(string $content): array
    {
        $findings = [];
        $lowerContent = strtolower($content);

        foreach (self::EMBEDDED_SCRIPT_MARKERS as $marker) {
            if (! str_contains($lowerContent, strtolower($marker))) {
                continue;
            }

            $findings[] = [
                'type' => 'embedded_script_marker',
                'label' => 'Embedded script-like content',
                'description' => "Image binary or metadata contains script marker '{$marker}'.",
                'severity' => Scan::RISK_HIGH,
                'score' => 25,
                'metadata' => ['marker' => $marker],
            ];
        }

        return $this->uniqueFindings($findings);
    }

    private function analyzeUrl(string $url): array
    {
        $urlScan = new Scan([
            'scan_type' => Scan::TYPE_URL,
            'target' => $url,
        ]);
        $result = $this->urlScannerService->scan($urlScan);

        return [
            'url' => $url,
            'risk_score' => $result->riskScore,
            'risk_level' => $result->riskLevel,
            'summary' => $result->summary,
            'tags' => $result->tags,
            'report_data' => $result->reportData,
        ];
    }

    private function calculateRiskScore(array $analysis): int
    {
        $score = 0;

        if (! ($analysis['metadata']['extension_matches_mime'] ?? true)) {
            $score += 30;
        }

        if ($analysis['metadata']['contains_trailing_data']) {
            $score += 8;
        }

        if ($analysis['exif']['gps_detected']) {
            $score += 10;
        }

        foreach ($analysis['embedded_content'] as $finding) {
            $score += (int) ($finding['score'] ?? 0);
        }

        if ($analysis['qr']['detected']) {
            $score += 5;
        }

        foreach ($analysis['qr']['decoded'] as $decoded) {
            $urlRisk = $decoded['url_analysis']['risk_score'] ?? 0;
            $score += min(45, (int) ceil($urlRisk * 0.65));
        }

        if ($analysis['ocr']['sensitive_terms'] !== []) {
            $score += min(25, count($analysis['ocr']['sensitive_terms']) * 8);
        }

        return min(100, max(0, $score));
    }

    private function buildSummary(string $riskLevel, int $riskScore, array $analysis): string
    {
        $parts = ['Image scan completed with '.str_replace('_', ' ', $riskLevel)." classification ({$riskScore}/100)."];

        if ($analysis['qr']['detected']) {
            $parts[] = count($analysis['qr']['decoded']).' QR payload(s) were decoded.';
        }

        if ($analysis['ocr']['status'] === 'metadata_text_extracted') {
            $parts[] = 'Visible text was extracted from image metadata.';
        }

        if ($analysis['embedded_content'] !== []) {
            $parts[] = count($analysis['embedded_content']).' embedded script-like indicator(s) were found.';
        }

        return implode(' ', $parts);
    }

    private function buildIndicators(array $analysis): array
    {
        $indicators = [
            [
                'label' => 'Image Format',
                'value' => strtoupper((string) $analysis['metadata']['format']),
                'severity' => 'info',
            ],
            [
                'label' => 'Dimensions',
                'value' => $analysis['metadata']['width'].'x'.$analysis['metadata']['height'],
                'severity' => 'info',
            ],
            [
                'label' => 'QR Code',
                'value' => $analysis['qr']['detected'] ? 'Detected' : 'Not detected',
                'severity' => $analysis['qr']['detected'] ? Scan::RISK_LOW : 'info',
            ],
            [
                'label' => 'OCR',
                'value' => $analysis['ocr']['status'],
                'severity' => $analysis['ocr']['sensitive_terms'] !== [] ? Scan::RISK_MEDIUM : 'info',
            ],
        ];

        foreach ($analysis['qr']['decoded'] as $decoded) {
            if (($decoded['url_analysis']['risk_score'] ?? 0) < 15) {
                continue;
            }

            $indicators[] = [
                'label' => 'QR URL Risk',
                'value' => $decoded['url'].' scored '.$decoded['url_analysis']['risk_score'].'/100',
                'severity' => $decoded['url_analysis']['risk_level'],
            ];
        }

        foreach ($analysis['embedded_content'] as $finding) {
            $indicators[] = [
                'label' => $finding['label'],
                'value' => $finding['description'],
                'severity' => $finding['severity'],
            ];
        }

        if ($analysis['exif']['gps_detected']) {
            $indicators[] = [
                'label' => 'EXIF GPS',
                'value' => 'GPS metadata detected',
                'severity' => Scan::RISK_LOW,
            ];
        }

        return $indicators;
    }

    private function buildEvidence(array $analysis): array
    {
        $evidence = [];

        foreach ($analysis['qr']['decoded'] as $decoded) {
            $severity = $decoded['url_analysis']['risk_level'] ?? Scan::RISK_LOW;

            $evidence[] = [
                'title' => 'Decoded QR payload',
                'description' => $decoded['type'] === 'url'
                    ? 'QR code payload contains a URL that was analyzed by the URL scanner.'
                    : 'QR code payload contains non-URL text.',
                'snippet' => $decoded['content'],
                'severity' => $severity,
                'metadata' => $decoded,
            ];
        }

        foreach ($analysis['embedded_content'] as $finding) {
            $evidence[] = [
                'title' => $finding['label'],
                'description' => $finding['description'],
                'snippet' => $finding['metadata']['marker'] ?? null,
                'severity' => $finding['severity'],
                'metadata' => $finding['metadata'],
            ];
        }

        if ($analysis['ocr']['sensitive_terms'] !== []) {
            $evidence[] = [
                'title' => 'Sensitive OCR text',
                'description' => 'Visible text extraction found security-sensitive or phishing-related terms.',
                'snippet' => Str::limit($analysis['ocr']['text'], 250),
                'severity' => Scan::RISK_MEDIUM,
                'metadata' => ['terms' => $analysis['ocr']['sensitive_terms']],
            ];
        }

        if ($analysis['exif']['gps_detected']) {
            $evidence[] = [
                'title' => 'EXIF GPS metadata',
                'description' => 'The image contains GPS-related EXIF metadata.',
                'snippet' => null,
                'severity' => Scan::RISK_LOW,
                'metadata' => ['exif' => $analysis['exif']['data']],
            ];
        }

        return $evidence;
    }

    private function buildRecommendations(array $analysis): array
    {
        $recommendations = [];

        if ($analysis['qr']['detected']) {
            $recommendations[] = 'Review decoded QR payloads and sandbox any URLs before users open them.';
        }

        if ($analysis['ocr']['sensitive_terms'] !== []) {
            $recommendations[] = 'Treat images containing credential, payment, or urgent action text as potential phishing lures.';
        }

        if ($analysis['embedded_content'] !== []) {
            $recommendations[] = 'Strip image metadata and block files containing script-like payload markers.';
        }

        if ($analysis['exif']['gps_detected']) {
            $recommendations[] = 'Remove sensitive EXIF metadata before sharing the image externally.';
        }

        if ($recommendations === []) {
            $recommendations[] = 'No immediate image remediation required. Keep the scan report for audit and correlation.';
        }

        return array_values(array_unique($recommendations));
    }

    private function buildTags(string $riskLevel, array $analysis): array
    {
        $tags = ['image', 'risk-'.$riskLevel, (string) $analysis['metadata']['format']];

        if ($analysis['qr']['detected']) {
            $tags[] = 'qr';
        }

        if (array_filter($analysis['qr']['decoded'], fn (array $decoded): bool => ($decoded['url_analysis']['risk_score'] ?? 0) >= 15) !== []) {
            $tags[] = 'suspicious-url';
        }

        if ($analysis['ocr']['sensitive_terms'] !== []) {
            $tags[] = 'ocr-sensitive-text';
        }

        if ($analysis['embedded_content'] !== []) {
            $tags[] = 'embedded-content-risk';
        }

        if ($analysis['exif']['gps_detected']) {
            $tags[] = 'exif-gps';
        }

        return array_values(array_unique($tags));
    }

    private function missingSourceResult(Scan $scan): ScanResult
    {
        return ScanResult::create(
            riskScore: 85,
            riskLevel: Scan::RISK_CRITICAL,
            title: 'Cyber Guardian AI image and QR scan report',
            summary: 'Image scan could not read a stored image source.',
            reportData: [
                'workflow' => 'image_scanner',
                'schema_version' => 1,
                'image' => [
                    'target' => $scan->target,
                    'error' => 'missing_image_source',
                ],
            ],
            indicators: [
                ['label' => 'Image Source', 'value' => 'Missing or unreadable', 'severity' => Scan::RISK_CRITICAL],
            ],
            evidence: [
                [
                    'title' => 'Missing image source',
                    'description' => 'The queued scan does not have a readable image file attached.',
                    'snippet' => $scan->target,
                    'severity' => Scan::RISK_CRITICAL,
                    'metadata' => ['scan_id' => $scan->id],
                ],
            ],
            recommendations: ['Create image scans through the image upload endpoint so the file source is attached to the scan.'],
            tags: ['image', 'missing-source', 'risk-critical']
        );
    }

    private function firstUrlInText(string $text): ?string
    {
        if (preg_match('/\bhttps?:\/\/[^\s<>"\'\]\)]+/i', $text, $match) !== 1) {
            return null;
        }

        return rtrim($match[0], ".,;:!?]}>'\"");
    }

    private function sensitiveTerms(string $text): array
    {
        $terms = [];
        $lowerText = strtolower($text);

        foreach (self::SENSITIVE_TEXT_TERMS as $term) {
            if (str_contains($lowerText, $term)) {
                $terms[] = $term;
            }
        }

        return array_values(array_unique($terms));
    }

    private function hasTrailingData(string $content, string $extension): bool
    {
        if ($extension === 'png') {
            $iend = strpos($content, 'IEND');

            return $iend !== false && strlen($content) > $iend + 8;
        }

        if (in_array($extension, ['jpg', 'jpeg'], true)) {
            $eoi = strrpos($content, "\xFF\xD9");

            return $eoi !== false && strlen($content) > $eoi + 2;
        }

        if ($extension === 'webp') {
            $declaredSize = unpack('V', substr($content, 4, 4))[1] ?? null;

            return is_int($declaredSize) && strlen($content) > $declaredSize + 8;
        }

        return false;
    }

    private function mimeMatchesExtension(string $mime, string $extension): bool
    {
        return match ($extension) {
            'png' => $mime === 'image/png',
            'jpg', 'jpeg' => in_array($mime, ['image/jpeg', 'image/pjpeg'], true),
            'webp' => $mime === 'image/webp',
            default => false,
        };
    }

    private function mimeTypeForExtension(string $extension): ?string
    {
        return match ($extension) {
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => null,
        };
    }

    private function uniqueFindings(array $findings): array
    {
        $unique = [];

        foreach ($findings as $finding) {
            $key = ($finding['type'] ?? '').'|'.($finding['description'] ?? '').'|'.json_encode($finding['metadata'] ?? []);
            $unique[$key] = $finding;
        }

        return array_values($unique);
    }

    private function riskLevelFromScore(int $riskScore): string
    {
        return match (true) {
            $riskScore >= 85 => Scan::RISK_CRITICAL,
            $riskScore >= 65 => Scan::RISK_HIGH,
            $riskScore >= 40 => Scan::RISK_MEDIUM,
            $riskScore >= 15 => Scan::RISK_LOW,
            default => Scan::RISK_SAFE,
        };
    }
}
