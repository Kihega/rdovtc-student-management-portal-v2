<?php

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Sanctum stateful middleware (for cookie-based sessions if needed)
        $middleware->statefulApi();

        // Register our custom role middleware alias
        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Return JSON for all API errors
        $exceptions->shouldRenderJsonWhen(fn ($request) => $request->is('api/*'));
    })
    ->create();
