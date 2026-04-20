<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class UserTest extends TestCase
{
    public function test_admin_can_list_users(): void
    {
        User::factory()->count(3)->create();
        $this->actingAsAdmin();

        $response = $this->getJson('/api/users')->assertStatus(200);
        // At least the 3 + 1 admin = 4 users
        $this->assertGreaterThanOrEqual(4, count($response->json()));
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $this->actingAsPrincipal();
        $this->getJson('/api/users')->assertStatus(403);
    }

    public function test_admin_can_create_user(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/users', [
            'username' => 'newprincipal@vtc.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'Principal/TC',
            'branch_name' => 'VTC-Mdabulo',
            'phone' => '+255700000001',
        ])->assertStatus(201)
            ->assertJsonFragment(['username' => 'newprincipal@vtc.com']);

        $this->assertDatabaseHas('users', ['username' => 'newprincipal@vtc.com']);
    }

    public function test_principal_role_requires_branch_name(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/users', [
            'username' => 'nob@vtc.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'Principal/TC',
            'phone' => '+255700000002',
            // branch_name intentionally omitted
        ])->assertStatus(422);
    }

    public function test_username_must_be_unique(): void
    {
        User::factory()->create(['username' => 'exists@vtc.com']);
        $this->actingAsAdmin();

        $this->postJson('/api/users', [
            'username' => 'exists@vtc.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'Admin',
            'phone' => '+255700000003',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_role_must_be_valid(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/users', [
            'username' => 'bad@vtc.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'SuperHacker',
            'phone' => '+255700000004',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_admin_can_delete_other_user(): void
    {
        $target = User::factory()->create();
        $this->actingAsAdmin();

        $this->deleteJson("/api/users/{$target->id}")->assertStatus(200);
        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        $admin = $this->actingAsAdmin();

        $this->deleteJson("/api/users/{$admin->id}")->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_non_admin_cannot_delete_user(): void
    {
        $target = User::factory()->create();
        $this->actingAsPrincipal();

        $this->deleteJson("/api/users/{$target->id}")->assertStatus(403);
    }
}
