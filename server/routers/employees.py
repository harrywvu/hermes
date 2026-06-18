from __future__ import annotations

from typing import Any

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status

from database import fetch, fetchrow, get_pool
from dependencies import get_current_admin
from schemas.employees import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    dependencies=[Depends(get_current_admin)],
)


def _employee_response(record: asyncpg.Record) -> EmployeeResponse:
    return EmployeeResponse(
        employee_id=record["employee_id"],
        full_name=record["full_name"],
        email=record["email"],
        contact_number=record["contact_number"],
        date_hired=record["date_hired"],
        employment_status=record["employment_status"],
    )


@router.get("", response_model=list[EmployeeResponse])
async def list_employees() -> list[EmployeeResponse]:
    rows = await fetch(
        """
        SELECT employee_id, full_name, email, contact_number, date_hired, employment_status
        FROM public.employees
        ORDER BY employee_id
        """
    )
    return [_employee_response(row) for row in rows]


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(payload: EmployeeCreate) -> EmployeeResponse:
    try:
        record = await fetchrow(
            """
            INSERT INTO public.employees (
                full_name,
                email,
                contact_number,
                date_hired,
                employment_status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING employee_id, full_name, email, contact_number, date_hired, employment_status
            """,
            payload.full_name,
            payload.email,
            payload.contact_number,
            payload.date_hired,
            payload.employment_status,
        )
    except asyncpg.UniqueViolationError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with that email already exists",
        ) from exc

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create employee",
        )

    return _employee_response(record)


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: int) -> EmployeeResponse:
    record = await fetchrow(
        """
        SELECT employee_id, full_name, email, contact_number, date_hired, employment_status
        FROM public.employees
        WHERE employee_id = $1
        """,
        employee_id,
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    return _employee_response(record)


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
) -> EmployeeResponse:
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided",
        )

    clauses: list[str] = []
    values: list[Any] = [employee_id]
    for index, (field, value) in enumerate(updates.items(), start=2):
        clauses.append(f"{field} = ${index}")
        values.append(value)

    try:
        record = await fetchrow(
            f"""
            UPDATE public.employees
            SET {", ".join(clauses)}
            WHERE employee_id = $1
            RETURNING employee_id, full_name, email, contact_number, date_hired, employment_status
            """,
            *values,
        )
    except asyncpg.UniqueViolationError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with that email already exists",
        ) from exc

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return _employee_response(record)


@router.delete("/{employee_id}", response_model=EmployeeResponse)
async def delete_employee(employee_id: int) -> EmployeeResponse:
    record = await fetchrow(
        """
        DELETE FROM public.employees
        WHERE employee_id = $1
        RETURNING employee_id, full_name, email, contact_number, date_hired, employment_status
        """,
        employee_id,
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    return _employee_response(record)
