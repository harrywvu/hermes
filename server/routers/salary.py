from __future__ import annotations

from decimal import Decimal

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status

from database import fetchrow, get_pool
from dependencies import get_current_admin
from schemas.salary import SalaryCreate, SalaryResponse, SalaryUpdate

router = APIRouter(
    prefix="/salary",
    tags=["salary"],
    dependencies=[Depends(get_current_admin)],
)


def _salary_response(record: asyncpg.Record) -> SalaryResponse:
    return SalaryResponse(
        id=record["id"],
        employee_id=record["employee_id"],
        basic_salary=record["basic_salary"],
        allowance=record["allowance"],
        deductions=record["deductions"],
        net_salary=record["net_salary"],
    )


async def _sync_payroll(
    connection: asyncpg.Connection,
    *,
    employee_id: int,
    basic_salary: Decimal,
    allowance: Decimal,
    deductions: Decimal,
) -> asyncpg.Record:
    await connection.execute(
        "DELETE FROM public.payroll WHERE employee_id = $1",
        employee_id,
    )
    return await connection.fetchrow(
        """
        INSERT INTO public.payroll (employee_id, basic_salary, allowance, deductions)
        VALUES ($1, $2, $3, $4)
        RETURNING id, employee_id, basic_salary, allowance, deductions, net_salary, payroll_date
        """,
        employee_id,
        basic_salary,
        allowance,
        deductions,
    )


@router.post("", response_model=SalaryResponse, status_code=status.HTTP_201_CREATED)
async def create_salary(payload: SalaryCreate) -> SalaryResponse:
    pool = get_pool()
    async with pool.acquire() as connection:
        async with connection.transaction():
            employee = await connection.fetchrow(
                "SELECT employee_id FROM public.employees WHERE employee_id = $1",
                payload.employee_id,
            )
            if employee is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found",
                )

            existing = await connection.fetchrow(
                """
                SELECT id
                FROM public.salaries
                WHERE employee_id = $1
                ORDER BY id DESC
                LIMIT 1
                """,
                payload.employee_id,
            )
            if existing is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Salary already exists for this employee",
                )

            record = await connection.fetchrow(
                """
                INSERT INTO public.salaries (
                    employee_id,
                    basic_salary,
                    allowance,
                    deductions
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id, employee_id, basic_salary, allowance, deductions, net_salary
                """,
                payload.employee_id,
                payload.basic_salary,
                payload.allowance,
                payload.deductions,
            )
            if record is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Unable to create salary",
                )

            await _sync_payroll(
                connection,
                employee_id=payload.employee_id,
                basic_salary=payload.basic_salary,
                allowance=payload.allowance,
                deductions=payload.deductions,
            )

            return _salary_response(record)


@router.put("/{employee_id}", response_model=SalaryResponse)
async def update_salary(employee_id: int, payload: SalaryUpdate) -> SalaryResponse:
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided",
        )

    pool = get_pool()
    async with pool.acquire() as connection:
        async with connection.transaction():
            employee = await connection.fetchrow(
                "SELECT employee_id FROM public.employees WHERE employee_id = $1",
                employee_id,
            )
            if employee is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found",
                )

            existing = await connection.fetchrow(
                """
                SELECT id, employee_id, basic_salary, allowance, deductions, net_salary
                FROM public.salaries
                WHERE employee_id = $1
                ORDER BY id DESC
                LIMIT 1
                """,
                employee_id,
            )
            if existing is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Salary not found for this employee",
                )

            basic_salary = updates.get("basic_salary", existing["basic_salary"])
            allowance = updates.get("allowance", existing["allowance"])
            deductions = updates.get("deductions", existing["deductions"])

            record = await connection.fetchrow(
                """
                UPDATE public.salaries
                SET basic_salary = $2,
                    allowance = $3,
                    deductions = $4
                WHERE id = $1
                RETURNING id, employee_id, basic_salary, allowance, deductions, net_salary
                """,
                existing["id"],
                basic_salary,
                allowance,
                deductions,
            )
            if record is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Unable to update salary",
                )

            await _sync_payroll(
                connection,
                employee_id=employee_id,
                basic_salary=basic_salary,
                allowance=allowance,
                deductions=deductions,
            )

            return _salary_response(record)


@router.get("/{employee_id}", response_model=SalaryResponse)
async def get_salary(employee_id: int) -> SalaryResponse:
    record = await fetchrow(
        """
        SELECT id, employee_id, basic_salary, allowance, deductions, net_salary
        FROM public.salaries
        WHERE employee_id = $1
        ORDER BY id DESC
        LIMIT 1
        """,
        employee_id,
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Salary not found for this employee",
        )
    return _salary_response(record)
