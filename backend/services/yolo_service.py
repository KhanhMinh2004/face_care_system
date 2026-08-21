import os
import io
import base64
import cv2
from PIL import Image
from collections import Counter
from ultralytics import YOLO
from dotenv import load_dotenv
load_dotenv()

_model = None
CONF_THRESHOLD = float(os.getenv("YOLO_CONF_THRESHOLD"))
DARKSPOT_LABELS = {"spot"}

def _get_model():
    global _model
    if _model is None:
        path = os.getenv("YOLO_MODEL_PATH")
        print(f"[YOLO] Loading model: {path}")
        _model = YOLO(path)
        print("[YOLO] ✅ Loaded")
    return _model

def detect_acne(image_bytes: bytes) -> dict:
    model = _get_model()

    img     = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model(img, conf=CONF_THRESHOLD, verbose=False)

    labels = []
    for box in results[0].boxes:
        conf  = float(box.conf)
        if conf >= CONF_THRESHOLD:              
            label = model.names[int(box.cls)]
            labels.append(label)

    counts = Counter(labels)

    detections        = [{"label": lbl, "count": cnt} for lbl, cnt in counts.items()]
    acne_detected     = "acne" in counts
    darkspot_detected = any(lbl in DARKSPOT_LABELS for lbl in counts)
    summary_detail    = (
        ", ".join(f"{cnt} {lbl}" for lbl, cnt in counts.items())
        if counts else "Không phát hiện mụn"
    )

    annotated_np  = results[0].plot(conf=False)   
    annotated_rgb = cv2.cvtColor(annotated_np, cv2.COLOR_BGR2RGB)
    pil_out       = Image.fromarray(annotated_rgb)

    buf = io.BytesIO()
    pil_out.save(buf, format="JPEG", quality=90)
    annotated_bytes = buf.getvalue()
    annotated_b64   = base64.b64encode(annotated_bytes).decode()

    return {
        "detections":         detections,
        "summary_detail":     summary_detail,
        "acne_detected":      acne_detected,
        "darkspot_detected":  darkspot_detected,
        "annotated_b64":      annotated_b64,
        "annotated_bytes":    annotated_bytes,
    }