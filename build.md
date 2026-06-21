# 🏛️ Hermes — Build Checklist

**Deadline:** June 21, 2026
**Stack:** React (TS) + Vite · FastAPI · Neon (PostgreSQL)

---

## Phase 1 — Backend Foundation

### Project Setup
- [x] Init FastAPI project structure (`main.py`, `routers/`, `models/`, `schemas/`, `database.py`)
- [x] Install dependencies (`fastapi`, `uvicorn`, `asyncpg`, `bcrypt`, `python-jose`, `python-dotenv`)
- [x] Connect to Neon via `asyncpg` in `database.py`
- [x] Add `.env` for `DATABASE_URL`, `JWT_SECRET`
- [x] Add `.env.example` (no real secrets)
- [x] Confirm `uvicorn main:app --reload` runs clean

### Auth
- [x] Seed admin user into `users` table with bcrypt-hashed password
- [x] `POST /login` — query `users`, verify password, return JWT
- [x] JWT middleware/dependency to protect all routes except `/login`

---

## Phase 2 — Core API Routes

### Employees `/employees`
- [x] `GET /employees` — return all employees
- [x] `POST /employees` — create employee, validate required fields
- [x] `GET /employees/:id` — return single employee
- [x] `PUT /employees/:id` — update employee
- [x] `DELETE /employees/:id` — delete employee (cascades to salary, attendance, payroll)

### Salary `/salary`
- [x] `POST /salary` — assign salary to employee
- [x] `PUT /salary/:employeeId` — update salary details
- [x] `GET /salary/:employeeId` — retrieve salary for employee *(optional but do it)*

### Attendance `/attendance`
- [x] `POST /attendance` — record attendance entry
- [x] `GET /attendance` — view all attendance records *(optional but do it)*

### Payroll `/payroll`
- [x] `GET /payroll` — return all payroll records joined with employee name

### Dashboard `/dashboard`
- [x] `GET /dashboard` — return:
  - Total employees
  - Active employees
  - Employees on leave
  - Total monthly payroll (sum of net salaries)

---

## Phase 3 — Frontend

### Setup
- [x] Install dependencies (`axios`, `react-router-dom`, `react-hook-form`)
- [x] Set up React Router with all 6 routes
- [x] Create `api/client.ts` — axios instance with base URL + auth header injection
- [x] Auth state — store JWT in memory or localStorage, redirect to login if missing

### Pages
- [x] **Login** — email + password form, calls `POST /login`, stores token, redirects to dashboard
- [x] **Dashboard** — fetch `GET /dashboard`, display 4 metric cards
- [x] **Employees** — table of all employees, add/edit/delete actions
- [x] **Salary** — assign or update salary per employee
- [x] **Attendance** — record attendance form + attendance table
- [x] **Payroll** — table of payroll records with employee name + computed net salary

### Shared
- [x] Sidebar with Hermes branding + nav links
- [x] Protected route wrapper (redirect to `/login` if no token)
- [x] Basic error handling on all API calls (show error message on failure)
- [x] Basic form validation on all forms (required fields, number fields)

---

## Phase 4 — Polish & Delivery

### QA
- [ ] Test all API endpoints (Postman or FastAPI `/docs`)
- [ ] Test full frontend flow end to end
- [ ] Check all cascade deletes work (delete employee → salary/attendance/payroll gone)
- [ ] Confirm `net_salary` computed column is correct

### Deployment
- [ ] Deploy backend to Render (set `DATABASE_URL` + `JWT_SECRET` env vars)
- [ ] Deploy frontend to Vercel (set `VITE_API_URL` env var)
- [ ] Smoke test deployed version

### Deliverables
- [ ] Export schema: `pg_dump --schema-only "..." > schema.sql`
- [ ] Write `README.md` (live link, local setup steps, env vars, seed instructions)
- [ ] Take screenshots: Login, Dashboard, Employees, Salary, Attendance, Payroll
- [ ] Push everything to GitHub (clean commit history)
- [ ] Submit repo link + deployed link

---

## Daily Targets

| Day | Goal |
|-----|------|
| Day 1 (today) | DB schema ✅ · FastAPI skeleton · `/login` working |
| Day 2 | All backend routes done + tested in `/docs` |
| Day 3 | Frontend routing + Login + Dashboard |
| Day 4 | Employees + Salary pages |
| Day 5 | Attendance + Payroll pages + polish |
| Day 6 | Deploy + README + screenshots + submit |
