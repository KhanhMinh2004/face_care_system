import os
import uuid
from pathlib import Path

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

def _ensure_dir(folder: str):
    Path(folder).mkdir(parents=True, exist_ok=True)

def save_image(image_bytes: bytes, subfolder: str, filename: str) -> str:
    """
    Lưu ảnh vào uploads/{subfolder}/{filename}
    Trả về URL truy cập qua FastAPI static files
    """
    folder = os.path.join(UPLOAD_DIR, subfolder)
    _ensure_dir(folder)

    filepath = os.path.join(folder, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    # URL trả về FE truy cập được
    return f"/uploads/{subfolder}/{filename}"