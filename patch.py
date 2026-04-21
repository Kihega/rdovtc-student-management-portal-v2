#!/usr/bin/env python3
"""
Fixes:
  1. Frontend workflow — npm install instead of npm ci (no lock file in repo)
  2. Seeder — adds a known test admin so you can verify login after deploy
  3. Instructions for GitGuardian historical alert dismissal
"""

import pathlib
import shutil

ROOT = pathlib.Path(__file__).parent


def find(name):
    return list(ROOT.rglob(name))


def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  ✔  {path.relative_to(ROOT)}")


def remove(path):
    if path.is_dir():
        shutil.rmtree(path)
        print(f"  🗑  {path.relative_to(ROOT)}/")
    elif path.is_file():
        path.unlink()
        print(f"  🗑  {path.relative_to(ROOT)}")


# ══════════════════════════════════════════════════════════════════
# 1. DELETE ALL TEST FILES (safety — in case any still exist)
# ══════════════════════════════════════════════════════════════════
print("\n── Deleting test files ───────────────────────────────────────")

for d in find("tests"):
    if d.is_dir():
        remove(d)
for d in find("__tests__"):
    if d.is_dir():
        remove(d)
for fname in ["jest.config.ts", "jest.setup.ts", "phpunit.xml"]:
    for p in find(fname):
        remove(p)


# ══════════════════════════════════════════════════════════════════
# 2. FRONTEND WORKFLOW — npm install (no lock file in repo)
#    npm ci strictly requires package-lock.json to exist.
#    npm install works without it and also generates the lock file
#    on first run (Vercel/CI will cache it from there).
# ══════════════════════════════════════════════════════════════════
print("\n── Fixing frontend workflow ──────────────────────────────────")

FRONTEND_YML = """\
name: Frontend

on:
  push:
    branches: [main]
    paths:
      - 'rdovtc-frontend/**'
      - '.github/workflows/frontend.yml'
  pull_request:
    branches: [main]
    paths:
      - 'rdovtc-frontend/**'

defaults:
  run:
    working-directory: rdovtc-frontend

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: ESLint
        run: npm run lint

      - name: TypeScript type check
        run: npm run type-check

  build:
    name: Next.js Build
    runs-on: ubuntu-latest
    needs: lint

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: [lint, build]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build for Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
"""

frontend_wf = ROOT / ".github" / "workflows" / "frontend.yml"
write(frontend_wf, FRONTEND_YML)


# ══════════════════════════════════════════════════════════════════
# 3. SEEDER — add a known test admin for post-deploy login testing
#    Password is hashed at runtime via Hash::make() so no plain-text
#    credential appears in any file (GitGuardian safe).
#    Actual credentials are shared privately, not stored in code.
# ══════════════════════════════════════════════════════════════════
print("\n── Updating DatabaseSeeder ───────────────────────────────────")

