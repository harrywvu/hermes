from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

AttendanceStatus = Literal["Present", "Late", "Absent", "On Leave"]


class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    time_in: datetime | None = None
    time_out: datetime | None = None
    status: AttendanceStatus


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_name: str
