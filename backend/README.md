# Vidhya Backend (FastAPI + MongoDB)

This is the backend API for the Vidhya frontend (`vidhya-bot`). It's built with
**FastAPI** and **MongoDB** (via the async **Motor** driver), and implements every
endpoint the React frontend already calls in `src/services/api.js` plus the
`/users` and `/tests` endpoints used directly by the Admin Dashboard.

## 1. Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Configure

A `.env` file is already included with your MongoDB connection string wired in:

```
MONGODB_URL=mongodb+srv://sudhanrohith5_db_user:vidyadb@cluster0.ewvo0n5.mongodb.net/vidhyadb?appName=Cluster0
MONGODB_DB_NAME=vidhyadb
JWT_SECRET=change-this-to-a-long-random-string-in-production
ADMIN_EMAIL=admin@vidhya.com
ADMIN_PASSWORD=Vidhya@Admin123
```

**Before running:** in MongoDB Atlas, go to **Network Access** and add your
machine's IP (or `0.0.0.0/0` for quick local testing) — Atlas blocks all
connections by default until your IP is allow-listed. Also double check the
database user `sudhanrohith5_db_user` has read/write permissions on `vidhyadb`.

**Change `JWT_SECRET` and `ADMIN_PASSWORD`** before deploying anywhere public.

## 3. Run

```bash
uvicorn app.main:app --reload --port 5000
```

On first boot the backend will:
- Connect to MongoDB and create indexes
- Seed one admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`)
- Seed two demo mock tests so `/mock-tests` isn't empty

Visit `http://127.0.0.1:5000/docs` for interactive Swagger docs of every route.

## 4. Connect the frontend

The frontend already points at `http://127.0.0.1:5000/api/v1` via
`.env` / `.env.production` (`REACT_APP_API_URL`). Just run both:

```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload --port 5000

# Terminal 2
cd vidhya-bot && npm install && npm start
```

## 5. Logging in

- **Student:** sign up at `/signup`, or log in at `/login`.
- **Admin:** go to `/admin` and log in with the seeded admin credentials
  (`admin@vidhya.com` / `Vidhya@Admin123` by default). This hits
  `POST /api/v1/auth/admin-login`, which only succeeds for accounts with
  `role: "admin"` in MongoDB.

## API surface

| Area | Prefix |
|---|---|
| Auth | `/api/v1/auth` — signup, login, admin-login, google, me, logout |
| Admin — users | `/api/v1/users` — list / suspend / activate / delete (admin only) |
| Admin — test results | `/api/v1/tests` — all submitted attempts (admin only) |
| Mock tests | `/api/v1/mock-tests` — list, start, submit, my-attempts, detail |
| Flashcards | `/api/v1/flashcards` — CRUD + review |
| Study planner | `/api/v1/study-plans` — CRUD + session toggle |
| Progress | `/api/v1/progress` — chapters + streak |
| Analytics | `/api/v1/analytics` — dashboard, subjects, study-time |
| Notifications | `/api/v1/notifications` — list, mark read |

## Notes on this connection string

Your MongoDB URI includes a plaintext username/password
(`sudhanrohith5_db_user:vidyadb`). Since you shared it directly in chat, treat
it as no longer private — consider rotating that database user's password in
Atlas once you're done testing, and keep `.env` out of any public git repo
(add it to `.gitignore`).
