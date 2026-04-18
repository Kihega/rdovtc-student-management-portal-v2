<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Branch extends Model
{
    protected $table = 'branches';
    public $timestamps = false;

    protected $fillable = ['branch_name'];

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'branches_courses', 'branch_id', 'course_id');
    }
}
