<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportTag extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'tag',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
