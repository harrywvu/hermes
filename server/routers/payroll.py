from __future__ import annotations

import asyncpg
from fastapi import APIRouter, Depends

from database import fetch
from dependencies import get_current_admin
from schemas.payroll import PayrollResponse

router = APIRouter(
    prefix="/payroll",
    tags=["payroll"],
    dependencies=[Depends(get_current_admin)],
)


def _payroll_response(record: asyncpg.Record) -> PayrollResponse:
    return PayrollResponse(
        id=record["id"],
        employee_id=record["employee_id"],
        employee_name=record["employee_name"],
        basic_salary=record["basic_salary"],
        allowance=record["allowance"],
        deductions=record["deductions"],
        net_salary=record["net_salary"],
        payroll_date=record["payroll_date"],
    )


@router.get("", response_model=list[PayrollResponse])
async def list_payroll() -> list[PayrollResponse]:
    rows = await fetch(
        """
        SELECT p.id,
               p.employee_id,
               e.full_name AS employee_name,
               p.basic_salary,
               p.allowance,
               p.deductions,
               p.net_salary,
               p.payroll_date
        FROM public.payroll AS p
        JOIN public.employees AS e ON e.employee_id = p.employee_id
        ORDER BY p.payroll_date DESC, p.id DESC
        """
    )
    return [_payroll_response(row) for row in rows]
