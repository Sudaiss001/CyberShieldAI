<?php

use App\Support\ApiResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->throttleApi();
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->respond(function ($response, Throwable $exception, Request $request) {
            if (! $request->is('api/*')) {
                return $response;
            }

            $payload = json_decode($response->getContent(), true) ?: [];
            $status = $response->getStatusCode();
            $message = $payload['message'] ?? 'Request failed.';
            $data = [];

            if (isset($payload['errors'])) {
                $data['errors'] = $payload['errors'];
            }

            return ApiResponse::error($message, $data, $status);
        });
    })->create();
