<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('branch_name', 100)->unique();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('course_code', 20)->unique();
            $table->string('course_name', 255);
        });

        Schema::create('branches_courses', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('course_id');
            $table->primary(['branch_id', 'course_id']);

            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches_courses');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('branches');
    }
};
