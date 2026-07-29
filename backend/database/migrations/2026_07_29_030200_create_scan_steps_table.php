<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scan_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scan_id')->constrained()->cascadeOnDelete();
            $table->string('step_name');
            $table->string('status', 30)->default('pending');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->text('message')->nullable();
            $table->timestamps();

            $table->index(['scan_id', 'status']);
            $table->index('step_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scan_steps');
    }
};
