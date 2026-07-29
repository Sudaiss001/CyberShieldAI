<?php

namespace Database\Factories;

use App\Models\Scan;
use App\Models\ScanStep;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScanStep>
 */
class ScanStepFactory extends Factory
{
    public function definition(): array
    {
        return [
            'scan_id' => Scan::factory(),
            'step_name' => fake()->randomElement([
                'Uploading',
                'Extracting Data',
                'Checking Threat Intelligence',
                'Generating Report',
            ]),
            'status' => ScanStep::STATUS_PENDING,
            'progress' => 0,
            'message' => null,
        ];
    }
}
