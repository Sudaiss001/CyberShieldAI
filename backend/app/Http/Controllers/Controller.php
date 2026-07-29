<?php

namespace App\Http\Controllers;

use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

abstract class Controller
{
    protected function success(
        mixed $data = [],
        string $message = '',
        int $status = 200,
        array $headers = []
    ): JsonResponse {
        return ApiResponse::success($data, $message, $status, $headers);
    }

    protected function error(
        string $message,
        mixed $data = [],
        int $status = 400,
        array $headers = []
    ): JsonResponse {
        return ApiResponse::error($message, $data, $status, $headers);
    }
}
