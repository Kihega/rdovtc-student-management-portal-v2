<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        try {
            $credentials = [
                'username' => trim($request->username),
                'password' => $request->password,
            ];

            $token = auth('api')->attempt($credentials);

            if (! $token) {
                return response()->json([
                    'message' => 'Invalid credentials. Please check your email and password.',
                ], 401);
            }

            $user = auth('api')->user();

            return response()->json([
                'token'      => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl', 1440) * 60,
                'user'       => [
                    'id'          => $user->id,
                    'username'    => $user->username,
                    'role'        => $user->role,
                    'branch_name' => $user->branch_name,
                    'phone'       => $user->phone,
                ],
            ]);

        } catch (\Throwable $e) {
            // Log the full error so it appears in Render logs
            Log::error('Login failed', [
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'class'   => get_class($e),
            ]);

            // Return the real error message so it shows in the frontend toast
            // (remove class/file in production once fixed)
            return response()->json([
                'message' => 'Login error: ' . $e->getMessage(),
                'hint'    => 'Check Render logs for full details.',
            ], 500);
        }
    }

    public function me(): JsonResponse
    {
        $user = auth('api')->user();
        return response()->json([
            'id'          => $user->id,
            'username'    => $user->username,
            'role'        => $user->role,
            'branch_name' => $user->branch_name,
            'phone'       => $user->phone,
        ]);
    }

    public function logout(): JsonResponse
    {
        try { auth('api')->logout(); } catch (\Throwable $e) { /* ignore on logout */ }
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function refresh(): JsonResponse
    {
        try {
            $token = auth('api')->refresh();
            return response()->json(['token' => $token, 'token_type' => 'bearer']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Token refresh failed.'], 401);
        }
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        $user = auth('api')->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'username'     => 'required|string',
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->old_password, $user->password)) {
            return response()->json(['message' => 'Invalid username or old password.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
