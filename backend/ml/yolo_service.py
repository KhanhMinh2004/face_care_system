import os
import io
import base64
import cv2
from PIL import Image
from collections import Counter
from dotenv import load_dotenv
load_dotenv()

_model = None
CONF_THRESHOLD = float(os.getenv("YOLO_CONF_THRESHOLD"))
DARKSPOT_LABELS = {"spot"}

def _get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        path = os.getenv("YOLO_MODEL_PATH", "backend/models/best.pt")
        print(f"[YOLO] Loading model: {path}")
        _model = YOLO(path)
        print("[YOLO] ✅ Loaded")
    return _model

def detect_acne(image_bytes: bytes) -> dict:
    """
    Returns:
        {
            "detections":      [{"label": "acne", "count": 2}, ...],
            "summary_detail":  "2 acne, 1 spot",
            "acne_detected":   True | False,
            "darkspot_detected": True | False,
            "annotated_b64":   "...",
            "annotated_bytes": b"..."
        }
    """
    model = _get_model()

    img     = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model(img, imgsz=640, verbose=False)

    # Chỉ lấy label, không lấy confidence
    labels = []
    for box in results[0].boxes:
        conf  = float(box.conf)
        if conf >= CONF_THRESHOLD:              # ← chỉ lấy nếu vượt ngưỡng
            label = model.names[int(box.cls)]
            labels.append(label)

    counts = Counter(labels)

    # Tổng hợp: [{"label": "acne", "count": 2}]
    detections        = [{"label": lbl, "count": cnt} for lbl, cnt in counts.items()]
    acne_detected     = "acne" in counts
    darkspot_detected = any(lbl in DARKSPOT_LABELS for lbl in counts)
    summary_detail    = (
        ", ".join(f"{cnt} {lbl}" for lbl, cnt in counts.items())
        if counts else "Không phát hiện mụn"
    )

    # ── Vẽ bbox — chỉ vẽ những box vượt ngưỡng ──────────────────────────
    annotated_np  = results[0].plot(conf=False)   # conf=False → không hiện số conf
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