<?php

namespace App\Http\Controllers\Api\V1\Scans;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scans\CreateImageScanRequest;
use App\Http\Resources\ScanResource;
use App\Http\Resources\ScanStatusResource;
use App\Jobs\ProcessScanJob;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\Exceptions\ImageScanException;
use App\Services\Scans\ImageScannerService;
use App\Services\Scans\ScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImageScanController extends Controller
{
    public function __construct(
        private readonly ScanService $scanService,
        private readonly ImageScannerService $imageScannerService
    ) {
    }

    public function store(CreateImageScanRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $input = $this->imageScannerService->prepareInput($request->file('image_file'));
        } catch (ImageScanException $exception) {
            return $this->error($exception->getMessage(), [], 422);
        }

        $scan = $this->scanService->createImageScan($user, $input);

        ProcessScanJob::dispatch($scan->id);

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Image scan created and queued for processing.', 201);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $perPage = min(max($request->integer('per_page', 15), 1), 50);
        $scans = $this->scanService->listUserScans($user, $perPage, Scan::TYPE_IMAGE);

        return $this->success([
            'scans' => ScanResource::collection($scans->items())->resolve($request),
            'pagination' => [
                'current_page' => $scans->currentPage(),
                'per_page' => $scans->perPage(),
                'total' => $scans->total(),
                'last_page' => $scans->lastPage(),
            ],
        ], 'Image scan history retrieved.');
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScan($user, $id, Scan::TYPE_IMAGE);

        if (! $scan) {
            return $this->error('Image scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Image scan details retrieved.');
    }

    public function status(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScanStatus($user, $id, Scan::TYPE_IMAGE);

        if (! $scan) {
            return $this->error('Image scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanStatusResource($scan),
        ], 'Image scan status retrieved.');
    }
}
