from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text,  ForeignKey, Float, JSON
from datetime import datetime
from backend.db.database import Base

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True)

    password = Column(String)

    role = Column(String, default="user")

    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

class DiagnosisHistory(Base):
    __tablename__ = "history"

    id            = Column(String, primary_key=True)        # uuid
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=True)
    skin_label    = Column(String)                          # "good" | "bad"
    skin_label_vn = Column(String)                          # "Da đẹp" | "Da xấu"
    detections    = Column(JSON)                            # [{"label":"acne","count":2}]
    summary       = Column(Text)                            # tóm tắt tổng hợp
    image_url     = Column(String)                          # ảnh gốc trên MinIO
    annotated_url = Column(String)                          # ảnh đã vẽ bbox
    skin_context  = Column(String, nullable=True)           # "da dầu" / "da khô"
    created_at    = Column(DateTime, default=datetime.utcnow)

class Advice(Base):
    __tablename__ = "advice"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    history_id   = Column(String, ForeignKey("history.id"), nullable=False)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_question = Column(Text)                            # câu hỏi người dùng
    advice_text  = Column(Text)                             # lời khuyên từ Gemini
    created_at   = Column(DateTime, default=datetime.utcnow)