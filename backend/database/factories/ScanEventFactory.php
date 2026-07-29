<?php

namespace Database\Factories;

use App\Models\Scan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScanEvent>
 */
class ScanEventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'scan_id' => Scan::factory(),
            'event_type' => fake()->randomElement(['created', 'queued', 'step_updated', 'completed']),
            'event_data' => [
                'source' => 'factory',
                'trace_id' => fake()->uuid(),
            ],
        ];
    }
}
