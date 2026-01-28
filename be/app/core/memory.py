import redis
import json
from app.config import settings

# Biến lưu trữ tạm thời trong RAM (Fallback khi không có Redis)
LOCAL_MEMORY = {}

# Kết nối Redis
try:
    rds = redis.Redis(
        host=settings.REDIS_HOST, 
        port=settings.REDIS_PORT, 
        db=settings.REDIS_DB, 
        decode_responses=True,
        socket_connect_timeout=1 # Timeout nhanh nếu không kết nối được
    )
    # Thử ping để check kết nối ngay lập tức
    rds.ping()
    IS_REDIS_AVAILABLE = True
    print("✅ Đã kết nối Redis")
except Exception as e:
    print(f"⚠️ Không thể kết nối Redis ({e}). Chuyển sang chế độ lưu RAM (In-Memory).")
    rds = None
    IS_REDIS_AVAILABLE = False

def get_session(user_id: str):
    # --- CHẾ ĐỘ RAM ---
    if not IS_REDIS_AVAILABLE:
        if user_id not in LOCAL_MEMORY:
            LOCAL_MEMORY[user_id] = {
                "departure_point": None,   
                "destination_point": None,
                "people": None,
                "days": None,
                "stage": "IDLE",
                "language": "vi",
                "history": []
            }
        return LOCAL_MEMORY[user_id]

    # --- CHẾ ĐỘ REDIS ---
    try:
        key = f"session:{user_id}"
        data = rds.get(key)
        
        if not data:
            session = {
                "destination": None, "people": None, "days": None,
                "stage": "IDLE", "language": "vi", "history": []
            }
            rds.set(key, json.dumps(session))
            return session
            
        return json.loads(data)
    except Exception as e:
        print(f"❌ Redis Error Reading: {e}")
        # Fallback về RAM nếu đang chạy mà Redis bị ngắt
        return LOCAL_MEMORY.get(user_id, {
                "destination": None, "people": None, "days": None,
                "stage": "IDLE", "language": "vi", "history": []
        })

def update_session(user_id: str, data: dict):
    # --- CHẾ ĐỘ RAM ---
    if not IS_REDIS_AVAILABLE:
        if user_id not in LOCAL_MEMORY:
            get_session(user_id) # Init nếu chưa có
        LOCAL_MEMORY[user_id].update(data)
        return

    # --- CHẾ ĐỘ REDIS ---
    try:
        current_session = get_session(user_id)
        current_session.update(data)
        key = f"session:{user_id}"
        rds.set(key, json.dumps(current_session))
    except Exception as e:
        print(f"❌ Redis Error Writing: {e}")

def add_history(user_id: str, role: str, content: str):
    """Thêm tin nhắn vào history"""
    session = get_session(user_id)
    session["history"].append({"role": role, "content": content})
    
    # Giới hạn 20 tin nhắn gần nhất
    if len(session["history"]) > 20:
        session["history"] = session["history"][-20:]
        
    update_session(user_id, {"history": session["history"]})