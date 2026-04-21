# RDO VTC Student Record Management System — v2

A full-stack student record management system for RDO Vocational Training Centres.

**Stack:** Next.js 14 (Vercel) → Laravel 11 API (Render) → PostgreSQL (Render)

```
rdovtc-student-management-portal-v2/
├── rdovtc-frontend/     ← Next.js 14 · TypeScript · Deployed to Vercel
├── rdovtc-backend/      ← Laravel 11 API · Docker · Deployed to Render
└── README.md            ← You are here
```

---

## 🔐 User Logins (All Roles)

These accounts are seeded automatically on first deploy.

> **The production user passwords are bcrypt-hashed in the seeder from the original system.**
> Use the **Change Password** feature on first login to set a new password, or use the Test Admin account below to reset others.

| Role | Email | Password | Branch |
|------|-------|----------|--------|
| **Admin** | `kihega2025@gmail.com` | *(set in original system — use Change Password)* | — |
| **Admin** | `kabanzamaisa@gmail.com` | *(set in original system — use Change Password)* | — |
| **Executive Director** | `babuu@gmail.com` | *(set in original system — use Change Password)* | — |
| **VET Coordinator** | `jogit@gmail.com` | *(set in original system — use Change Password)* | — |
| **Principal/TC** | `christopherisack64@gmail.com` | *(set in original system — use Change Password)* | VTC-Mdabulo |
| **Principal/TC** | `kilonzompemba@gmail.com` | *(set in original system — use Change Password)* | VTC-Ibwanzi |
| **Principal/TC** | `kibwengo@gmail.com` | *(set in original system — use Change Password)* | VTC-Kilolo |

### ✅ Test Admin — Known Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin (test)** | `testadmin@rdovtc.com` | `RdoAdmin2025` |

> Use this account to log in immediately after deployment and reset passwords for other users via the **Admin Dashboard → Manage Users** panel.

---

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://rdovtc-frontend.vercel.app` *(update after deploy)* |
| Backend API (Render) | `https://rdovtc-backend.onrender.com/api` |
| Health check | `https://rdovtc-backend.onrender.com/health` |

---

## 🏗️ Architecture

```
Browser
  │
  │  HTTPS
  ▼
Vercel (Next.js 14)
  │  NEXT_PUBLIC_API_URL → https://rdovtc-backend.onrender.com/api
  │  Bearer token (Sanctum)
  ▼
Render Web Service (Laravel 11 · Docker · port 8080)
  │  DATABASE_URL (internal network — fast, no SSL overhead)
  ▼
Render PostgreSQL (free, 1 GB)
```

The frontend and backend are **separate repositories/services** that communicate over HTTPS. CORS is pre-configured to allow all `*.vercel.app` origins.

---

## 🚀 Deployment Guide (One-Time Setup)

