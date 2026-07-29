<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->text('value')->nullable();
            $table->string('severity', 30)->default('info');
            $table->timestamps();

            $table->index(['report_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_indicators');
    }
};
