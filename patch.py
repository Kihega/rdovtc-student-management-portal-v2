#!/usr/bin/env python3
"""
patch.py  —  Full CI/CD setup for rdovtc monorepo.

Run from anywhere inside the repo:
    python3 patch.py

What it does
────────────
  FIX A  rdovtc-frontend/.eslintrc.json     — remove broken plugin rules
  FIX B  rdovtc-frontend/jest.config.ts     — setupFilesAfterFramework typo
  FIX C  DELETE  .github/workflows/webpack.yml          (broken, not needed)
  FIX D  DELETE  rdovtc-backend/.github/               (GitHub ignores these)
  FIX E  DELETE  rdovtc-frontend/.github/              (GitHub ignores these)
  NEW 1  .github/workflows/pr-backend.yml   — PHP tests on every PR
  NEW 2  .github/workflows/pr-frontend.yml  — Jest tests on every PR
  NEW 3  .github/workflows/deploy.yml       — deploy both on merge to main
"""

import json, shutil, sys
from pathlib import Path

G = "\033[92m"; R = "\033[91m"; B = "\033[94m"; Y = "\033[93m"; X = "\033[0m"
def ok(m):   print(f"  {G}✔{X}  {m}")
def fail(m): print(f"\n{R}✘  {m}{X}"); sys.exit(1)
def info(m): print(f"  {B}→{X}  {m}")
def head(m): print(f"\n{Y}── {m}{X}")

# ── find repo root ────────────────────────────────────────────────────────────
def find_root() -> Path:
    here = Path(__file__).resolve().parent
    for p in [here, *here.parents[:4]]:
        if (p / "rdovtc-frontend").exists() and (p / "rdovtc-backend").exists():
            return p
    fail(
        "Cannot find repo root.\n"
        "  Place patch.py next to rdovtc-frontend/ and rdovtc-backend/ and retry."
    )

ROOT     = find_root()
FRONTEND = ROOT / "rdovtc-frontend"
BACKEND  = ROOT / "rdovtc-backend"
GH_WF    = ROOT / ".github" / "workflows"

print(f"""
{'='*58}
  RDOVTC CI/CD PATCH
{'='*58}
  Repo root : {ROOT}
  Backend   : {BACKEND}
  Frontend  : {FRONTEND}
""")

# ─────────────────────────────────────────────────────────────────────────────
# FIX A — .eslintrc.json (rewrite completely — remove broken plugin rules)
# ─────────────────────────────────────────────────────────────────────────────
head("Fix A · rdovtc-frontend/.eslintrc.json")
eslint_path = FRONTEND / ".eslintrc.json"
if not eslint_path.exists():
    fail(f".eslintrc.json not found at {eslint_path}")
eslint_path.write_text(json.dumps({
    "extends": ["next/core-web-vitals"],
    "rules": {
        "no-console": ["warn", {"allow": ["warn", "error"]}]
    }
}, indent=2) + "\n")
ok('extends → ["next/core-web-vitals"]')
ok("Removed @typescript-eslint/*, import/order, jsx-a11y/*, react-hooks/* rules")
ok("next/core-web-vitals already bundles all of them internally")

# ─────────────────────────────────────────────────────────────────────────────
# FIX B — jest.config.ts typo
# ─────────────────────────────────────────────────────────────────────────────
head("Fix B · rdovtc-frontend/jest.config.ts")
jest_path = FRONTEND / "jest.config.ts"
if jest_path.exists():
    src = jest_path.read_text()
    if "setupFilesAfterFramework" in src:
        jest_path.write_text(src.replace("setupFilesAfterFramework:", "setupFilesAfterEnv:"))
        ok("setupFilesAfterFramework  →  setupFilesAfterEnv")
    elif "setupFilesAfterEnv" in src:
        info("Already correct — skipping")

# ─────────────────────────────────────────────────────────────────────────────
# FIX C — delete webpack.yml from root (broken, never worked)
# ─────────────────────────────────────────────────────────────────────────────
head("Fix C · Remove .github/workflows/webpack.yml")
wp = ROOT / ".github" / "workflows" / "webpack.yml"
if wp.exists():
    wp.unlink()
    ok("Deleted webpack.yml  (no webpack.config.js exists — was always broken)")
else:
    info("webpack.yml not found — skipping")

