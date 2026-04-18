<?php

namespace App\Models;

use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;
    protected $table = 'student';

    public $timestamps = false; // table uses created_at only (no updated_at)
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'first_name',
        'middle_name',
        'surname',
        'gender',
        'course',
        'date_of_birth',
        'village',
        'ward',
        'district',
        'region',
        'education_level',
        'student_telephone',
        'registration_number',
        'registration_date',
        'residential_status',
        'prem_no',
        'std_vii_index_no',
        'form_iv_index_no',
        'status',
        'duration',
        'sponsor',
        'branch_name',
        'guardian_full_name',
        'guardian_address',
        'guardian_telephone',
        'occupation',
    ];

    protected $casts = [
        'date_of_birth'     => 'date',
        'registration_date' => 'date',
        'created_at'        => 'datetime',
    ];

    protected static function newFactory(): StudentFactory
    {
        return StudentFactory::new();
    }
}
