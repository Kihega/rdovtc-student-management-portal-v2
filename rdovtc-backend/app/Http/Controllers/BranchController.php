<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DB::table('branches')->orderBy('branch_name')->get());
    }

    public function show(int $id): JsonResponse
    {
        $branch = DB::table('branches')->find($id);
        if (!$branch) return response()->json(['message' => 'Not found.'], 404);
        return response()->json($branch);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'branch_name' => 'required|string|max:200|unique:branches,branch_name',
        ]);

        $id = DB::table('branches')->insertGetId(['branch_name' => $data['branch_name']]);

        return response()->json([
            'message' => 'Branch added.',
            'branch'  => DB::table('branches')->find($id),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $branch = DB::table('branches')->find($id);
        if (!$branch) return response()->json(['message' => 'Not found.'], 404);

        DB::table('branches')->delete($id);

        return response()->json(['message' => 'Branch removed.']);
    }
}
