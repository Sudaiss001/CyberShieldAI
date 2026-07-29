<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->registerUser($request->validated());
        $token = $this->authService->createToken($user, 'user-api-token', ['user']);

        return $this->success([
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => new UserResource($user),
        ], 'Registration successful.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->findUserByCredentials(
            $request->string('email')->toString(),
            $request->string('password')->toString()
        );

        if (! $user) {
            return $this->error('Invalid email or password.', [], 401);
        }

        if ($user->hasRole(Role::ADMIN)) {
            return $this->error('Admin accounts must use the admin authentication endpoint.', [], 403);
        }

        if (! $user->isActive()) {
            return $this->error('Your account is not active.', [
                'status' => $user->status,
            ], 403);
        }

        $token = $this->authService->createToken($user, 'user-api-token', ['user']);

        return $this->success([
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => new UserResource($user),
        ], 'Login successful.');
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authService->revokeCurrentToken($user);

        return $this->success([], 'Logout successful.');
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('role');

        return $this->success([
            'user' => new UserResource($user),
        ], 'Authenticated user retrieved.');
    }
}
