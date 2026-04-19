#!/usr/bin/env python3
"""
patch.py — fixes all Vercel build errors and enforces a test gate on PRs.

Run from the repo root (where rdovtc-frontend/ lives):
    python3 patch.py

What it does:
  1. Fixes .eslintrc.json   — removes "next/typescript" (doesn't exist in Next 14)
  2. Fixes jest.config.ts   — typo setupFilesAfterFramework → setupFilesAfterEnv
  3. Rewrites the PR workflow so ALL tests must pass before a PR can be merged
"""

import json
import re
import sys
from pathlib import Path

# ── helpers ──────────────────────────────────────────────────────────────────

OK   = "\033[92m✔\033[0m"
FAIL = "\033[91m✘\033[0m"
INFO = "\033[94m→\033[0m"

def success(msg: str) -> None:
    print(f"  {OK}  {msg}")

def error(msg: str) -> None:
    print(f"  {FAIL}  {msg}")
    sys.exit(1)

def info(msg: str) -> None:
    print(f"  {INFO}  {msg}")

def ensure(path: Path, label: str) -> Path:
    if not path.exists():
        error(f"{label} not found at: {path}\n"
              f"     Make sure you run this script from the repo root.")
    return path

# ── resolve the frontend directory ───────────────────────────────────────────

REPO_ROOT    = Path(__file__).parent.resolve()
FRONTEND_DIR = REPO_ROOT / "rdovtc-frontend"

if not FRONTEND_DIR.exists():
    # allow running from inside rdovtc-frontend/ itself
    FRONTEND_DIR = REPO_ROOT

print()
print("=" * 60)
print("  RDOVTC FRONTEND — PATCH SCRIPT")
print("=" * 60)
print(f"\n  Targeting: {FRONTEND_DIR}\n")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 1 — .eslintrc.json
# Remove "next/typescript" which does not exist in Next.js 14.x
# ─────────────────────────────────────────────────────────────────────────────

print("── Fix 1: .eslintrc.json ──────────────────────────────────────")

eslint_path = ensure(FRONTEND_DIR / ".eslintrc.json", ".eslintrc.json")

with open(eslint_path) as f:
    # json.load won't parse the file because it contains // comments.
    # Read as text and strip single-line comments before parsing.
    raw = f.read()

# Strip // … comments (json doesn't support them but the file uses them)
no_comments = re.sub(r"//[^\n]*", "", raw)

config = json.loads(no_comments)
extends: list = config.get("extends", [])

if "next/typescript" in extends:
    extends.remove("next/typescript")
    config["extends"] = extends
    # Write back without the comment lines (keep it clean JSON)
    with open(eslint_path, "w") as f:
        json.dump(config, f, indent=2)
        f.write("\n")
    success('Removed "next/typescript" from extends')
else:
    info('"next/typescript" was not present — skipping')

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2 — jest.config.ts
# Rename setupFilesAfterFramework → setupFilesAfterEnv  (typo fix)
# ─────────────────────────────────────────────────────────────────────────────

print("\n── Fix 2: jest.config.ts ──────────────────────────────────────")

jest_path = ensure(FRONTEND_DIR / "jest.config.ts", "jest.config.ts")

jest_src = jest_path.read_text()

if "setupFilesAfterFramework" in jest_src:
    jest_src = jest_src.replace(
        "setupFilesAfterFramework:",
        "setupFilesAfterEnv:"
    )
    jest_path.write_text(jest_src)
    success("setupFilesAfterFramework → setupFilesAfterEnv")
elif "setupFilesAfterEnv" in jest_src:
    info("setupFilesAfterEnv already correct — skipping")
else:
    info("Neither key found in jest.config.ts — manual check needed")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 3 — PR quality-gate workflow
# Rewrite so build only runs after tests pass, and merges are blocked otherwise
# ─────────────────────────────────────────────────────────────────────────────

print("\n── Fix 3: .github/workflows/pr-check.yml ──────────────────────")

workflow_dir = FRONTEND_DIR / ".github" / "workflows"
workflow_dir.mkdir(parents=True, exist_ok=True)
pr_workflow_path = workflow_dir / "pr-check.yml"

PR_WORKFLOW = """\
# ─────────────────────────────────────────────────────────────────────────────
# PR Quality Gate
# All jobs must pass before a PR can be merged into main or develop.
# Configure "Required status checks" in GitHub → Settings → Branches to enforce.
# ─────────────────────────────────────────────────────────────────────────────
name: PR Quality Gate

on:
  pull_request:
    branches: [main, develop]

# Cancel any in-progress run for the same PR branch (saves CI minutes)
concurrency:
  group: pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  # ── Job 1: Lint & type check ───────────────────────────────────────────────
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: rdovtc-frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: ESLint
        run: npm run lint

      - name: TypeScript type check
        run: npm run type-check

  # ── Job 2: Unit tests (must pass before build) ────────────────────────────
  test:
    name: Jest Tests
    runs-on: ubuntu-latest
    needs: lint
    defaults:
      run:
        working-directory: rdovtc-frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:ci
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8080/api

      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: rdovtc-frontend/coverage/
          retention-days: 7

  # ── Job 3: Build smoke test (only runs if tests are green) ─────────────────
  build:
    name: Next.js Build
    runs-on: ubuntu-latest
    needs: [lint, test]          # ← blocked until both jobs above pass
    defaults:
      run:
        working-directory: rdovtc-frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: rdovtc-frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Check for console.log statements
        run: |
          if grep -rn "console\\.log(" app/ components/ lib/ \
              --include="*.ts" --include="*.tsx" 2>/dev/null; then
            echo "console.log() found — remove before merging"
            exit 1
          fi
          echo "No console.log statements found"

      - name: Check for hardcoded API URLs
        run: |
          if grep -rn "onrender\\.com\\|localhost:8080" app/ components/ lib/ \
              --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".env"; then
            echo "Hardcoded API URL found — use NEXT_PUBLIC_API_URL env var"
            exit 1
          fi
          echo "No hardcoded API URLs found"

      - name: Build (smoke test)
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: https://rdovtc-backend.onrender.com/api
"""

pr_workflow_path.write_text(PR_WORKFLOW)
success(f"Wrote {pr_workflow_path.relative_to(REPO_ROOT)}")

# ─────────────────────────────────────────────────────────────────────────────
# DONE — summary
# ─────────────────────────────────────────────────────────────────────────────

print()
print("=" * 60)
print("  ALL PATCHES APPLIED")
print("=" * 60)
print("""
Next steps
──────────────────────────────────────────────────────────────

1.  Commit the patched files:

      git add rdovtc-frontend/.eslintrc.json \\
              rdovtc-frontend/jest.config.ts \\
              rdovtc-frontend/.github/workflows/pr-check.yml
      git commit -m "fix: eslint config, jest setup key, PR test gate"
      git push

2.  Enforce required status checks on GitHub so PRs CANNOT be
    merged unless all three jobs pass:

      GitHub → your repo → Settings
        → Branches → main → Edit (or Add rule)
        → ✅ Require status checks to pass before merging
        → Search for and add these three checks:
            • "Lint & Type Check"
            • "Jest Tests"
            • "Next.js Build"
        → ✅ Require branches to be up to date before merging
        → Save changes

3.  Run the tests locally before pushing:

      cd rdovtc-frontend
      npm ci
      npm run lint
      npm run type-check
      npm run test:ci

4.  Verify the build succeeds locally:

      NEXT_PUBLIC_API_URL=http://localhost:8080/api npm run build

──────────────────────────────────────────────────────────────
""")
