<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $query = Student::query();

        if ($user->role === 'Principal/TC') {
            $query->where('branch_name', $user->branch_name);
        } elseif ($request->filled('branch_name')) {
            $query->where('branch_name', $request->branch_name);
        }

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function show(int $id): JsonResponse
    {
        $user    = auth('api')->user();
        $student = Student::findOrFail($id);

        if ($user->role === 'Principal/TC' && $student->branch_name !== $user->branch_name) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($student);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $data = $request->validate([
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'gender'         => 'required|in:Male,Female',
            'branch_name'    => 'required|string|max:200',
            'course_id'      => 'required|integer|exists:courses,id',
            'year_of_study'  => 'required|integer|min:1|max:3',
        ]);

        // Principal can only register for own branch
        if ($user->role === 'Principal/TC') {
            $data['branch_name'] = $user->branch_name;
        }

        // Resolve course name from course_id
        $course = \DB::table('courses')->find($data['course_id']);
        $data['course_name'] = $course?->course_name ?? '';

        $student = Student::create($data);

        return response()->json(['message' => 'Student registered.', 'student' => $student], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $user    = auth('api')->user();
        $student = Student::findOrFail($id);

        if ($user->role === 'Principal/TC' && $student->branch_name !== $user->branch_name) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $student->delete();

        return response()->json(['message' => 'Student removed.']);
    }
}
