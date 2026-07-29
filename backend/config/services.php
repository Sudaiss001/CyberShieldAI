<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'gemma' => [
        'key' => env('GEMMA_API_KEY'),
        'base_url' => env('GEMMA_API_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'model' => env('GEMMA_MODEL', 'gemma-4-26b-a4b-it'),
        'timeout' => (int) env('GEMMA_TIMEOUT', 20),
        'retries' => (int) env('GEMMA_RETRIES', 2),
        'retry_sleep_ms' => (int) env('GEMMA_RETRY_SLEEP_MS', 250),
        'temperature' => (float) env('GEMMA_TEMPERATURE', 0.2),
        'max_output_tokens' => (int) env('GEMMA_MAX_OUTPUT_TOKENS', 2048),
        'max_prompt_chars' => (int) env('GEMMA_MAX_PROMPT_CHARS', 12000),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
