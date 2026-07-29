<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->unsignedTinyInteger('risk_score')->default(0);
            $table->json('report_data')->nullable();
            $table->timestamps();

            $table->unique('scan_id');
            $table->index(['user_id', 'created_at']);
            $table->index('risk_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
