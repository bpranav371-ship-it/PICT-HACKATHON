import streamlit as st
import requests

st.set_page_config(page_title="Offline Outreach Engine", layout="wide")

st.title("🧠 Offline AI Outreach Engine")
st.caption("Personalized • Private • Offline")

profile_text = st.text_area(
    "Paste LinkedIn profile / bio / details",
    height=220,
    placeholder="Name, role, company, skills, interests..."
)

language = st.selectbox(
    "Select output language",
    ["English", "Hindi", "Hinglish"]
)

st.info(f"🌐 Generating messages in **{language}**")

generate = st.button("🚀 Generate Outreach")

if generate:
    if not profile_text.strip():
        st.warning("Please paste profile details")
    else:
        with st.spinner("Generating personalized outreach..."):
            tabs = st.tabs(["📧 Email", "💼 LinkedIn DM", "💬 WhatsApp"])

            for tab, channel in zip(tabs, ["email", "linkedin", "whatsapp"]):
                with tab:
                    col1, col2 = st.columns(2)

                    for col, tone in [(col1, "Formal"), (col2, "Casual")]:
                        with col:
                            st.subheader(tone)
                            res = requests.post(
                                "http://127.0.0.1:8000/generate",
                                json={
                                    "profile_text": profile_text,
                                    "channel": channel,
                                    "tone": tone,
                                    "language": language
                                },
                                timeout=120
                            )

                            if res.status_code == 200:
                                data = res.json()
                                st.write(data["response"])
                                st.caption(f"📊 Reply Likelihood: {data['reply_score']}/100")
                            else:
                                st.error("Backend error")
