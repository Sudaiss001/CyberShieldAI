<?php

namespace App\Http\Controllers\Api\V1\Scans;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scans\CreateDocumentScanRequest;
use App\Http\Resources\ScanResource;
use App\Http\Resources\ScanStatusResource;
use App\Jobs\ProcessScanJob;
use App\Models\Scan;
use App\Models\User;
use App\Services\Scans\DocumentScannerService;
use App\Services\Scans\Exceptions\DocumentScanException;
use App\Services\Scans\ScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentScanController extends Controller
{
    public function __construct(
        private readonly ScanService $scanService,
        private readonly DocumentScannerService $documentScannerService
    ) {
    }

    public function store(CreateDocumentScanRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        try {
            $input = $this->documentScannerService->prepareInput($request->file('document_file'));
        } catch (DocumentScanException $exception) {
            return $this->error($exception->getMessage(), [], 422);
        }

        $scan = $this->scanService->createDocumentScan($user, $input);

        ProcessScanJob::dispatch($scan->id);

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Document scan created and queued for processing.', 201);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $perPage = min(max($request->integer('per_page', 15), 1), 50);
        $scans = $this->scanService->listUserScans($user, $perPage, Scan::TYPE_DOCUMENT);

        return $this->success([
            'scans' => ScanResource::collection($scans->items())->resolve($request),
            'pagination' => [
                'current_page' => $scans->currentPage(),
                'per_page' => $scans->perPage(),
                'total' => $scans->total(),
                'last_page' => $scans->lastPage(),
            ],
        ], 'Document scan history retrieved.');
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScan($user, $id, Scan::TYPE_DOCUMENT);

        if (! $scan) {
            return $this->error('Document scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanResource($scan),
        ], 'Document scan details retrieved.');
    }

    public function status(Request $request, int|string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $scan = $this->scanService->findUserScanStatus($user, $id, Scan::TYPE_DOCUMENT);

        if (! $scan) {
            return $this->error('Document scan not found.', [], 404);
        }

        return $this->success([
            'scan' => new ScanStatusResource($scan),
        ], 'Document scan status retrieved.');
    }
}
