<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 100)->nullable();
            $table->string('middle_name', 100)->nullable();
            $table->string('surname', 100)->nullable();
            $table->string('gender', 10);            // 'Male' | 'Female' | 'Other'
            $table->string('course', 50)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('village', 100)->nullable();
            $table->string('ward', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('education_level', 100)->nullable();
            $table->string('student_telephone', 255)->nullable();
            $table->string('registration_number', 100)->nullable();
            $table->date('registration_date')->nullable();
            $table->string('residential_status', 10)->nullable();  // 'day' | 'boarding'
            $table->string('prem_no', 100)->nullable();
            $table->string('std_vii_index_no', 100)->nullable();
            $table->string('form_iv_index_no', 100)->nullable();
            $table->string('status', 200)->nullable();
            $table->string('sponsor', 255)->nullable();
            $table->string('duration', 200)->nullable();
            $table->string('branch_name', 200)->nullable();
            $table->string('guardian_full_name', 255)->nullable();
            $table->string('guardian_address', 255)->nullable();
            $table->string('guardian_telephone', 255)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student');
    }
};
