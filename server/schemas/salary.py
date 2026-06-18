from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SalaryBase(BaseModel):
    employee_id: int
    basic_salary: Decimal
    allowance: Decimal = Decimal("0")
    deductions: Decimal = Decimal("0")


class SalaryCreate(SalaryBase):
    pass


class SalaryUpdate(BaseModel):
    basic_salary: Decimal | None = None
    allowance: Decimal | None = None
    deductions: Decimal | None = None


class SalaryResponse(SalaryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    net_salary: Decimal
