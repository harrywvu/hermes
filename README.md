# Hermes HRMS

A web-based HR management system for handling employees, salaries, attendance, and payroll. Designed for HR professionals and administrators.

**Live Demo:** [https://hermes-iota-five.vercel.app](https://hermes-iota-five.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | FastAPI (Python 3.14) |
| Database | PostgreSQL on Neon |
| Auth | JWT with bcrypt password hashing |

---

## Features

- **Authentication** — JWT-based login with protected routes
- **Dashboard** — Overview metrics: total employees, active count, payroll summary, recent activity
- **Employees** — Full CRUD directory with employment status tracking
- **Salary** — Assign and update salary components (basic, allowance, deductions) with live net calculation
- **Attendance** — Log daily attendance records with per-date uniqueness enforcement
- **Payroll** — Auto-synced payroll records linked to salary configuration

---

## Database Schema (5 tables)

- **users** — Admin accounts for authentication
- **employees** — Employee records with employment status enum (Active, Resigned, On Leave)
- **salaries** — Per-employee salary configuration (`net_salary` computed via PostgreSQL generated column)
- **attendance** — Daily attendance with `(employee_id, date)` unique constraint
- **payroll** — Monthly payroll records synced automatically when salaries change

All foreign keys use `ON DELETE CASCADE` — deleting an employee removes their salary, attendance, and payroll records.

---

## Local Development Setup

### Prerequisites

- Python 3.14+
- Node.js 22+
- PostgreSQL database (local or Neon)

### 1. Clone the repository

```bash
git clone https://github.com/harrywvu/hermes.git
cd hermes
```

### 2. Backend setup

```bash
cd server
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `server/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=change-this-to-a-random-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Seed the database and start the server:

```bash
python seed_database.py
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Demo credentials

| Email | Password |
|---|---|
| admin@test.com | admin123 |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | No | Authenticate and receive JWT |
| GET | `/employees` | Yes | List all employees |
| POST | `/employees` | Yes | Create employee |
| GET | `/employees/{id}` | Yes | Get employee by ID |
| PUT | `/employees/{id}` | Yes | Update employee |
| DELETE | `/employees/{id}` | Yes | Delete employee |
| POST | `/salary` | Yes | Assign salary to employee |
| PUT | `/salary/{employee_id}` | Yes | Update salary |
| GET | `/salary/{employee_id}` | Yes | Get salary by employee |
| POST | `/attendance` | Yes | Log attendance record |
| GET | `/attendance` | Yes | List attendance records |
| GET | `/payroll` | Yes | List payroll records |
| GET | `/dashboard` | Yes | Dashboard aggregate metrics |