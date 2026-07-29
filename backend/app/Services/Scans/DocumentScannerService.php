<?php

namespace App\Services\Scans;

use App\Models\Scan;
use App\Models\ScanFile;
use App\Services\Scans\Contracts\ScannerInterface;
use App\Services\Scans\DTO\ScanResult;
use App\Services\Scans\Exceptions\DocumentScanException;
use App\Services\Scans\Scanners\UrlScannerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class DocumentScannerService implements ScannerInterface
{
    private const MAX_DOCUMENT_BYTES = 15_728_640;

    private const SUPPORTED_EXTENSIONS = [
        'pdf',
        'doc',
        'docx',
        'txt',
    ];

    private const SUSPICIOUS_SCRIPT_PATTERNS = [
        'autoopen',
        'document_open',
        'createobject',
        'wscript.shell',
        'powershell',
        'cmd.exe',
        'shell.application',
        'javascript',
        '/javascript',
        '/launch',
        '/openaction',
        'activex',
        'ddeauto',
        'urldownloadtofile',
    ];

    public function __construct(private readonly UrlScannerService $urlScannerService)
    {
    }

    public function supports(string $scanType): bool
    {
        return strtolower($scanType) === Scan::TYPE_DOCUMENT;
    }

    public function prepareInput(UploadedFile $file): array
    {
        $extension = strtolower((string) $file->getClientOriginalExtension());

        if (! in_array($extension, self::SUPPORTED_EXTENSIONS, true)) {
            throw new DocumentScanException('Unsupported file type. Supported document types are PDF, DOC, DOCX, and TXT.');
        }

        $content = file_get_contents($file->getRealPath());

        if ($content === false || $content === '') {
            throw new DocumentScanException('Invalid document format. The uploaded document could not be read.');
        }

        if (strlen($content) > self::MAX_DOCUMENT_BYTES) {
            throw new DocumentScanException('Invalid document format. Document exceeds the 15 MB scanning limit.');
        }

        $this->validateDocumentContent($extension, $content);

        return [
            'scan_type' => Scan::TYPE_DOCUMENT,
            'target' => Str::limit($file->getClientOriginalName(), 240, ''),
            'content' => $content,
            'source_type' => 'document_upload',
            'file_name' => $file->getClientOriginalName(),
            'extension' => $extension,
            'mime_type' => $file->getClientMimeType() ?: $this->mimeTypeForExtension($extension),
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
        $analysis = $this->analyzeDocument($file, $content, $extension);
        $urlAnalyses = $this->analyzeUrls($analysis['hyperlinks']);
        $riskScore = $this->calculateRiskScore($analysis, $urlAnalyses);
        $riskLevel = $this->riskLevelFromScore($riskScore);
        $tags = $this->buildTags($riskLevel, $analysis, $urlAnalyses);

        return ScanResult::create(
            riskScore: $riskScore,
            riskLevel: $riskLevel,
            title: 'Cyber Guardian AI document scan report',
            summary: $this->buildSummary($riskLevel, $riskScore, $analysis, $urlAnalyses),
            reportData: [
                'workflow' => 'document_scanner',
                'schema_version' => 1,
                'ai_analysis_enabled' => false,
                'document' => [
                    'metadata' => $analysis['metadata'],
                    'text' => [
                        'length' => mb_strlen($analysis['text']),
                        'excerpt' => Str::limit($analysis['text'], 800),
                        'extraction_method' => $analysis['text_extraction_method'],
                    ],
                    'password_protected' => $analysis['password_protected'],
                    'hyperlinks' => $urlAnalyses,
                    'scripts_and_macros' => $analysis['scripts_and_macros'],
                    'counts' => [
                        'hyperlinks' => count($urlAnalyses),
                        'suspicious_scripts' => count($analysis['scripts_and_macros']),
                    ],
                ],
            ],
            indicators: $this->buildIndicators($analysis, $urlAnalyses),
            evidence: $this->buildEvidence($analysis, $urlAnalyses),
            recommendations: $this->buildRecommendations($analysis, $urlAnalyses),
            tags: $tags
        );
    }

    private function validateDocumentContent(string $extension, string $content): void
    {
        if ($extension === 'pdf' && ! str_starts_with($content, '%PDF-')) {
            throw new DocumentScanException('Invalid document format. The uploaded PDF is malformed or corrupted.');
        }

        if ($extension === 'docx') {
            $zip = new ZipArchive();
            $tempPath = $this->temporaryContentPath($content, 'docx');
            $opened = $zip->open($tempPath);

            if ($opened !== true) {
                @unlink($tempPath);
                throw new DocumentScanException('Invalid document format. The uploaded DOCX is malformed, encrypted, or corrupted.');
            }

            $hasOfficeContent = $zip->locateName('[Content_Types].xml') !== false
                && ($zip->locateName('word/document.xml') !== false || $zip->locateName('docProps/core.xml') !== false);

            $zip->close();
            @unlink($tempPath);

            if (! $hasOfficeContent) {
                throw new DocumentScanException('Invalid document format. The uploaded DOCX does not contain readable Office document parts.');
            }
        }

        if ($extension === 'txt' && trim($this->normalizeText($content)) === '') {
            throw new DocumentScanException('Invalid document format. TXT documents must contain readable text.');
        }

        if ($extension === 'doc' && strlen($content) < 16) {
            throw new DocumentScanException('Invalid document format. The uploaded DOC is malformed or corrupted.');
        }
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

    private function analyzeDocument(ScanFile $file, string $content, string $extension): array
    {
        return match ($extension) {
            'pdf' => $this->analyzePdf($file, $content),
            'docx' => $this->analyzeDocx($file, $content),
            'doc' => $this->analyzeDoc($file, $content),
            'txt' => $this->analyzeTxt($file, $content),
            default => throw new DocumentScanException('Unsupported file type. Supported document types are PDF, DOC, DOCX, and TXT.'),
        };
    }

    private function analyzeTxt(ScanFile $file, string $content): array
    {
        $text = $this->normalizeText($content);

        return [
            'metadata' => $this->baseMetadata($file, 'txt', [
                'line_count' => substr_count($text, "\n") + 1,
            ]),
            'text' => $text,
            'text_extraction_method' => 'plain_text',
            'password_protected' => false,
            'hyperlinks' => $this->extractUrls($text),
            'scripts_and_macros' => $this->detectSuspiciousScripts($content, 'txt'),
        ];
    }

    private function analyzePdf(ScanFile $file, string $content): array
    {
        $passwordProtected = str_contains($content, '/Encrypt') || str_contains($content, '/Filter /Standard');
        $metadata = $this->baseMetadata($file, 'pdf', [
            'pdf_version' => $this->firstMatch('/%PDF-([0-9.]+)/', $content),
            'page_count_estimate' => preg_match_all('/\/Type\s*\/Page\b/', $content),
            'title' => $this->pdfMetadataValue('Title', $content),
            'author' => $this->pdfMetadataValue('Author', $content),
            'creator' => $this->pdfMetadataValue('Creator', $content),
            'producer' => $this->pdfMetadataValue('Producer', $content),
        ]);
        $text = $passwordProtected ? '' : $this->extractPdfText($content);
        $hyperlinks = array_merge($this->extractUrls($text), $this->extractPdfUriLinks($content));

        return [
            'metadata' => $metadata,
            'text' => $text,
            'text_extraction_method' => $passwordProtected ? 'skipped_password_protected' : 'pdf_literal_strings',
            'password_protected' => $passwordProtected,
            'hyperlinks' => array_values(array_unique($hyperlinks)),
            'scripts_and_macros' => $this->detectSuspiciousScripts($content, 'pdf'),
        ];
    }

    private function analyzeDocx(ScanFile $file, string $content): array
    {
        $tempPath = $this->temporaryContentPath($content, 'docx');
        $zip = new ZipArchive();

        if ($zip->open($tempPath) !== true) {
            @unlink($tempPath);

            return [
                'metadata' => $this->baseMetadata($file, 'docx', ['encrypted_package_detected' => str_contains($content, 'EncryptedPackage')]),
                'text' => '',
                'text_extraction_method' => 'unreadable_zip',
                'password_protected' => true,
                'hyperlinks' => [],
                'scripts_and_macros' => $this->detectSuspiciousScripts($content, 'docx'),
            ];
        }

        $parts = $this->readDocxTextParts($zip);
        $text = $this->normalizeText(implode("\n", $parts));
        $relationships = $this->readDocxRelationships($zip);
        $metadata = array_merge(
            $this->baseMetadata($file, 'docx', [
                'zip_entries' => $zip->numFiles,
            ]),
            $this->readDocxProperties($zip)
        );
        $scripts = $this->detectDocxScripts($zip, $content);
        $zip->close();
        @unlink($tempPath);

        return [
            'metadata' => $metadata,
            'text' => $text,
            'text_extraction_method' => 'docx_xml',
            'password_protected' => false,
            'hyperlinks' => array_values(array_unique(array_merge($this->extractUrls($text), $relationships))),
            'scripts_and_macros' => $scripts,
        ];
    }

    private function analyzeDoc(ScanFile $file, string $content): array
    {
        $text = $this->extractPrintableText($content);
        $passwordProtected = stripos($content, 'EncryptedPackage') !== false
            || stripos($content, 'encryption') !== false
            || stripos($content, 'password') !== false;

        return [
            'metadata' => $this->baseMetadata($file, 'doc', [
                'ole_compound_file' => str_starts_with($content, "\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"),
                'text_extraction_confidence' => 'low',
            ]),
            'text' => $text,
            'text_extraction_method' => 'binary_printable_strings',
            'password_protected' => $passwordProtected,
            'hyperlinks' => $this->extractUrls($text),
            'scripts_and_macros' => $this->detectSuspiciousScripts($content, 'doc'),
        ];
    }

    private function baseMetadata(ScanFile $file, string $format, array $extra = []): array
    {
        return array_merge([
            'file_name' => $file->file_name,
            'format' => $format,
            'mime_type' => $file->mime_type,
            'file_size' => $file->file_size,
            'sha256' => $file->hash,
        ], array_filter($extra, fn ($value): bool => $value !== null && $value !== ''));
    }

    private function readDocxTextParts(ZipArchive $zip): array
    {
        $parts = [];

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);

            if (! preg_match('#^word/(document|header\d+|footer\d+|footnotes|endnotes|comments)\.xml$#', $name)) {
                continue;
            }

            $xml = $zip->getFromName($name);

            if (! is_string($xml)) {
                continue;
            }

            $parts[] = $this->xmlText($xml);
        }

        return $parts;
    }

    private function readDocxRelationships(ZipArchive $zip): array
    {
        $links = [];

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);

            if (! str_ends_with($name, '.rels')) {
                continue;
            }

            $xml = $zip->getFromName($name);

            if (! is_string($xml)) {
                continue;
            }

            preg_match_all('/Target="([^"]+)"/i', $xml, $matches);

            foreach ($matches[1] ?? [] as $target) {
                $target = html_entity_decode($target);

                if (preg_match('#^https?://#i', $target)) {
                    $links[] = $target;
                }
            }
        }

        return array_values(array_unique($links));
    }

    private function readDocxProperties(ZipArchive $zip): array
    {
        $properties = [];

        foreach ([
            'title' => ['docProps/core.xml', 'dc:title'],
            'creator' => ['docProps/core.xml', 'dc:creator'],
            'subject' => ['docProps/core.xml', 'dc:subject'],
            'description' => ['docProps/core.xml', 'dc:description'],
            'created_at_document' => ['docProps/core.xml', 'dcterms:created'],
            'modified_at_document' => ['docProps/core.xml', 'dcterms:modified'],
            'application' => ['docProps/app.xml', 'Application'],
            'pages' => ['docProps/app.xml', 'Pages'],
            'words' => ['docProps/app.xml', 'Words'],
        ] as $key => [$fileName, $tag]) {
            $xml = $zip->getFromName($fileName);

            if (! is_string($xml)) {
                continue;
            }

            $value = $this->xmlTagValue($xml, $tag);

            if ($value !== null) {
                $properties[$key] = $value;
            }
        }

        return $properties;
    }

    private function detectDocxScripts(ZipArchive $zip, string $content): array
    {
        $findings = $this->detectSuspiciousScripts($content, 'docx');

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = strtolower((string) $zip->getNameIndex($i));

            foreach ([
                'word/vbaproject.bin' => 'VBA macro project embedded in DOCX.',
                'activex' => 'ActiveX control embedded in DOCX.',
                'oleobject' => 'OLE object embedded in DOCX.',
                'embeddings/' => 'Embedded package found in DOCX.',
            ] as $needle => $description) {
                if (str_contains($name, $needle)) {
                    $findings[] = [
                        'type' => 'docx_embedded_code',
                        'label' => 'Suspicious DOCX component',
                        'description' => $description,
                        'severity' => str_contains($needle, 'vbaproject') ? Scan::RISK_HIGH : Scan::RISK_MEDIUM,
                        'score' => str_contains($needle, 'vbaproject') ? 45 : 18,
                        'metadata' => ['entry' => $name],
                    ];
                }
            }
        }

        return $this->uniqueFindings($findings);
    }

    private function detectSuspiciousScripts(string $content, string $format): array
    {
        $findings = [];
        $lowerContent = strtolower($content);

        foreach (self::SUSPICIOUS_SCRIPT_PATTERNS as $pattern) {
            if (! str_contains($lowerContent, strtolower($pattern))) {
                continue;
            }

            $findings[] = [
                'type' => 'suspicious_script_pattern',
                'label' => 'Suspicious script or macro indicator',
                'description' => "Document contains script/macro indicator '{$pattern}'.",
                'severity' => in_array($format, ['pdf', 'doc', 'docx'], true) ? Scan::RISK_HIGH : Scan::RISK_MEDIUM,
                'score' => in_array($format, ['pdf', 'doc', 'docx'], true) ? 22 : 12,
                'metadata' => [
                    'format' => $format,
                    'pattern' => $pattern,
                ],
            ];
        }

        return $this->uniqueFindings($findings);
    }

    private function analyzeUrls(array $urls): array
    {
        return array_map(function (string $url): array {
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
        }, array_values(array_unique($urls)));
    }

    private function calculateRiskScore(array $analysis, array $urlAnalyses): int
    {
        $score = 0;

        if ($analysis['password_protected']) {
            $score += 20;
        }

        foreach ($analysis['scripts_and_macros'] as $finding) {
            $score += (int) ($finding['score'] ?? 0);
        }

        $maxUrlRisk = max(array_column($urlAnalyses, 'risk_score') ?: [0]);
        $score += min(40, (int) ceil($maxUrlRisk * 0.6));

        if (count($urlAnalyses) >= 10) {
            $score += 8;
        }

        if ($analysis['text'] === '' && ! $analysis['password_protected']) {
            $score += 5;
        }

        return min(100, max(0, $score));
    }

    private function buildSummary(string $riskLevel, int $riskScore, array $analysis, array $urlAnalyses): string
    {
        $parts = ['Document scan completed with '.str_replace('_', ' ', $riskLevel)." classification ({$riskScore}/100)."];

        if ($analysis['password_protected']) {
            $parts[] = 'The document appears password protected.';
        }

        if ($analysis['scripts_and_macros'] !== []) {
            $parts[] = count($analysis['scripts_and_macros']).' suspicious script or macro indicator(s) were found.';
        }

        if ($urlAnalyses !== []) {
            $parts[] = count($urlAnalyses).' hyperlink(s) were extracted and scanned.';
        }

        return implode(' ', $parts);
    }

    private function buildIndicators(array $analysis, array $urlAnalyses): array
    {
        $indicators = [
            [
                'label' => 'Document Format',
                'value' => strtoupper((string) $analysis['metadata']['format']),
                'severity' => 'info',
            ],
            [
                'label' => 'Readable Text',
                'value' => mb_strlen($analysis['text']).' characters extracted',
                'severity' => $analysis['text'] === '' ? Scan::RISK_LOW : 'info',
            ],
            [
                'label' => 'Password Protection',
                'value' => $analysis['password_protected'] ? 'Detected' : 'Not detected',
                'severity' => $analysis['password_protected'] ? Scan::RISK_MEDIUM : 'info',
            ],
            [
                'label' => 'Embedded Hyperlinks',
                'value' => (string) count($urlAnalyses),
                'severity' => $urlAnalyses === [] ? 'info' : Scan::RISK_LOW,
            ],
        ];

        foreach ($analysis['scripts_and_macros'] as $finding) {
            $indicators[] = [
                'label' => $finding['label'],
                'value' => $finding['description'],
                'severity' => $finding['severity'],
            ];
        }

        foreach ($urlAnalyses as $url) {
            if ($url['risk_score'] < 15) {
                continue;
            }

            $indicators[] = [
                'label' => 'Hyperlink Risk',
                'value' => $url['url'].' scored '.$url['risk_score'].'/100',
                'severity' => $url['risk_level'],
            ];
        }

        return $indicators;
    }

    private function buildEvidence(array $analysis, array $urlAnalyses): array
    {
        $evidence = [];

        if ($analysis['password_protected']) {
            $evidence[] = [
                'title' => 'Password-protected document',
                'description' => 'The document contains encryption or password-protection markers.',
                'snippet' => null,
                'severity' => Scan::RISK_MEDIUM,
                'metadata' => ['format' => $analysis['metadata']['format']],
            ];
        }

        foreach ($analysis['scripts_and_macros'] as $finding) {
            $evidence[] = [
                'title' => $finding['label'],
                'description' => $finding['description'],
                'snippet' => $finding['metadata']['pattern'] ?? $finding['metadata']['entry'] ?? null,
                'severity' => $finding['severity'],
                'metadata' => $finding['metadata'],
            ];
        }

        foreach ($urlAnalyses as $url) {
            if ($url['risk_score'] < 15) {
                continue;
            }

            $evidence[] = [
                'title' => 'Document hyperlink risk',
                'description' => $url['summary'],
                'snippet' => $url['url'],
                'severity' => $url['risk_level'],
                'metadata' => $url,
            ];
        }

        return $evidence;
    }

    private function buildRecommendations(array $analysis, array $urlAnalyses): array
    {
        $recommendations = [];

        if ($analysis['password_protected']) {
            $recommendations[] = 'Open password-protected documents only in a sandbox and verify the sender before requesting or entering passwords.';
        }

        if ($analysis['scripts_and_macros'] !== []) {
            $recommendations[] = 'Disable macros, scripts, ActiveX, and embedded objects unless the document source is independently trusted.';
        }

        if ($urlAnalyses !== []) {
            $recommendations[] = 'Review and sandbox extracted hyperlinks before allowing users to open them.';
        }

        if ($recommendations === []) {
            $recommendations[] = 'No immediate document remediation required. Keep the report for audit and correlation.';
        }

        return array_values(array_unique($recommendations));
    }

    private function buildTags(string $riskLevel, array $analysis, array $urlAnalyses): array
    {
        $tags = ['document', 'risk-'.$riskLevel, (string) $analysis['metadata']['format']];

        if ($analysis['password_protected']) {
            $tags[] = 'password-protected';
        }

        if ($analysis['scripts_and_macros'] !== []) {
            $tags[] = 'macro-script-risk';
        }

        if (array_filter($urlAnalyses, fn (array $url): bool => $url['risk_score'] >= 15) !== []) {
            $tags[] = 'suspicious-url';
        }

        return array_values(array_unique($tags));
    }

    private function missingSourceResult(Scan $scan): ScanResult
    {
        return ScanResult::create(
            riskScore: 85,
            riskLevel: Scan::RISK_CRITICAL,
            title: 'Cyber Guardian AI document scan report',
            summary: 'Document scan could not read a stored document source.',
            reportData: [
                'workflow' => 'document_scanner',
                'schema_version' => 1,
                'document' => [
                    'target' => $scan->target,
                    'error' => 'missing_document_source',
                ],
            ],
            indicators: [
                ['label' => 'Document Source', 'value' => 'Missing or unreadable', 'severity' => Scan::RISK_CRITICAL],
            ],
            evidence: [
                [
                    'title' => 'Missing document source',
                    'description' => 'The queued scan does not have a readable document file attached.',
                    'snippet' => $scan->target,
                    'severity' => Scan::RISK_CRITICAL,
                    'metadata' => ['scan_id' => $scan->id],
                ],
            ],
            recommendations: ['Create document scans through the document upload endpoint so the file source is attached to the scan.'],
            tags: ['document', 'missing-source', 'risk-critical']
        );
    }

    private function extractUrls(string $content): array
    {
        $content = html_entity_decode($content);
        preg_match_all('/\bhttps?:\/\/[^\s<>"\'\]\)]+/i', $content, $matches);

        $urls = [];

        foreach ($matches[0] ?? [] as $url) {
            $url = rtrim($url, ".,;:!?]}>'\"");

            if ($url !== '') {
                $urls[$url] = $url;
            }
        }

        return array_values($urls);
    }

    private function extractPdfUriLinks(string $content): array
    {
        preg_match_all('/\/URI\s*\((.*?)\)/s', $content, $matches);

        return array_values(array_filter(array_map(
            fn (string $uri): string => $this->pdfUnescape($uri),
            $matches[1] ?? []
        ), fn (string $uri): bool => preg_match('#^https?://#i', $uri) === 1));
    }

    private function extractPdfText(string $content): string
    {
        $text = '';
        preg_match_all('/\((?:\\\\.|[^\\\\)])*\)\s*T[jJ]/s', $content, $matches);

        foreach ($matches[0] ?? [] as $match) {
            if (preg_match('/\(((?:\\\\.|[^\\\\)])*)\)/s', $match, $valueMatch) === 1) {
                $text .= ' '.$this->pdfUnescape($valueMatch[1]);
            }
        }

        if ($text === '') {
            preg_match_all('/\((?:\\\\.|[^\\\\)])*\)/s', $content, $matches);

            foreach ($matches[0] ?? [] as $match) {
                $text .= ' '.$this->pdfUnescape(trim($match, '()'));
            }
        }

        return $this->normalizeText($text);
    }

    private function pdfMetadataValue(string $name, string $content): ?string
    {
        if (preg_match('/\/'.preg_quote($name, '/').'\s*\((.*?)\)/s', $content, $match) !== 1) {
            return null;
        }

        return $this->pdfUnescape($match[1]);
    }

    private function pdfUnescape(string $value): string
    {
        $value = str_replace(['\\(', '\\)', '\\\\'], ['(', ')', '\\'], $value);

        return preg_replace('/\\\\([nrtbf])/', ' ', $value) ?? $value;
    }

    private function extractPrintableText(string $content): string
    {
        preg_match_all('/[\x20-\x7E]{4,}/', $content, $matches);

        return $this->normalizeText(implode(' ', $matches[0] ?? []));
    }

    private function normalizeText(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/[^\P{C}\n\t]+/u', ' ', $text) ?? $text;
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;

        return trim($text);
    }

    private function xmlText(string $xml): string
    {
        $xml = preg_replace('/<w:tab\s*\/>/', ' ', $xml) ?? $xml;
        $xml = preg_replace('/<w:br\s*\/>/', "\n", $xml) ?? $xml;

        return html_entity_decode(strip_tags($xml));
    }

    private function xmlTagValue(string $xml, string $tag): ?string
    {
        if (preg_match('/<'.preg_quote($tag, '/').'[^>]*>(.*?)<\/'.preg_quote($tag, '/').'>/s', $xml, $match) !== 1) {
            return null;
        }

        return trim(html_entity_decode(strip_tags($match[1])));
    }

    private function temporaryContentPath(string $content, string $extension): string
    {
        $path = tempnam(sys_get_temp_dir(), 'cybershield-doc-');
        file_put_contents($path, $content);
        $newPath = $path.'.'.$extension;
        rename($path, $newPath);

        return $newPath;
    }

    private function firstMatch(string $pattern, string $content): ?string
    {
        if (preg_match($pattern, $content, $match) !== 1) {
            return null;
        }

        return $match[1] ?? null;
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

    private function mimeTypeForExtension(string $extension): string
    {
        return match ($extension) {
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt' => 'text/plain',
            default => 'application/octet-stream',
        };
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
