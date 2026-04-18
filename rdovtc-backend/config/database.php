<?php

use Illuminate\Support\Str;

return [

    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [

        // ── PostgreSQL — Render Free DB ────────────────────────────────────
        'pgsql' => [
            'driver'   => 'pgsql',
            'url'      => env('DATABASE_URL'),          // Render injects this automatically
            'host'     => env('DB_HOST', '127.0.0.1'),
            'port'     => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'rdovtc'),
            'username' => env('DB_USERNAME', 'rdovtc_user'),
            'password' => env('DB_PASSWORD', ''),
            'charset'  => 'utf8',
            'prefix'   => '',
            'prefix_indexes' => true,
            'search_path'    => 'public',
            'sslmode'  => env('DB_SSLMODE', 'require'), // required by Render PostgreSQL
        ],

        // ── SQLite — used by PHPUnit tests (in-memory) ─────────────────────
        'sqlite' => [
            'driver'   => 'sqlite',
            'url'      => env('DB_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix'   => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],
    ],

    'migrations' => [
        'table'  => 'migrations',
        'update_date_on_publish' => true,
    ],

];
