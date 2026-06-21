from __future__ import annotations

from os import getenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import close_db, connect_db
from routers.auth import router as auth_router
from routers.attendance import router as attendance_router
from routers.dashboard import router as dashboard_router
from routers.employees import router as employees_router
from routers.payroll import router as payroll_router
from routers.salary import router as salary_router

app = FastAPI(title="Hermes HRMS")

cors_origins = [
    origin.strip()
    for origin in getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await connect_db()


@app.on_event("shutdown")
async def shutdown() -> None:
    await close_db()


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hermes API"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(salary_router)
app.include_router(attendance_router)
app.include_router(payroll_router)
app.include_router(dashboard_router)

