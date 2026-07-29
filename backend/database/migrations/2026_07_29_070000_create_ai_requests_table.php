<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scan_id')->constrained()->cascadeOnDelete();
            $table->string('model_name', 120);
            $table->longText('prompt');
            $table->json('response')->nullable();
            $table->string('status', 30)->default('pending');
            $table->decimal('processing_time', 10, 3)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['scan_id', 'status']);
            $table->index('model_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_requests');
    }
};
