<?php

namespace Database\Factories;

use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReportRecommendation>
 */
class ReportRecommendationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'report_id' => Report::factory(),
            'recommendation' => fake()->sentence(),
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
