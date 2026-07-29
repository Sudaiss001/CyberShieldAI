<?php

namespace App\Http\Requests\Scans;

use App\Models\Scan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('scan_type')) {
            $this->merge([
                'scan_type' => strtolower((string) $this->input('scan_type')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'scan_type' => [
                'required',
                'string',
                Rule::in([
                    Scan::TYPE_AI,
                    Scan::TYPE_URL,
                    Scan::TYPE_EMAIL,
                    Scan::TYPE_IMAGE,
                    Scan::TYPE_DOCUMENT,
                    Scan::TYPE_AUDIO,
                    Scan::TYPE_VIDEO,
                    Scan::TYPE_QR,
                ]),
            ],
            'target' => ['required', 'string', 'max:2048'],
        ];
    }
}
