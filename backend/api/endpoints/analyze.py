import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.ml.classification_service import classify_skin
from backend.ml.yolo_service            import detect_acne
from backend.ml.rag_service             import get_skin_advice
from backend.services.storage_service     import save_image
from backend.db.models                  import DiagnosisHistory, Advice
from backend.db.database                import get_db

router = APIRouter()

@router.post("")
async def analyze_skin(
    file:          UploadFile = File(...),
    user_id:       int        = Form(default=None),
    skin_context:  str        = Form(default=""),
    user_question: str        = Form(default="Tôi nên chăm sóc da như thế nào?"),
    db:            Session    = Depends(get_db),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file ảnh")

    image_bytes = await file.read()
    record_id   = str(uuid.uuid4())
    filename    = f"{record_id}.jpg"

    # ── Bước 1a: Classification ─────────────────────────────────────────
    cls  = classify_skin(image_bytes)
    # {"label": "good"|"bad", "label_vn": "Da đẹp"|"Da xấu"}

    # ── Bước 1b: YOLO ───────────────────────────────────────────────────
    yolo = detect_acne(image_bytes)
    # {"detections": [...], "summary_detail": "2 acne", ...}

    # ── Bước 2: Tổng hợp summary ────────────────────────────────────────
    summary = f"{cls['label_vn']}. {yolo['summary_detail']}."

    # ── Bước 3: Upload MinIO ────────────────────────────────────────────
    original_url  = save_image(image_bytes,             "original",  filename)
    annotated_url = save_image(yolo["annotated_bytes"], "annotated", filename)

    # ── Bước 4: RAG + Gemini ────────────────────────────────────────────
    advice_text = get_skin_advice(
        skin_label_vn     = cls["label_vn"],
        acne_detected     = yolo["acne_detected"],
        darkspot_detected = yolo["darkspot_detected"],
        summary_detail    = yolo["summary_detail"],
        user_question     = user_question,
    )

    # ── Bước 5: Lưu DB ──────────────────────────────────────────────────
    history = DiagnosisHistory(
        id            = record_id,
        user_id       = user_id,
        skin_label    = cls["label"],
        skin_label_vn = cls["label_vn"],
        detections    = yolo["detections"],
        summary       = summary,
        image_url     = original_url,
        annotated_url = annotated_url,
        skin_context  = skin_context,
    )
    db.add(history)
    db.flush()

    advice = Advice(
        history_id    = record_id,
        user_id       = user_id,
        user_question = user_question,
        advice_text   = advice_text,
    )
    db.add(advice)
    db.commit()

    return {
        "record_id":      record_id,
        "skin_label":     cls["label"],
        "skin_label_vn":  cls["label_vn"],
        "detections":     yolo["detections"],
        "summary":        summary,
        "advice":         advice_text,
        "annotated_b64":  yolo["annotated_b64"],
        "annotated_url":  annotated_url,   # /uploads/annotated/{uuid}.jpg
        "image_url":      original_url,    # /uploads/original/{uuid}.jpg
    }


@router.get("/history/{user_id}")
def get_history(user_id: str, db: Session = Depends(get_db)):
    # Convert sang int an toàn
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="user_id không hợp lệ")
    
    # Join history + advice để lấy đủ thông tin
    records = (
        db.query(DiagnosisHistory, Advice)
        .outerjoin(Advice, Advice.history_id == DiagnosisHistory.id)
        .filter(DiagnosisHistory.user_id == uid)
        .order_by(DiagnosisHistory.created_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "record_id":      h.id,
            "skin_label":     h.skin_label,
            "skin_label_vn":  h.skin_label_vn,
            "detections":     h.detections,
            "summary":        h.summary,
            "annotated_url":  h.annotated_url,
            "image_url":      h.image_url,
            "advice":         a.advice_text if a else "",
            "user_question":  a.user_question if a else "",
            "created_at":     h.created_at.isoformat(),
        }
        for h, a in records
    ]