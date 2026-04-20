# RDO VTC Backend — Laravel 11 API

REST API for the RDO VTC Student Record Management System.
**Laravel 11 + Sanctum + PostgreSQL** · Hosted on **Render free tier** · Kept awake by **UptimeRobot**.

---

## 🏗️ Architecture

```
 Vercel (Next.js)  ──────────►  Render Web Service (Laravel API)
                                          │
                                          ▼
                               Render PostgreSQL (free, 1 GB)
                                          ▲
                        UptimeRobot pings /health every 14 min
                        (prevents the free tier from sleeping)
```

---

## ⚠️ Free Tier Limitations — Know Before You Deploy

| Thing | Limit | How we handle it |
|---|---|---|
| Web service sleeps after | 15 min idle | UptimeRobot ping every 14 min |
| Cold start time | ~50s after sleep | UptimeRobot prevents this |
| PostgreSQL storage | 1 GB | More than enough for this app |
| PostgreSQL expires | Every **30 days** | Re-create DB + redeploy (seeder restores all data in ~10s) |
| Free DBs per workspace | 1 | One workspace = one project |

---

## 🚀 Step-by-Step Deployment

### Step 1 — Push backend to GitHub

```bash
cd rdovtc-backend
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/rdovtc-backend.git
git push -u origin main
```

### Step 2 — Create Render PostgreSQL (free)

1. render.com → **New → PostgreSQL**
2. Name: `rdovtc-db` · Database: `rdovtc` · User: `rdovtc_user` · Plan: **Free**
3. Click **Create Database** → copy the **Internal Database URL**

### Step 3 — Create Render Web Service

1. render.com → **New → Web Service** → connect your repo
2. Runtime: **Docker** · Plan: **Free**
3. Add these environment variables:

| Key | Value |
|-----|-------|
| `APP_KEY` | `base64:` + output of `php -r "echo base64_encode(random_bytes(32));"` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://rdovtc-backend.onrender.com` |
| `DATABASE_URL` | Internal Database URL from Step 2 |
| `DB_CONNECTION` | `pgsql` |
| `DB_SSLMODE` | `require` |
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` |
| `LOG_CHANNEL` | `stderr` |

4. Click **Create Web Service**

> ✅ The `docker/start.sh` script auto-runs `migrate --seed` on every deploy.

### Step 4 — Set up UptimeRobot (free, prevents sleeping)

1. Sign up free at [uptimerobot.com](https://uptimerobot.com)
2. **+ Add New Monitor**
   - Type: **HTTP(s)**
   - URL: `https://rdovtc-backend.onrender.com/health`
   - Interval: **14 minutes**
3. Save — your backend will never sleep again

### Step 5 — Handling the 30-day DB expiry

When Render emails you that the free DB is expiring:
```
1. Render Dashboard → delete old rdovtc-db
2. Create new PostgreSQL → same settings → Free
3. Copy new Internal Database URL
4. rdovtc-backend service → Environment → update DATABASE_URL
5. Trigger redeploy → startup script re-runs migrate --seed automatically
```
Set a calendar reminder 25 days after each DB creation.

---

## 🔐 API Reference

All protected routes require: `Authorization: Bearer <token>`

| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/api/auth/login` | — | All |
| POST | `/api/auth/logout` | ✓ | All |
| GET | `/api/auth/me` | ✓ | All |
| PUT | `/api/auth/password` | ✓ | All |
| POST | `/api/auth/change-password` | — | All |
| GET | `/api/students` | ✓ | All |
| POST | `/api/students` | ✓ | Admin, Principal/TC |
| DELETE | `/api/students/{id}` | ✓ | Admin, Principal/TC |
| GET | `/api/branches` | ✓ | All |
| POST | `/api/branches` | ✓ | Admin |
| DELETE | `/api/branches/{id}` | ✓ | Admin |
| GET | `/api/courses/by-branch` | — | All |
| GET | `/api/users` | ✓ | Admin |
| POST | `/api/users` | ✓ | Admin |
| DELETE | `/api/users/{id}` | ✓ | Admin |
| GET | `/health` | — | — |

---

## 🧪 Tests

```bash
composer install
cp .env.example .env && php artisan key:generate
php artisan test              # SQLite in-memory — no DB needed
php artisan test --coverage   # with coverage report
```
