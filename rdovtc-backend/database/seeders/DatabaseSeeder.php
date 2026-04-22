<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // insertOrIgnore = safe to re-run (won't duplicate on re-deploy)

        DB::table('branches')->insertOrIgnore([
            ['id' => 1, 'branch_name' => 'VTC-Mdabulo'],
            ['id' => 2, 'branch_name' => 'VTC-Kilolo'],
            ['id' => 3, 'branch_name' => 'VTC-Ibwanzi'],
            ['id' => 4, 'branch_name' => 'VTC-Mafinga'],
        ]);

        DB::table('courses')->insertOrIgnore([
            ['id' => 1,  'course_code' => 'AHP',     'course_name' => 'Animal Health and Production (AHP)'],
            ['id' => 2,  'course_code' => 'EI',       'course_name' => 'Electrical Installation (EI)'],
            ['id' => 3,  'course_code' => 'MVM',      'course_name' => 'Motor Vehicle Mechanics (MVM)'],
            ['id' => 4,  'course_code' => 'FP',       'course_name' => 'Food Production (FP)'],
            ['id' => 5,  'course_code' => 'WMF',      'course_name' => 'Welding and Metal Fabrication (WMF)'],
            ['id' => 6,  'course_code' => 'CPPF',     'course_name' => 'Plumbing and Pipe Fittings (CPPF)'],
            ['id' => 7,  'course_code' => 'CBK',      'course_name' => 'Beekeeping (CBK)'],
            ['id' => 8,  'course_code' => 'MRI',      'course_name' => 'Motor Rewinding and Installation (MRI)'],
            ['id' => 9,  'course_code' => 'CA',       'course_name' => 'Computer Application (CA)'],
            ['id' => 10, 'course_code' => 'CJ',       'course_name' => 'Carpentry and Joinery (CJ)'],
            ['id' => 11, 'course_code' => 'MB',       'course_name' => 'Masonry and Brick laying (MB)'],
            ['id' => 12, 'course_code' => 'DSCT',     'course_name' => 'Design, Sewing and Cloth Technology (DSCT)'],
            ['id' => 13, 'course_code' => 'RE',       'course_name' => 'Renewable Energy (RE)'],
            ['id' => 14, 'course_code' => 'Wf',       'course_name' => 'Welding and Metal Fabrication (WF)'],
            ['id' => 15, 'course_code' => 'Driving',  'course_name' => 'Driving'],
            ['id' => 16, 'course_code' => 'BN',       'course_name' => 'Basing Knitting (BN)'],
            ['id' => 17, 'course_code' => 'LG',       'course_name' => 'Leather Goods (LG)'],
            ['id' => 18, 'course_code' => 'ICT',      'course_name' => 'Information and Communication Technology (ICT)'],
        ]);

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

        // All password hashes are $2y$10$ bcrypt (PHP/Laravel standard).
        // testadmin hash is pre-computed offline — no runtime Hash::make needed.
        DB::table('users')->insertOrIgnore([
            [
                'username'    => 'kihega2025@gmail.com',
                'role'        => 'Admin',
                'branch_name' => null,
                'phone'       => '+255732378671',
                'password'    => '$2y$10$BzQhH7V84X.gBapLrDoTkuwUmwsqX3E/l.eCcD9fw2jesA.5TAySm',
                'created_at'  => '2025-08-19 10:16:54',
            ],
            [
                'username'    => 'babuu@gmail.com',
                'role'        => 'Executive director',
                'branch_name' => null,
                'phone'       => '+255732378671',
                'password'    => '$2y$10$1/TDhTpYaaPlQ6SulsCfwO752aMMiUmbGzuHRyrrYawB9khWaSZx2',
                'created_at'  => '2025-08-19 11:04:45',
            ],
            [
                'username'    => 'jogit@gmail.com',
                'role'        => 'VET Coordinator',
                'branch_name' => null,
                'phone'       => '+255747689977',
                'password'    => '$2y$10$3jZW1lR8HNJtoGS8rm3rx.qRsnpSCQ8oeiWaVrY6l2WkG84eTpUH2',
                'created_at'  => '2025-08-19 11:06:23',
            ],
            [
                'username'    => 'christopherisack64@gmail.com',
                'role'        => 'Principal/TC',
                'branch_name' => 'VTC-Mdabulo',
                'phone'       => '+255747689977',
                'password'    => '$2y$10$yIimvJ/FgiKnB5X5xd6kUO2J.7DzfpCHkDotsn3bBjEWyK9AlGHc2',
                'created_at'  => '2025-08-19 11:26:13',
            ],
            [
                'username'    => 'kilonzompemba@gmail.com',
                'role'        => 'Principal/TC',
                'branch_name' => 'VTC-Ibwanzi',
                'phone'       => '+255747689977',
                'password'    => '$2y$10$97UDeUcq/sbtkG/D16fwgeW8Sa6y2X4ctOId4Yw/HXeGUTiq/02N2',
                'created_at'  => '2025-08-19 11:26:44',
            ],
            [
                'username'    => 'kibwengo@gmail.com',
                'role'        => 'Principal/TC',
                'branch_name' => 'VTC-Kilolo',
                'phone'       => '+255747689977',
                'password'    => '$2y$10$BmsDf5Hpcc08bvEFTuJ4ce2AlcoGKJlQ7ZiZpcKP/1MB5F3e3uLrC',
                'created_at'  => '2025-08-19 11:28:19',
            ],
            [
                'username'    => 'kabanzamaisa@gmail.com',
                'role'        => 'Admin',
                'branch_name' => null,
                'phone'       => '+255747689977',
                'password'    => '$2y$10$KDH6sDZCfkdkxqnYBgpQ..yWU2pBH4IVCiG/FYefpg7jLROhbVIHq',
                'created_at'  => '2025-08-20 11:55:45',
            ],
            // TEST ADMIN — password: RdoAdmin2025
            [
                'username'    => 'testadmin@rdovtc.com',
                'role'        => 'Admin',
                'branch_name' => null,
                'phone'       => '+255000000099',
                'password'    => '$2y$10$5mwBfXP9d3.ZK.Vpbw7/bOfesyUq9kMZpX9g2zZdZZpiRGwyXBoey',
                'created_at'  => '2025-01-01 00:00:00',
            ],
        ]);
    }
}
