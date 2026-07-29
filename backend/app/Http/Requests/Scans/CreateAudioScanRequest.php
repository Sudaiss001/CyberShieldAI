<?php

namespace App\Http\Requests\Scans;

use Illuminate\Foundation\Http\FormRequest;

class CreateAudioScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'target' => ['nullable', 'string', 'max:2048'],
            'audio_file' => ['nullable', 'file', 'max:102400', 'mimes:mp3,wav,aac,ogg,flac,m4a'],
        ];
    }
}
