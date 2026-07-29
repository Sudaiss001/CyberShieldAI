<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_user_can_register_with_default_user_role(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Alex Morgan',
            'email' => 'alex@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role.slug', Role::USER)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token_type',
                    'access_token',
                    'user',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'alex@example.com',
            'status' => User::STATUS_ACTIVE,
        ]);

        $this->assertTrue(Hash::check('password123', User::query()->first()->password));
    }

    public function test_user_can_login_and_get_authenticated_profile(): void
    {
        $user = $this->createUser();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $token = $login->json('data.access_token');

        $login
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', $user->email);

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.role.slug', Role::USER);
    }

    public function test_user_can_logout_and_revoke_current_token(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test-user-token', ['user'])->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_normal_login_rejects_admin_accounts(): void
    {
        $admin = $this->createAdmin();

        $this->postJson('/api/v1/auth/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_admin_login_is_separate_and_requires_admin_role(): void
    {
        $admin = $this->createAdmin();
        $user = $this->createUser('jane@example.com');

        $this->postJson('/api/v1/admin/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $login = $this->postJson('/api/v1/admin/auth/login', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $login
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role.slug', Role::ADMIN);

        $this->withToken($login->json('data.access_token'))
            ->getJson('/api/v1/admin/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.role.slug', Role::ADMIN);
    }

    public function test_role_middleware_blocks_user_token_from_admin_auth_profile(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test-user-token', ['user'])->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/admin/auth/me')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }

    private function createUser(string $email = 'alex@example.com'): User
    {
        return User::query()->create([
            'name' => 'Alex Morgan',
            'email' => $email,
            'password' => Hash::make('password123'),
            'role_id' => Role::query()->where('slug', Role::USER)->value('id'),
            'status' => User::STATUS_ACTIVE,
        ])->load('role');
    }

    private function createAdmin(): User
    {
        return User::query()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role_id' => Role::query()->where('slug', Role::ADMIN)->value('id'),
            'status' => User::STATUS_ACTIVE,
        ])->load('role');
    }
}
