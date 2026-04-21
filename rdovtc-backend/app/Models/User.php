<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'username',
        'password',
        'role',
        'branch_name',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Roles constants for clean usage across the app
    const ROLE_ADMIN = 'Admin';

    const ROLE_ED = 'Executive director';

    const ROLE_VET = 'VET Coordinator';

    const ROLE_PRINCIPAL = 'Principal/TC';

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isPrincipal(): bool
    {
        return $this->role === self::ROLE_PRINCIPAL;
    }

    public function canViewAllBranches(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_ED, self::ROLE_VET]);
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }
}
