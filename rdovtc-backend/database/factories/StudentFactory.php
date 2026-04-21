<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->firstName(),
            'surname' => fake()->lastName(),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'course' => fake()->randomElement(['EI', 'AHP', 'FP', 'MVM', 'CPPF']),
            'branch_name' => 'VTC-Mdabulo',
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'village' => fake()->city(),
            'ward' => fake()->word(),
            'district' => fake()->city(),
            'region' => fake()->state(),
            'education_level' => 'secondary',
            'student_telephone' => '+255'.fake()->numerify('#########'),
            'registration_number' => 'RDO/MD/'.fake()->randomElement(['EI', 'AHP', 'FP']).'/2025/'.fake()->numerify('###'),
            'registration_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'residential_status' => fake()->randomElement(['day', 'boarding']),
            'status' => 'Long Course',
            'sponsor' => '$PRIVATE',
            'guardian_full_name' => fake()->name(),
            'guardian_telephone' => '+255'.fake()->numerify('#########'),
        ];
    }

    public function shortCourse(): static
    {
        return $this->state([
            'status' => 'Short Course',
            'duration' => '3months',
        ]);
    }

    public function forBranch(string $branch): static
    {
        return $this->state(['branch_name' => $branch]);
    }
}
