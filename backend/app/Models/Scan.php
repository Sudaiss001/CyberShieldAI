<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Scan extends Model
{
    use HasFactory;

    public const TYPE_AI = 'ai';
    public const TYPE_URL = 'url';
    public const TYPE_EMAIL = 'email';
    public const TYPE_IMAGE = 'image';
    public const TYPE_DOCUMENT = 'document';
    public const TYPE_AUDIO = 'audio';
    public const TYPE_VIDEO = 'video';
    public const TYPE_QR = 'qr';

    public const STATUS_QUEUED = 'queued';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    public const RISK_SAFE = 'safe';
    public const RISK_LOW = 'low';
    public const RISK_MEDIUM = 'medium';
    public const RISK_HIGH = 'high';
    public const RISK_CRITICAL = 'critical';

    protected $fillable = [
        'user_id',
        'scan_type',
        'target',
        'status',
        'risk_level',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ScanFile::class);
    }

    public function steps(): HasMany
    {
        return $this->hasMany(ScanStep::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(ScanEvent::class);
    }

    public function report(): HasOne
    {
        return $this->hasOne(Report::class);
    }

    public function aiRequests(): HasMany
    {
        return $this->hasMany(AiRequest::class);
    }
}
