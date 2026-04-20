<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * List students.
     * - Admin / Executive Director / VET Coordinator → can filter by any branch
     * - Principal/TC → only their own branch (enforced server-side)
     *
     * Query params: branch, year, status, duration, course
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isPrincipal = $user->role === 'Principal/TC';

        $query = Student::query();

        // Branch enforcement
        if ($isPrincipal) {
            $query->where('branch_name', $user->branch_name);
        } elseif ($request->filled('branch')) {
            $query->where('branch_name', $request->branch);
        }

        // Optional filters
        if ($request->filled('year')) {
            $query->whereYear('registration_date', $request->year);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('duration')) {
            $query->where('duration', $request->duration);
        }
        if ($request->filled('course')) {
            $query->where('course', $request->course);
        }

        $students = $query->orderBy('registration_date', 'desc')->get();

        return response()->json($students);
    }

    /**
     * Show a single student.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $student = Student::findOrFail($id);

        // Principal/TC can only view their branch's students
        if ($user->role === 'Principal/TC' && $student->branch_name !== $user->branch_name) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($student);
    }

    /**
     * Register a new student.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'surname' => 'required|string|max:100',
            'gender' => 'required|in:Male,Female,Other',
            'course' => 'required|string|max:50',
            'branch_name' => 'required|string|max:200',
            'date_of_birth' => 'nullable|date',
            'village' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'education_level' => 'nullable|string|max:100',
            'student_telephone' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:100',
            'registration_date' => 'required|date',
            'residential_status' => 'nullable|in:day,boarding',
            'prem_no' => 'nullable|string|max:100',
            'std_vii_index_no' => 'nullable|string|max:100',
            'form_iv_index_no' => 'nullable|string|max:100',
            'status' => 'required|in:Long Course,Short Course',
            'duration' => 'nullable|string|max:200',
            'sponsor' => 'nullable|string|max:255',
            'guardian_full_name' => 'nullable|string|max:255',
            'guardian_address' => 'nullable|string|max:255',
            'guardian_telephone' => 'nullable|string|max:255',
            'occupation' => 'nullable|string|max:100',
        ]);

        // Principal/TC can only register students for their own branch
        if ($user->role === 'Principal/TC') {
            $validated['branch_name'] = $user->branch_name;
        }

        // Prefix sponsor value to match original system format
        if (! empty($validated['sponsor'])) {
            $validated['sponsor'] = '$'.$validated['sponsor'];
        }

        $student = Student::create($validated);

        return response()->json([
            'message' => 'Student registered successfully.',
            'student' => $student,
        ], 201);
    }

    /**
     * Delete a student record.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $student = Student::findOrFail($id);

        // Principal/TC can only delete from their branch
        if ($user->role === 'Principal/TC' && $student->branch_name !== $user->branch_name) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $student->delete();

        return response()->json(['message' => 'Student removed successfully.']);
    }
}
