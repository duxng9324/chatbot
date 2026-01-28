from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

class IntentData(BaseModel):
    intent: str
    departure_point: Optional[str] = None   
    destination_point: Optional[str] = None 
    people: Optional[int] = None
    days: Optional[int] = None
    language: str = "vi"

class Message(BaseModel):
    role: str       # "user" hoặc "ai"
    content: str    # Nội dung tin nhắn

class HistoryResponse(BaseModel):
    user_id: str
    history: List[Message]