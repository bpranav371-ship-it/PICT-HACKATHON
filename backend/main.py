from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import requests
import json
import os
from datetime import datetime

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"
MEMORY_FILE = "memory.json"

def load_memory():
    if not os.path.exists(MEMORY_FILE): return []
    try:
        with open(MEMORY_FILE, "r") as f:
            content = f.read().strip()
            return json.loads(content) if content else []
    except: return []

def save_memory(entry):
    memory = load_memory()
    memory.append(entry)
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)

def find_similar_industry(current_industry):
    memory = load_memory()
    for item in memory:
        if item.get("industry") == current_industry:
            return item
    return None

def score_message(message):
    prompt = f"Score this outreach from 0 to 100 based on reply probability. Return ONLY the number.\n\nMessage:\n{message}"
    try:
        res = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False},
            timeout=60
        )
        digits = "".join(filter(str.isdigit, res.json().get("response", "")))
        return int(digits[:3]) if digits else 50
    except: return 50

@app.post("/generate")
async def generate(payload: dict):
    profile_text = payload.get("profile_text", "")
    channel = payload.get("channel", "email")
    tone = payload.get("tone", "Formal")
    language = payload.get("language", "English")

    industry = "AI / Tech" if any(k in profile_text.lower() for k in ["ml", "ai", "data"]) else "General"
    role = "Student" if "student" in profile_text.lower() else "Professional"
    similar = find_similar_industry(industry)

    channel_rules = {
        "email": "Write a professional cold outreach email (100–120 words).",
        "linkedin": "Write a LinkedIn DM (40–60 words).",
        "whatsapp": "Write a WhatsApp message (25–35 words)."
    }
    tone_rule = "Use a professional tone." if tone == "Formal" else "Use a casual, conversational tone."
    
    language_rule = {
        "English": "strictly in English.",
        "Hindi": "strictly in Hindi (Devanagari script only).",
        "Hinglish": "strictly in Hinglish (English + simple Hindi words in Roman script). DO NOT write pure English."
    }[language]

    memory_hint = "Mention interest in their specific field based on past context." if similar else ""

    prompt = f"""
    SYSTEM RULES (NON-NEGOTIABLE):
    - Write {language_rule}. 
    - Do NOT mix other languages.
    - If any sentence violates the language rule, REWRITE the full message correctly.

    TASK:
    Return ONLY the final message text. No chat intro.

    Profile: {profile_text}
    Inferred: Role: {role} | Industry: {industry}

    Rules:
    - {channel_rules[channel]}
    - {tone_rule}
    - Highly personalized | Human and natural | No AI mention
    - End with a soft CTA
    {memory_hint}
    """

    def stream_tokens():
        full_response = ""
        try:
            if similar:
                yield "||CONTEXT:MATCH||"

            with requests.post(
                OLLAMA_URL,
                json={"model": MODEL, "prompt": prompt, "stream": True},
                stream=True,
                timeout=300
            ) as r:
                for line in r.iter_lines():
                    if line:
                        chunk = json.loads(line.decode('utf-8'))
                        token = chunk.get("response", "")
                        full_response += token
                        yield token 
                        
                        if chunk.get("done"):
                            score = score_message(full_response)
                            save_memory({"timestamp": str(datetime.now()), "role": role, "industry": industry, "channel": channel, "tone": tone})
                            yield f"||SCORE:{score}||"
                            break
        except Exception as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(stream_tokens(), media_type="text/plain")