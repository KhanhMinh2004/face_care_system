from sqlalchemy.orm import Session
from backend.db import models
from backend.core.security import hash_password


def get_user_by_email(db: Session, email: str):

    return db.query(models.User).filter(
        models.User.email == email
    ).first()


def create_user(db: Session, email: str, password: str):

    hashed = hash_password(password)

    user = models.User(
        email=email,
        password=hashed
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user