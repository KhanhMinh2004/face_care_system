from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from backend.db.database import engine
from backend.db import models
from backend.core.settings import create_app

from backend.api.endpoints import auth
from backend.api.endpoints import admin
from backend.api.endpoints import analyze 
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
create_app(app)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# routers
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"]
)

app.include_router(           # ← thêm
    analyze.router,
    prefix="/api/analyze",
    tags=["Analyze"]
)