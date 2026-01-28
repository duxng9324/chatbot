import requests
import json
import re
from app.config import settings
from app.core.prompts import build_intent_prompt, SYSTEM_INSTRUCTION
from app.schemas.chat import IntentData

def extract_json(text: str):
    match = re.search(r"\{[\s\S]*\}", text)
    return match.group(0) if match else None

def normalize_days(days):
    if isinstance(days, str):
        match = re.search(r"\d+", days)
        return int(match.group()) if match else None
    return days

def call_ollama_intent(session: dict, message: str) -> IntentData:
    prompt = build_intent_prompt(session, message)
    payload = {"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}

    try:
        res = requests.post(settings.OLLAMA_URL, json=payload, timeout=60)
        res.raise_for_status()
        raw = res.json().get("response", "")
        
        json_text = extract_json(raw)
        if not json_text:
            return IntentData(intent="UNKNOWN")

        data = json.loads(json_text)
        
        # Chuẩn hóa
        data["days"] = normalize_days(data.get("days"))
        try:
            if data.get("people"): data["people"] = int(data.get("people"))
        except:
            data["people"] = None
            
        return IntentData(**data)
        
    except Exception as e:
        print(f"❌ Ollama Error: {e}")
        return IntentData(intent="UNKNOWN")

def call_ollama_chat(message: str, lang: str) -> str:
    prompt = f"{SYSTEM_INSTRUCTION.format(lang=lang)}\nUser: {message}"
    payload = {"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}
    try:
        res = requests.post(settings.OLLAMA_URL, json=payload, timeout=120)
        return res.json().get("response", "")
    except:
        return "Service unavailable."