<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'username' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            'role' => 'Principal/TC',
            'branch_name' => 'VTC-Mdabulo',
            'phone' => '+255'.fake()->numerify('#########'),
        ];
    }

    public function admin(): static
    {
        return $this->state(['role' => 'Admin', 'branch_name' => null]);
    }

    public function principal(string $branch = 'VTC-Mdabulo'): static
    {
        return $this->state(['role' => 'Principal/TC', 'branch_name' => $branch]);
    }

    public function executiveDirector(): static
    {
        return $this->state(['role' => 'Executive director', 'branch_name' => null]);
    }
}
