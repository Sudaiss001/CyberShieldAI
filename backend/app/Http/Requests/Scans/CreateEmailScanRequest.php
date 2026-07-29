<?php

namespace App\Http\Requests\Scans;

use Illuminate\Foundation\Http\FormRequest;

class CreateEmailScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'raw_email' => ['nullable', 'string', 'max:5242880'],
            'headers' => ['nullable', 'string', 'max:262144'],
            'email_file' => ['nullable', 'file', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $providedInputs = array_filter([
                'raw_email' => $this->filled('raw_email'),
                'headers' => $this->filled('headers'),
                'email_file' => $this->hasFile('email_file'),
            ]);

            if (count($providedInputs) === 0) {
                $validator->errors()->add('email', 'Provide raw email content, headers, or a .eml file.');
            }

            if (count($providedInputs) > 1) {
                $validator->errors()->add('email', 'Provide exactly one email input per scan.');
            }

            if ($this->hasFile('email_file')) {
                $extension = strtolower((string) $this->file('email_file')->getClientOriginalExtension());

                if ($extension !== 'eml') {
                    $validator->errors()->add('email_file', 'Unsupported file type. Only .eml files are supported.');
                }
            }
        });
    }
}
