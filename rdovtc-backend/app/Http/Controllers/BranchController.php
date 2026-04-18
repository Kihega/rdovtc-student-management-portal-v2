<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        $branches = Branch::orderBy('branch_name')->get();
        return response()->json($branches);
    }

    public function show(int $id): JsonResponse
    {
        $branch = Branch::with('courses')->findOrFail($id);
        return response()->json($branch);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_name' => 'required|string|max:100|unique:branches,branch_name',
            'course_ids'  => 'nullable|array',
            'course_ids.*'=> 'integer|exists:courses,id',
        ]);

        $branch = Branch::create(['branch_name' => $validated['branch_name']]);

        if (! empty($validated['course_ids'])) {
            $branch->courses()->attach($validated['course_ids']);
        }

        return response()->json([
            'message' => 'Branch created successfully.',
            'branch'  => $branch->load('courses'),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $branch = Branch::findOrFail($id);
        $branch->delete(); // courses pivot is cascade-deleted via FK

        return response()->json(['message' => 'Branch removed successfully.']);
    }
}
