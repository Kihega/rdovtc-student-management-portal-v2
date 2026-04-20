<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Course extends Model
{
    protected $table = 'courses';

    public $timestamps = false;

    protected $fillable = ['course_code', 'course_name'];

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class, 'branches_courses', 'course_id', 'branch_id');
    }
}
