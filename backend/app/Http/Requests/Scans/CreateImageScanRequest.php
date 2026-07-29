<?php

namespace App\Http\Requests\Scans;

use Illuminate\Foundation\Http\FormRequest;

class CreateImageScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'image_file' => ['required', 'file', 'max:10240'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->hasFile('image_file')) {
                return;
            }

            $extension = strtolower((string) $this->file('image_file')->getClientOriginalExtension());

            if (! in_array($extension, ['png', 'jpg', 'jpeg', 'webp'], true)) {
                $validator->errors()->add('image_file', 'Unsupported file type. Supported image types are PNG, JPG, JPEG, and WEBP.');
            }
        });
    }
}
