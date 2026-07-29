<?php

namespace App\Http\Controllers\Api\V1\Scans;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scans\CreateVideoScanRequest;
use App\Http\Resources\ScanResource;
use App\Http\Resources\ScanStatusResource;
use App\Jobs\ProcessScanJob;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\ScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoScanController extends Controller
{
    public function __construct(private readonly ScanService $scanService)
    {
    }

    public function store(CreateVideoScanRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $file = $request->file('video_file');
        $fileName = $file?->getClientOriginalName() ?? basename((string) $request->input('target', 'video_sample.mp4'));
        $target = $request->input('target') ?? $fileName;

        $input = [
            'scan_type' => Scan::TYPE_VIDEO,
            'target' => $target,
            'file_name' => $fileName,
            'mime_type' => $file?->getClientMimeType() ?? 'video/mp4',
            'file_size' => $file?->getSize() ?? 10 * 1024 * 1024,
            'content' => $file ? file_get_contents($file->getRealPath()) : 'VIDEO_SAMPLE_STREAM',
            'hash' => $file ? hash_file('sha256', $file->getRealPath()) : hash('sha256', $target),
        ];

        $scan = $this->scanService->createVideoScan($user, $input);

        ProcessScanJob::dispatch($scan->id);

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Video scan created and queued for processing.', 201);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $perPage = min(max($request->integer('per_page', 15), 1), 50);
        $scans = $this->scanService->listUserScans($user, $perPage, Scan::TYPE_VIDEO);

        return $this->success([
            'scans' => ScanResource::collection($scans->items())->resolve($request),
            'pagination' => [
                'current_page' => $scans->currentPage(),
                'per_page' => $scans->perPage(),
                'total' => $scans->total(),
                'last_page' => $scans->lastPage(),
            ],
        ], 'Video scan history retrieved.');
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScan($user, $id, Scan::TYPE_VIDEO);

        if (! $scan) {
            return $this->error('Video scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Video scan details retrieved.');
    }

    public function status(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScanStatus($user, $id, Scan::TYPE_VIDEO);

        if (! $scan) {
            return $this->error('Video scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanStatusResource($scan),
        ], 'Video scan status retrieved.');
    }
}
