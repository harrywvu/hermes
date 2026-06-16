from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from database import fetchrow
from dependencies import create_access_token, verify_password
from schemas.auth import LoginRequest, TokenResponse

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    admin = await fetchrow(
        "SELECT admin_id, email, password FROM public.users WHERE email = $1",
        payload.email,
    )
    if admin is None or not verify_password(payload.password, admin["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        subject=admin["email"],
        claims={"admin_id": admin["admin_id"]},
    )
    return TokenResponse(
        access_token=access_token,
        admin_id=admin["admin_id"],
        email=admin["email"],
    )
