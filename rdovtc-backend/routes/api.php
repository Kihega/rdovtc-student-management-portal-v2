<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\UserController;

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────
Route::post('/auth/login',          [AuthController::class, 'login']);
Route::post('/auth/change-password',[AuthController::class, 'changePassword']); // token-less reset by old pw

// Dynamic courses for a branch (used in registration form - public for simplicity)
Route::get('/courses/by-branch',    [CourseController::class, 'byBranch']);

// ─────────────────────────────────────────────
// PROTECTED ROUTES (require Sanctum token)
// ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout',         [AuthController::class, 'logout']);
    Route::get('/auth/me',              [AuthController::class, 'me']);
    Route::put('/auth/password',        [AuthController::class, 'updatePassword']);

    // ── STUDENTS ──────────────────────────────
    // Principal/TC & Admin can register
    Route::middleware('role:Admin,Principal/TC')->group(function () {
        Route::post('/students',            [StudentController::class, 'store']);
        Route::delete('/students/{id}',     [StudentController::class, 'destroy']);
    });

    // All authenticated roles can view students (filtered by branch for Principal/TC)
    Route::get('/students',              [StudentController::class, 'index']);
    Route::get('/students/{id}',         [StudentController::class, 'show']);

    // ── BRANCHES ──────────────────────────────
    Route::get('/branches',              [BranchController::class, 'index']);
    Route::get('/branches/{id}',         [BranchController::class, 'show']);

    Route::middleware('role:Admin')->group(function () {
        Route::post('/branches',             [BranchController::class, 'store']);
        Route::delete('/branches/{id}',      [BranchController::class, 'destroy']);
    });

    // ── USERS ─────────────────────────────────
    Route::middleware('role:Admin')->group(function () {
        Route::get('/users',                 [UserController::class, 'index']);
        Route::post('/users',                [UserController::class, 'store']);
        Route::delete('/users/{id}',         [UserController::class, 'destroy']);
    });

    // ── COURSES ───────────────────────────────
    Route::get('/courses',               [CourseController::class, 'index']);
});
