import os
import google.generativeai as genai
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
load_dotenv() 
# ── Giữ nguyên ───────────────────────────────────────────────────────────
_vector_db    = None
_gemini_model = None

VECTOR_STORE_PATH = os.getenv(
    "VECTOR_STORE_PATH"
)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def _get_vector_db():
    global _vector_db
    if _vector_db is None:
        print("[RAG] Loading FAISS vector store...")
        embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        _vector_db = FAISS.load_local(
            VECTOR_STORE_PATH,
            embedding_model,
            allow_dangerous_deserialization=True,
        )
        print("[RAG] ✅ Vector store loaded")
    return _vector_db

def _get_gemini():
    global _gemini_model
    if _gemini_model is None:
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-2.5-flash")
        print("[RAG] ✅ Gemini model ready")
    return _gemini_model

def _retrieve_knowledge(query: str, k: int = 3) -> str:
    docs = _get_vector_db().similarity_search(query, k=k)
    return "\n\n".join([doc.page_content for doc in docs])

# ── Chỉ sửa hàm này — bỏ severity, bỏ confidence ────────────────────────
def get_skin_advice(
    skin_label_vn:     str,
    acne_detected:     bool,
    darkspot_detected: bool,
    summary_detail:    str,
    user_question:     str = "Tôi nên chăm sóc da như thế nào?",
) -> str:
    lines = [
        f"Tình trạng da: {skin_label_vn}.",
        f"Chi tiết phát hiện: {summary_detail}.",
        "Có mụn đang hoạt động." if acne_detected else "Không phát hiện mụn.",
        "Có đốm thâm." if darkspot_detected else "",
    ]
    skin_result = "\n".join(l for l in lines if l)

    rag_query = (
        f"{user_question} "
        f"{'mụn viêm' if acne_detected else ''} "
        f"{'thâm' if darkspot_detected else ''}"
    ).strip()

    context = _retrieve_knowledge(rag_query)

    prompt = f"""
Bạn là trợ lý tư vấn da liễu chuyên nghiệp.

Kết quả phân tích da:
{skin_result}

Kiến thức chuyên môn:
{context}

Câu hỏi: {user_question}

Chỉ dùng kiến thức trên. Trả lời tiếng Việt, rõ ràng, dễ hiểu.
""".strip()

    return _get_gemini().generate_content(prompt).text