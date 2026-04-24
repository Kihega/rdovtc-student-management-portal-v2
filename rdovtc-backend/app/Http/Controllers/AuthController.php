<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /** Login — returns a JWT token + user info */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = [
            'username' => $request->username,
            'password' => $request->password,
        ];

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials. Please check your username and password.',
            ], 401);
        }

        $user = auth('api')->user();

        return response()->json([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user' => [
                'id'          => $user->id,
                'username'    => $user->username,
                'role'        => $user->role,
                'branch_name' => $user->branch_name,
                'phone'       => $user->phone,
            ],
        ]);
    }

    /** Return currently authenticated user */
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

    /** Logout — invalidate the JWT */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /** Refresh JWT token */
    public function refresh(): JsonResponse
    {
        $token = auth('api')->refresh();

        return response()->json(['token' => $token, 'token_type' => 'bearer']);
    }

    /** Change password (authenticated — user knows current password) */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password'          => 'required|string',
            'new_password'              => 'required|string|min:6|confirmed',
        ]);

        $user = auth('api')->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    /** Change password via old-password (no token — used from login page) */
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
