<?php

namespace App\Services\Auth;

use App\Models\Role;

class SocialAuthService
{
    public const GOOGLE = 'google';
    public const GITHUB = 'github';

    /**
     * Social authentication is reserved for normal users.
     * Admin authentication must remain email/password only.
     */
    public function isAllowedForRole(string $roleSlug): bool
    {
        return $roleSlug === Role::USER;
    }

    public function supportedProviders(): array
    {
        return [
            self::GOOGLE,
            self::GITHUB,
        ];
    }
}
