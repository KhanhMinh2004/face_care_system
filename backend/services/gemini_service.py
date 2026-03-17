import google.generativeai as genai

# Hàm gọi Gemini API
def ask_gemini(prompt: str) -> str:
    genai.configure(api_key="AIzaSyA5qWAFjnlHPxKuq5Pgv1AhC6CCa_qrR9c")
    model = genai.GenerativeModel("gemini-2.5-flash")

    response = model.generate_content(prompt)
    return response.text
