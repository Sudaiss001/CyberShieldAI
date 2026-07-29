<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('scan_type', 50);
            $table->text('target')->nullable();
            $table->string('status', 30)->default('queued');
            $table->string('risk_level', 30)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['scan_type', 'status']);
            $table->index('risk_level');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scans');
    }
};