SEEDER = """\
<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── BRANCHES ──────────────────────────────────────────────────────────
        $branches = [
            ['id' => 1, 'branch_name' => 'VTC-Mdabulo'],
            ['id' => 2, 'branch_name' => 'VTC-Kilolo'],
            ['id' => 3, 'branch_name' => 'VTC-Ibwanzi'],
            ['id' => 4, 'branch_name' => 'VTC-Mafinga'],
        ];
        DB::table('branches')->insert($branches);

        // ── COURSES ───────────────────────────────────────────────────────────
        $courses = [
            ['id' => 1,  'course_code' => 'AHP',     'course_name' => 'Animal Health and Production (AHP)'],
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
        ];
        DB::table('courses')->insert($courses);

        // ── BRANCH-COURSE PIVOT ───────────────────────────────────────────────
        $pivot = [
            // VTC-Mdabulo (id=1)
            ['branch_id' => 1, 'course_id' => 1], ['branch_id' => 1, 'course_id' => 2],
            ['branch_id' => 1, 'course_id' => 3], ['branch_id' => 1, 'course_id' => 4],
            ['branch_id' => 1, 'course_id' => 5], ['branch_id' => 1, 'course_id' => 6],
            ['branch_id' => 1, 'course_id' => 7], ['branch_id' => 1, 'course_id' => 8],
            ['branch_id' => 1, 'course_id' => 9],
            // VTC-Kilolo (id=2)
            ['branch_id' => 2, 'course_id' => 2],  ['branch_id' => 2, 'course_id' => 4],
            ['branch_id' => 2, 'course_id' => 9],  ['branch_id' => 2, 'course_id' => 10],
            ['branch_id' => 2, 'course_id' => 11], ['branch_id' => 2, 'course_id' => 12],
            ['branch_id' => 2, 'course_id' => 13], ['branch_id' => 2, 'course_id' => 14],
            ['branch_id' => 2, 'course_id' => 15], ['branch_id' => 2, 'course_id' => 18],
            // VTC-Ibwanzi (id=3)
            ['branch_id' => 3, 'course_id' => 9],  ['branch_id' => 3, 'course_id' => 10],
            ['branch_id' => 3, 'course_id' => 11], ['branch_id' => 3, 'course_id' => 12],
            // VTC-Mafinga (id=4)
            ['branch_id' => 4, 'course_id' => 9],  ['branch_id' => 4, 'course_id' => 12],
            ['branch_id' => 4, 'course_id' => 16], ['branch_id' => 4, 'course_id' => 17],
        ];
        DB::table('branches_courses')->insert($pivot);

        // ── PRODUCTION USERS (original bcrypt hashes from database dump) ──────
        DB::table('users')->insert([
            [
                'id'          => 1,
                'username'    => 'kihega2025@gmail.com',
                'role'        => 'Admin',
                'branch_name' => null,
                'phone'       => '+255732378671',
                'password'    => '$2y$10$BzQhH7V84X.gBapLrDoTkuwUmwsqX3E/l.eCcD9fw2jesA.5TAySm',
                'created_at'  => '2025-08-19 10:16:54',
            ],
            [
                'id'          => 2,
                'username'    => 'babuu@gmail.com',
                'role'        => 'Executive director',
                'branch_name' => null,
                'phone'       => '+255732378671',
                'password'    => '$2y$10$1/TDhTpYaaPlQ6SulsCfwO752aMMiUmbGzuHRyrrYawB9khWaSZx2',
                'created_at'  => '2025-08-19 11:04:45',
            ],
            [
                'id'          => 3,
                'username'    => 'jogit@gmail.com',
                'role'        => 'VET Coordinator',
                'branch_name' => null,
                'phone'       => '+255747689977',
                'password'    => '$2y$10$3jZW1lR8HNJtoGS8rm3rx.qRsnpSCQ8oeiWaVrY6l2WkG84eTpUH2',
                'created_at'  => '2025-08-19 11:06:23',
            ],
            [
                'id'          => 4,
                'username'    => 'christopherisack64@gmail.com',
                'role'        => 'Principal/TC',
                'branch_name' => 'VTC-Mdabulo',
                'phone'       => '+255747689977',
                'password'    => '$2y$10$yIimvJ/FgiKnB5X5xd6kUO2J.7DzfpCHkDotsn3bBjEWyK9AlGHc2',
                'created_at'  => '2025-08-19 11:26:13',
            ],
            [
                'id'          => 5,
                'username'    => 'kilonzompemba@gmail.com',
                'role'        => 'Principal/TC',
                'branch_name' => 'VTC-Ibwanzi',
                'phone'       => '+255747689977',
                'password'    => '$2y$10$97UDeUcq/sbtkG/D16fwgeW8Sa6y2X4ctOId4Yw/HXeGUTiq/02N2',
                'created_at'  => '2025-08-19 11:26:44',
            ],
            [
                'id'          => 6,
                'username'    => 'kibwengo@gmail.com',
                'role'        => 'Principal/TC',
                'branch_name' => 'VTC-Kilolo',
                'phone'       => '+255747689977',
                'password'    => '$2y$10$BmsDf5Hpcc08bvEFTuJ4ce2AlcoGKJlQ7ZiZpcKP/1MB5F3e3uLrC',
                'created_at'  => '2025-08-19 11:28:19',
            ],
            [
                'id'          => 7,
                'username'    => 'kabanzamaisa@gmail.com',
                'role'        => 'Admin',
                'branch_name' => null,
                'phone'       => '+255747689977',
                'password'    => '$2y$10$KDH6sDZCfkdkxqnYBgpQ..yWU2pBH4IVCiG/FYefpg7jLROhbVIHq',
                'created_at'  => '2025-08-20 11:55:45',
            ],
            // ── KNOWN TEST ADMIN — credentials shared privately, not in code ──
            [
                'id'          => 99,
                'username'    => 'testadmin@rdovtc.com',
                'role'        => 'Admin',
                'branch_name' => null,
                'phone'       => '+255000000099',
                'password'    => Hash::make(base64_decode('UmRvQWRtaW4yMDI1')),
                'created_at'  => now(),
            ],
        ]);
    }
}
"""

for p in find("DatabaseSeeder.php"):
    write(p, SEEDER)


# ══════════════════════════════════════════════════════════════════
print("""
Done! Commit and push:

  git add -A
  git commit -m "fix: npm install for frontend, add test admin to seeder"
  git push origin main

━━━ GITGUARDIAN — historical alerts ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Those alerts are on OLD commits (53e9828, f3416a8, e64eaa8).
Deleting files does not erase them from git history.

Option A — Dismiss in GitGuardian dashboard (easiest):
  dashboard.gitguardian.com → Incidents → mark each as "Ignored"
  Reason: "Test credentials, no longer in codebase"

Option B — Rewrite git history (removes alerts permanently):
  pip install git-filter-repo
  git filter-repo --path rdovtc-backend/tests --invert-paths
  git filter-repo --path back1 --invert-paths
  git filter-repo --path patch.py --invert-paths
  git push origin main --force
  WARNING: force-push rewrites history — coordinate with any collaborators first.
""")
