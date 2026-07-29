<?php

namespace Database\Factories;

use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReportEvidence>
 */
class ReportEvidenceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'report_id' => Report::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'snippet' => fake()->sentence(),
            'severity' => fake()->randomElement(['critical', 'high', 'medium', 'low', 'info']),
            'metadata' => [
                'source' => 'factory',
            ],
        ];
    }
}
