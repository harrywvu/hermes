from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PayrollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str
    basic_salary: Decimal
    allowance: Decimal
    deductions: Decimal
    net_salary: Decimal
    payroll_date: date
