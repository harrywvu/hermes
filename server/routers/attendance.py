from __future__ import annotations

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status

from database import fetch, fetchrow
from dependencies import get_current_admin
from schemas.attendance import AttendanceCreate, AttendanceResponse

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"],
    dependencies=[Depends(get_current_admin)],
)


def _attendance_response(record: asyncpg.Record) -> AttendanceResponse:
    return AttendanceResponse(
        id=record["id"],
        employee_id=record["employee_id"],
        employee_name=record["employee_name"],
        date=record["date"],
        time_in=record["time_in"],
        time_out=record["time_out"],
        status=record["status"],
    )


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance(payload: AttendanceCreate) -> AttendanceResponse:
    employee = await fetchrow(
        "SELECT employee_id FROM public.employees WHERE employee_id = $1",
        payload.employee_id,
    )
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    record = await fetchrow(
        """
        INSERT INTO public.attendance (
            employee_id,
            date,
            time_in,
            time_out,
            status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, employee_id, date, time_in, time_out, status
        """,
        payload.employee_id,
        payload.date,
        payload.time_in,
        payload.time_out,
        payload.status,
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create attendance record",
        )

    record = await fetchrow(
        """
        SELECT a.id,
               a.employee_id,
               e.full_name AS employee_name,
               a.date,
               a.time_in,
               a.time_out,
               a.status
        FROM public.attendance AS a
        JOIN public.employees AS e ON e.employee_id = a.employee_id
        WHERE a.id = $1
        """,
        record["id"],
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load attendance record",
        )
    return _attendance_response(record)


@router.get("", response_model=list[AttendanceResponse])
async def list_attendance() -> list[AttendanceResponse]:
    rows = await fetch(
        """
        SELECT a.id,
               a.employee_id,
               e.full_name AS employee_name,
               a.date,
               a.time_in,
               a.time_out,
               a.status
        FROM public.attendance AS a
        JOIN public.employees AS e ON e.employee_id = a.employee_id
        ORDER BY a.date DESC, a.id DESC
        """
    )
    return [_attendance_response(row) for row in rows]
