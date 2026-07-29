<?php

namespace Database\Factories;

use App\Models\Report;
use App\Models\Scan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    public function definition(): array
    {
        $scan = Scan::factory()->completed();

        return [
            'scan_id' => $scan,
            'user_id' => fn (array $attributes) => Scan::query()->find($attributes['scan_id'])->user_id,
            'title' => fake()->sentence(4),
            'summary' => fake()->paragraph(),
            'risk_score' => fake()->numberBetween(0, 100),
            'report_data' => [
                'model' => 'pending',
                'schema_version' => 1,
            ],
        ];
    }
}
