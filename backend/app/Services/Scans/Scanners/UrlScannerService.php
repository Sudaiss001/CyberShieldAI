<?php

namespace App\Services\Scans\Scanners;

use App\Models\Scan;
use App\Services\Scans\Contracts\ScannerInterface;
use App\Services\Scans\DTO\ScanResult;
use App\Support\UrlValidator;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Throwable;

class UrlScannerService implements ScannerInterface
{
    public function supports(string $scanType): bool
    {
        return strtolower($scanType) === Scan::TYPE_URL;
    }

    public function scan(Scan $scan): ScanResult
    {
        $validation = UrlValidator::validateAndNormalize($scan->target);

        if (! $validation['valid']) {
            return ScanResult::create(
                riskScore: 85,
                riskLevel: Scan::RISK_CRITICAL,
                title: 'Invalid URL Scanner Target',
                summary: 'The provided scan target is not a valid HTTP/HTTPS URL: '.($validation['error'] ?? 'Malformed input'),
                reportData: [
                    'target' => $scan->target,
                    'error' => $validation['error'],
                    'valid' => false,
                ],
                indicators: [
                    ['label' => 'URL Validity', 'value' => 'Invalid Format', 'severity' => 'critical'],
                ],
                evidence: [
                    [
                        'title' => 'Invalid URL Format',
                        'description' => $validation['error'] ?? 'The target URL could not be parsed as a valid web address.',
                        'snippet' => $scan->target,
                        'severity' => 'critical',
                        'metadata' => ['target' => $scan->target],
                    ],
                ],
                recommendations: [
                    ['recommendation' => 'Ensure the scan target includes a valid hostname and standard protocol (http:// or https://).', 'sort_order' => 1],
                ],
                tags: ['URL Scanner', 'Invalid Target']
            );
        }

        $urlInfo = $validation;
        $urlToScan = $urlInfo['normalized_url'];

        // Perform HTTP analysis
        $httpResult = $this->inspectHttpTarget($urlToScan);

        // Calculate heuristic risk score
        $riskScore = 0;
        $evidenceList = [];
        $indicatorsList = [];
        $recommendationsList = [];
        $tags = ['URL Scanner'];

        // 1. HTTPS & Protocol Check
        if ($urlInfo['is_https']) {
            $indicatorsList[] = ['label' => 'Transport Security', 'value' => 'HTTPS Enabled', 'severity' => 'safe'];
            $tags[] = 'HTTPS';
        } else {
            $riskScore += 20;
            $indicatorsList[] = ['label' => 'Transport Security', 'value' => 'HTTP Only (Unencrypted)', 'severity' => 'warning'];
            $evidenceList[] = [
                'title' => 'Unencrypted HTTP Connection',
                'description' => 'Target uses unencrypted HTTP protocol. Data transmitted may be intercepted or tampered with.',
                'snippet' => $urlInfo['scheme'].'://',
                'severity' => 'medium',
                'metadata' => ['scheme' => $urlInfo['scheme']],
            ];
            $recommendationsList[] = ['recommendation' => 'Enforce HTTPS encryption with a valid SSL/TLS certificate.', 'sort_order' => 1];
            $tags[] = 'Unencrypted';
        }

        // 2. IP Address Host Check
        if ($urlInfo['is_ip']) {
            $riskScore += 25;
            $indicatorsList[] = ['label' => 'Host Type', 'value' => 'Raw IP Address', 'severity' => 'danger'];
            $evidenceList[] = [
                'title' => 'Raw IP Address Host',
                'description' => 'Target uses a direct IP address instead of a domain name, commonly seen in phishing and malware landing pages.',
                'snippet' => $urlInfo['host'],
                'severity' => 'high',
                'metadata' => ['host' => $urlInfo['host']],
            ];
            $recommendationsList[] = ['recommendation' => 'Use domain names with verified DNS records instead of raw IP addresses.', 'sort_order' => 2];
            $tags[] = 'IP Host';
        } else {
            $indicatorsList[] = ['label' => 'Host Type', 'value' => 'Domain Name', 'severity' => 'safe'];
        }

        // 3. Userinfo Obfuscation Check (@ symbol)
        if ($urlInfo['has_userinfo_obfuscation']) {
            $riskScore += 35;
            $indicatorsList[] = ['label' => 'URL Obfuscation', 'value' => 'UserInfo @ Token Detected', 'severity' => 'critical'];
            $evidenceList[] = [
                'title' => 'URL Obfuscation Attempt (@)',
                'description' => 'Target contains userinfo prefix (@ symbol) designed to trick users regarding the actual destination domain.',
                'snippet' => $urlInfo['original_url'],
                'severity' => 'critical',
                'metadata' => ['original' => $urlInfo['original_url']],
            ];
            $recommendationsList[] = ['recommendation' => 'Avoid using credentials or @ symbols in URL host strings.', 'sort_order' => 3];
            $tags[] = 'Obfuscation';
        }

        // 4. High Risk TLD Check
        if ($urlInfo['is_high_risk_tld']) {
            $riskScore += 20;
            $indicatorsList[] = ['label' => 'Top Level Domain', 'value' => '.'.$urlInfo['tld'].' (High Risk TLD)', 'severity' => 'warning'];
            $evidenceList[] = [
                'title' => 'High-Risk Top Level Domain',
                'description' => 'Target TLD (.'.$urlInfo['tld'].') is frequently associated with abuse and spam campaigns.',
                'snippet' => '.'.$urlInfo['tld'],
                'severity' => 'medium',
                'metadata' => ['tld' => $urlInfo['tld']],
            ];
            $tags[] = 'Suspicious TLD';
        }

        // 5. URL Length Check
        if ($urlInfo['url_length'] > 200) {
            $riskScore += 20;
            $indicatorsList[] = ['label' => 'URL Length', 'value' => $urlInfo['url_length'].' characters (Excessively Long)', 'severity' => 'warning'];
            $evidenceList[] = [
                'title' => 'Excessively Long URL',
                'description' => 'URL contains over 200 characters. Long obfuscated query parameters are frequently used to hide payload structures.',
                'snippet' => substr($urlToScan, 0, 100).'...',
                'severity' => 'medium',
                'metadata' => ['length' => $urlInfo['url_length']],
            ];
        } elseif ($urlInfo['url_length'] > 100) {
            $riskScore += 10;
            $indicatorsList[] = ['label' => 'URL Length', 'value' => $urlInfo['url_length'].' characters', 'severity' => 'info'];
        }

        // 6. Excessive Subdomains Check
        if ($urlInfo['subdomain_count'] > 3) {
            $riskScore += 15;
            $indicatorsList[] = ['label' => 'Subdomain Count', 'value' => $urlInfo['subdomain_count'].' levels', 'severity' => 'warning'];
            $evidenceList[] = [
                'title' => 'Excessive Subdomain Levels',
                'description' => 'Host contains multiple subdomain levels, which may be an attempt to impersonate legitimate brand domains.',
                'snippet' => $urlInfo['host'],
                'severity' => 'medium',
                'metadata' => ['subdomains' => $urlInfo['subdomain_count']],
            ];
        }

        // 7. Suspicious Keywords Check
        if (! empty($urlInfo['suspicious_keywords'])) {
            $kwCount = count($urlInfo['suspicious_keywords']);
            $scoreAdd = min(30, $kwCount * 10);
            $riskScore += $scoreAdd;
            $indicatorsList[] = ['label' => 'Keyword Analysis', 'value' => implode(', ', $urlInfo['suspicious_keywords']), 'severity' => 'warning'];
            $evidenceList[] = [
                'title' => 'Sensitive Security Keywords Detected',
                'description' => 'URL string contains high-target security/authentication terms: '.implode(', ', $urlInfo['suspicious_keywords']),
                'snippet' => implode(', ', $urlInfo['suspicious_keywords']),
                'severity' => 'medium',
                'metadata' => ['keywords' => $urlInfo['suspicious_keywords']],
            ];
            $tags[] = 'Sensitive Keywords';
        }

        // 8. Reachability & HTTP Inspection Results
        if (! $httpResult['reachable']) {
            $riskScore += 20;
            $indicatorsList[] = ['label' => 'Target Reachability', 'value' => 'Unreachable ('.$httpResult['error'].')', 'severity' => 'danger'];
            $evidenceList[] = [
                'title' => 'Host Reachability Failure',
                'description' => 'The target web server could not be reached: '.$httpResult['error'],
                'snippet' => $urlToScan,
                'severity' => 'high',
                'metadata' => ['error' => $httpResult['error']],
            ];
            $recommendationsList[] = ['recommendation' => 'Verify DNS configuration and web server availability.', 'sort_order' => 4];
        } else {
            $indicatorsList[] = ['label' => 'Target Reachability', 'value' => 'Reachable (HTTP '.$httpResult['status_code'].')', 'severity' => 'safe'];

            // Check Redirects
            if ($httpResult['redirect_count'] > 0) {
                $indicatorsList[] = ['label' => 'Redirect Chain', 'value' => $httpResult['redirect_count'].' redirect(s)', 'severity' => $httpResult['redirect_count'] > 3 ? 'warning' : 'info'];
                if ($httpResult['redirect_count'] > 3) {
                    $riskScore += 15;
                    $evidenceList[] = [
                        'title' => 'Excessive Redirect Chain',
                        'description' => 'Target URL performed '.$httpResult['redirect_count'].' redirects before reaching final destination.',
                        'snippet' => implode(' -> ', array_column($httpResult['redirect_chain'], 'url')),
                        'severity' => 'medium',
                        'metadata' => ['redirects' => $httpResult['redirect_chain']],
                    ];
                }
            }

            // Check Security Headers
            $missingHeaders = [];
            foreach ($httpResult['security_headers'] as $headerName => $present) {
                if (! $present) {
                    $missingHeaders[] = $headerName;
                }
            }

            if (! empty($missingHeaders)) {
                $headScore = min(20, count($missingHeaders) * 5);
                $riskScore += $headScore;
                $indicatorsList[] = ['label' => 'Missing Security Headers', 'value' => implode(', ', $missingHeaders), 'severity' => 'warning'];
                $evidenceList[] = [
                    'title' => 'Missing Key Security Headers',
                    'description' => 'Target HTTP response lacks important protection headers: '.implode(', ', $missingHeaders),
                    'snippet' => implode(', ', $missingHeaders),
                    'severity' => 'medium',
                    'metadata' => ['missing_headers' => $missingHeaders],
                ];
                $recommendationsList[] = ['recommendation' => 'Configure security response headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).', 'sort_order' => 5];
            } else {
                $indicatorsList[] = ['label' => 'Security Headers', 'value' => 'All Recommended Headers Present', 'severity' => 'safe'];
            }
        }

        $finalScore = min(100, max(0, $riskScore));
        $riskLevel = $this->classifyRisk($finalScore);

        $summary = $this->generateSummary($urlInfo, $httpResult, $finalScore, $riskLevel);

        return ScanResult::create(
            riskScore: $finalScore,
            riskLevel: $riskLevel,
            title: 'CyberShield AI URL Security Assessment',
            summary: $summary,
            reportData: [
                'url_info' => $urlInfo,
                'http_result' => $httpResult,
                'scanner_version' => '1.0.0',
            ],
            indicators: $indicatorsList,
            evidence: $evidenceList,
            recommendations: $recommendationsList,
            tags: array_values(array_unique($tags))
        );
    }

