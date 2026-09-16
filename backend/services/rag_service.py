import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from backend.services.llm.base import LLMProvider
from collections.abc import AsyncIterator
from dotenv import load_dotenv

load_dotenv()

# ---------- Config ----------
VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

if not VECTOR_STORE_PATH:
    raise RuntimeError("Missing VECTOR_STORE_PATH env var")


# ---------- Lazy singletons ----------
_vector_db = None

def _get_vector_db():
    global _vector_db
    if _vector_db is None:
        print("[RAG] Loading FAISS vector store...")
        embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        _vector_db = FAISS.load_local(
            VECTOR_STORE_PATH,
            embedding_model,
            allow_dangerous_deserialization=True,
        )
        print("[RAG] ✅ Vector store loaded")
    return _vector_db


async def _rewrite_prompt(
    llm: LLMProvider,
    user_question: str,
    summary_detail: str,
    skin_context: str,
    skin_label_vn: str,
) -> str:
    """
    Viết lại câu hỏi người dùng thành chuỗi keyword tiếng Việt
    tối ưu cho similarity search trên FAISS.
    """
    prompt = f"""Bạn là bộ trích xuất từ khóa cho hệ thống tìm kiếm tài liệu da liễu.

Thông tin bệnh nhân:
- Tình trạng da: {skin_label_vn}
- Loại da: {skin_context}
- Chi tiết: {summary_detail}
- Câu hỏi: {user_question}

Nhiệm vụ: Trả về MỘT dòng duy nhất gồm các từ khóa tiếng Việt liên quan,
phân tách bằng dấu phẩy. Tập trung vào: tình trạng da, triệu chứng, hoạt chất,
phương pháp điều trị/chăm sóc liên quan đến câu hỏi.

QUY TẮC BẮT BUỘC:
- KHÔNG giải thích, KHÔNG tiền tố ("Từ khóa:", "Dưới đây..."), KHÔNG markdown.
- KHÔNG dùng câu hoàn chỉnh, chỉ dùng cụm từ khóa.
- Tối đa 15 từ khóa.

Ví dụ output đúng: da dầu mụn, mụn viêm, BHA, salicylic acid, kiềm dầu, chăm sóc da mụn
"""
    raw = await llm.generate(
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    print(f"[RAG] Rewritten query: {raw}")
    return raw



# ---------- Retrieval ----------
def _retrieve_knowledge(query: str, k: int = 3) -> str:
    docs = _get_vector_db().similarity_search(query, k=k)
    return "\n\n".join(doc.page_content for doc in docs)

async def build_final_prompt(
    llm: LLMProvider,
    skin_label_vn: str,
    acne_detected: bool,
    darkspot_detected: bool,
    summary_detail: str,
    user_question: str = "Tôi nên chăm sóc da như thế nào?",
    skin_context: str = "",
) -> str:
    # Tổng hợp kết quả phân tích da
    lines = [
        f"Tình trạng da: {skin_label_vn}.",
        f"Chi tiết phát hiện: {summary_detail}.",
    ]
    if acne_detected:
        lines.append("Có mụn đang hoạt động.")
    else:
        lines.append("Không phát hiện mụn.")
    if darkspot_detected:
        lines.append("Có đốm thâm.")
    skin_result = "\n".join(lines)

    # Mở rộng câu hỏi với tín hiệu phát hiện được để rewrite có ngữ cảnh
    enriched_question = user_question
    extras = []
    if acne_detected:
        extras.append("mụn viêm")
    if darkspot_detected:
        extras.append("thâm sau mụn")
    if extras:
        enriched_question = f"{user_question} (lưu ý: {', '.join(extras)})"

    # Rewrite -> retrieve
    rag_query = await _rewrite_prompt(
        llm, enriched_question, summary_detail, skin_context, skin_label_vn
    )
    context = _retrieve_knowledge(rag_query)
    print(f"[RAG] Retrieved context length: {len(context)} chars")

    final_prompt = f"""Bạn là trợ lý tư vấn da liễu chuyên nghiệp.

Kết quả phân tích da:
{skin_result}

Thông tin loại da:
{skin_context}

Kiến thức chuyên môn (chỉ dùng phần này, không bịa thêm):
{context}

Câu hỏi: {user_question}

Trả lời tiếng Việt, rõ ràng, dễ hiểu. Nếu kiến thức trên không đủ
để trả lời không được bịa và hãy nói rõ thay vì suy đoán.
""".strip()
    return final_prompt

async def get_skin_advice(
    llm: LLMProvider,
    skin_label_vn: str,
    acne_detected: bool,
    darkspot_detected: bool,
    summary_detail: str,
    user_question: str = "Tôi nên chăm sóc da như thế nào?",
    skin_context: str = "",
):

    final_prompt = await build_final_prompt(
        llm, skin_label_vn, acne_detected, darkspot_detected, summary_detail, user_question, skin_context
    )

    return await llm.generate(
        messages=[
            {"role": "user", "content": final_prompt}
        ]
    )

async def stream_skin_advice(
    llm: LLMProvider,
    skin_label_vn: str,
    acne_detected: bool,
    darkspot_detected: bool,
    summary_detail: str,
    user_question: str = "Tôi nên chăm sóc da như thế nào?",
    skin_context: str = "",
) -> AsyncIterator[str]:

    final_prompt = await build_final_prompt(
        llm, skin_label_vn, acne_detected, darkspot_detected, summary_detail, user_question, skin_context
    )

    async for chunk in llm.stream(
        messages=[
            {"role": "user", "content": final_prompt}
        ]
    ):
        yield chunk