from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.dependencies import get_admin_user
from backend.db.database import get_db
from backend.db import models
from backend.schemas.user import RegisterRequest
from passlib.context import CryptContext
from backend.db.models import User


router = APIRouter()

@router.post("/create-admin")
def create_admin(data: RegisterRequest, db: Session = Depends(get_db)):
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(data.password)

    user = models.User(
        email=data.email,
        password=hashed_password,
        role="admin",
        is_verified=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Admin created"}

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    users = db.query(models.User).all()

    return users

@router.put("/users/{user_id}/role")
def update_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role

    db.commit()

    return {
        "message": "Role updated"
    }

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin_user)
):

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)

    db.commit()

    return {
        "message": "User deleted"
    }