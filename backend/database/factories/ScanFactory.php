<?php

namespace Database\Factories;

use App\Models\Scan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Scan>
 */
class ScanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'scan_type' => fake()->randomElement([
                Scan::TYPE_URL,
                Scan::TYPE_EMAIL,
                Scan::TYPE_IMAGE,
                Scan::TYPE_DOCUMENT,
                Scan::TYPE_AUDIO,
                Scan::TYPE_VIDEO,
                Scan::TYPE_QR,
                Scan::TYPE_AI,
            ]),
            'target' => fake()->url(),
            'status' => Scan::STATUS_QUEUED,
            'risk_level' => null,
            'started_at' => null,
            'completed_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Scan::STATUS_COMPLETED,
            'risk_level' => fake()->randomElement([
                Scan::RISK_SAFE,
                Scan::RISK_LOW,
                Scan::RISK_MEDIUM,
                Scan::RISK_HIGH,
                Scan::RISK_CRITICAL,
            ]),
            'started_at' => now()->subMinutes(2),
            'completed_at' => now(),
        ]);
    }
}
