<?php

namespace Database\Factories;

use App\Models\Scan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScanFile>
 */
class ScanFileFactory extends Factory
{
    public function definition(): array
    {
        $fileName = fake()->word().'.pdf';

        return [
            'scan_id' => Scan::factory(),
            'file_name' => $fileName,
            'file_path' => 'scans/'.fake()->uuid().'/'.$fileName,
            'mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(10_000, 5_000_000),
            'hash' => hash('sha256', fake()->uuid()),
        ];
    }
}
