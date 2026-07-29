<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'scan_id',
        'user_id',
        'title',
        'summary',
        'risk_score',
        'report_data',
    ];

    protected function casts(): array
    {
        return [
            'risk_score' => 'integer',
            'report_data' => 'array',
        ];
    }

    public function scan(): BelongsTo
    {
        return $this->belongsTo(Scan::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function indicators(): HasMany
    {
        return $this->hasMany(ReportIndicator::class);
    }

    public function evidence(): HasMany
    {
        return $this->hasMany(ReportEvidence::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(ReportRecommendation::class)->orderBy('sort_order');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(ReportTag::class);
    }
}
