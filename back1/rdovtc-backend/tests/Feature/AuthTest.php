<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    // ── Login ────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->admin()->create([
            'username' => 'admin@rdovtc.com',
            'password' => Hash::make('secret123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => 'admin@rdovtc.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'username', 'role']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'username' => 'user@rdovtc.com',
            'password' => Hash::make('correctpass'),
        ]);

        $this->postJson('/api/auth/login', [
            'username' => 'user@rdovtc.com',
            'password' => 'wrongpass',
        ])->assertStatus(422);
    }

    public function test_login_fails_with_unknown_user(): void
    {
        $this->postJson('/api/auth/login', [
            'username' => 'ghost@rdovtc.com',
            'password' => 'any',
        ])->assertStatus(422);
    }

    public function test_login_requires_username_and_password(): void
    {
        $this->postJson('/api/auth/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['username', 'password']);
    }

    // ── Me ───────────────────────────────────────────────────────────────────

    public function test_me_returns_authenticated_user(): void
    {
        $user = $this->actingAsAdmin();

        $this->getJson('/api/auth/me')
            ->assertStatus(200)
            ->assertJsonFragment(['username' => $user->username]);
    }

    public function test_me_returns_401_when_unauthenticated(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    public function test_user_can_logout(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/auth/logout')->assertStatus(200);

        // Token is revoked — me should now fail
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    // ── Change Password ───────────────────────────────────────────────────────

    public function test_authenticated_user_can_change_own_password(): void
    {
        User::factory()->create([
            'username' => 'change@rdovtc.com',
            'password' => Hash::make('oldpass123'),
        ]);

        $this->actingAsAdmin();

        $user = User::factory()->create(['password' => Hash::make('oldpass123')]);

        Sanctum::actingAs($user, ['*']);

        $this->putJson('/api/auth/password', [
            'current_password' => 'oldpass123',
            'new_password' => 'newpass456',
            'new_password_confirmation' => 'newpass456',
        ])->assertStatus(200);

        // Old password no longer works
        $this->assertFalse(Hash::check('oldpass123', $user->fresh()->password));
        $this->assertTrue(Hash::check('newpass456', $user->fresh()->password));
    }

    public function test_change_password_fails_with_wrong_current_password(): void
    {
        $this->actingAsAdmin();

        $this->putJson('/api/auth/password', [
            'current_password' => 'wrongcurrent',
            'new_password' => 'newpass456',
            'new_password_confirmation' => 'newpass456',
        ])->assertStatus(422);
    }

    public function test_public_change_password_endpoint(): void
    {
        User::factory()->create([
            'username' => 'pub@rdovtc.com',
            'password' => Hash::make('oldpub123'),
        ]);

        $this->postJson('/api/auth/change-password', [
            'username' => 'pub@rdovtc.com',
            'old_password' => 'oldpub123',
            'new_password' => 'newpub456',
            'new_password_confirmation' => 'newpub456',
        ])->assertStatus(200);
    }
}
