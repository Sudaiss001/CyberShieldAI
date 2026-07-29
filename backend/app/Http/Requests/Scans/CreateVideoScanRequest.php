<?php

namespace App\Http\Requests\Scans;

use Illuminate\Foundation\Http\FormRequest;

class CreateVideoScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'target' => ['nullable', 'string', 'max:2048'],
            'video_file' => ['nullable', 'file', 'max:512000', 'mimes:mp4,avi,mov,mkv,webm'],
        ];
    }
}
