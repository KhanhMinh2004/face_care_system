import os
import io
import numpy as np
from PIL import Image
from dotenv import load_dotenv
load_dotenv()

_model = None
TARGET_SIZE = (384, 384)
CLASS_NAMES = ["good", "bad"]

def _get_model():
    global _model
    if _model is None:
        from tensorflow.keras.models import load_model
        path = os.getenv("CLASSIFICATION_MODEL_PATH", "backend/models/final_best.keras")
        print(f"[Classification] Loading model: {path}")
        _model = load_model(path)
        print("[Classification] ✅ Loaded")
    return _model

def classify_skin(image_bytes: bytes) -> dict:
    """
    Returns:
        {
            "label":    "good" | "bad",
            "label_vn": "Da đẹp" | "Da xấu"   ← không có confidence
        }
    """
    model = _get_model()

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(TARGET_SIZE)

    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)

    prediction = model.predict(arr, verbose=0)
    idx        = int(np.argmax(prediction, axis=1)[0])
    label      = CLASS_NAMES[idx]

    return {
        "label":    label,
        "label_vn": "Da đẹp" if label == "good" else "Da xấu",
    }