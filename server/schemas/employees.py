from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr

EmploymentStatus = Literal["Active", "Resigned", "On Leave"]


class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    contact_number: str | None = None
    date_hired: date
    employment_status: EmploymentStatus = "Active"


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    contact_number: str | None = None
    date_hired: date | None = None
    employment_status: EmploymentStatus | None = None


class EmployeeResponse(EmployeeBase):
    employee_id: int
