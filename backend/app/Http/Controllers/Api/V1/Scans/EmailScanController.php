<?php

namespace App\Http\Controllers\Api\V1\Scans;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scans\CreateEmailScanRequest;
use App\Http\Resources\ScanResource;
use App\Http\Resources\ScanStatusResource;
use App\Jobs\ProcessScanJob;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\EmailScannerService;
use App\Services\Scans\Exceptions\EmailScanException;
use App\Services\Scans\ScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailScanController extends Controller
{
    public function __construct(
        private readonly ScanService $scanService,
        private readonly EmailScannerService $emailScannerService
    ) {
    }

    public function store(CreateEmailScanRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $input = $this->emailScannerService->prepareInput(
                $request->validated(),
                $request->file('email_file')
            );
        } catch (EmailScanException $exception) {
            return $this->error($exception->getMessage(), [], 422);
        }

        $scan = $this->scanService->createEmailScan($user, $input);

        ProcessScanJob::dispatch($scan->id);

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Email scan created and queued for processing.', 201);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $perPage = min(max($request->integer('per_page', 15), 1), 50);
        $scans = $this->scanService->listUserScans($user, $perPage, Scan::TYPE_EMAIL);

        return $this->success([
            'scans' => ScanResource::collection($scans->items())->resolve($request),
            'pagination' => [
                'current_page' => $scans->currentPage(),
                'per_page' => $scans->perPage(),
                'total' => $scans->total(),
                'last_page' => $scans->lastPage(),
            ],
        ], 'Email scan history retrieved.');
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScan($user, $id, Scan::TYPE_EMAIL);

        if (! $scan) {
            return $this->error('Email scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Email scan details retrieved.');
    }

    public function status(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScanStatus($user, $id, Scan::TYPE_EMAIL);

        if (! $scan) {
            return $this->error('Email scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanStatusResource($scan),
        ], 'Email scan status retrieved.');
    }
}
