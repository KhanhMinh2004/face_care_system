from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.db.database import get_db
from backend.crud.user import get_user_by_email
from backend.core.security import verify_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    payload = verify_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user_by_email(db, payload["email"])

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

def get_admin_user(current_user = Depends(get_current_user)):

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin only"
        )

    return current_user