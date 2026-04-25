<?php

return [
    'secret'  => env('JWT_SECRET'),
    'keys'    => [
        'public'     => null,
        'private'    => null,
        'passphrase' => null,
    ],
    'ttl'          => env('JWT_TTL', 1440),
    'refresh_ttl'  => 20160,
    'algo'         => 'HS256',
    'required_claims' => ['iss', 'iat', 'exp', 'nbf', 'sub', 'jti'],
    'persistent_claims' => [],
    'lock_subject' => true,
    'leeway'       => 0,
    'blacklist_enabled'      => false,   // Disabled — avoids needing cache storage
    'blacklist_grace_period' => 0,
    'decrypt_cookies' => false,
    'providers' => [
        'jwt'     => Tymon\JWTAuth\Providers\JWT\Lcobucci::class,
        'auth'    => Tymon\JWTAuth\Providers\Auth\Illuminate::class,
        'storage' => Tymon\JWTAuth\Providers\Storage\Illuminate::class,
    ],
];
