# Hermes HRMS — Interview Prep Reading List

## How to use this

You designed the schema and picked the stack, so you're not starting from zero. The goal is to be able to **trace the full data flow** for any feature — from click to database and back.

Read in this order. Check off each item as you go.

---

## Phase 1: Foundation (read your own work first)

- [✔] `tables.sql` — You designed this. Re-read it. Every interview question traces back to this schema.
- [ ] `server/seed_database.py` — See how the test data maps to your schema. Note the demo creds: `admin@test.com` / `admin123`.
- [ ] `.env` (or `.env.example`) — Know every variable and where it's used.

---

## Phase 2: Backend Infrastructure (how the server boots)

- [ ] `server/database.py` — Connection pool lifecycle. `connect_db()` on startup, `close_db()` on shutdown. 4 helper functions: `fetch`, `fetchrow`, `fetchval`, `execute`.
- [ ] `server/main.py` — CORS config, startup/shutdown events, route registration.
- [ ] `server/dependencies.py` — bcrypt hashing, JWT creation (`create_access_token`), the `get_current_admin` auth guard.

---

## Phase 3: One Complete Vertical Slice (Employees)

This is the most important phase. Read these files **in order** and trace the full flow.

### Backend
- [ ] `server/schemas/employees.py` — Request/response Pydantic models
- [ ] `server/routers/employees.py` — CRUD endpoints. Note: dynamic `SET` clause in UPDATE, `UniqueViolationError` handling, CASCADE implications on DELETE

### Frontend
- [ ] `client/src/api/client.ts` — Axios instance with JWT interceptor
- [ ] `client/src/lib/hrms.ts` — All API wrapper functions + types + formatters
- [ ] `client/src/pages/EmployeesPage.tsx` — Full CRUD UI. Note: loading state, error state, empty state, split-layout pattern

---

## Phase 4: Every Other Feature (same pattern, shorter)

For each, read the **schema → route handler** and note anything unique:

- [ ] **Auth** — `schemas/auth.py` → `routers/auth.py` (login flow: query user → verify bcrypt → create JWT → return token)
- [ ] **Salary** — `schemas/salary.py` → `routers/salary.py` (key: `_sync_payroll()`, transactional create/update, one-salary-per-employee guard)
- [ ] **Attendance** — `schemas/attendance.py` → `routers/attendance.py` (key: `(employee_id, date)` unique constraint)
- [ ] **Payroll** — `schemas/payroll.py` → `routers/payroll.py` (simple read-only list with employee name JOIN)
- [ ] **Dashboard** — `schemas/dashboard.py` → `routers/dashboard.py` (aggregate queries, note: `total_monthly_payroll` doesn't filter by month)

### Frontend pages (skim, focus on data flow)
- [ ] `client/src/pages/LoginPage.tsx` — learn `useAuth().login()` flow
- [ ] `client/src/pages/SalaryPage.tsx` — live net-salary preview
- [ ] `client/src/auth/AuthContext.tsx` — token storage, login/logout
- [ ] `client/src/auth/ProtectedRoute.tsx` — redirect guard
- [ ] `client/src/layouts/WorkspaceLayout.tsx` — sidebar nav, Outlet

---

# Mock Interview Questions

## Architecture & Design

1. **Why did you choose FastAPI and asyncpg instead of Django or SQLAlchemy?**
   - FastAPI gives async out of the box, lightweight, good for a focused HRMS. asyncpg is the fastest PostgreSQL driver for Python. No ORM overhead — raw SQL is simpler for these queries.

2. **Walk me through what happens when a user clicks "Add Employee" and submits the form.**
   - Frontend: `react-hook-form` validates → `createEmployee()` in hrms.ts → axios POST to `/employees` (JWT injected by interceptor) → FastAPI route handler validates with Pydantic → inserts into `public.employees` with parameterized query → returns the new record → table re-renders.

3. **How does authentication work from end to end?**
   - Login: POST `/login` with email/password → server verifies bcrypt hash → creates JWT with `sub=email`, `admin_id` claim, 1440min expiry → client stores token in `localStorage` as `hermes_token`. Every subsequent request: axios interceptor reads token, attaches `Authorization: Bearer <token>` header → `get_current_admin` dependency decodes JWT, queries users table, returns admin info or 401.

4. **What happens if the JWT expires while someone is on the Dashboard page?**
   - The next API call will get a 401. Currently there's no auto-redirect — the app would just show an error. In production you'd add a 401 response interceptor that calls `logout()`.

## Schema & Data

5. **Why is `net_salary` a GENERATED STORED column instead of computed in application code?**
   - Ensures consistency — no matter how the data is inserted or updated, the net is always correct. The database guarantees it. The frontend also computes a preview for UX, but the source of truth is the DB.

6. **Explain the relationship between Salary and Payroll. What does `_sync_payroll()` do?**
   - `_sync_payroll()` is called inside a transaction whenever a salary is created or updated. It **deletes all existing payroll records** for that employee, then inserts a new one. This is a simplification — it means payroll always mirrors the latest salary, but there's no salary history or monthly snapshots.

7. **Why does the attendance table have a UNIQUE constraint on `(employee_id, date)`?**
   - An employee can only have one attendance record per day. The route handler checks this explicitly before insert and returns 409 Conflict.

8. **What happens if you delete an employee?**
   - CASCADE DELETE — their salary, attendance, and payroll records are all deleted automatically. The `DELETE` endpoint returns the deleted employee record.

## Code-Specific

9. **In `routers/employees.py`, how does the UPDATE endpoint handle partial updates?**
   - Uses Pydantic's `model_dump(exclude_unset=True)` to get only provided fields, then dynamically builds a `SET col = $N` clause. This avoids sending unchanged fields to the database.

10. **What's the issue with `total_monthly_payroll` in the Dashboard endpoint?**
    - It sums all payroll records regardless of month. It should filter by the current month (or a provided month). It's a known TODO.

11. **Why does `_sync_payroll()` DELETE all existing payroll records for that employee instead of updating?**
    - Simplicity. Since payroll mirrors salary data and there's no salary history, it's easier to delete and re-insert. Not suitable for production (loses history), but sufficient for this scope.

12. **How does the frontend handle the case where a salary doesn't exist for an employee yet?**
    - In `SalaryPage.tsx`, `fetchSalary()` is called in a try/catch — if it throws (404), the catch block silently ignores it and the salary is simply not in the Map. The UI shows "—" for missing salaries and lets the user create one.

## General / Problem-Solving

13. **What would you add if you had another week?**
    - Salary history / versioning, monthly payroll filtering, attendance time_in/time_out validation (can't clock out before clocking in), audit logging, pagination on large tables, confirmation dialogs as proper modals instead of `window.confirm`.

14. **What's the biggest "vibecoded" smell in this project?**
    - `_sync_payroll()` destroying and recreating payroll records. It works for the demo but loses data. Also, the activities dropdown in `WorkspaceLayout.tsx` uses hardcoded mock data.

15. **Why raw SQL instead of an ORM?**
    - For a schema this small (5 tables), an ORM adds complexity without much benefit. Raw asyncpg queries are transparent, easy to optimize, and you always know exactly what SQL hits the database.
