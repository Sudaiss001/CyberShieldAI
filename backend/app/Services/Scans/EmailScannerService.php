<?php

namespace App\Services\Scans;

use App\Models\Scan;
use App\Services\Scans\Contracts\ScannerInterface;
use App\Services\Scans\DTO\ScanResult;
use App\Services\Scans\Exceptions\EmailScanException;
use App\Support\UrlValidator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmailScannerService implements ScannerInterface
{
    private const MAX_EMAIL_BYTES = 5_242_880;

    private const AUTH_FAILURE_RESULTS = [
        'fail',
        'hardfail',
        'permerror',
    ];

    private const AUTH_WARNING_RESULTS = [
        'softfail',
        'neutral',
        'temperror',
        'policy',
        'none',
    ];

    private const PHISHING_TERMS = [
        'account suspended',
        'act now',
        'confirm your identity',
        'credentials',
        'final notice',
        'immediate action',
        'login',
        'password',
        'payment failed',
        'security alert',
        'unauthorized',
        'urgent',
        'verify',
        'wire transfer',
    ];

    private const BRANDS = [
        'amazon' => ['amazon.com'],
        'apple' => ['apple.com'],
        'docusign' => ['docusign.com'],
        'dropbox' => ['dropbox.com'],
        'facebook' => ['facebook.com'],
        'google' => ['google.com'],
        'instagram' => ['instagram.com'],
        'microsoft' => ['microsoft.com', 'office.com', 'outlook.com'],
        'netflix' => ['netflix.com'],
        'paypal' => ['paypal.com'],
    ];

    private const SUSPICIOUS_ATTACHMENT_EXTENSIONS = [
        '7z',
        'bat',
        'cmd',
        'com',
        'docm',
        'exe',
        'hta',
        'htm',
        'html',
        'img',
        'iso',
        'jar',
        'js',
        'lnk',
        'msi',
        'ps1',
        'rar',
        'scr',
        'vbs',
        'xlsm',
        'zip',
    ];

    public function supports(string $scanType): bool
    {
        return $scanType === Scan::TYPE_EMAIL;
    }

    public function prepareInput(array $data, ?UploadedFile $file = null): array
    {
        [$content, $sourceType, $fileMetadata] = $this->resolveInputContent($data, $file);
        $parsedEmail = $this->parseEmail($content);

        return [
            'scan_type' => Scan::TYPE_EMAIL,
            'target' => $this->buildTarget($parsedEmail),
            'content' => $content,
            'source_type' => $sourceType,
            'file_name' => $fileMetadata['file_name'],
            'mime_type' => $fileMetadata['mime_type'],
            'file_size' => $fileMetadata['file_size'],
            'hash' => hash('sha256', $content),
        ];
    }

    public function scan(Scan $scan): ScanResult
    {
        $content = $this->loadScanContent($scan);
        $parsedEmail = $this->parseEmail($content);
        $headers = $parsedEmail['headers'];
        $sender = $this->extractSender($headers);
        $authentication = $this->analyzeAuthentication($headers);
        $urls = $this->extractUrls($content);
        $urlAnalyses = $this->analyzeUrls($urls);
        $attachments = $this->extractAttachmentMetadata($content);
        $spoofingIndicators = $this->detectSpoofingIndicators($sender, $headers, $authentication);
        $phishingIndicators = $this->detectPhishingCharacteristics($parsedEmail, $sender, $urlAnalyses);
        $riskScore = $this->calculateRiskScore(
            authentication: $authentication,
            spoofingIndicators: $spoofingIndicators,
            phishingIndicators: $phishingIndicators,
            urlAnalyses: $urlAnalyses,
            attachments: $attachments
        );
        $riskLevel = $this->riskLevelFromScore($riskScore);
        $tags = $this->buildTags($riskLevel, $authentication, $spoofingIndicators, $phishingIndicators, $urlAnalyses, $attachments);

        return ScanResult::create(
            riskScore: $riskScore,
            riskLevel: $riskLevel,
            title: 'Cyber Guardian AI email scan report',
            summary: $this->buildSummary($riskLevel, $riskScore, $spoofingIndicators, $phishingIndicators, $urlAnalyses, $attachments),
            reportData: [
                'workflow' => 'email_scanner',
                'schema_version' => 1,
                'ai_analysis_enabled' => false,
                'email' => [
                    'source_type' => $this->scanSourceType($scan),
                    'headers' => $this->selectedHeaders($headers),
                    'header_names' => array_keys($headers),
                    'sender' => $sender,
                    'authentication' => $authentication,
                    'spoofing_indicators' => $this->stripScores($spoofingIndicators),
                    'phishing_indicators' => $this->stripScores($phishingIndicators),
                    'urls' => $urlAnalyses,
                    'attachments' => $attachments,
                    'counts' => [
                        'headers' => count($headers),
                        'received_headers' => count($headers['received'] ?? []),
                        'urls' => count($urlAnalyses),
                        'attachments' => count($attachments),
                        'spoofing_indicators' => count($spoofingIndicators),
                        'phishing_indicators' => count($phishingIndicators),
                    ],
                ],
            ],
            indicators: $this->buildReportIndicators($sender, $authentication, $spoofingIndicators, $phishingIndicators, $urlAnalyses, $attachments),
            evidence: $this->buildEvidence($spoofingIndicators, $phishingIndicators, $urlAnalyses, $attachments),
            recommendations: $this->buildRecommendations($riskLevel, $authentication, $spoofingIndicators, $phishingIndicators, $urlAnalyses, $attachments),
            tags: $tags
        );
    }

    public function parseEmail(string $content): array
    {
        $normalizedContent = $this->normalizeContent($content);

        if ($normalizedContent === '') {
            throw new EmailScanException('Invalid email format. Email content cannot be empty.');
        }

        if (str_contains($normalizedContent, "\0")) {
            throw new EmailScanException('Corrupted .eml file. Binary null bytes were found in the email content.');
        }

        [$headerText, $body] = $this->splitHeaderBody($normalizedContent);
        $headers = $this->parseHeaders($headerText);

        if ($headers === []) {
            throw new EmailScanException('Invalid email format. The email headers could not be parsed.');
        }

        if (empty($headers['from'])) {
            throw new EmailScanException('Missing headers. Email scans require a From header.');
        }

        return [
            'raw' => $normalizedContent,
            'header_text' => $headerText,
            'body' => $body,
            'headers' => $headers,
        ];
    }

    private function resolveInputContent(array $data, ?UploadedFile $file): array
    {
        if ($file instanceof UploadedFile) {
            $extension = strtolower((string) $file->getClientOriginalExtension());

            if ($extension !== 'eml') {
                throw new EmailScanException('Unsupported file type. Only .eml files are supported.');
            }

            $content = file_get_contents($file->getRealPath());

            if ($content === false) {
                throw new EmailScanException('Corrupted .eml file. The upload could not be read.');
            }

            $this->assertReasonableContentSize($content);

            return [
                $content,
                'eml_upload',
                [
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType() ?: 'message/rfc822',
                    'file_size' => strlen($content),
                ],
            ];
        }

        if (isset($data['raw_email']) && trim((string) $data['raw_email']) !== '') {
            $content = (string) $data['raw_email'];
            $this->assertReasonableContentSize($content);

            return [
                $content,
                'raw_content',
                [
                    'file_name' => 'raw-email.eml',
                    'mime_type' => 'message/rfc822',
                    'file_size' => strlen($content),
                ],
            ];
        }

        if (isset($data['headers']) && trim((string) $data['headers']) !== '') {
            $content = rtrim((string) $data['headers'])."\n\n";
            $this->assertReasonableContentSize($content);

            return [
                $content,
                'headers',
                [
                    'file_name' => 'email-headers.eml',
                    'mime_type' => 'message/rfc822',
                    'file_size' => strlen($content),
                ],
            ];
        }

        throw new EmailScanException('Invalid email format. Provide raw email content, headers, or a .eml file.');
    }

    private function assertReasonableContentSize(string $content): void
    {
        if (strlen($content) > self::MAX_EMAIL_BYTES) {
            throw new EmailScanException('Invalid email format. Email content exceeds the 5 MB scanning limit.');
        }
    }

    private function loadScanContent(Scan $scan): string
    {
        $scan->loadMissing('files');
        $file = $scan->files->first();

        if (! $file) {
            throw new EmailScanException('Invalid email format. Email scan source is missing.');
        }

        if (! Storage::disk('local')->exists($file->file_path)) {
            throw new EmailScanException('Corrupted .eml file. The stored email source could not be read.');
        }

        $content = Storage::disk('local')->get($file->file_path);

        if (! is_string($content)) {
            throw new EmailScanException('Corrupted .eml file. The stored email source could not be read.');
        }

        return $content;
    }

    private function normalizeContent(string $content): string
    {
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content) ?? $content;

        return str_replace(["\r\n", "\r"], "\n", $content);
    }

    private function splitHeaderBody(string $content): array
    {
        $separatorPosition = strpos($content, "\n\n");

        if ($separatorPosition === false) {
            return [$content, ''];
        }

        return [
            substr($content, 0, $separatorPosition),
            substr($content, $separatorPosition + 2),
        ];
    }

    private function parseHeaders(string $headerText): array
    {
        $headers = [];
        $currentName = null;

        foreach (explode("\n", $headerText) as $index => $line) {
            if ($index === 0 && str_starts_with($line, 'From ')) {
                continue;
            }

            if ($line === '') {
                continue;
            }

            if (preg_match('/^[ \t]/', $line) === 1) {
                if ($currentName !== null) {
                    $headers[$currentName][array_key_last($headers[$currentName])] .= ' '.trim($line);
                }

                continue;
            }

            $colonPosition = strpos($line, ':');

            if ($colonPosition === false) {
                continue;
            }

            $name = strtolower(trim(substr($line, 0, $colonPosition)));
            $value = $this->decodeHeaderValue(trim(substr($line, $colonPosition + 1)));

            if ($name === '' || ! preg_match('/^[a-z0-9\-]+$/', $name)) {
                continue;
            }

            $headers[$name] ??= [];
            $headers[$name][] = $value;
            $currentName = $name;
        }

        return $headers;
    }

    private function decodeHeaderValue(string $value): string
    {
        if (function_exists('mb_decode_mimeheader')) {
            $decoded = mb_decode_mimeheader($value);

            if (is_string($decoded) && $decoded !== '') {
                return $decoded;
            }
        }

        return $value;
    }

    private function buildTarget(array $parsedEmail): string
    {
        $headers = $parsedEmail['headers'];
        $sender = $this->extractSender($headers);
        $subject = $headers['subject'][0] ?? 'No subject';
        $from = $sender['address'] ?? 'unknown sender';

        return Str::limit($from.' | '.$subject, 240, '');
    }

    private function extractSender(array $headers): array
    {
        $from = $this->parseAddress($headers['from'][0] ?? '');
        $replyTo = $this->parseAddress($headers['reply-to'][0] ?? '');
        $returnPath = $this->parseAddress($headers['return-path'][0] ?? '');
        $sender = $this->parseAddress($headers['sender'][0] ?? '');

        return [
            'display_name' => $from['display_name'],
            'address' => $from['address'],
            'domain' => $from['domain'],
            'registered_domain' => $this->registeredDomain($from['domain']),
            'reply_to' => $replyTo,
            'return_path' => $returnPath,
            'sender' => $sender,
            'message_id_domain' => $this->extractMessageIdDomain($headers['message-id'][0] ?? null),
        ];
    }

    private function parseAddress(?string $value): array
    {
        $value = trim((string) $value);

        if ($value === '') {
            return [
                'display_name' => null,
                'address' => null,
                'domain' => null,
            ];
        }

        preg_match('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', $value, $match);
        $address = isset($match[0]) ? strtolower($match[0]) : null;
        $displayName = $value;

        if ($address !== null) {
            $displayName = (string) preg_replace('/<?'.preg_quote($address, '/').'>?/i', '', $value);
        }

        $displayName = trim($displayName);
        $displayName = trim($displayName, " \t\n\r\0\x0B\"'");

        return [
            'display_name' => $displayName !== '' ? $displayName : null,
            'address' => $address,
            'domain' => $this->domainFromAddress($address),
        ];
    }

    private function domainFromAddress(?string $address): ?string
    {
        if (! $address || ! str_contains($address, '@')) {
            return null;
        }

        return strtolower(Str::afterLast($address, '@'));
    }

    private function registeredDomain(?string $domain): ?string
    {
        if (! $domain) {
            return null;
        }

        $parts = array_values(array_filter(explode('.', strtolower($domain))));

        if (count($parts) <= 2) {
            return implode('.', $parts);
        }

        return implode('.', array_slice($parts, -2));
    }

    private function extractMessageIdDomain(?string $messageId): ?string
    {
        if (! $messageId || ! str_contains($messageId, '@')) {
            return null;
        }

        $domain = strtolower(trim(Str::afterLast($messageId, '@'), " <>\"'"));

        return $domain !== '' ? $domain : null;
    }

    private function analyzeAuthentication(array $headers): array
    {
        $authHeaders = array_merge(
            $headers['authentication-results'] ?? [],
            $headers['arc-authentication-results'] ?? []
        );

        $combinedAuthHeaders = implode(' ', $authHeaders);
        $receivedSpf = implode(' ', $headers['received-spf'] ?? []);
        $dkimSignature = implode(' ', $headers['dkim-signature'] ?? []);

        return [
            'spf' => [
                'available' => $combinedAuthHeaders !== '' || $receivedSpf !== '',
                'result' => $this->authenticationResultFor('spf', $combinedAuthHeaders, $receivedSpf),
            ],
            'dkim' => [
                'available' => $combinedAuthHeaders !== '',
                'result' => $this->authenticationResultFor('dkim', $combinedAuthHeaders),
                'signed' => $dkimSignature !== '',
                'signature_domain' => $this->dkimSignatureDomain($dkimSignature),
            ],
            'dmarc' => [
                'available' => $combinedAuthHeaders !== '',
                'result' => $this->authenticationResultFor('dmarc', $combinedAuthHeaders),
            ],
            'raw' => [
                'authentication_results' => $authHeaders,
                'received_spf' => $headers['received-spf'] ?? [],
            ],
        ];
    }

    private function authenticationResultFor(string $mechanism, string $authenticationResults, string $fallback = ''): ?string
    {
        $matches = [];
        preg_match_all('/\b'.preg_quote($mechanism, '/').'\s*=\s*([a-z0-9_\-]+)/i', $authenticationResults, $matches);

        $results = array_map('strtolower', $matches[1] ?? []);

        if ($results === [] && $mechanism === 'spf' && $fallback !== '') {
            foreach (['pass', 'fail', 'softfail', 'neutral', 'temperror', 'permerror', 'none'] as $candidate) {
                if (preg_match('/\b'.preg_quote($candidate, '/').'\b/i', $fallback) === 1) {
                    $results[] = $candidate;
                    break;
                }
            }
        }

        if ($results === []) {
            return null;
        }

        return $this->highestPriorityAuthResult($results);
    }

    private function highestPriorityAuthResult(array $results): string
    {
        $priority = [
            'fail' => 70,
            'hardfail' => 70,
            'permerror' => 65,
            'softfail' => 50,
            'temperror' => 45,
            'neutral' => 40,
            'policy' => 35,
            'none' => 30,
            'pass' => 10,
        ];

        usort($results, fn (string $left, string $right): int => ($priority[$right] ?? 0) <=> ($priority[$left] ?? 0));

        return $results[0];
    }

    private function dkimSignatureDomain(string $dkimSignature): ?string
    {
        if (preg_match('/(?:^|;)\s*d=([^;\s]+)/i', $dkimSignature, $match) !== 1) {
            return null;
        }

        return strtolower(trim($match[1]));
    }

    private function detectSpoofingIndicators(array $sender, array $headers, array $authentication): array
    {
        $indicators = [];
        $fromDomain = $sender['registered_domain'];

        foreach ([
            'reply_to' => ['label' => 'Reply-To domain mismatch', 'severity' => Scan::RISK_MEDIUM, 'score' => 14],
            'return_path' => ['label' => 'Return-Path domain mismatch', 'severity' => Scan::RISK_MEDIUM, 'score' => 18],
            'sender' => ['label' => 'Sender header domain mismatch', 'severity' => Scan::RISK_LOW, 'score' => 8],
        ] as $field => $definition) {
            $domain = $this->registeredDomain($sender[$field]['domain'] ?? null);

            if ($fromDomain && $domain && $domain !== $fromDomain) {
                $indicators[] = [
                    'type' => $field.'_mismatch',
                    'label' => $definition['label'],
                    'description' => "From domain {$fromDomain} does not align with {$field} domain {$domain}.",
                    'severity' => $definition['severity'],
                    'score' => $definition['score'],
                    'metadata' => [
                        'from_domain' => $fromDomain,
                        'comparison_domain' => $domain,
                    ],
                ];
            }
        }

        foreach (['spf', 'dkim', 'dmarc'] as $mechanism) {
            $result = $authentication[$mechanism]['result'] ?? null;

            if (in_array($result, self::AUTH_FAILURE_RESULTS, true)) {
                $indicators[] = [
                    'type' => $mechanism.'_failure',
                    'label' => strtoupper($mechanism).' authentication failed',
                    'description' => strtoupper($mechanism)." returned {$result}.",
                    'severity' => $mechanism === 'dmarc' ? Scan::RISK_HIGH : Scan::RISK_MEDIUM,
                    'score' => $mechanism === 'dmarc' ? 25 : 18,
                    'metadata' => [
                        'mechanism' => $mechanism,
                        'result' => $result,
                    ],
                ];
            }
        }

        $displayEmail = $this->firstEmailInText($sender['display_name'] ?? null);

        if ($displayEmail && $sender['address'] && $displayEmail !== $sender['address']) {
            $indicators[] = [
                'type' => 'display_name_email_mismatch',
                'label' => 'Display name contains a different email address',
                'description' => 'The visible display name includes an email address that differs from the From address.',
                'severity' => Scan::RISK_MEDIUM,
                'score' => 16,
                'metadata' => [
                    'display_email' => $displayEmail,
                    'from_address' => $sender['address'],
                ],
            ];
        }

        $messageIdDomain = $this->registeredDomain($sender['message_id_domain']);

        if ($fromDomain && $messageIdDomain && $messageIdDomain !== $fromDomain) {
            $indicators[] = [
                'type' => 'message_id_domain_mismatch',
                'label' => 'Message-ID domain mismatch',
                'description' => "Message-ID domain {$messageIdDomain} does not align with From domain {$fromDomain}.",
                'severity' => Scan::RISK_LOW,
                'score' => 7,
                'metadata' => [
                    'from_domain' => $fromDomain,
                    'message_id_domain' => $messageIdDomain,
                ],
            ];
        }

        return $indicators;
    }

    private function firstEmailInText(?string $text): ?string
    {
        if (! $text) {
            return null;
        }

        if (preg_match('/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i', $text, $match) !== 1) {
            return null;
        }

        return strtolower($match[0]);
    }

    private function detectPhishingCharacteristics(array $parsedEmail, array $sender, array $urlAnalyses): array
    {
        $headers = $parsedEmail['headers'];
        $body = $parsedEmail['body'];
        $subject = $headers['subject'][0] ?? '';
        $searchText = strtolower($subject.' '.$body);
        $indicators = [];
        $matchedTerms = [];

        foreach (self::PHISHING_TERMS as $term) {
            if (str_contains($searchText, $term)) {
                $matchedTerms[] = $term;
            }
        }

        if ($matchedTerms !== []) {
            $indicators[] = [
                'type' => 'phishing_language',
                'label' => 'Phishing language detected',
                'description' => 'The email contains urgent, credential, or payment-oriented language commonly found in phishing campaigns.',
                'severity' => count($matchedTerms) >= 3 ? Scan::RISK_MEDIUM : Scan::RISK_LOW,
                'score' => min(20, count($matchedTerms) * 6),
                'metadata' => [
                    'matched_terms' => array_values(array_unique($matchedTerms)),
                ],
            ];
        }

        $brandIndicator = $this->brandImpersonationIndicator($subject, $body, $sender);

        if ($brandIndicator !== null) {
            $indicators[] = $brandIndicator;
        }

        if (preg_match('/<form\b/i', $body) === 1) {
            $indicators[] = [
                'type' => 'html_form',
                'label' => 'HTML form embedded in email',
                'description' => 'Embedded forms can collect credentials directly from an email body.',
                'severity' => Scan::RISK_HIGH,
                'score' => 25,
                'metadata' => [],
            ];
        }

        foreach ($this->detectMismatchedAnchors($body) as $anchorIndicator) {
            $indicators[] = $anchorIndicator;
        }

        $highRiskUrls = array_values(array_filter(
            $urlAnalyses,
            fn (array $url): bool => in_array($url['risk_level'], [Scan::RISK_HIGH, Scan::RISK_CRITICAL], true)
        ));

        if ($highRiskUrls !== []) {
            $indicators[] = [
                'type' => 'high_risk_urls',
                'label' => 'High-risk URL characteristics detected',
                'description' => 'One or more extracted URLs contains suspicious URL characteristics.',
                'severity' => Scan::RISK_HIGH,
                'score' => min(25, count($highRiskUrls) * 12),
                'metadata' => [
                    'url_count' => count($highRiskUrls),
                ],
            ];
        }

        if (count($urlAnalyses) >= 10) {
            $indicators[] = [
                'type' => 'excessive_links',
                'label' => 'Unusually high number of links',
                'description' => 'The email contains many URLs, increasing the chance of social-engineering or redirect abuse.',
                'severity' => Scan::RISK_LOW,
                'score' => 6,
                'metadata' => [
                    'url_count' => count($urlAnalyses),
                ],
            ];
        }

        return $indicators;
    }

    private function brandImpersonationIndicator(string $subject, string $body, array $sender): ?array
    {
        $haystack = strtolower(($sender['display_name'] ?? '').' '.$subject.' '.$body);
        $fromDomain = $this->registeredDomain($sender['domain'] ?? null);

        foreach (self::BRANDS as $brand => $trustedDomains) {
            if (! str_contains($haystack, $brand)) {
                continue;
            }

            $trusted = false;

            foreach ($trustedDomains as $trustedDomain) {
                if ($fromDomain === $this->registeredDomain($trustedDomain)) {
                    $trusted = true;
                    break;
                }
            }

            if (! $trusted) {
                return [
                    'type' => 'brand_impersonation',
                    'label' => 'Possible brand impersonation',
                    'description' => "The email references {$brand} but the From domain is {$fromDomain}.",
                    'severity' => Scan::RISK_HIGH,
                    'score' => 24,
                    'metadata' => [
                        'brand' => $brand,
                        'from_domain' => $fromDomain,
                        'trusted_domains' => $trustedDomains,
                    ],
                ];
            }
        }

        return null;
    }

    private function detectMismatchedAnchors(string $body): array
    {
        $indicators = [];

        preg_match_all('/<a\b[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)<\/a>/is', $body, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $href = html_entity_decode(trim(strip_tags($match[1])));
            $text = html_entity_decode(trim(strip_tags($match[2])));
            $visibleUrl = $this->firstUrlInText($text);

            if (! $visibleUrl) {
                continue;
            }

            $hrefHost = parse_url($href, PHP_URL_HOST);
            $visibleHost = parse_url($visibleUrl, PHP_URL_HOST);

            if ($hrefHost && $visibleHost && $this->registeredDomain($hrefHost) !== $this->registeredDomain($visibleHost)) {
                $indicators[] = [
                    'type' => 'link_text_mismatch',
                    'label' => 'Visible link text does not match destination',
                    'description' => 'The displayed URL points to a different domain than the actual href target.',
                    'severity' => Scan::RISK_HIGH,
                    'score' => 24,
                    'metadata' => [
                        'visible_url' => $visibleUrl,
                        'href' => $href,
                    ],
                ];
            }
        }

        return $indicators;
    }

    private function firstUrlInText(string $text): ?string
    {
        $urls = $this->extractUrls($text);

        return $urls[0] ?? null;
    }

    private function extractUrls(string $content): array
    {
        $content = html_entity_decode($content);
        $urls = [];

        preg_match_all('/\bhttps?:\/\/[^\s<>"\'\]\)]+/i', $content, $absoluteMatches);
        preg_match_all('/(?<!@)\bwww\.[^\s<>"\'\]\)]+/i', $content, $wwwMatches);

        foreach (array_merge($absoluteMatches[0] ?? [], $wwwMatches[0] ?? []) as $url) {
            $url = rtrim($url, ".,;:!?]}>'\"");

            if (str_starts_with(strtolower($url), 'www.')) {
                $url = 'http://'.$url;
            }

            if ($url !== '') {
                $urls[$url] = $url;
            }
        }

        return array_values($urls);
    }

    private function analyzeUrls(array $urls): array
    {
        return array_map(function (string $url): array {
            $analysis = UrlValidator::validateAndNormalize($url);
            $riskScore = $this->urlRiskScore($analysis);

            return [
                'original_url' => $url,
                'normalized_url' => $analysis['normalized_url'] ?? null,
                'valid' => $analysis['valid'],
                'host' => $analysis['host'] ?? null,
                'risk_score' => $riskScore,
                'risk_level' => $this->riskLevelFromScore($riskScore),
                'signals' => [
                    'is_https' => $analysis['is_https'] ?? false,
                    'is_ip' => $analysis['is_ip'] ?? false,
                    'has_userinfo_obfuscation' => $analysis['has_userinfo_obfuscation'] ?? false,
                    'subdomain_count' => $analysis['subdomain_count'] ?? 0,
                    'is_high_risk_tld' => $analysis['is_high_risk_tld'] ?? false,
                    'suspicious_keywords' => $analysis['suspicious_keywords'] ?? [],
                    'url_length' => $analysis['url_length'] ?? strlen($url),
                ],
                'error' => $analysis['error'] ?? null,
            ];
        }, $urls);
    }

    private function urlRiskScore(array $analysis): int
    {
        if (! ($analysis['valid'] ?? false)) {
            return 35;
        }

        $score = 0;

        if (! ($analysis['is_https'] ?? false)) {
            $score += 8;
        }

        if ($analysis['is_ip'] ?? false) {
            $score += 20;
        }

        if ($analysis['has_userinfo_obfuscation'] ?? false) {
            $score += 25;
        }

        if (($analysis['subdomain_count'] ?? 0) >= 3) {
            $score += 10;
        }

        if ($analysis['is_high_risk_tld'] ?? false) {
            $score += 22;
        }

        if (($analysis['url_length'] ?? 0) > 120) {
            $score += 8;
        }

        $score += min(24, count($analysis['suspicious_keywords'] ?? []) * 6);

        return min(100, $score);
    }

    private function extractAttachmentMetadata(string $content): array
    {
        $attachments = [];

        preg_match_all('/(?:filename|name)\*?=(?:"([^"]+)"|([^;\r\n]+))/i', $content, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);

        foreach ($matches as $match) {
            $fileName = $this->decodeAttachmentFileName($match[1][0] ?: $match[2][0]);
            $offset = $match[0][1];
            $window = substr($content, max(0, $offset - 500), 700);
            $disposition = $this->headerValueFromWindow($window, 'Content-Disposition');
            $contentType = $this->headerValueFromWindow($window, 'Content-Type');
            $encoding = $this->headerValueFromWindow($window, 'Content-Transfer-Encoding');
            $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $isSuspicious = in_array($extension, self::SUSPICIOUS_ATTACHMENT_EXTENSIONS, true);
            $key = strtolower($fileName.'|'.$contentType);

            if ($fileName === '' || isset($attachments[$key])) {
                continue;
            }

            $attachments[$key] = [
                'file_name' => $fileName,
                'extension' => $extension ?: null,
                'content_type' => $contentType,
                'disposition' => $disposition,
                'encoding' => $encoding,
                'is_suspicious' => $isSuspicious,
                'reason' => $isSuspicious ? 'Attachment extension is commonly abused in phishing or malware delivery.' : null,
            ];
        }

        return array_values($attachments);
    }

    private function decodeAttachmentFileName(string $fileName): string
    {
        $fileName = trim($fileName, " \t\n\r\0\x0B\"'");

        if (str_contains($fileName, "''")) {
            $fileName = rawurldecode(Str::after($fileName, "''"));
        }

        return basename($fileName);
    }

    private function headerValueFromWindow(string $window, string $headerName): ?string
    {
        if (preg_match('/'.preg_quote($headerName, '/').':\s*([^;\r\n]+)/i', $window, $match) !== 1) {
            return null;
        }

        return strtolower(trim($match[1]));
    }

    private function calculateRiskScore(
        array $authentication,
        array $spoofingIndicators,
        array $phishingIndicators,
        array $urlAnalyses,
        array $attachments
    ): int {
        $score = 0;

        foreach (['spf', 'dkim', 'dmarc'] as $mechanism) {
            $result = $authentication[$mechanism]['result'] ?? null;

            if (in_array($result, self::AUTH_FAILURE_RESULTS, true)) {
                $score += $mechanism === 'dmarc' ? 22 : 14;
            } elseif (in_array($result, self::AUTH_WARNING_RESULTS, true)) {
                $score += 6;
            }
        }

        foreach (array_merge($spoofingIndicators, $phishingIndicators) as $indicator) {
            $score += (int) ($indicator['score'] ?? 0);
        }

        $maxUrlRisk = max(array_column($urlAnalyses, 'risk_score') ?: [0]);
        $score += min(35, (int) ceil($maxUrlRisk * 0.55));

        $suspiciousAttachments = array_values(array_filter($attachments, fn (array $attachment): bool => $attachment['is_suspicious']));
        $score += min(30, count($suspiciousAttachments) * 18);

        return min(100, max(0, $score));
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

    private function selectedHeaders(array $headers): array
    {
        $selected = [];

        foreach (['from', 'reply-to', 'return-path', 'sender', 'to', 'cc', 'subject', 'date', 'message-id', 'authentication-results', 'received-spf', 'dkim-signature'] as $name) {
            if (isset($headers[$name])) {
                $selected[$name] = $headers[$name];
            }
        }

        return $selected;
    }

    private function scanSourceType(Scan $scan): ?string
    {
        $scan->loadMissing('events');

        return $scan->events
            ->where('event_type', 'scan.created')
            ->pluck('event_data.email_source_type')
            ->filter()
            ->first();
    }

    private function stripScores(array $indicators): array
    {
        return array_map(function (array $indicator): array {
            unset($indicator['score']);

            return $indicator;
        }, $indicators);
    }

    private function buildSummary(
        string $riskLevel,
        int $riskScore,
        array $spoofingIndicators,
        array $phishingIndicators,
        array $urlAnalyses,
        array $attachments
    ): string {
        $riskLabel = str_replace('_', ' ', $riskLevel);
        $parts = ["Email scan completed with {$riskLabel} classification ({$riskScore}/100)."];

        if ($spoofingIndicators !== []) {
            $parts[] = count($spoofingIndicators).' spoofing indicator(s) were found.';
        }

        if ($phishingIndicators !== []) {
            $parts[] = count($phishingIndicators).' phishing characteristic(s) were found.';
        }

        if ($urlAnalyses !== []) {
            $parts[] = count($urlAnalyses).' URL(s) were extracted and analyzed.';
        }

        $suspiciousAttachments = array_filter($attachments, fn (array $attachment): bool => $attachment['is_suspicious']);

        if ($suspiciousAttachments !== []) {
            $parts[] = count($suspiciousAttachments).' suspicious attachment(s) were identified by metadata.';
        }

        return implode(' ', $parts);
    }

    private function buildReportIndicators(
        array $sender,
        array $authentication,
        array $spoofingIndicators,
        array $phishingIndicators,
        array $urlAnalyses,
        array $attachments
    ): array {
        $indicators = [
            [
                'label' => 'Sender',
                'value' => ($sender['address'] ?? 'unknown').' ('.($sender['domain'] ?? 'unknown domain').')',
                'severity' => 'info',
            ],
        ];

        foreach (['spf', 'dkim', 'dmarc'] as $mechanism) {
            $result = $authentication[$mechanism]['result'] ?? null;
            $severity = in_array($result, self::AUTH_FAILURE_RESULTS, true)
                ? Scan::RISK_HIGH
                : (in_array($result, self::AUTH_WARNING_RESULTS, true) ? Scan::RISK_LOW : 'info');

            $indicators[] = [
                'label' => strtoupper($mechanism),
                'value' => $result ?? 'not available',
                'severity' => $severity,
            ];
        }

        foreach (array_merge($spoofingIndicators, $phishingIndicators) as $indicator) {
            $indicators[] = [
                'label' => $indicator['label'],
                'value' => $indicator['description'],
                'severity' => $indicator['severity'],
            ];
        }

        if ($urlAnalyses !== []) {
            $indicators[] = [
                'label' => 'Extracted URLs',
                'value' => (string) count($urlAnalyses),
                'severity' => max(array_column($urlAnalyses, 'risk_score')) >= 65 ? Scan::RISK_HIGH : 'info',
            ];
        }

        $suspiciousAttachments = array_filter($attachments, fn (array $attachment): bool => $attachment['is_suspicious']);

        if ($attachments !== []) {
            $indicators[] = [
                'label' => 'Attachments',
                'value' => count($attachments).' total, '.count($suspiciousAttachments).' suspicious',
                'severity' => $suspiciousAttachments !== [] ? Scan::RISK_HIGH : 'info',
            ];
        }

        return $indicators;
    }

    private function buildEvidence(array $spoofingIndicators, array $phishingIndicators, array $urlAnalyses, array $attachments): array
    {
        $evidence = [];

        foreach (array_merge($spoofingIndicators, $phishingIndicators) as $indicator) {
            $evidence[] = [
                'title' => $indicator['label'],
                'description' => $indicator['description'],
                'snippet' => null,
                'severity' => $indicator['severity'],
                'metadata' => $indicator['metadata'] ?? [],
            ];
        }

        foreach ($urlAnalyses as $url) {
            if ($url['risk_score'] < 15) {
                continue;
            }

            $evidence[] = [
                'title' => 'Suspicious URL',
                'description' => 'Extracted URL contains suspicious characteristics.',
                'snippet' => $url['normalized_url'] ?? $url['original_url'],
                'severity' => $url['risk_level'],
                'metadata' => $url,
            ];
        }

        foreach ($attachments as $attachment) {
            if (! $attachment['is_suspicious']) {
                continue;
            }

            $evidence[] = [
                'title' => 'Suspicious attachment metadata',
                'description' => $attachment['reason'],
                'snippet' => $attachment['file_name'],
                'severity' => Scan::RISK_HIGH,
                'metadata' => $attachment,
            ];
        }

        return $evidence;
    }

    private function buildRecommendations(
        string $riskLevel,
        array $authentication,
        array $spoofingIndicators,
        array $phishingIndicators,
        array $urlAnalyses,
        array $attachments
    ): array {
        $recommendations = [];

        if (in_array($riskLevel, [Scan::RISK_SAFE, Scan::RISK_LOW], true)) {
            $recommendations[] = 'No high-confidence malicious signals were found. Continue normal user awareness and mailbox monitoring.';
        }

        foreach (['spf', 'dkim', 'dmarc'] as $mechanism) {
            if (in_array($authentication[$mechanism]['result'] ?? null, self::AUTH_FAILURE_RESULTS, true)) {
                $recommendations[] = 'Review sender authentication policy and quarantine messages that fail SPF, DKIM, or DMARC alignment.';
                break;
            }
        }

        if ($spoofingIndicators !== []) {
            $recommendations[] = 'Verify the sender through a trusted channel before replying, clicking links, or acting on the request.';
        }

        if ($phishingIndicators !== [] || $urlAnalyses !== []) {
            $recommendations[] = 'Inspect extracted URLs in a sandboxed environment before allowing user access.';
        }

        if (array_filter($attachments, fn (array $attachment): bool => $attachment['is_suspicious']) !== []) {
            $recommendations[] = 'Block or sandbox suspicious attachments before delivery to the mailbox.';
        }

        if ($recommendations === []) {
            $recommendations[] = 'Archive the scan report with the email metadata for future correlation.';
        }

        return array_values(array_unique($recommendations));
    }

    private function buildTags(
        string $riskLevel,
        array $authentication,
        array $spoofingIndicators,
        array $phishingIndicators,
        array $urlAnalyses,
        array $attachments
    ): array {
        $tags = ['email', 'risk-'.$riskLevel];

        foreach (['spf', 'dkim', 'dmarc'] as $mechanism) {
            if (in_array($authentication[$mechanism]['result'] ?? null, self::AUTH_FAILURE_RESULTS, true)) {
                $tags[] = 'authentication-failure';
                break;
            }
        }

        if ($spoofingIndicators !== []) {
            $tags[] = 'spoofing';
        }

        if ($phishingIndicators !== []) {
            $tags[] = 'phishing';
        }

        if (array_filter($urlAnalyses, fn (array $url): bool => $url['risk_score'] >= 15) !== []) {
            $tags[] = 'suspicious-url';
        }

        if (array_filter($attachments, fn (array $attachment): bool => $attachment['is_suspicious']) !== []) {
            $tags[] = 'attachment-risk';
        }

        return array_values(array_unique($tags));
    }
}
