import os
import io
import numpy as np
from tensorflow import keras
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from dotenv import load_dotenv
load_dotenv()

_model = None
TARGET_SIZE = (384, 384)
CLASS_NAMES = ["good", "bad"]

def _get_model():
    global _model
    if _model is None:
        path = os.getenv("CLASSIFICATION_MODEL_PATH")
        print(f"[Classification] Loading model: {path}")
        _model = load_model(path)
        print("[Classification] ✅ Loaded")
    return _model

def classify_skin(image_bytes: bytes) -> dict:
    model = _get_model()

    img = image.load_img(io.BytesIO(image_bytes), target_size=TARGET_SIZE)
    img_array = image.img_to_array(img)
    arr = np.expand_dims(img_array, axis=0)
    arr = keras.applications.efficientnet_v2.preprocess_input(arr)
    prediction = model.predict(arr, verbose=0)
    idx        = int(np.argmax(prediction, axis=1)[0])
    label      = CLASS_NAMES[idx]

    return {
        "label":    label,
        "label_vn": "Da đẹp" if label == "good" else "Da xấu",
    }