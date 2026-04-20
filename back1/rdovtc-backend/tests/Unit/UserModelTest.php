<?php

namespace Tests\Unit;

use App\Models\User;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    public function test_is_admin_returns_true_for_admin_role(): void
    {
        $user = User::factory()->admin()->make();
        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->isPrincipal());
    }

    public function test_is_principal_returns_true_for_principal_role(): void
    {
        $user = User::factory()->principal()->make();
        $this->assertTrue($user->isPrincipal());
        $this->assertFalse($user->isAdmin());
    }

    public function test_can_view_all_branches_for_admin_and_ed(): void
    {
        $admin = User::factory()->admin()->make();
        $ed = User::factory()->executiveDirector()->make();
        $tc = User::factory()->principal()->make();

        $this->assertTrue($admin->canViewAllBranches());
        $this->assertTrue($ed->canViewAllBranches());
        $this->assertFalse($tc->canViewAllBranches());
    }

    public function test_password_is_hidden_in_json(): void
    {
        $user = User::factory()->make(['password' => 'secret']);
        $json = $user->toArray();

        $this->assertArrayNotHasKey('password', $json);
    }
}
