from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict


class AttendanceRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_name: str
    date: date
    status: str


class PayrollRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_name: str
    net_salary: Decimal
    payroll_date: date


class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_employees: int
    active_employees: int
    employees_on_leave: int
    total_monthly_payroll: Decimal
    recent_attendance: List[AttendanceRecord] = []
    recent_payroll: List[PayrollRecord] = []
