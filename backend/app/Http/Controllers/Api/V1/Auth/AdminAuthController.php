<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AdminLoginRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function login(AdminLoginRequest $request): JsonResponse
    {
        $user = $this->authService->findUserByCredentials(
            $request->string('email')->toString(),
            $request->string('password')->toString()
        );

        if (! $user) {
            return $this->error('Invalid admin credentials.', [], 401);
        }

        if (! $user->hasRole(Role::ADMIN)) {
            return $this->error('This account does not have admin access.', [], 403);
        }

        if (! $user->isActive()) {
            return $this->error('This admin account is not active.', [
                'status' => $user->status,
            ], 403);
        }

        $token = $this->authService->createToken($user, 'admin-api-token', ['admin']);

        return $this->success([
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => new UserResource($user),
        ], 'Admin login successful.');
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authService->revokeCurrentToken($user);

        return $this->success([], 'Admin logout successful.');
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('role');

        return $this->success([
            'user' => new UserResource($user),
        ], 'Authenticated admin retrieved.');
    }
}