# ─────────────────────────────────────────────────────────────────────────────
# FIX D+E — delete misplaced .github dirs inside subfolders
# GitHub ONLY reads workflows from the REPO ROOT .github/workflows/
# Anything inside rdovtc-backend/.github/ or rdovtc-frontend/.github/
# is silently ignored — those workflows never run.
# ─────────────────────────────────────────────────────────────────────────────
head("Fix D+E · Remove misplaced .github/ inside subfolders")
for sub in [BACKEND / ".github", FRONTEND / ".github"]:
    if sub.exists():
        shutil.rmtree(sub)
        ok(f"Deleted {sub.relative_to(ROOT)}  (GitHub never reads these)")
    else:
        info(f"{sub.relative_to(ROOT)} not found — skipping")

# ─────────────────────────────────────────────────────────────────────────────
# Create root .github/workflows/
# ─────────────────────────────────────────────────────────────────────────────
GH_WF.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# NEW 1 — pr-backend.yml
# Runs on every PR that touches rdovtc-backend/**
# Jobs: pint (style) → phpunit tests
# Both must pass — PR is blocked if either fails.
# ─────────────────────────────────────────────────────────────────────────────
head("New 1 · .github/workflows/pr-backend.yml")

(GH_WF / "pr-backend.yml").write_text("""\
# ─────────────────────────────────────────────────────────────────────────────
# Backend PR Quality Gate (Laravel / PHP)
#
# Triggers: any PR targeting main or develop that touches rdovtc-backend/
# Jobs:  style-check  →  tests
# Both must be green before the PR can be merged.
# ─────────────────────────────────────────────────────────────────────────────
name: Backend PR Check

on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'rdovtc-backend/**'
      - '.github/workflows/pr-backend.yml'

concurrency:
  group: backend-pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

defaults:
  run:
    working-directory: rdovtc-backend

jobs:
  # ── 1. Laravel Pint code style ─────────────────────────────────────────────
  style:
    name: Code Style (Pint)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_sqlite
          coverage: none

      - name: Cache Composer
        uses: actions/cache@v4
        with:
          path: rdovtc-backend/vendor
          key: composer-${{ hashFiles('rdovtc-backend/composer.lock') }}
          restore-keys: composer-

      - name: Install dependencies
        run: composer install --prefer-dist --no-interaction --no-progress

      - name: Run Pint (style check)
        run: ./vendor/bin/pint --test

  # ── 2. PHPUnit tests (SQLite in-memory — fast, no DB service needed) ───────
  tests:
    name: PHPUnit Tests
    runs-on: ubuntu-latest
    needs: style

    steps:
      - uses: actions/checkout@v4

      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_sqlite, bcmath, zip
          coverage: none

      - name: Cache Composer
        uses: actions/cache@v4
        with:
          path: rdovtc-backend/vendor
          key: composer-${{ hashFiles('rdovtc-backend/composer.lock') }}
          restore-keys: composer-

      - name: Install dependencies
        run: composer install --prefer-dist --no-interaction --no-progress

      - name: Prepare .env
        run: |
          cp .env.example .env
          php artisan key:generate

      - name: No debug statements check
        run: |
          if grep -rn "dd(\\|dump(\\|var_dump(\\|print_r(" app/ --include="*.php"; then
            echo "Debug statement found — remove before merging"
            exit 1
          fi
          echo "No debug statements found"

      - name: Run tests
        run: php artisan test

      - name: Post result to PR
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ **Backend tests failed.** Check the Actions tab for details.'
            });
""")
ok("Wrote pr-backend.yml")

# ─────────────────────────────────────────────────────────────────────────────
# NEW 2 — pr-frontend.yml
# Runs on every PR that touches rdovtc-frontend/**
# Jobs: lint → jest tests → build smoke test
# All must pass — PR is blocked if any fails.
# ─────────────────────────────────────────────────────────────────────────────
head("New 2 · .github/workflows/pr-frontend.yml")

