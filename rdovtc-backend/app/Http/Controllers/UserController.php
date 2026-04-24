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
        return response()->json(
            User::select('id','username','role','branch_name','phone','created_at')
                ->orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username'    => 'required|email|unique:users,username',
            'password'    => 'required|string|min:6|confirmed',
            'role'        => 'required|in:Admin,Executive director,VET Coordinator,Principal/TC',
            'branch_name' => 'required_if:role,Principal/TC|nullable|string|max:200',
            'phone'       => 'required|string|max:20',
        ]);

        $user = User::create([
            'username'    => $data['username'],
            'password'    => Hash::make($data['password']),
            'role'        => $data['role'],
            'branch_name' => $data['branch_name'] ?? null,
            'phone'       => $data['phone'],
        ]);

        return response()->json([
            'message' => 'User registered.',
            'user'    => $user->only(['id','username','role','branch_name','phone']),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        // Prevent self-deletion
        if ($user->id === auth('api')->id()) {
            return response()->json(['message' => 'Cannot delete your own account.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'User removed.']);
    }
}
