<?php

return [
    'paths'                    => ['api/*'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => [
        env('FRONTEND_URL', 'https://rdovtc-student-management-portal-2.vercel.app'),
        'http://localhost:3000',
    ],
    'allowed_origins_patterns' => ['/^https:\/\/.*\.vercel\.app$/'],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => ['Authorization'],
    'max_age'                  => 86400,
    'supports_credentials'     => false,
];
