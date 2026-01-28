def build_intent_prompt(session, current_message):
    history_text = ""
    if session.get("history"):
        for h in session["history"][-6:]:
            role = "User" if h["role"] == "user" else "Assistant"
            history_text += f"{role}: {h['content']}\n"

    return f"""
Bạn là AI đặt tour. Phân tích câu nói để trích xuất thông tin.

Lịch sử chat:
{history_text}

Câu người dùng: "{current_message}"

Nhiệm vụ:
1. Xác định Intent (Mục đích).
2. Tách rõ "Điểm xuất phát" (departure_point) và "Điểm đến" (destination_point).
   - Ví dụ: "Tôi muốn đi Đà Nẵng từ Hà Nội" -> departure: "Hà Nội", destination: "Đà Nẵng".
   - Ví dụ: "Đi chơi Sapa" -> departure: null, destination: "Sapa".
3. Xác định số người, số ngày.

Format JSON bắt buộc:
{{
  "intent": "GREETING" | "SEARCH_TOUR" | "BOOK_TOUR" | "UNKNOWN",
  "departure_point": string (Nơi đi) hoặc null,
  "destination_point": string (Nơi đến) hoặc null,
  "people": number hoặc null,
  "days": number hoặc null,
  "language": "vi" | "en"
}}
"""

SYSTEM_INSTRUCTION = """
Bạn là trợ lý du lịch chuyên nghiệp. 
Hãy trả lời câu hỏi một cách ngắn gọn, thân thiện bằng ngôn ngữ: {lang}.
**Yêu cầu định dạng:** Sử dụng Markdown (in đậm, gạch đầu dòng, heading, code block) để câu trả lời dễ đọc hơn.
"""