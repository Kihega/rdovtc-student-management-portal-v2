<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Course;
use Tests\TestCase;

class BranchTest extends TestCase
{
    public function test_anyone_authenticated_can_list_branches(): void
    {
        Branch::create(['branch_name' => 'VTC-Mdabulo']);
        Branch::create(['branch_name' => 'VTC-Kilolo']);

        $this->actingAsViewer();

        $this->getJson('/api/branches')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_admin_can_create_branch(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/branches', ['branch_name' => 'VTC-Mbeya'])
            ->assertStatus(201)
            ->assertJsonFragment(['branch_name' => 'VTC-Mbeya']);

        $this->assertDatabaseHas('branches', ['branch_name' => 'VTC-Mbeya']);
    }

    public function test_admin_can_create_branch_with_courses(): void
    {
        $c1 = Course::create(['course_code' => 'EI', 'course_name' => 'Electrical Installation']);
        $c2 = Course::create(['course_code' => 'AHP', 'course_name' => 'Animal Health']);

        $this->actingAsAdmin();

        $response = $this->postJson('/api/branches', [
            'branch_name' => 'VTC-Test',
            'course_ids' => [$c1->id, $c2->id],
        ])->assertStatus(201);

        $this->assertCount(2, $response->json('branch.courses'));
    }

    public function test_branch_name_must_be_unique(): void
    {
        Branch::create(['branch_name' => 'VTC-Mdabulo']);
        $this->actingAsAdmin();

        $this->postJson('/api/branches', ['branch_name' => 'VTC-Mdabulo'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['branch_name']);
    }

    public function test_non_admin_cannot_create_branch(): void
    {
        $this->actingAsPrincipal();

        $this->postJson('/api/branches', ['branch_name' => 'VTC-Hack'])
            ->assertStatus(403);
    }

    public function test_admin_can_delete_branch(): void
    {
        $branch = Branch::create(['branch_name' => 'VTC-ToDelete']);
        $this->actingAsAdmin();

        $this->deleteJson("/api/branches/{$branch->id}")->assertStatus(200);
        $this->assertDatabaseMissing('branches', ['id' => $branch->id]);
    }

    public function test_deleting_branch_cascades_course_pivot(): void
    {
        $branch = Branch::create(['branch_name' => 'VTC-Cascade']);
        $course = Course::create(['course_code' => 'CA', 'course_name' => 'Computer Application']);
        $branch->courses()->attach($course->id);

        $this->actingAsAdmin();
        $this->deleteJson("/api/branches/{$branch->id}")->assertStatus(200);

        $this->assertDatabaseMissing('branches_courses', ['branch_id' => $branch->id]);
        // Course itself still exists — only the pivot row is removed
        $this->assertDatabaseHas('courses', ['id' => $course->id]);
    }

    public function test_non_admin_cannot_delete_branch(): void
    {
        $branch = Branch::create(['branch_name' => 'VTC-Safe']);
        $this->actingAsViewer();

        $this->deleteJson("/api/branches/{$branch->id}")->assertStatus(403);
    }
}
