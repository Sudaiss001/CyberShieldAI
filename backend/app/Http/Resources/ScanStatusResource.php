<?php

namespace App\Http\Resources;

use App\Models\Scan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScanStatusResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'risk_level' => $this->risk_level,
            'progress' => $this->progressPercentage(),
            'current_step' => $this->currentStepName(),
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function progressPercentage(): int
    {
        if ($this->status === Scan::STATUS_COMPLETED) {
            return 100;
        }

        if (! $this->relationLoaded('steps') || $this->steps->isEmpty()) {
            return 0;
        }

        return (int) round($this->steps->avg('progress'));
    }

    private function currentStepName(): ?string
    {
        if (! $this->relationLoaded('steps')) {
            return null;
        }

        return $this->steps
            ->firstWhere('status', 'running')
            ?->step_name;
    }
}
