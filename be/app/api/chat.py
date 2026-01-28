from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse, HistoryResponse, Message
from app.core.memory import get_session, update_session, add_history
from app.services import llm_service, tour_service
from app.core import i18n

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    user_id = req.user_id

    # 1. Lưu tin nhắn User vào History
    add_history(user_id, "user", req.message)
    
    # Lấy session
    session = get_session(user_id)
    
    # 2. Phân tích Intent
    intent_data = llm_service.call_ollama_intent(session, req.message)
    
    # 3. Update Session Context
    updates = {}
    if intent_data.language: updates["language"] = intent_data.language
    if intent_data.departure_point: updates["departure_point"] = intent_data.departure_point
    if intent_data.destination_point: updates["destination_point"] = intent_data.destination_point
    if intent_data.people: updates["people"] = intent_data.people
    if intent_data.days: updates["days"] = intent_data.days
    
    if updates:
        update_session(user_id, updates)
        session = get_session(user_id)
    
    current_lang = session.get("language", "vi")
    intent = intent_data.intent
    reply_text = ""

    # 4. Xử lý Logic
    
    # --- Greeting / Unknown ---
    if intent in ["GREETING", "UNKNOWN"]:
        reply_text = llm_service.call_ollama_chat(req.message, current_lang)

    # --- Booking ---
    elif intent == "BOOK_TOUR":
        update_session(user_id, {"stage": "BOOKING"})
        reply_text = i18n.get_msg(current_lang, "book_req")

    # --- Search Tour ---
    elif intent == "SEARCH_TOUR" or session["stage"] == "SEARCHING":
        update_session(user_id, {"stage": "SEARCHING"})
        
        # Lấy thông tin từ session
        dep = session.get("departure_point")
        dest = session.get("destination_point")
        people = session.get("people")
        days = session.get("days")

        # LOGIC MỚI: Kiểm tra từng bước
        if not dest:
            # 1. Chưa có điểm đến -> Hỏi điểm đến
            reply_text = i18n.get_msg(current_lang, "ask_dest")
            
        elif not dep:
            # 2. Có điểm đến rồi, nhưng chưa có điểm đi -> Hỏi điểm đi (MỚI)
            reply_text = i18n.get_msg(current_lang, "ask_dep")
            
        elif not people:
            # 3. Đã có Đi/Đến -> Hỏi số người
            reply_text = i18n.get_msg(current_lang, "ask_people", dest=dest, dep=dep)
            
        elif not days:
            # 4. Đã có Đi/Đến/Người -> Hỏi số ngày
            reply_text = i18n.get_msg(current_lang, "ask_days")
            
        else:
            # 5. Đủ 4 thông tin -> Tìm kiếm
            tours = tour_service.search_tours(dep, dest, people, days)
            
            if not tours:
                reply_text = i18n.get_msg(current_lang, "no_tour", dest=dest, dep=dep, days=days)
            else:
                intro = i18n.get_msg(current_lang, "found_tour", count=len(tours), dest=dest, dep=dep, days=days, people=people)
                list_text = "\n".join([i18n.format_tour_card(t, i, current_lang) for i, t in enumerate(tours, 1)])
                cta = i18n.get_msg(current_lang, "cta")
                reply_text = f"{intro}\n\n{list_text}\n{cta}"

    # Fallback
    if not reply_text:
        reply_text = llm_service.call_ollama_chat(req.message, current_lang)

    # 5. Lưu câu trả lời
    add_history(user_id, "ai", reply_text)

    return ChatResponse(reply=reply_text)

@router.get("/history/{user_id}", response_model=HistoryResponse)
def get_chat_history(user_id: str):
    """Lấy toàn bộ lịch sử chat của User"""
    
    # 1. Lấy session từ Redis (hoặc RAM)
    session = get_session(user_id)

    print("user_id:", user_id)
    print("session:", session)
    
    # 2. Lấy list history (Mặc định là rỗng nếu chưa có)
    raw_history = session.get("history", [])
    
    # 3. Trả về đúng định dạng Schema
    return HistoryResponse(
        user_id=user_id,
        history=raw_history
    )

# --- (Optional) ENDPOINT XÓA HISTORY ---
@router.delete("/history/{user_id}")
def clear_chat_history(user_id: str):
    """Xóa lịch sử chat để bắt đầu lại"""
    try:
        # Import rds từ memory để xóa key
        from app.core.memory import rds, LOCAL_MEMORY, IS_REDIS_AVAILABLE
        
        key = f"session:{user_id}"
        
        if IS_REDIS_AVAILABLE and rds:
            rds.delete(key)
        else:
            if user_id in LOCAL_MEMORY:
                del LOCAL_MEMORY[user_id]
                
        return {"status": "success", "message": "Đã xóa lịch sử chat"}
    except Exception as e:
        return {"status": "error", "message": str(e)}