    private function inspectHttpTarget(string $url): array
    {
        $redirectChain = [];
        $currentUrl = $url;
        $maxRedirects = 5;
        $redirectCount = 0;
        $finalResponse = null;
        $error = null;
        $reachable = false;

        for ($i = 0; $i <= $maxRedirects; $i++) {
            try {
                $response = Http::withOptions([
                    'allow_redirects' => false,
                    'connect_timeout' => 3,
                    'timeout' => 5,
                    'verify' => false,
                ])->get($currentUrl);

                $reachable = true;
                $statusCode = $response->status();

                $redirectChain[] = [
                    'url' => $currentUrl,
                    'status' => $statusCode,
                ];

                if ($response->isRedirect()) {
                    $location = $response->header('Location');
                    if (! $location) {
                        $finalResponse = $response;
                        break;
                    }

                    // Resolve relative location header
                    if (! preg_match('#^https?://#i', $location)) {
                        $parsedBase = parse_url($currentUrl);
                        $location = ($parsedBase['scheme'] ?? 'http').'://'.($parsedBase['host'] ?? '').$location;
                    }

                    $currentUrl = $location;
                    $redirectCount++;
                    continue;
                }

                $finalResponse = $response;
                break;
            } catch (ConnectionException $e) {
                $error = 'Connection failed or timed out: '.$e->getMessage();
                break;
            } catch (RequestException $e) {
                $error = 'HTTP request error: '.$e->getMessage();
                break;
            } catch (Throwable $e) {
                $error = 'Request failure: '.$e->getMessage();
                break;
            }
        }

        $securityHeaders = [
            'Strict-Transport-Security' => false,
            'Content-Security-Policy' => false,
            'X-Frame-Options' => false,
            'X-Content-Type-Options' => false,
            'Referrer-Policy' => false,
        ];

        $statusCode = null;
        if ($finalResponse) {
            $statusCode = $finalResponse->status();
            foreach ($securityHeaders as $headerName => &$present) {
                if ($finalResponse->hasHeader($headerName)) {
                    $present = true;
                }
            }
        }

        return [
            'reachable' => $reachable,
            'status_code' => $statusCode,
            'redirect_count' => $redirectCount,
            'redirect_chain' => $redirectChain,
            'security_headers' => $securityHeaders,
            'final_url' => $currentUrl,
            'error' => $error,
        ];
    }

    private function classifyRisk(int $score): string
    {
        return match (true) {
            $score >= 85 => Scan::RISK_CRITICAL,
            $score >= 65 => Scan::RISK_HIGH,
            $score >= 40 => Scan::RISK_MEDIUM,
            $score >= 15 => Scan::RISK_LOW,
            default => Scan::RISK_SAFE,
        };
    }

    private function generateSummary(array $urlInfo, array $httpResult, int $score, string $riskLevel): string
    {
        $statusStr = $httpResult['reachable'] ? 'reachable (HTTP '.$httpResult['status_code'].')' : 'unreachable';
        return sprintf(
            'URL analysis completed for %s. Target is %s. Assigned risk score %d/100 (%s).',
            $urlInfo['host'],
            $statusStr,
            $score,
            strtoupper($riskLevel)
        );
    }
}
