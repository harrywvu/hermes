from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator, model_validator


class SalaryBase(BaseModel):
    employee_id: int
    basic_salary: Decimal
    allowance: Decimal = Decimal("0")
    deductions: Decimal = Decimal("0")


class SalaryCreate(SalaryBase):
    @field_validator("basic_salary")
    @classmethod
    def basic_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("basic_salary must be greater than 0")
        return v

    @field_validator("allowance", "deductions")
    @classmethod
    def no_negatives(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("must not be negative")
        return v

    @model_validator(mode="after")
    def net_must_be_positive(self):
        net = self.basic_salary + self.allowance - self.deductions
        if net <= 0:
            raise ValueError("Net salary must be greater than 0")
        return self


class SalaryUpdate(BaseModel):
    basic_salary: Decimal | None = None
    allowance: Decimal | None = None
    deductions: Decimal | None = None

    @field_validator("basic_salary")
    @classmethod
    def basic_must_be_positive(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v <= 0:
            raise ValueError("basic_salary must be greater than 0")
        return v

    @field_validator("allowance", "deductions")
    @classmethod
    def no_negatives(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("must not be negative")
        return v


class SalaryResponse(SalaryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    net_salary: Decimal
