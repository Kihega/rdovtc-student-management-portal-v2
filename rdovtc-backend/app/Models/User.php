<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'username', 'password', 'role', 'branch_name', 'phone',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['created_at' => 'datetime'];

    // JWT required methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role'        => $this->role,
            'username'    => $this->username,
            'branch_name' => $this->branch_name,
        ];
    }

    // Role constants
    const ROLE_ADMIN     = 'Admin';
    const ROLE_ED        = 'Executive director';
    const ROLE_VET       = 'VET Coordinator';
    const ROLE_PRINCIPAL = 'Principal/TC';

    public function isAdmin(): bool      { return $this->role === self::ROLE_ADMIN; }
    public function isPrincipal(): bool  { return $this->role === self::ROLE_PRINCIPAL; }
    public function canViewAllBranches(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_ED, self::ROLE_VET]);
    }
}
