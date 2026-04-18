<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::select('id', 'username', 'role', 'branch_name', 'phone', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username'    => 'required|string|email|max:100|unique:users,username',
            'password'    => 'required|string|min:6|confirmed',
            'role'        => 'required|in:Admin,Executive director,VET Coordinator,Principal/TC',
            'branch_name' => 'nullable|string|max:100',
            'phone'       => 'required|string|max:20',
        ]);

        // Branch is required only for Principal/TC
        if ($validated['role'] === 'Principal/TC' && empty($validated['branch_name'])) {
            return response()->json([
                'message' => 'Branch name is required for Principal/TC role.',
                'errors'  => ['branch_name' => ['Branch name is required for this role.']],
            ], 422);
        }

        $user = User::create([
            'username'    => $validated['username'],
            'password'    => Hash::make($validated['password']),
            'role'        => $validated['role'],
            'branch_name' => $validated['branch_name'] ?? null,
            'phone'       => $validated['phone'],
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user'    => $user->only('id', 'username', 'role', 'branch_name', 'phone'),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->tokens()->delete(); // revoke tokens
        $user->delete();

        return response()->json(['message' => 'User removed successfully.']);
    }
}
