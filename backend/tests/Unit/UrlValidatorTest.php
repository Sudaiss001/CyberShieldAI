<?php

namespace Tests\Unit;

use App\Support\UrlValidator;
use PHPUnit\Framework\TestCase;

class UrlValidatorTest extends TestCase
{
    public function test_it_validates_and_normalizes_standard_urls(): void
    {
        $res = UrlValidator::validateAndNormalize('https://example.com/login?ref=1');

        $this->assertTrue($res['valid']);
        $this->assertSame('https://example.com/login?ref=1', $res['normalized_url']);
        $this->assertSame('https', $res['scheme']);
        $this->assertSame('example.com', $res['host']);
        $this->assertFalse($res['is_ip']);
        $this->assertFalse($res['has_userinfo_obfuscation']);
        $this->assertContains('login', $res['suspicious_keywords']);
    }

    public function test_it_adds_http_scheme_when_missing(): void
    {
        $res = UrlValidator::validateAndNormalize('example.org/dashboard');

        $this->assertTrue($res['valid']);
        $this->assertSame('http://example.org/dashboard', $res['normalized_url']);
        $this->assertSame('http', $res['scheme']);
    }

    public function test_it_detects_raw_ip_address_hosts(): void
    {
        $res = UrlValidator::validateAndNormalize('http://192.168.1.100/admin');

        $this->assertTrue($res['valid']);
        $this->assertTrue($res['is_ip']);
        $this->assertSame('192.168.1.100', $res['host']);
    }

    public function test_it_detects_userinfo_obfuscation_attempts(): void
    {
        $res = UrlValidator::validateAndNormalize('http://google.com@phishing-site.xyz/login');

        $this->assertTrue($res['valid']);
        $this->assertTrue($res['has_userinfo_obfuscation']);
        $this->assertTrue($res['is_high_risk_tld']);
    }

    public function test_it_rejects_unsupported_protocols(): void
    {
        $res = UrlValidator::validateAndNormalize('ftp://ftp.example.com/file.txt');

        $this->assertFalse($res['valid']);
        $this->assertNotNull($res['error']);
    }

    public function test_it_rejects_empty_or_malformed_urls(): void
    {
        $res1 = UrlValidator::validateAndNormalize('   ');
        $this->assertFalse($res1['valid']);

        $res2 = UrlValidator::validateAndNormalize('http:///path');
        $this->assertFalse($res2['valid']);
    }
}
