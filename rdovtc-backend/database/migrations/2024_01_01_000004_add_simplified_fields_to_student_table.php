<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student', function (Blueprint $table) {
            if (!Schema::hasColumn('student', 'last_name')) {
                $table->string('last_name', 100)->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('student', 'course_id')) {
                $table->unsignedBigInteger('course_id')->nullable()->after('course');
            }
            if (!Schema::hasColumn('student', 'course_name')) {
                $table->string('course_name', 255)->nullable()->after('course_id');
            }
            if (!Schema::hasColumn('student', 'year_of_study')) {
                $table->unsignedTinyInteger('year_of_study')->nullable()->after('course_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student', function (Blueprint $table) {
            $table->dropColumn(['last_name', 'course_id', 'course_name', 'year_of_study']);
        });
    }
};
