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

generate = st.button("🚀 Generate Outreach")

# ---- OUTPUT ----
if generate:
    if profile_text.strip() == "":
        st.warning("Please paste profile details")
    else:
        with st.spinner("Generating personalized outreach..."):
            tabs = st.tabs(["📧 Email", "💼 LinkedIn DM", "💬 WhatsApp"])

            for tab, channel in zip(tabs, ["email", "linkedin", "whatsapp"]):
                with tab:
                    col1, col2 = st.columns(2)

                    # ---------- FORMAL ----------
                    with col1:
                        st.subheader("Formal")
                        res_f = requests.post(
                            "http://127.0.0.1:8000/generate",
                            json={
                                "profile_text": profile_text,
                                "channel": channel,
                                "tone": "Formal"
                            }
                        )

                        if res_f.status_code == 200:
                            data = res_f.json()
                            st.write(data.get("response", "No response"))
                            st.caption(f"📊 Reply Likelihood: {data.get('reply_score', 0)}/100")
                        else:
                            st.error("Backend error (Formal)")

                    # ---------- CASUAL ----------
                    with col2:
                        st.subheader("Casual")
                        res_c = requests.post(
                            "http://127.0.0.1:8000/generate",
                            json={
                                "profile_text": profile_text,
                                "channel": channel,
                                "tone": "Casual"
                            }
                        )

                        if res_c.status_code == 200:
                            data = res_c.json()
                            st.write(data.get("response", "No response"))
                            st.caption(f"📊 Reply Likelihood: {data.get('reply_score', 0)}/100")
                        else:
                            st.error("Backend error (Casual)")
