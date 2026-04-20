<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Allow the Vercel frontend to call the Render backend.
    | In production, set FRONTEND_URL in Render environment variables.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
        'https://rdovtc-frontend.vercel.app',  // update to your actual Vercel URL
        'http://localhost:3000',               // local dev
        'http://localhost:5173',               // vite dev
    ],

    'allowed_origins_patterns' => [
        // Allow any Vercel preview deployment
        'https://.*\.vercel\.app',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
