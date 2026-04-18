<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Authenticate as a user with the given role.
     */
    protected function actingAsRole(string $role, ?string $branchName = null): User
    {
        $user = User::factory()->create([
            'role'        => $role,
            'branch_name' => $branchName,
        ]);

        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    protected function actingAsAdmin(): User
    {
        return $this->actingAsRole('Admin');
    }

    protected function actingAsPrincipal(string $branch = 'VTC-Mdabulo'): User
    {
        return $this->actingAsRole('Principal/TC', $branch);
    }

    protected function actingAsViewer(): User
    {
        return $this->actingAsRole('Executive director');
    }
}
