from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import os
from datetime import datetime

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"
MEMORY_FILE = "memory.json"

# -------- MEMORY (SAFE & MINIMAL) --------
def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return []
    try:
        with open(MEMORY_FILE, "r") as f:
            content = f.read().strip()
            return json.loads(content) if content else []
    except:
        return []

def save_memory(entry):
    memory = load_memory()
    memory.append(entry)
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)

def find_similar(profile_text):
    memory = load_memory()
    for item in memory:
        if item.get("industry", "").lower() in profile_text.lower():
            return item
    return None

# -------- REPLY SCORE --------
def score_message(message):
    prompt = f"""
Score the following outreach message from 0 to 100.
Return ONLY a number.

Message:
{message}
"""
    try:
        res = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False},
            timeout=60
        )
        digits = "".join(filter(str.isdigit, res.json().get("response", "")))
        return int(digits[:3]) if digits else 50
    except:
        return 50

@app.post("/generate")
def generate(payload: dict):
    profile_text = payload.get("profile_text", "")
    channel = payload.get("channel", "email")
    tone = payload.get("tone", "Formal")
    language = payload.get("language", "English")

    industry = "AI / Tech" if any(k in profile_text.lower() for k in ["ml", "ai", "data"]) else "General"
    role = "Student" if "student" in profile_text.lower() else "Professional"

    similar = find_similar(profile_text)

    channel_rules = {
        "email": "Write a professional cold outreach email (100–120 words).",
        "linkedin": "Write a LinkedIn DM (40–60 words).",
        "whatsapp": "Write a WhatsApp message (25–35 words)."
    }

    tone_rule = (
        "Use a professional, polite tone."
        if tone == "Formal"
        else "Use a casual, friendly, conversational tone."
    )

    # 🔒 HARD LANGUAGE LOCK (THIS FIXES YOUR ISSUE)
    language_rule = {
        "English": "Write the ENTIRE message strictly in English only.",
        "Hindi": "Write the ENTIRE message strictly in Hindi using Devanagari script only.",
        "Hinglish": (
            "Write the ENTIRE message strictly in Hinglish "
            "(English + simple Hindi words in Roman script). "
            "DO NOT write pure English."
        )
    }[language]

    memory_hint = ""
    if similar:
        memory_hint = """
Include exactly ONE natural line implying recent conversations with similar professionals.
"""

    prompt = f"""
SYSTEM RULES (NON-NEGOTIABLE):
- {language_rule}
- If any sentence violates the language rule, REWRITE the full message correctly.
- Do NOT mix other languages.

TASK:
Return ONLY the final message text.

Profile:
{profile_text}

Inferred:
- Role: {role}
- Industry: {industry}

Rules:
- {channel_rules[channel]}
- {tone_rule}
- Highly personalized
- Human and natural
- No AI mention
- End with a soft CTA
{memory_hint}
"""

    res = requests.post(
        OLLAMA_URL,
        json={"model": MODEL, "prompt": prompt, "stream": False},
        timeout=120
    )

    final_text = res.json().get("response", "").strip()
    reply_score = score_message(final_text)

    # Store abstract memory only
    save_memory({
        "timestamp": str(datetime.now()),
        "role": role,
        "industry": industry,
        "channel": channel,
        "tone": tone
    })

    return {
        "response": final_text,
        "reply_score": reply_score
    }
