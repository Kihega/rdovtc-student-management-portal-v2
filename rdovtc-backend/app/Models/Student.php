<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $table = 'student';
    public $timestamps = false;
    const CREATED_AT = 'created_at';

    protected $fillable = [
        'first_name', 'last_name', 'gender',
        'branch_name', 'course_id', 'course_name', 'year_of_study',
        // Legacy fields kept for compatibility
        'middle_name', 'surname', 'course', 'date_of_birth',
        'village', 'ward', 'district', 'region',
        'education_level', 'student_telephone', 'registration_number',
        'registration_date', 'residential_status', 'prem_no',
        'std_vii_index_no', 'form_iv_index_no', 'status', 'duration',
        'sponsor', 'guardian_full_name', 'guardian_address',
        'guardian_telephone', 'occupation',
    ];

    protected $casts = ['created_at' => 'datetime'];
}
