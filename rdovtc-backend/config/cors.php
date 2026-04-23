<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Your actual Vercel frontend URLs
        'https://rdovtc-student-management-portal-2.vercel.app',
        'https://rdovtc-frontend.vercel.app',
        // Set FRONTEND_URL in Render dashboard to your exact Vercel URL
        env('FRONTEND_URL', 'https://rdovtc-student-management-portal-2.vercel.app'),
        // Local development
        'http://localhost:3000',
        'http://localhost:5173',
    ],

    'allowed_origins_patterns' => [
        // Allow ALL Vercel deployments (preview + production + any project name)
        // PHP regex syntax — must be a valid PCRE pattern
        '/^https:\/\/.*\.vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
