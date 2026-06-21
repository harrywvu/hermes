# Hermes HRMS - Agent Reference

## 1. Project Overview
Hermes is a comprehensive HR Management System that helps organizations manage employees, salaries, attendance, and payroll. It's designed for HR professionals and administrators to handle core HR operations through a web-based interface with a FastAPI backend and React frontend.

## 2. Tech Stack
- **Backend**: FastAPI 0.110+ with Python 3.14
- **Database**: PostgreSQL via asyncpg, hosted on Neon
- **Authentication**: JWT tokens with bcrypt password hashing
- **Frontend**: React 18+ with TypeScript and Vite
- **Key Dependencies**: asyncpg, bcrypt, python-jose, passlib, python-dotenv, pydantic[email]

## 3. Architecture & File Structure
```
/server
├── main.py              # FastAPI app entry point
├── database.py          # Database connection pool management
├── dependencies.py      # JWT auth, password hashing, token creation
├── routers/             # API route handlers
│   ├── auth.py          # /login endpoint
│   ├── employees.py     # Employee CRUD operations
│   ├── salary.py        # Salary assignment and updates
│   ├── attendance.py    # Attendance tracking
│   ├── payroll.py       # Payroll generation
│   └── dashboard.py     # Dashboard metrics
├── schemas/             # Pydantic models for request/response validation
│   ├── auth.py
│   ├── employees.py
│   ├── salary.py
│   ├── attendance.py
│   ├── payroll.py
│   └── dashboard.py
└── seed_database.py     # Initial data seeding script

/client
├── src/                 # React frontend
└── vite.config.ts       # Vite build configuration
```

Request flow: Client → API route handler → database operations → return response

## 4. Data Models & Schema
Key tables:
- `users`: Admin authentication (admin_id, email, password)
- `employees`: Employee records (employee_id, full_name, email, contact_number, department, position, date_hired, employment_status)
- `salaries`: Salary information (id, employee_id, basic_salary, allowance, deductions, net_salary)
- `attendance`: Attendance records (id, employee_id, date, time_in, time_out, status)
- `payroll`: Monthly payroll records (id, employee_id, basic_salary, allowance, deductions, net_salary, payroll_date)

Relationships:
- Employees → Salaries (one-to-one)
- Employees → Attendance (one-to-many)
- Employees → Payroll (one-to-many)
- All foreign keys use CASCADE DELETE

Computed fields:
- `net_salary` in salaries and payroll tables is generated automatically via PostgreSQL STORED expression

Enums:
- `employment_status`: Active, Resigned, On Leave
- `attendance_status`: Present, Late, Absent, On Leave

## 5. Core Business Logic
- **Payroll synchronization**: In `salary.py`, `_sync_payroll()` function automatically updates payroll records when salaries change
- **Authentication**: JWT tokens created in `dependencies.py` with `create_access_token()` and validated in `get_current_admin()` dependency
- **Employee status tracking**: Employment status is managed in employees table with proper enum validation
- **Salary calculations**: Net salary computed automatically in database using STORED expression

## 6. Conventions
- All API routes are protected by `get_current_admin()` dependency except `/login`
- Database queries use asyncpg parameterized queries to prevent SQL injection
- Error handling uses HTTPException with appropriate status codes
- Pydantic schemas validate all request/response data
- Passwords are hashed with bcrypt in `dependencies.py`
- All database operations use connection pooling from `database.py`
- Routes return Pydantic models as responses with proper status codes

## 7. Environment & Config
Environment variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_ALGORITHM`: JWT algorithm (default HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default 1440)

To run locally:
1. Set up `.env` with DB credentials
2. Run `uvicorn main:app --reload` in `/server`
3. Run `npm install && npm run dev` in `/client`

Seed data: Run `python seed_database.py` to populate with sample data

## 8. Known Gotchas / TODOs
- No explicit testing framework setup
- Payroll generation in `/payroll` endpoint doesn't filter by month/year
- Attendance records don't validate time_in vs time_out logic
- The system assumes one salary per employee (no salary history)
- No audit trail for changes to employee data
- Dashboard metrics don't filter by current month for payroll calculation