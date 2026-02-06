from fastapi import FastAPI
import requests
import json
import os
from datetime import datetime

app = FastAPI()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:3b"
MEMORY_FILE = "memory.json"


# ---- MEMORY HELPERS ----
def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return []
    with open(MEMORY_FILE, "r") as f:
        return json.load(f)


def save_memory(entry):
    memory = load_memory()
    memory.append(entry)
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)


def find_similar(profile_text):
    memory = load_memory()
    for item in memory:
        if item["industry"].lower() in profile_text.lower():
            return item
    return None


@app.get("/")
def home():
    return {"status": "Backend running 🚀"}


@app.post("/generate")
def generate(payload: dict):
    profile_text = payload.get("profile_text", "")
    channel = payload.get("channel", "email")
    tone = payload.get("tone", "Formal")

    # 🔹 VERY SIMPLE inference (hackathon-friendly)
    industry = "AI / Tech" if "ml" in profile_text.lower() or "ai" in profile_text.lower() else "General"
    role = "Student" if "student" in profile_text.lower() else "Professional"

    similar = find_similar(profile_text)

    channel_rules = {
        "email": "Write a professional cold outreach email (100–120 words).",
        "linkedin": "Write a short LinkedIn DM (40–60 words).",
        "whatsapp": "Write a concise WhatsApp message (25–35 words)."
    }

    tone_rule = (
        "Use a professional tone."
        if tone == "Formal"
        else "Use a casual, friendly tone."
    )

    memory_hint = ""
    if similar:
        memory_hint = f"""
You may naturally reference that we recently interacted with someone in a similar role or industry.
"""

    prompt = f"""
You are an AI that writes highly personalized cold outreach messages.

Profile Information:
{profile_text}

Inferred:
- Role: {role}
- Industry: {industry}

Instructions:
- {channel_rules[channel]}
- {tone_rule}
- Do not sound generic
- Do not mention AI
- End with a soft CTA
{memory_hint}

Write the message now.
"""

    data = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=data)
    result = response.json()
    final_text = result.get("response", "")

    # 🔹 SAVE TO MEMORY
    save_memory({
        "timestamp": str(datetime.now()),
        "role": role,
        "industry": industry,
        "profile_summary": profile_text[:200],
        "channel": channel,
        "tone": tone,
        "message": final_text
    })

    return {"response": final_text}
