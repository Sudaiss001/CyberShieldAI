<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AiRequestResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'scan_id' => $this->scan_id,
            'model_name' => $this->model_name,
            'status' => $this->status,
            'processing_time' => $this->processing_time,
            'analysis' => $this->response['analysis'] ?? $this->response,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
