from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.schemas.user import (
    RefreshRequest,
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

from backend.db.database import get_db
from backend.crud.user import get_user_by_email, create_user
from backend.core.security import verify_password, hash_password, create_access_token, create_refresh_token, verify_refresh_token, verify_token
from jose import jwt
from backend.services.email_service import send_reset_email

router = APIRouter()

# REGISTER
@router.post("/register")

def register(
        data: RegisterRequest,
        db: Session = Depends(get_db)
):

    if data.password != data.confirm_password:

        raise HTTPException(
            status_code=400,
            detail="Password not match"
        )
    print(data.password)
    print(len(data.password))
    existing = get_user_by_email(db, data.email)

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    create_user(db, data.email, data.password)

    return {"message": "Register success"}


# LOGIN
@router.post("/login")

def login(
        data: LoginRequest,
        db: Session = Depends(get_db)
):

    user = get_user_by_email(db, data.email)

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(data.password, user.password):

        raise HTTPException(
            status_code=400,
            detail="Wrong password"
        )

    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })

    refresh_token = create_refresh_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": user.role
    }


# FORGOT PASSWORD
@router.post("/forgot-password")
def forgot_password(
        data: ForgotPasswordRequest,
        db: Session = Depends(get_db)
):

    user = get_user_by_email(db, data.email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    send_reset_email(data.email)
    return {
        "message": "Reset password email sent"
    }

@router.post("/reset-password")
def reset_password(
        data: ResetPasswordRequest,
        db: Session = Depends(get_db)
):

    user = get_user_by_email(db, data.email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.password = hash_password(data.new_password)

    db.commit()

    return {
        "message": "Password updated"
    }

@router.post("/refresh")
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = verify_refresh_token(data.refresh_token)  
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user = get_user_by_email(db, payload["email"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })
    return {"access_token": new_access_token}