<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── BRANCHES ─────────────────────────────────────────────────────────
        DB::table('branches')->insertOrIgnore([
            ['id' => 1, 'branch_name' => 'VTC-Mdabulo'],
            ['id' => 2, 'branch_name' => 'VTC-Kilolo'],
            ['id' => 3, 'branch_name' => 'VTC-Ibwanzi'],
            ['id' => 4, 'branch_name' => 'VTC-Mafinga'],
        ]);

        // ── COURSES ───────────────────────────────────────────────────────────
        DB::table('courses')->insertOrIgnore([
            ['id' => 1,  'course_code' => 'AHP',    'course_name' => 'Animal Health and Production (AHP)'],
            ['id' => 2,  'course_code' => 'EI',      'course_name' => 'Electrical Installation (EI)'],
            ['id' => 3,  'course_code' => 'MVM',     'course_name' => 'Motor Vehicle Mechanics (MVM)'],
            ['id' => 4,  'course_code' => 'FP',      'course_name' => 'Food Production (FP)'],
            ['id' => 5,  'course_code' => 'WMF',     'course_name' => 'Welding and Metal Fabrication (WMF)'],
            ['id' => 6,  'course_code' => 'CPPF',    'course_name' => 'Plumbing and Pipe Fittings (CPPF)'],
            ['id' => 7,  'course_code' => 'CBK',     'course_name' => 'Beekeeping (CBK)'],
            ['id' => 8,  'course_code' => 'MRI',     'course_name' => 'Motor Rewinding and Installation (MRI)'],
            ['id' => 9,  'course_code' => 'CA',      'course_name' => 'Computer Application (CA)'],
            ['id' => 10, 'course_code' => 'CJ',      'course_name' => 'Carpentry and Joinery (CJ)'],
            ['id' => 11, 'course_code' => 'MB',      'course_name' => 'Masonry and Brick laying (MB)'],
            ['id' => 12, 'course_code' => 'DSCT',    'course_name' => 'Design, Sewing and Cloth Technology (DSCT)'],
            ['id' => 13, 'course_code' => 'RE',      'course_name' => 'Renewable Energy (RE)'],
            ['id' => 14, 'course_code' => 'Wf',      'course_name' => 'Welding and Metal Fabrication (WF)'],
            ['id' => 15, 'course_code' => 'Driving', 'course_name' => 'Driving'],
            ['id' => 16, 'course_code' => 'BN',      'course_name' => 'Basing Knitting (BN)'],
            ['id' => 17, 'course_code' => 'LG',      'course_name' => 'Leather Goods (LG)'],
            ['id' => 18, 'course_code' => 'ICT',     'course_name' => 'Information and Communication Technology (ICT)'],
        ]);

        // ── BRANCH-COURSE PIVOT ───────────────────────────────────────────────
        DB::table('branches_courses')->insertOrIgnore([
            ['branch_id' => 1, 'course_id' => 1], ['branch_id' => 1, 'course_id' => 2],
            ['branch_id' => 1, 'course_id' => 3], ['branch_id' => 1, 'course_id' => 4],
            ['branch_id' => 1, 'course_id' => 5], ['branch_id' => 1, 'course_id' => 6],
            ['branch_id' => 1, 'course_id' => 7], ['branch_id' => 1, 'course_id' => 8],
            ['branch_id' => 1, 'course_id' => 9],
            ['branch_id' => 2, 'course_id' => 2],  ['branch_id' => 2, 'course_id' => 4],
            ['branch_id' => 2, 'course_id' => 9],  ['branch_id' => 2, 'course_id' => 10],
            ['branch_id' => 2, 'course_id' => 11], ['branch_id' => 2, 'course_id' => 12],
            ['branch_id' => 2, 'course_id' => 13], ['branch_id' => 2, 'course_id' => 14],
            ['branch_id' => 2, 'course_id' => 15], ['branch_id' => 2, 'course_id' => 18],
            ['branch_id' => 3, 'course_id' => 9],  ['branch_id' => 3, 'course_id' => 10],
            ['branch_id' => 3, 'course_id' => 11], ['branch_id' => 3, 'course_id' => 12],
            ['branch_id' => 4, 'course_id' => 9],  ['branch_id' => 4, 'course_id' => 12],
            ['branch_id' => 4, 'course_id' => 16], ['branch_id' => 4, 'course_id' => 17],
        ]);

        // ── USERS — FRESH TEST ACCOUNTS ───────────────────────────────────────
        // All old users are wiped and replaced with clean test accounts.
        // Passwords are pre-computed $2y$10$ bcrypt hashes (cost=10).
        //
        // ┌─────────────────────────────┬──────────────────────┬──────────────────┐
        // │ Email                       │ Password             │ Role             │
        // ├─────────────────────────────┼──────────────────────┼──────────────────┤
        // │ admin@rdovtc.com            │ Admin@2025           │ Admin            │
        // │ director@rdovtc.com         │ Director@2025        │ Exec. Director   │
        // │ vet@rdovtc.com              │ Vet@2025             │ VET Coordinator  │
        // │ principal@rdovtc.com        │ Principal@2025       │ Principal/TC     │
        // └─────────────────────────────┴──────────────────────┴──────────────────┘

        DB::table('users')->truncate();

        DB::table('users')->insert([
            [
                'username'    => 'admin@rdovtc.com',
                'role'        => 'Admin',
                'branch_name' => null,
                'phone'       => '+255700000001',
                'password'    => '$2y$10$O3TGkrZ/sYfTxyJSpwhdVe5mtBs.qsw6k51us7fkCXNTDeITua0WC',
                'created_at'  => now(),
            ],
            [
                'username'    => 'director@rdovtc.com',
                'role'        => 'Executive director',
                'branch_name' => null,
                'phone'       => '+255700000002',
                'password'    => '$2y$10$U9ERA2qCgaQgG5fstYpTiedwH.2pigyPFyYADP2cj19mzzF5z/iue',
                'created_at'  => now(),
            ],
            [
                'username'    => 'vet@rdovtc.com',
                'role'        => 'VET Coordinator',
                'branch_name' => null,
                'phone'       => '+255700000003',
                'password'    => '$2y$10$JHejfT6i2q2PcUO1nZcJo.FwC0T/SmDhS65j8ZTG8UgfYwljTBqHG',
                'created_at'  => now(),
            ],
            [
                'username'    => 'principal@rdovtc.com',
                'role'        => 'Principal/TC',
                'branch_name' => 'VTC-Mdabulo',
                'phone'       => '+255700000004',
                'password'    => '$2y$10$O67FVjA1FdSsOU4qhui15uYrErky7/FdWyz5O0Sywt3wf8xyHAHpC',
                'created_at'  => now(),
            ],
        ]);
    }
}
