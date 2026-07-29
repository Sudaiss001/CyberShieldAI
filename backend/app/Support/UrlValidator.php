<?php

namespace App\Support;

class UrlValidator
{
    private const HIGH_RISK_TLDS = [
        'zip', 'mov', 'top', 'xyz', 'fit', 'tk', 'work', 'gq', 'cf', 'ml', 'ga', 'click', 'country', 'stream',
    ];

    private const SUSPICIOUS_KEYWORDS = [
        'login', 'signin', 'verify', 'account', 'banking', 'secure', 'update', 'paypal',
        'credential', 'auth', 'password', 'wallet', 'crypto', 'admin', 'service', 'security',
        'support', 'billing', 'confirm', 'recover',
    ];

    public static function validateAndNormalize(string $rawUrl): array
    {
        $trimmed = trim($rawUrl);

        if ($trimmed === '') {
            return [
                'valid' => false,
                'error' => 'URL target cannot be empty.',
            ];
        }

        // Add scheme if missing
        if (! preg_match('#^[a-zA-Z][a-zA-Z0-9+\-.]*://#', $trimmed)) {
            $trimmed = 'http://'.$trimmed;
        }

        $parsed = parse_url($trimmed);

        if ($parsed === false || empty($parsed['host'])) {
            return [
                'valid' => false,
                'error' => 'Malformed URL or missing host.',
            ];
        }

        $scheme = strtolower($parsed['scheme'] ?? 'http');

        if (! in_array($scheme, ['http', 'https'], true)) {
            return [
                'valid' => false,
                'error' => 'Unsupported protocol. Only HTTP and HTTPS URLs are allowed.',
            ];
        }

        $host = strtolower($parsed['host']);
        $port = $parsed['port'] ?? ($scheme === 'https' ? 443 : 80);
        $path = $parsed['path'] ?? '/';
        $query = isset($parsed['query']) ? '?'.$parsed['query'] : '';
        $user = $parsed['user'] ?? null;
        $pass = $parsed['pass'] ?? null;

        $normalizedUrl = $scheme.'://'.$host.($port !== 80 && $port !== 443 ? ':'.$port : '').$path.$query;

        $isIp = filter_var($host, FILTER_VALIDATE_IP) !== false;
        $hasUserinfoObfuscation = $user !== null || str_contains($rawUrl, '@');
        
        // Count subdomains
        $hostParts = explode('.', $host);
        $subdomainCount = max(0, count($hostParts) - 2);

        // TLD extraction
        $tld = count($hostParts) > 1 ? end($hostParts) : '';

        // Detect suspicious keywords
        $foundKeywords = [];
        $searchTarget = strtolower($host.$path.$query);
        foreach (self::SUSPICIOUS_KEYWORDS as $keyword) {
            if (str_contains($searchTarget, $keyword)) {
                $foundKeywords[] = $keyword;
            }
        }

        return [
            'valid' => true,
            'original_url' => $rawUrl,
            'normalized_url' => $normalizedUrl,
            'scheme' => $scheme,
            'host' => $host,
            'port' => $port,
            'path' => $path,
            'query' => $query,
            'is_ip' => $isIp,
            'is_https' => $scheme === 'https',
            'has_userinfo_obfuscation' => $hasUserinfoObfuscation,
            'subdomain_count' => $subdomainCount,
            'tld' => $tld,
            'is_high_risk_tld' => in_array($tld, self::HIGH_RISK_TLDS, true),
            'url_length' => strlen($normalizedUrl),
            'suspicious_keywords' => array_values(array_unique($foundKeywords)),
            'error' => null,
        ];
    }
}
