<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Course::orderBy('course_name')->get());
    }

    /**
     * Get courses for a specific branch — used by the student registration form.
     * Query param: branch_name
     */
    public function byBranch(Request $request): JsonResponse
    {
        $request->validate(['branch_name' => 'required|string']);

        $branch = Branch::where('branch_name', $request->branch_name)->first();

        if (! $branch) {
            return response()->json([], 200);
        }

        $courses = $branch->courses()->orderBy('course_name')->get(['courses.id', 'course_code', 'course_name']);

        return response()->json($courses);
    }
}
