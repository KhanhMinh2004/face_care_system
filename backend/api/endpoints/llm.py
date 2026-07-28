from pydantic import BaseModel
from services.gemini_service import ask_gemini  
from fastapi import APIRouter

router = APIRouter()
class ChatRequest(BaseModel):
    question: str

@router.post("/chat")
def chat(req: ChatRequest):
    reply = ask_gemini(req.question)
    return {"reply": reply}