(GH_WF / "pr-frontend.yml").write_text("""\
# ─────────────────────────────────────────────────────────────────────────────
# Frontend PR Quality Gate (Next.js / React)
#
# Triggers: any PR targeting main or develop that touches rdovtc-frontend/
# Jobs:  lint  →  tests  →  build
# All three must be green before the PR can be merged.
# ─────────────────────────────────────────────────────────────────────────────
name: Frontend PR Check

on:
  pull_request:
    branches: [main, develop]
    paths:
      - 'rdovtc-frontend/**'
      - '.github/workflows/pr-frontend.yml'

concurrency:
  group: frontend-pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

defaults:
  run:
    working-directory: rdovtc-frontend

jobs:
  # ── 1. ESLint + TypeScript ─────────────────────────────────────────────────
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - name: Install deps
        run: npm ci

      - name: ESLint
        run: npm run lint

      - name: TypeScript
        run: npm run type-check

  # ── 2. Jest unit tests ─────────────────────────────────────────────────────
  tests:
    name: Jest Tests
    runs-on: ubuntu-latest
    needs: lint

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - name: Install deps
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:ci
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8080/api

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-pr-${{ github.event.pull_request.number }}
          path: rdovtc-frontend/coverage/
          retention-days: 7

      - name: Post coverage to PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const f = 'rdovtc-frontend/coverage/coverage-summary.json';
            if (!fs.existsSync(f)) return;
            const s = JSON.parse(fs.readFileSync(f)).total;
            const row = k => `| ${k.padEnd(12)} | ${String(s[k].pct + '%').padEnd(8)} |`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: [
                '## Test Coverage',
                '| Metric       | Coverage |',
                '|--------------|----------|',
                row('statements'), row('branches'),
                row('functions'),  row('lines'),
              ].join('\\n')
            });

  # ── 3. Next.js build smoke test ────────────────────────────────────────────
  build:
    name: Next.js Build
    runs-on: ubuntu-latest
    needs: [lint, tests]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - name: Install deps
        run: npm ci

      - name: No console.log in source
        run: |
          if grep -rn "console\\.log(" app/ components/ lib/ \
              --include="*.ts" --include="*.tsx" 2>/dev/null; then
            echo "console.log() found — remove before merging"
            exit 1
          fi
          echo "No console.log statements"

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: https://rdovtc-backend.onrender.com/api
""")
ok("Wrote pr-frontend.yml")

# ─────────────────────────────────────────────────────────────────────────────
# NEW 3 — deploy.yml
# Triggers ONLY on push to main (i.e. after a PR is merged).
# Runs all quality checks again, then deploys:
#   backend  → Render  (via deploy hook)
#   frontend → Vercel  (via Vercel CLI)
# ─────────────────────────────────────────────────────────────────────────────
head("New 3 · .github/workflows/deploy.yml")

(GH_WF / "deploy.yml").write_text("""\
# ─────────────────────────────────────────────────────────────────────────────
# Production Deploy (runs ONLY when a PR is merged into main)
#
# Pipeline:
#   backend-test ──┐
#                  ├──► deploy-backend  (Render)
#   frontend-test ─┘
#   frontend-build ─────► deploy-frontend (Vercel)
#
# Required GitHub Secrets (Settings → Secrets → Actions):
#   RENDER_DEPLOY_HOOK_URL   Render dashboard → service → Settings → Deploy Hook
#   RENDER_APP_URL           e.g. https://rdovtc-backend.onrender.com
#   VERCEL_TOKEN             vercel.com → Settings → Tokens → Create
#   VERCEL_ORG_ID            run `vercel link` locally → .vercel/project.json
#   VERCEL_PROJECT_ID        same file as above
#   NEXT_PUBLIC_API_URL      https://rdovtc-backend.onrender.com/api
# ─────────────────────────────────────────────────────────────────────────────
name: Deploy to Production

on:
  push:
    branches: [main]

# Never cancel a deploy mid-flight
concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  # ── Backend tests (re-run on main for safety) ──────────────────────────────
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: rdovtc-backend

    steps:
      - uses: actions/checkout@v4

      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo, pdo_sqlite, bcmath, zip
          coverage: none

      - name: Cache Composer
        uses: actions/cache@v4
        with:
          path: rdovtc-backend/vendor
          key: composer-${{ hashFiles('rdovtc-backend/composer.lock') }}
          restore-keys: composer-

      - name: Install dependencies
        run: composer install --prefer-dist --no-interaction --no-progress

      - name: Prepare .env
        run: |
          cp .env.example .env
          php artisan key:generate

      - name: Run tests
        run: php artisan test

  # ── Frontend tests ─────────────────────────────────────────────────────────
  frontend-test:
    name: Frontend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: rdovtc-frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - name: Jest tests
        run: npm run test:ci
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8080/api

  # ── Frontend build ─────────────────────────────────────────────────────────
  frontend-build:
    name: Frontend Build
    runs-on: ubuntu-latest
    needs: [frontend-test]
    defaults:
      run:
        working-directory: rdovtc-frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - run: npm ci
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Upload build
        uses: actions/upload-artifact@v4
        with:
          name: nextjs-build-${{ github.sha }}
          path: rdovtc-frontend/.next/
          retention-days: 1

  # ── Deploy backend → Render ────────────────────────────────────────────────
  deploy-backend:
    name: Deploy Backend (Render)
    runs-on: ubuntu-latest
    needs: [backend-test]

    steps:
      - name: Trigger Render deploy hook
        run: |
          HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}")
          echo "Render responded: HTTP $HTTP"
          [ "$HTTP" = "200" ] || [ "$HTTP" = "201" ] || (echo "Deploy hook failed" && exit 1)

      - name: Wait for Render to start
        run: sleep 90

      - name: Health check
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            "${{ secrets.RENDER_APP_URL }}/health")
          echo "Health check: HTTP $STATUS"
          [ "$STATUS" = "200" ] || (echo "Health check failed" && exit 1)

      - name: Summary
        run: |
          echo "### Backend deployed to Render" >> $GITHUB_STEP_SUMMARY
          echo "URL: ${{ secrets.RENDER_APP_URL }}" >> $GITHUB_STEP_SUMMARY

  # ── Deploy frontend → Vercel ───────────────────────────────────────────────
  deploy-frontend:
    name: Deploy Frontend (Vercel)
    runs-on: ubuntu-latest
    needs: [frontend-build]
    defaults:
      run:
        working-directory: rdovtc-frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - run: npm ci

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Link project
        run: vercel link --yes --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID:     ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Pull Vercel env
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID:     ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build for Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID:      ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID:  ${{ secrets.VERCEL_PROJECT_ID }}
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Deploy
        id: deploy
        run: |
          URL=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$URL" >> $GITHUB_OUTPUT
        env:
          VERCEL_ORG_ID:     ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Summary
        run: |
          echo "### Frontend deployed to Vercel" >> $GITHUB_STEP_SUMMARY
          echo "URL: ${{ steps.deploy.outputs.url }}" >> $GITHUB_STEP_SUMMARY
          echo "Commit: ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
""")
ok("Wrote deploy.yml")

