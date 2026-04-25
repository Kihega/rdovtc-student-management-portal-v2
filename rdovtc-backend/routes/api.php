<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ── Public: API info & health ─────────────────────────────────────────────────
Route::get('/', fn () => response()->json([
    'service' => 'RDO VTC Backend API',
    'version' => '2.0',
    'status'  => 'running',
    'auth'    => 'POST /api/auth/login',
]));

Route::get('/health', fn () => response()->json(['status' => 'ok']));

// ── Public: Auth ──────────────────────────────────────────────────────────────
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

// Public: courses by branch (for registration dropdowns)
Route::get('/courses/by-branch', [CourseController::class, 'byBranch']);

// ── Protected: JWT required ───────────────────────────────────────────────────
Route::middleware('auth:api')->group(function () {

    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me',       [AuthController::class, 'me']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    // Students
    Route::get('/students',       [StudentController::class, 'index']);
    Route::get('/students/{id}',  [StudentController::class, 'show']);
    Route::middleware('role:Admin,Principal/TC')->group(function () {
        Route::post('/students',        [StudentController::class, 'store']);
        Route::delete('/students/{id}', [StudentController::class, 'destroy']);
    });

    // Branches
    Route::get('/branches',      [BranchController::class, 'index']);
    Route::get('/branches/{id}', [BranchController::class, 'show']);
    Route::middleware('role:Admin')->group(function () {
        Route::post('/branches',        [BranchController::class, 'store']);
        Route::delete('/branches/{id}', [BranchController::class, 'destroy']);
    });

    // Users (Admin only)
    Route::middleware('role:Admin')->group(function () {
        Route::get('/users',        [UserController::class, 'index']);
        Route::post('/users',       [UserController::class, 'store']);
        Route::delete('/users/{id}',[UserController::class, 'destroy']);
    });

    // Courses
    Route::get('/courses', [CourseController::class, 'index']);
});

// ── Diagnostic ping (no auth needed) ─────────────────────────────────────────
Route::get('/ping', function () {
    $jwtSecret = config('jwt.secret');
    $jwtOk     = ! empty($jwtSecret);
    $cacheOk   = true;
    try { cache()->put('ping_test', true, 5); $cacheOk = cache()->get('ping_test') === true; }
    catch (\Throwable $e) { $cacheOk = false; }

    return response()->json([
        'status'       => 'ok',
        'jwt_secret'   => $jwtOk ? 'set (' . strlen($jwtSecret) . ' chars)' : 'MISSING',
        'cache_store'  => config('cache.default'),
        'cache_works'  => $cacheOk,
        'app_env'      => config('app.env'),
        'php_version'  => PHP_VERSION,
        'time'         => now()->toIso8601String(),
    ]);
});
