<?php

return [
    'name'     => env('APP_NAME', 'RDO VTC Backend'),
    'env'      => env('APP_ENV', 'production'),
    'debug'    => (bool) env('APP_DEBUG', false),
    'url'      => env('APP_URL', 'https://rdovtc-student-management-portal-v2.onrender.com'),
    'timezone' => 'UTC',
    'locale'   => 'en',
    'fallback_locale' => 'en',
    'faker_locale'    => 'en_US',
    'cipher'   => 'AES-256-CBC',
    'key'      => env('APP_KEY'),
    'previous_keys' => array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    // NOTE: No 'providers' array here — Laravel 11 uses bootstrap/providers.php
    // NOTE: No 'aliases' array here — use AppServiceProvider::boot() if needed
];
