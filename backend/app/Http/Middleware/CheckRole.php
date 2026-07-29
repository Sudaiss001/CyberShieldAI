<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated.', [], 401);
        }

        $user->loadMissing('role');

        if (! $user->hasRole($roles)) {
            return ApiResponse::error('You do not have permission to access this resource.', [], 403);
        }

        return $next($request);
    }
}
