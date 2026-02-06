import streamlit as st
import requests

st.set_page_config(page_title="Offline Outreach Engine", layout="wide")

st.title("🧠 Offline AI Outreach Engine")
st.caption("Personalized • Private • Offline")

# ---- INPUT ----
profile_text = st.text_area(
    "Paste LinkedIn profile / bio / details",
    height=220,
    placeholder="Name, role, company, skills, interests..."
)

tone = st.radio(
    "Select tone",
    ["Formal", "Casual"],
    horizontal=True
)

generate = st.button("🚀 Generate Outreach")

# ---- OUTPUT ----
if generate:
    if profile_text.strip() == "":
        st.warning("Please paste profile details")
    else:
        with st.spinner("Generating personalized outreach..."):
            tabs = st.tabs(["📧 Email", "💼 LinkedIn DM", "💬 WhatsApp"])

            for tab, channel in zip(
                tabs, ["email", "linkedin", "whatsapp"]
            ):
                with tab:
                    res = requests.post(
                        "http://127.0.0.1:8000/generate",
                        json={
                            "profile_text": profile_text,
                            "channel": channel,
                            "tone": tone
                        }
                    )
                    st.write(res.json()["response"])
