-- note: This is using the latest version of Postgres. The database is hosted and deployed on Neon
-- THIS IS FOR REFERENCE

CREATE TYPE employment_status AS ENUM ('Active', 'Resigned', 'On Leave'); 
CREATE TYPE attendance_status AS ENUM ('Present', 'Late', 'Absent', 'On Leave'); 

CREATE TABLE public.users (
    admin_id INTEGER GENERATED ALWAYS AS IDENTITY,
    email TEXT UNIQUE NOT NULL ,
    password TEXT UNIQUE NOT NULL,
    
    -- Constraints
    CONSTRAINT users_pkey PRIMARY KEY (admin_id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_password_key UNIQUE (password)
);

CREATE TABLE public.employees (
    employee_id INTEGER GENERATED ALWAYS AS IDENTITY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT,
    date_hired DATE NOT NULL,
    employment_status employment_status NOT NULL DEFAULT 'Active',
    
    -- Constraints
    CONSTRAINT employees_pkey PRIMARY KEY (employee_id),
    CONSTRAINT employees_email_key UNIQUE (email)
);

CREATE TABLE public.payroll (
    id           SERIAL PRIMARY KEY,
    employee_id  INTEGER NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    allowance    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    deductions   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_salary   NUMERIC(12, 2) GENERATED ALWAYS AS (basic_salary + allowance - deductions) STORED,
    payroll_date DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES public.employees (employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE public.attendance (
    id          SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    date        DATE NOT NULL,
    time_in     TIMESTAMP,
    time_out    TIMESTAMP,
    status      attendance_status NOT NULL,

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES public.employees (employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE public.salaries (
    id            SERIAL PRIMARY KEY,
    employee_id   INTEGER NOT NULL,
    basic_salary  NUMERIC(12,2) NOT NULL,
    allowance     NUMERIC(12,2) NOT NULL DEFAULT 0,
    deductions    NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_salary    NUMERIC(12,2)
                  GENERATED ALWAYS AS (
                      basic_salary + allowance - deductions
                  ) STORED,

    CONSTRAINT fk_employee_id
        FOREIGN KEY (employee_id)
        REFERENCES public.employees (employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);