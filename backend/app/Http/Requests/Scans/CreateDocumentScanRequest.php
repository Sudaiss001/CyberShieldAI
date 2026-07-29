<?php

namespace App\Http\Requests\Scans;

use Illuminate\Foundation\Http\FormRequest;

class CreateDocumentScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'document_file' => ['required', 'file', 'max:15360'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->hasFile('document_file')) {
                return;
            }

            $extension = strtolower((string) $this->file('document_file')->getClientOriginalExtension());

            if (! in_array($extension, ['pdf', 'doc', 'docx', 'txt'], true)) {
                $validator->errors()->add('document_file', 'Unsupported file type. Supported document types are PDF, DOC, DOCX, and TXT.');
            }
        });
    }
}
