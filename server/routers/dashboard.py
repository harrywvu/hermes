from __future__ import annotations

from fastapi import APIRouter, Depends

from database import fetch, fetchrow
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
    
    # Get recent attendance records
    recent_attendance = await fetch(
        """
        SELECT 
            e.full_name AS employee_name,
            a.date,
            a.status
        FROM public.attendance a
        JOIN public.employees e ON a.employee_id = e.employee_id
        ORDER BY a.date DESC, a.time_in DESC
        LIMIT 5
        """
    )
    
    # Get recent payroll records
    recent_payroll = await fetch(
        """
        SELECT 
            e.full_name AS employee_name,
            p.net_salary,
            p.payroll_date
        FROM public.payroll p
        JOIN public.employees e ON p.employee_id = e.employee_id
        ORDER BY p.payroll_date DESC
        LIMIT 5
        """
    )

    return DashboardResponse(
        total_employees=record["total_employees"] if record else 0,
        active_employees=record["active_employees"] if record else 0,
        employees_on_leave=record["employees_on_leave"] if record else 0,
        total_monthly_payroll=record["total_monthly_payroll"] if record else 0,
        recent_attendance=[dict(r) for r in recent_attendance] if recent_attendance else [],
        recent_payroll=[dict(r) for r in recent_payroll] if recent_payroll else [],
    )
