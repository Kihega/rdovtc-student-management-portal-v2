# GitHub Secrets Setup Guide

Both repos need secrets configured for CI/CD to work.
Go to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

---

## rdovtc-backend secrets

| Secret Name | Where to get it | Example |
|---|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Render dashboard → your service → Settings → **Deploy Hook** | `https://api.render.com/deploy/srv-xxx?key=yyy` |
| `RENDER_APP_URL` | Your Render service URL | `https://rdovtc-backend.onrender.com` |

---

## rdovtc-frontend secrets

| Secret Name | Where to get it | Example |
|---|---|---|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → **Create Token** | `abc123...` |
| `NEXT_PUBLIC_API_URL` | Your Render backend URL + `/api` | `https://rdovtc-backend.onrender.com/api` |

> **Note:** Vercel also needs your `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
> Run `vercel link` in the frontend folder once locally, then check `.vercel/project.json` for those values.
> Add them as secrets: `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.

---

## CI/CD Pipeline Flow

```
Push to feature branch
        │
        ▼
   Pull Request
        │
   PR Quality Gate runs:
   ├── lint / type-check
   ├── tests
   ├── debug statement check
   └── hardcoded URL check
        │
   Merge to main
        │
   Full CI/CD pipeline:
   ├── 1. lint        (Pint / ESLint)
   ├── 2. test        (PHPUnit / Jest) ← blocks deploy if failing
   ├── 3. build       (Next.js compile check)
   └── 4. deploy      (Render hook / Vercel CLI)
        │
   Health check confirms live
```

---

## Branch Strategy

| Branch | Purpose | Auto-deploys |
|---|---|---|
| `main` | Production | ✅ Yes — Render + Vercel |
| `develop` | Integration | ❌ No — tests only |
| `feature/*` | Feature work | ❌ No — PR checks only |
