<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'scan_id' => $this->scan_id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'summary' => $this->summary,
            'risk_score' => $this->risk_score,
            'report_data' => $this->report_data,
            'indicators' => ReportIndicatorResource::collection($this->whenLoaded('indicators')),
            'evidence' => ReportEvidenceResource::collection($this->whenLoaded('evidence')),
            'recommendations' => ReportRecommendationResource::collection($this->whenLoaded('recommendations')),
            'tags' => ReportTagResource::collection($this->whenLoaded('tags')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
