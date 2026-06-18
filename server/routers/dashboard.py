from __future__ import annotations

from fastapi import APIRouter, Depends

from database import fetchrow
from dependencies import get_current_admin
from schemas.dashboard import DashboardResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("", response_model=DashboardResponse)
async def get_dashboard() -> DashboardResponse:
    record = await fetchrow(
        """
        SELECT
            (SELECT COUNT(*)::int FROM public.employees) AS total_employees,
            (
                SELECT COUNT(*)::int
                FROM public.employees
                WHERE employment_status = 'Active'
            ) AS active_employees,
            (
                SELECT COUNT(*)::int
                FROM public.employees
                WHERE employment_status = 'On Leave'
            ) AS employees_on_leave,
            COALESCE((SELECT SUM(net_salary) FROM public.payroll), 0) AS total_monthly_payroll
        """
    )

    return DashboardResponse(
        total_employees=record["total_employees"] if record else 0,
        active_employees=record["active_employees"] if record else 0,
        employees_on_leave=record["employees_on_leave"] if record else 0,
        total_monthly_payroll=record["total_monthly_payroll"] if record else 0,
    )