### Prerequisites
- GitHub account
- [Render](https://render.com) account (free)
- [Vercel](https://vercel.com) account (free)

---

### Step 1 — Push to GitHub (two repos)

```bash
# Backend
cd rdovtc-backend
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/rdovtc-backend.git
git push -u origin main

# Frontend
cd ../rdovtc-frontend
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/rdovtc-frontend.git
git push -u origin main
```

---

### Step 2 — Render: Create PostgreSQL Database

1. Go to [render.com](https://render.com) → **New → PostgreSQL**
2. Fill in:
   - **Name:** `rdovtc-db`
   - **Database:** `rdovtc`
   - **User:** `rdovtc_user`
   - **Plan:** Free
3. Click **Create Database**
4. Once created, copy the **Internal Database URL** (starts with `postgres://`)

---

### Step 3 — Render: Create Web Service (Backend)

1. render.com → **New → Web Service** → connect `rdovtc-backend` repo
2. Settings:
   - **Runtime:** Docker
   - **Plan:** Free
   - **Health Check Path:** `/health`
3. Add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | Run: `php -r "echo 'base64:'.base64_encode(random_bytes(32));"` and paste result |
| `APP_URL` | `https://rdovtc-backend.onrender.com` *(use your actual Render URL)* |
| `DATABASE_URL` | Internal Database URL from Step 2 |
| `DB_CONNECTION` | `pgsql` |
| `DB_SSLMODE` | `require` |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` *(fill in after Step 4)* |
| `LOG_CHANNEL` | `stderr` |

4. Click **Create Web Service** — first deploy takes ~5 minutes
5. The startup script automatically runs migrations **and seeds all data** on a fresh database

> ✅ After deploy, verify at: `https://rdovtc-backend.onrender.com/health`

---

### Step 4 — Vercel: Deploy Frontend

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import `rdovtc-frontend` repo
2. Framework: **Next.js** (auto-detected)
3. Add this **Environment Variable** before deploying:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://rdovtc-backend.onrender.com/api` |

4. Click **Deploy**
5. Once deployed, copy your Vercel URL (e.g. `https://rdovtc-frontend.vercel.app`)

> ✅ Go back to Render → your backend service → Environment → update `FRONTEND_URL` to your Vercel URL → **Save Changes** (triggers a redeploy)

---

### Step 5 — UptimeRobot (Prevents backend from sleeping)

Render free web services sleep after 15 minutes of inactivity (50s cold start). UptimeRobot pings your backend every 14 minutes to keep it awake — completely free.

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. **+ New Monitor**:
   - Type: **HTTP(s)**
   - URL: `https://rdovtc-backend.onrender.com/health`
   - Interval: **14 minutes**
3. Save

---

### Step 6 — First Login

1. Open your Vercel URL
2. Log in with: **`testadmin@rdovtc.com`** / **`RdoAdmin2025`**
3. Use **Admin Dashboard → Register User** to create new accounts, or use **Change Password** to update existing ones

---

## ♻️ Handling the 30-Day Free DB Expiry

Render's free PostgreSQL expires every 30 days. When you get the expiry email:

```
1. Render Dashboard → your database → Delete
2. New → PostgreSQL → same settings (rdovtc-db / rdovtc / rdovtc_user / Free)
3. Copy new Internal Database URL
4. rdovtc-backend service → Environment → update DATABASE_URL → Save Changes
5. Render auto-redeploys → startup script re-runs migrate + seed (~30s)
```

> 📅 Set a calendar reminder 25 days after each DB creation so you're not caught off guard.

---

## 🧑‍💻 Local Development

### Backend

```bash
cd rdovtc-backend
composer install
cp .env.example .env
php artisan key:generate

# Edit .env — set DB_CONNECTION=sqlite (or point to local postgres)
# For SQLite (easiest):
touch database/database.sqlite

php artisan migrate --seed
php artisan serve          # runs on http://localhost:8080
```

### Frontend

```bash
cd rdovtc-frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

npm run dev               # runs on http://localhost:3000
```

### Run Tests

```bash
# Backend (uses SQLite in-memory — no DB needed)
cd rdovtc-backend
php artisan test

# Frontend lint
cd rdovtc-frontend
npm run lint
npm run type-check
```

---

## 🔒 Role Permissions

| Feature | Admin | Executive Director | VET Coordinator | Principal/TC |
|---------|-------|--------------------|-----------------|--------------|
| View students | ✅ All branches | ✅ All branches | ✅ All branches | ✅ Own branch only |
| Register student | ✅ | ❌ | ❌ | ✅ Own branch only |
| Remove student | ✅ | ❌ | ❌ | ✅ Own branch only |
| View branches | ✅ | ✅ | ✅ | ✅ |
| Register branch | ✅ | ❌ | ❌ | ❌ |
| Remove branch | ✅ | ❌ | ❌ | ❌ |
| View users | ✅ | ❌ | ❌ | ❌ |
| Register user | ✅ | ❌ | ❌ | ❌ |
| Remove user | ✅ | ❌ | ❌ | ❌ |
| Change own password | ✅ | ✅ | ✅ | ✅ |

---

## 📡 API Quick Reference

Base URL: `https://rdovtc-backend.onrender.com/api`

All protected routes require the header: `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login, returns token |
| POST | `/auth/logout` | ✅ | Revoke token |
| GET | `/auth/me` | ✅ | Get current user |
| PUT | `/auth/password` | ✅ | Change own password |
| GET | `/students` | ✅ | List students (filterable) |
| POST | `/students` | ✅ Admin/Principal | Register student |
| DELETE | `/students/{id}` | ✅ Admin/Principal | Remove student |
| GET | `/branches` | ✅ | List branches |
| POST | `/branches` | ✅ Admin | Register branch |
| DELETE | `/branches/{id}` | ✅ Admin | Remove branch |
| GET | `/courses` | ✅ | List all courses |
| GET | `/courses/by-branch` | ❌ | Courses for a branch |
| GET | `/users` | ✅ Admin | List system users |
| POST | `/users` | ✅ Admin | Register user |
| DELETE | `/users/{id}` | ✅ Admin | Remove user |
| GET | `/health` | ❌ | Health check (UptimeRobot) |

---

## ⚠️ Free Tier Limits Summary

| Limit | Detail |
|-------|--------|
| Backend sleep | After 15 min idle — solved by UptimeRobot |
| Cold start | ~50s after sleep — UptimeRobot prevents it |
| PostgreSQL storage | 1 GB — sufficient for this app |
| PostgreSQL expiry | Every **30 days** — follow Step ♻️ above |
| Free DBs per workspace | 1 |

---

*RDO VTC Student Record Management System — Built with Laravel 11 + Next.js 14*
