<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_evidence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('snippet')->nullable();
            $table->string('severity', 30)->default('info');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['report_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_evidence');
    }
};
