# RDO VTC Frontend — Next.js 14

Frontend for the RDO VTC Student Record Management System.
Built with **Next.js 14 + TypeScript + Bootstrap 5** · Deployed on **Vercel**.

---

## 🗂️ Project Structure

```
rdovtc-frontend/
├── app/
│   ├── layout.tsx                   # root layout + providers
│   ├── globals.css                  # full green theme matching original
│   ├── page.tsx                     # login page
│   └── dashboard/
│       ├── admin/page.tsx           # Admin dashboard
│       ├── principal/page.tsx       # Principal/TC dashboard
│       └── viewer/page.tsx          # ED / VET Coordinator dashboard
├── components/
│   ├── Header.tsx                   # shared green header
│   ├── Footer.tsx                   # shared green footer
│   ├── Modal.tsx                    # reusable modal overlay
│   ├── ProtectedPage.tsx            # auth + role guard HOC
│   ├── ChangePasswordModal.tsx      # change password (auth + public)
│   ├── RegisterStudentForm.tsx      # full 20-field student form
│   ├── StudentsFilter.tsx           # filter + list students
│   ├── RemoveStudents.tsx           # search + confirm-delete students
│   ├── BranchesList.tsx             # list + admin remove branches
│   ├── UsersList.tsx                # list + remove users
│   ├── RegisterUserForm.tsx         # create new user
│   └── RegisterBranchForm.tsx       # create branch + assign courses
└── lib/
    ├── api.ts                       # axios client + all API helpers
    └── auth-context.tsx             # global auth state + login/logout
```

---

## 🚀 Deploy to Vercel (Step by Step)

### 1. Push this folder to GitHub

```bash
cd rdovtc-frontend
git init
git add .
git commit -m "Initial Next.js frontend"
git remote add origin https://github.com/YOUR_USERNAME/rdovtc-frontend.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `rdovtc-frontend` GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Add environment variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.onrender.com/api` |

5. Click **Deploy**

### 3. Update backend CORS

After you get your Vercel URL (e.g. `https://rdovtc-xyz.vercel.app`):
- Go to Render → your backend service → Environment
- Update `FRONTEND_URL` to your Vercel URL
- Render will auto-redeploy

---

## 👥 Role-Based Routing

| Role | Redirects to |
|------|-------------|
| Admin | `/dashboard/admin` |
| Executive director | `/dashboard/viewer` |
| VET Coordinator | `/dashboard/viewer` |
| Principal/TC | `/dashboard/principal` |

Each dashboard is server-enforced (API) AND client-enforced (ProtectedPage guard).

---

## 🧪 Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev   # runs on http://localhost:3000
```

---

## 🎨 UI Notes

- Color scheme: `#006400` (dark green) header/footer, Bootstrap 5 components
- Modals replace the original iframe-based popups with proper React components
- All forms include client + server validation
- Toast notifications replace PHP session flash messages
- The logo placeholder (🛡️ emoji) should be replaced with `logo1.png`:
  - Copy `logo1.png` from the original project into `/public/`
  - Update `components/Header.tsx` to use `<Image src="/logo1.png" ... />`
