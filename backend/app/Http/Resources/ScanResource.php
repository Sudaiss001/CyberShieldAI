<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScanResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'scan_type' => $this->scan_type,
            'target' => $this->target,
            'status' => $this->status,
            'risk_level' => $this->risk_level,
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'steps' => ScanStepResource::collection($this->whenLoaded('steps')),
            'events' => ScanEventResource::collection($this->whenLoaded('events')),
            'report' => new ReportResource($this->whenLoaded('report')),
        ];
    }
}
