<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\Branch;
use App\Models\Course;
use Tests\TestCase;

class StudentTest extends TestCase
{
    private function seedBranchAndCourse(): void
    {
        $branch = Branch::create(['branch_name' => 'VTC-Mdabulo']);
        $course = Course::create(['course_code' => 'EI', 'course_name' => 'Electrical Installation (EI)']);
        $branch->courses()->attach($course->id);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'first_name'          => 'John',
            'surname'             => 'Doe',
            'gender'              => 'Male',
            'course'              => 'EI',
            'branch_name'         => 'VTC-Mdabulo',
            'registration_date'   => '2025-01-15',
            'status'              => 'Long Course',
        ], $overrides);
    }

    // ── Index ────────────────────────────────────────────────────────────────

    public function test_admin_can_list_all_students(): void
    {
        Student::factory()->count(5)->create(['branch_name' => 'VTC-Mdabulo']);
        Student::factory()->count(3)->create(['branch_name' => 'VTC-Kilolo']);

        $this->actingAsAdmin();

        $this->getJson('/api/students')
             ->assertStatus(200)
             ->assertJsonCount(8);
    }

    public function test_principal_only_sees_own_branch_students(): void
    {
        Student::factory()->count(4)->create(['branch_name' => 'VTC-Mdabulo']);
        Student::factory()->count(2)->create(['branch_name' => 'VTC-Kilolo']);

        $this->actingAsPrincipal('VTC-Mdabulo');

        $response = $this->getJson('/api/students');
        $response->assertStatus(200);

        // Every returned student must be from the principal's branch
        foreach ($response->json() as $student) {
            $this->assertEquals('VTC-Mdabulo', $student['branch_name']);
        }
    }

    public function test_unauthenticated_cannot_list_students(): void
    {
        $this->getJson('/api/students')->assertStatus(401);
    }

    public function test_students_can_be_filtered_by_year(): void
    {
        Student::factory()->create([
            'branch_name'       => 'VTC-Mdabulo',
            'registration_date' => '2024-03-01',
        ]);
        Student::factory()->create([
            'branch_name'       => 'VTC-Mdabulo',
            'registration_date' => '2025-01-01',
        ]);

        $this->actingAsAdmin();

        $response = $this->getJson('/api/students?year=2025');
        $response->assertStatus(200)->assertJsonCount(1);
        $this->assertEquals('2025-01-01', $response->json()[0]['registration_date']);
    }

    // ── Store ────────────────────────────────────────────────────────────────

    public function test_admin_can_register_student(): void
    {
        $this->seedBranchAndCourse();
        $this->actingAsAdmin();

        $this->postJson('/api/students', $this->validPayload())
             ->assertStatus(201)
             ->assertJsonFragment(['first_name' => 'John']);

        $this->assertDatabaseHas('student', ['first_name' => 'John', 'surname' => 'Doe']);
    }

    public function test_principal_registers_student_locked_to_own_branch(): void
    {
        $this->seedBranchAndCourse();
        $this->actingAsPrincipal('VTC-Mdabulo');

        // Even if payload says different branch, server enforces own branch
        $payload = $this->validPayload(['branch_name' => 'VTC-Kilolo']);

        $response = $this->postJson('/api/students', $payload)->assertStatus(201);
        $this->assertEquals('VTC-Mdabulo', $response->json('student.branch_name'));
    }

    public function test_viewer_cannot_register_student(): void
    {
        $this->actingAsViewer();

        $this->postJson('/api/students', $this->validPayload())->assertStatus(403);
    }

    public function test_registration_requires_mandatory_fields(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/students', [])
             ->assertStatus(422)
             ->assertJsonValidationErrors(['first_name', 'surname', 'gender', 'registration_date', 'status']);
    }

    public function test_gender_must_be_valid_enum(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/students', $this->validPayload(['gender' => 'Robot']))
             ->assertStatus(422)
             ->assertJsonValidationErrors(['gender']);
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_delete_any_student(): void
    {
        $student = Student::factory()->create(['branch_name' => 'VTC-Kilolo']);
        $this->actingAsAdmin();

        $this->deleteJson("/api/students/{$student->id}")->assertStatus(200);
        $this->assertDatabaseMissing('student', ['id' => $student->id]);
    }

    public function test_principal_cannot_delete_student_from_other_branch(): void
    {
        $student = Student::factory()->create(['branch_name' => 'VTC-Kilolo']);
        $this->actingAsPrincipal('VTC-Mdabulo');

        $this->deleteJson("/api/students/{$student->id}")->assertStatus(403);
        $this->assertDatabaseHas('student', ['id' => $student->id]);
    }

    public function test_principal_can_delete_student_from_own_branch(): void
    {
        $student = Student::factory()->create(['branch_name' => 'VTC-Mdabulo']);
        $this->actingAsPrincipal('VTC-Mdabulo');

        $this->deleteJson("/api/students/{$student->id}")->assertStatus(200);
        $this->assertDatabaseMissing('student', ['id' => $student->id]);
    }

    public function test_viewer_cannot_delete_student(): void
    {
        $student = Student::factory()->create();
        $this->actingAsViewer();

        $this->deleteJson("/api/students/{$student->id}")->assertStatus(403);
    }

    public function test_delete_nonexistent_student_returns_404(): void
    {
        $this->actingAsAdmin();
        $this->deleteJson('/api/students/99999')->assertStatus(404);
    }
}