# ── Done ──────────────────────────────────────────────────────────────────────
print(f"""
{'='*58}
  ALL DONE — files written
{'='*58}

  .github/workflows/pr-backend.yml    ← new
  .github/workflows/pr-frontend.yml   ← new
  .github/workflows/deploy.yml        ← new
  .github/workflows/webpack.yml       ← deleted
  rdovtc-backend/.github/             ← deleted
  rdovtc-frontend/.github/            ← deleted
  rdovtc-frontend/.eslintrc.json      ← fixed
  rdovtc-frontend/jest.config.ts      ← fixed

{'='*58}
  STEP 1 — Commit and push
{'='*58}

  git add .
  git commit -m "ci: fix CI/CD pipeline — all workflows moved to repo root"
  git push origin main

{'='*58}
  STEP 2 — Add GitHub Secrets  (one-time, do this in browser)
{'='*58}

  GitHub → your repo → Settings → Secrets → Actions → New secret

  Secret name              Value
  ─────────────────────────────────────────────────────────
  RENDER_DEPLOY_HOOK_URL   Render dashboard → service → Settings → Deploy Hook
  RENDER_APP_URL           https://rdovtc-backend.onrender.com
  VERCEL_TOKEN             vercel.com → Settings → Tokens → Create
  VERCEL_ORG_ID            run: vercel link   then check .vercel/project.json
  VERCEL_PROJECT_ID        same file as above
  NEXT_PUBLIC_API_URL      https://rdovtc-backend.onrender.com/api

{'='*58}
  STEP 3 — Protect main branch  (one-time, do this in browser)
{'='*58}

  GitHub → Settings → Branches → Add rule → Branch name: main
  ✅ Require a pull request before merging
  ✅ Require status checks to pass before merging
       Add:  "Code Style (Pint)"
             "PHPUnit Tests"
             "Lint & Type Check"
             "Jest Tests"
             "Next.js Build"
  ✅ Require branches to be up to date before merging
  ✅ Do not allow bypassing the above settings
  → Save changes

{'='*58}
  STEP 4 — Your daily flow from Termux
{'='*58}

  # start a new feature
  git checkout -b feature/my-feature

  # write code, then commit and push
  git add .
  git commit -m "feat: what you built"
  git push origin feature/my-feature

  # go to GitHub → open a Pull Request
  # → pr-backend.yml  runs: Pint style → PHPUnit tests
  # → pr-frontend.yml runs: ESLint → Jest → Build
  # all green? → merge the PR on GitHub
  # → deploy.yml auto-runs → backend to Render + frontend to Vercel 🚀

{'='*58}
""")
