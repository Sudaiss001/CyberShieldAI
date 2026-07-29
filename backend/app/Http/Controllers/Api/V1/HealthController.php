<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'service' => 'Cyber Guardian AI API',
            'version' => 'v1',
            'status' => 'ready',
        ], 'API foundation is ready.');
    }
}
