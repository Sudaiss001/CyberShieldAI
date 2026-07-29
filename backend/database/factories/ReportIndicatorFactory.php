<?php

namespace Database\Factories;

use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ReportIndicator>
 */
class ReportIndicatorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'report_id' => Report::factory(),
            'label' => fake()->randomElement(['Domain Age', 'SPF/DKIM', 'Redirect Chain']),
            'value' => fake()->words(3, true),
            'severity' => fake()->randomElement(['critical', 'high', 'medium', 'low', 'info']),
        ];
    }
}
