"""
So sánh đầu ra giữa LLM thuần và LLM có RAG
Mục đích: Lấy 2 output để viết vào phần Kết quả thực nghiệm Module 3
"""

import google.generativeai as genai
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# =====================
# 1. KHỞI TẠO
# =====================
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vector_db = FAISS.load_local(
    "vector_store",
    embedding_model,
    allow_dangerous_deserialization=True
)

genai.configure(api_key="AIzaSyBpCdTrGw962F52hArgxtXLtM-at-8e3jU")
model = genai.GenerativeModel("gemini-2.5-flash")


# =====================
# 2. HÀM HỖ TRỢ
# =====================
def format_skin_result(acne_class_detected, severity, darkspot_detected):
    """Định dạng kết quả phân tích da từ Module 1 + Module 2"""
    text = f"Mức độ da: {severity}.\n"
    text += "Có mụn đang hoạt động.\n" if acne_class_detected else "Không phát hiện mụn hoạt động.\n"
    if darkspot_detected:
        text += "Có đốm thâm/tăng sắc tố sau viêm.\n"
    return text


def rewrite_query(user_question, summary_detail):
    """Query Rewriting - Gọi Gemini lần 1 để tối ưu truy vấn"""
    prompt = f"""
    Tình trạng bệnh nhân: {summary_detail}
    Câu hỏi người dùng: {user_question}
    Viết lại thông tin câu hỏi người dùng, mục đích để tìm kiếm tài liệu liên quan trong vector DB.
    Trả lời ngắn gọn, chỉ tập trung vào từ khóa chính.
    """
    return model.generate_content(prompt).text


def retrieve_knowledge(query, k=3):
    """Truy xuất top-k đoạn tài liệu liên quan từ FAISS"""
    docs = vector_db.similarity_search(query, k=k)
    return "\n\n".join([doc.page_content for doc in docs])


# =====================
# 3. RAG CHATBOT
# =====================
def ask_with_rag(user_question, acne_class_detected, severity, darkspot_detected):
    """Trả lời CÓ RAG - Có truy xuất tri thức từ AAD"""
    skin_result = format_skin_result(acne_class_detected, severity, darkspot_detected)

    # Bước 1: Query Rewriting (Gemini call #1)
    rewritten_query = rewrite_query(user_question, skin_result)

    # Bước 2: Retrieval (FAISS Semantic Search)
    context = retrieve_knowledge(rewritten_query)

    # Bước 3: Generation với context (Gemini call #2)
    prompt = f"""
Bạn là trợ lý tư vấn da liễu.

Kết quả phân tích da từ hệ thống AI:
{skin_result}

Kiến thức chuyên môn:
{context}

Câu hỏi người dùng: {user_question}

Chỉ sử dụng thông tin từ phần kiến thức.
Nếu không có thông tin, hãy nói không đủ dữ liệu.
Trả lời bằng ngôn ngữ tự nhiên, dễ hiểu.
"""
    return model.generate_content(prompt).text


# =====================
# 4. PURE LLM (KHÔNG RAG)
# =====================
def ask_without_rag(user_question, acne_class_detected, severity, darkspot_detected):
    """Trả lời KHÔNG RAG - Chỉ dùng LLM thuần, không có tri thức ngoài"""
    skin_result = format_skin_result(acne_class_detected, severity, darkspot_detected)

    prompt = f"""
Bạn là trợ lý tư vấn da liễu.

Kết quả phân tích da từ hệ thống AI:
{skin_result}

Câu hỏi người dùng: {user_question}

Trả lời bằng ngôn ngữ tự nhiên, dễ hiểu.
"""
    return model.generate_content(prompt).text


# =====================
# 5. TEST - SO SÁNH 2 OUTPUT
# =====================
if __name__ == "__main__":
    # Cấu hình test case
    test_case = {
        "user_question": "Tôi có da xấu và 3 acne và 2 spot thì làm sao để giảm. "
                         "Hãy đưa ra lời khuyên chi tiết bao gồm: Routine skincare, "
                         "Hoạt chất phù hợp và Lưu ý.",
        "acne_class_detected": True,
        "severity": "Moderate",
        "darkspot_detected": True
    }

    print("=" * 70)
    print("ĐẦU VÀO TEST")
    print("=" * 70)
    print(f"Câu hỏi: {test_case['user_question']}")
    print(f"Tình trạng da: {test_case['severity']}")
    print(f"Phát hiện mụn: {test_case['acne_class_detected']}")
    print(f"Phát hiện đốm thâm: {test_case['darkspot_detected']}")

    # ─────────────────────────────────────────────
    # OUTPUT 1: LLM THUẦN (Không RAG)
    # ─────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("📤 OUTPUT 1: LLM THUẦN (KHÔNG CÓ RAG)")
    print("=" * 70)
    output_pure_llm = ask_without_rag(**test_case)
    print(output_pure_llm)

    # ─────────────────────────────────────────────
    # OUTPUT 2: LLM + RAG
    # ─────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("📤 OUTPUT 2: LLM + RAG (CÓ TRUY XUẤT TRI THỨC TỪ AAD)")
    print("=" * 70)
    output_rag = ask_with_rag(**test_case)
    print(output_rag)

    # ─────────────────────────────────────────────
    # GHI FILE ĐỂ DÁN VÀO BÁO CÁO
    # ─────────────────────────────────────────────
    with open("comparison_output.txt", "w", encoding="utf-8") as f:
        f.write("=" * 70 + "\n")
        f.write("SO SÁNH ĐẦU RA: LLM THUẦN vs LLM + RAG\n")
        f.write("=" * 70 + "\n\n")
        f.write(f"CÂU HỎI: {test_case['user_question']}\n\n")
        f.write(f"TÌNH TRẠNG DA: {test_case['severity']}\n")
        f.write(f"PHÁT HIỆN MỤN: {test_case['acne_class_detected']}\n")
        f.write(f"PHÁT HIỆN ĐỐM THÂM: {test_case['darkspot_detected']}\n\n")
        f.write("─" * 70 + "\n")
        f.write("OUTPUT 1 — LLM THUẦN (KHÔNG RAG)\n")
        f.write("─" * 70 + "\n")
        f.write(output_pure_llm + "\n\n")
        f.write("─" * 70 + "\n")
        f.write("OUTPUT 2 — LLM + RAG\n")
        f.write("─" * 70 + "\n")
        f.write(output_rag + "\n")

    print("\n" + "=" * 70)
    print("✅ Đã lưu kết quả so sánh vào file 'comparison_output.txt'")
    print("=" * 70)