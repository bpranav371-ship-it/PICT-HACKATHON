from fastapi import FastAPI
import requests
import json
import os
from datetime import datetime

app = FastAPI()

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

# -------- SCORE --------
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

    industry = "AI / Tech" if any(k in profile_text.lower() for k in ["ml", "ai", "data"]) else "General"
    role = "Student" if "student" in profile_text.lower() else "Professional"

    similar = find_similar(profile_text)

    channel_rules = {
        "email": "Write a professional cold outreach email (100–120 words).",
        "linkedin": "Write a short LinkedIn DM (40–60 words).",
        "whatsapp": "Write a concise WhatsApp message (25–35 words)."
    }

    tone_rule = (
        "Use a professional, polite tone."
        if tone == "Formal"
        else "Use a casual, friendly, conversational tone."
    )

    memory_hint = ""
    if similar:
        memory_hint = """
Include ONE natural line implying recent conversations with similar professionals,
without naming anyone.
"""

    prompt = f"""
You are an expert cold outreach writer.

TASK:
Return ONLY the final message text.
No explanations. No headings. No analysis.

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

    # ✅ STORE ONLY ABSTRACT MEMORY
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
