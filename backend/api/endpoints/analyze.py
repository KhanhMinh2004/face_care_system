import uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.services.classification_service import classify_skin
from backend.services.yolo_service            import detect_acne
from backend.services.rag_service             import get_skin_advice
from backend.services.storage_service     import save_image
from backend.db.models                  import DiagnosisHistory, Advice
from backend.db.database                import get_db
from backend.services.llm.factory       import create_llm_router

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

    cls  = classify_skin(image_bytes)

    yolo = detect_acne(image_bytes)

    summary = f"{cls['label_vn']}. {yolo['summary_detail']}."

    original_url  = save_image(image_bytes,             "original",  filename)
    annotated_url = save_image(yolo["annotated_bytes"], "annotated", filename)

    llm = create_llm_router()

    advice_text = await get_skin_advice(
        llm=llm,
        skin_label_vn     = cls["label_vn"],
        acne_detected     = yolo["acne_detected"],
        darkspot_detected = yolo["darkspot_detected"],
        summary_detail    = yolo["summary_detail"],
        user_question     = user_question,
        skin_context      = skin_context,
    )

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
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="user_id không hợp lệ")
    
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