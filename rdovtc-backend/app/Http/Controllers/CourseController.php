<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DB::table('courses')->orderBy('course_name')->get());
    }

    public function byBranch(Request $request): JsonResponse
    {
        $branchName = $request->query('branch_name', '');

        if (!$branchName) {
            return response()->json([]);
        }

        $branch = DB::table('branches')->where('branch_name', $branchName)->first();
        if (!$branch) return response()->json([]);

        $courses = DB::table('courses')
            ->join('branches_courses', 'courses.id', '=', 'branches_courses.course_id')
            ->where('branches_courses.branch_id', $branch->id)
            ->select('courses.*')
            ->orderBy('courses.course_name')
            ->get();

        return response()->json($courses);
    }
}
