from __future__ import annotations

import asyncio
import os
from datetime import date
from pathlib import Path

import asyncpg
import bcrypt
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DSN")

ADMIN_EMAIL = "admin@test.com"
ADMIN_PASSWORD = "admin123"

EMPLOYEES = [
    {
        "full_name": "Ava Santos",
        "email": "ava.santos@hermes.test",
        "contact_number": "+63 917 000 0001",
        "date_hired": date(2025, 1, 6),
        "employment_status": "Active",
    },
    {
        "full_name": "Noah Reyes",
        "email": "noah.reyes@hermes.test",
        "contact_number": "+63 917 000 0002",
        "date_hired": date(2025, 2, 3),
        "employment_status": "Active",
    },
    {
        "full_name": "Mia Cruz",
        "email": "mia.cruz@hermes.test",
        "contact_number": "+63 917 000 0003",
        "date_hired": date(2025, 3, 10),
        "employment_status": "On Leave",
    },
    {
        "full_name": "Liam Flores",
        "email": "liam.flores@hermes.test",
        "contact_number": "+63 917 000 0004",
        "date_hired": date(2025, 4, 14),
        "employment_status": "Active",
    },
    {
        "full_name": "Sophia Dela Cruz",
        "email": "sophia.delacruz@hermes.test",
        "contact_number": "+63 917 000 0005",
        "date_hired": date(2025, 5, 19),
        "employment_status": "Resigned",
    },
]


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")


async def main() -> None:
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL (or DSN) is not set")

    pool = await asyncpg.create_pool(dsn=DATABASE_URL, min_size=1, max_size=5)
    try:
        async with pool.acquire() as connection:
            async with connection.transaction():
                await connection.execute(
                    "TRUNCATE TABLE public.payroll, public.attendance, public.salaries RESTART IDENTITY CASCADE"
                )

                hashed_password = get_password_hash(ADMIN_PASSWORD)
                await connection.execute(
                    """
                    INSERT INTO public.users (email, password)
                    VALUES ($1, $2)
                    ON CONFLICT (email)
                    DO UPDATE SET password = EXCLUDED.password
                    """,
                    ADMIN_EMAIL,
                    hashed_password,
                )

                for employee in EMPLOYEES:
                    await connection.execute(
                        """
                        INSERT INTO public.employees (
                            full_name,
                            email,
                            contact_number,
                            date_hired,
                            employment_status
                        )
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (email)
                        DO UPDATE SET
                            full_name = EXCLUDED.full_name,
                            contact_number = EXCLUDED.contact_number,
                            date_hired = EXCLUDED.date_hired,
                            employment_status = EXCLUDED.employment_status
                        """,
                        employee["full_name"],
                        employee["email"],
                        employee["contact_number"],
                        employee["date_hired"],
                        employee["employment_status"],
                    )

                counts = await connection.fetchrow(
                    """
                    SELECT
                        (SELECT COUNT(*) FROM public.users) AS users_count,
                        (SELECT COUNT(*) FROM public.employees) AS employees_count,
                        (SELECT COUNT(*) FROM public.salaries) AS salaries_count,
                        (SELECT COUNT(*) FROM public.attendance) AS attendance_count,
                        (SELECT COUNT(*) FROM public.payroll) AS payroll_count
                    """
                )
                print(dict(counts))
    finally:
        await pool.close()


if __name__ == "__main__":
    asyncio.run(main())
