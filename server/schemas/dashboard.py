from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_employees: int
    active_employees: int
    employees_on_leave: int
    total_monthly_payroll: Decimal
