from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, model_validator

AttendanceStatus = Literal["Present", "Late", "Absent", "On Leave"]


class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    time_in: datetime | None = None
    time_out: datetime | None = None
    status: AttendanceStatus


class AttendanceCreate(AttendanceBase):
    @model_validator(mode="after")
    def validate_times(self):
        if self.time_in is not None and self.time_out is not None:
            if self.time_out <= self.time_in:
                raise ValueError("time_out must be after time_in")
        return self


class AttendanceResponse(AttendanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_name: str
