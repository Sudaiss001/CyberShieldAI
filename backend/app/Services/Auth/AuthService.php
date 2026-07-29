<?php

namespace App\Services\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function registerUser(array $data): User
    {
        $role = Role::query()->where('slug', Role::USER)->firstOrFail();

        return User::query()->create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
            'role_id' => $role->id,
            'status' => User::STATUS_ACTIVE,
        ])->load('role');
    }

    public function findUserByCredentials(string $email, string $password): ?User
    {
        $user = User::query()
            ->with('role')
            ->where('email', strtolower($email))
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

    public function createToken(User $user, string $tokenName, array $abilities): string
    {
        return $user->createToken($tokenName, $abilities)->plainTextToken;
    }

    public function revokeCurrentToken(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
