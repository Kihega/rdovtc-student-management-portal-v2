#!/usr/bin/env python3
"""
Patch script to fix:
  1. Pint style errors in rdovtc-backend/config/app.php
     (fully_qualified_strict_types + single_line_after_imports)
  2. GitGuardian secret detections in back1/rdovtc-backend/tests/Feature/AuthTest.php
     (hardcoded plain-text passwords replaced with non-triggering test values)
"""

import pathlib
import sys

# ─────────────────────────────────────────────────────────────────
# 1. rdovtc-backend/config/app.php
#    Fix: add `use Illuminate\Support\Facades\Facade;` import,
#         replace inline FQCN with short form,
#         ensure single blank line after imports (satisfies both rules).
# ─────────────────────────────────────────────────────────────────

APP_PHP_PATH = pathlib.Path("rdovtc-backend/config/app.php")

APP_PHP_CONTENT = """\
<?php

use Illuminate\\Support\\Facades\\Facade;

return [

    'name' => env('APP_NAME', 'RDO VTC Student System'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'Africa/Dar_es_Salaam',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),

    'providers' => [
        Illuminate\\Auth\\AuthServiceProvider::class,
        Illuminate\\Broadcasting\\BroadcastServiceProvider::class,
        Illuminate\\Bus\\BusServiceProvider::class,
        Illuminate\\Cache\\CacheServiceProvider::class,
        Illuminate\\Foundation\\Providers\\ConsoleSupportServiceProvider::class,
        Illuminate\\Cookie\\CookieServiceProvider::class,
        Illuminate\\Database\\DatabaseServiceProvider::class,
        Illuminate\\Encryption\\EncryptionServiceProvider::class,
        Illuminate\\Filesystem\\FilesystemServiceProvider::class,
        Illuminate\\Foundation\\Providers\\FoundationServiceProvider::class,
        Illuminate\\Hashing\\HashServiceProvider::class,
        Illuminate\\Mail\\MailServiceProvider::class,
        Illuminate\\Notifications\\NotificationServiceProvider::class,
        Illuminate\\Pagination\\PaginationServiceProvider::class,
        Illuminate\\Pipeline\\PipelineServiceProvider::class,
        Illuminate\\Queue\\QueueServiceProvider::class,
        Illuminate\\Redis\\RedisServiceProvider::class,
        Illuminate\\Auth\\Passwords\\PasswordResetServiceProvider::class,
        Illuminate\\Session\\SessionServiceProvider::class,
        Illuminate\\Translation\\TranslationServiceProvider::class,
        Illuminate\\Validation\\ValidationServiceProvider::class,
        Illuminate\\View\\ViewServiceProvider::class,
        Laravel\\Sanctum\\SanctumServiceProvider::class,
    ],

    'aliases' => Facade::defaultAliases()->merge([])->toArray(),
];
"""

# ─────────────────────────────────────────────────────────────────
# 2. back1/rdovtc-backend/tests/Feature/AuthTest.php
#    Fix: replace hardcoded plain-text passwords that trigger
#         GitGuardian "Generic Password" / "Username Password" rules
#         with clearly-labelled test-only values.
# ─────────────────────────────────────────────────────────────────

AUTH_TEST_PATH = pathlib.Path("back1/rdovtc-backend/tests/Feature/AuthTest.php")

AUTH_TEST_CONTENT = """\
<?php

namespace Tests\\Feature;

use App\\Models\\User;
use Illuminate\\Support\\Facades\\Hash;
use Laravel\\Sanctum\\Sanctum;
use Tests\\TestCase;

class AuthTest extends TestCase
{
    // ── Login ────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->admin()->create([
            'username' => 'admin@rdovtc.com',
            'password' => Hash::make('test-valid-pw'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'username' => 'admin@rdovtc.com',
            'password' => 'test-valid-pw',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'username', 'role']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'username' => 'user@rdovtc.com',
            'password' => Hash::make('test-correct-pw'),
        ]);

        $this->postJson('/api/auth/login', [
            'username' => 'user@rdovtc.com',
            'password' => 'test-wrong-pw',
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
            'password' => Hash::make('test-old-pw-123'),
        ]);

        $this->actingAsAdmin();

        $user = User::factory()->create(['password' => Hash::make('test-old-pw-123')]);

        Sanctum::actingAs($user, ['*']);

        $this->putJson('/api/auth/password', [
            'current_password' => 'test-old-pw-123',
            'new_password' => 'test-new-pw-456',
            'new_password_confirmation' => 'test-new-pw-456',
        ])->assertStatus(200);

        // Old password no longer works
        $this->assertFalse(Hash::check('test-old-pw-123', $user->fresh()->password));
        $this->assertTrue(Hash::check('test-new-pw-456', $user->fresh()->password));
    }

    public function test_change_password_fails_with_wrong_current_password(): void
    {
        $this->actingAsAdmin();

        $this->putJson('/api/auth/password', [
            'current_password' => 'test-wrong-current',
            'new_password' => 'test-new-pw-456',
            'new_password_confirmation' => 'test-new-pw-456',
        ])->assertStatus(422);
    }

    public function test_public_change_password_endpoint(): void
    {
        User::factory()->create([
            'username' => 'pub@rdovtc.com',
            'password' => Hash::make('test-pub-old-123'),
        ]);

        $this->postJson('/api/auth/change-password', [
            'username' => 'pub@rdovtc.com',
            'old_password' => 'test-pub-old-123',
            'new_password' => 'test-pub-new-456',
            'new_password_confirmation' => 'test-pub-new-456',
        ])->assertStatus(200);
    }
}
"""

# ─────────────────────────────────────────────────────────────────
# Writer
# ─────────────────────────────────────────────────────────────────

def write(path: pathlib.Path, content: str) -> None:
    if not path.parent.exists():
        print(f"ERROR: directory {path.parent} not found — are you in the repo root?")
        sys.exit(1)
    path.write_text(content, encoding="utf-8")
    print(f"  ✔  patched {path}")


if __name__ == "__main__":
    print("Applying patches...")
    write(APP_PHP_PATH, APP_PHP_CONTENT)
    write(AUTH_TEST_PATH, AUTH_TEST_CONTENT)
    print("\nDone. Commit both files and push to re-trigger CI.")
