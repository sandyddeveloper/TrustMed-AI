import os
import json
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False
    logger.warning("google-genai package not found. Fallback clinical summarizer will be used.")

# Dictionary of clinical benchmarks, zero-medical-knowledge explanations, and reference ranges
BIOMARKER_BENCHMARKS = {
    "glucose_level": {
        "title": "Blood Sugar (Glucose)",
        "unit": "mg/dL",
        "normal_range": "70 – 99 mg/dL",
        "optimal_max": 99.0,
        "borderline_max": 125.0,
        "why_it_matters": "Blood sugar is the main fuel your body gets from food. When sugar stays high, it puts extra strain on blood vessels and organs.",
        "high_explanation": "Your blood sugar reading is higher than normal. Your cells are having difficulty absorbing sugar from your blood for daily energy.",
        "normal_explanation": "Your blood sugar is in a healthy, steady range.",
        "action_tip": "Cut back on sweet sodas, juices, and refined flour. A 15-minute walk after meals helps muscles absorb excess blood sugar.",
        "doctor_q": "What is my latest 3-month average blood sugar (HbA1c test)?",
    },
    "glucose": {
        "title": "Blood Sugar (Glucose)",
        "unit": "mg/dL",
        "normal_range": "70 – 99 mg/dL",
        "optimal_max": 99.0,
        "borderline_max": 125.0,
        "why_it_matters": "Blood sugar is the main fuel your body gets from food. When sugar stays high, it puts extra strain on blood vessels and organs.",
        "high_explanation": "Your blood sugar reading is higher than normal. Your cells are having difficulty absorbing sugar from your blood for daily energy.",
        "normal_explanation": "Your blood sugar is in a healthy, steady range.",
        "action_tip": "Cut back on sweet sodas, juices, and refined flour. A 15-minute walk after meals helps muscles absorb excess blood sugar.",
        "doctor_q": "What is my latest 3-month average blood sugar (HbA1c test)?",
    },
    "bmi": {
        "title": "Body Mass Index (BMI)",
        "unit": "kg/m²",
        "normal_range": "18.5 – 24.9 kg/m²",
        "optimal_max": 24.9,
        "borderline_max": 29.9,
        "why_it_matters": "BMI compares your weight to your height. Extra body fat around the waist makes it harder for natural insulin to work.",
        "high_explanation": "Your weight is higher than the recommended range for your height, creating insulin resistance and metabolic strain.",
        "normal_explanation": "Your weight-to-height ratio is in a balanced, healthy range.",
        "action_tip": "Focus on high-fiber foods, fresh vegetables, and mindful portion sizes rather than crash diets.",
        "doctor_q": "What is a safe, sustainable target weight and body composition for my height and age?",
    },
    "blood_pressure": {
        "title": "Blood Pressure",
        "unit": "mmHg",
        "normal_range": "< 120 mmHg (Systolic)",
        "optimal_max": 119.0,
        "borderline_max": 129.0,
        "why_it_matters": "Measures how hard your blood pushes against your artery walls as your heart pumps.",
        "high_explanation": "Your blood is pushing harder against your blood vessel walls, putting extra workload on your heart and circulation.",
        "normal_explanation": "Your blood pressure is smooth and gentle on your heart and arteries.",
        "action_tip": "Lower sodium/salt intake, stay well hydrated, and practice 5 minutes of deep breathing daily.",
        "doctor_q": "Should I keep a home blood pressure log morning and evening?",
    },
    "insulin": {
        "title": "Fasting Insulin",
        "unit": "μU/mL",
        "normal_range": "2.6 – 24.9 μU/mL",
        "optimal_max": 24.9,
        "borderline_max": 49.9,
        "why_it_matters": "Insulin is the natural 'key' your pancreas produces to unlock cells so glucose can enter and provide energy.",
        "high_explanation": "Your pancreas is working overtime making extra insulin to keep blood sugar under control.",
        "normal_explanation": "Your insulin production is functioning smoothly to balance your sugar.",
        "action_tip": "Include lean proteins and healthy fats with carbohydrates to prevent sudden insulin spikes.",
        "doctor_q": "Do I have signs of insulin resistance, and would fasting glucose/insulin ratios be helpful?",
    },
    "age": {
        "title": "Age Factor",
        "unit": "years",
        "normal_range": "Adult Lifecycle",
        "optimal_max": 45.0,
        "borderline_max": 60.0,
        "why_it_matters": "As we get older, our metabolism naturally slows down and body tissues process sugars more slowly.",
        "high_explanation": "Natural aging makes proactive lifestyle habits and routine checkups even more effective.",
        "normal_explanation": "Your age profile is in an active, resilient range.",
        "action_tip": "Incorporate light resistance training (like bodyweight squats or resistance bands) twice weekly to preserve muscle mass.",
        "doctor_q": "What age-specific preventive health screenings are recommended for me this year?",
    },
    "cholesterol": {
        "title": "Total Cholesterol",
        "unit": "mg/dL",
        "normal_range": "< 200 mg/dL",
        "optimal_max": 199.0,
        "borderline_max": 239.0,
        "why_it_matters": "Cholesterol is a fat-like substance in your blood. High levels can slowly build up on artery walls.",
        "high_explanation": "Blood fats are elevated, which can affect cardiovascular circulation over time.",
        "normal_explanation": "Your blood fats are well-balanced.",
        "action_tip": "Swap saturated cooking fats with olive oil, nuts, and omega-3 rich foods like flaxseeds.",
        "doctor_q": "Should we check my full lipid profile (LDL, HDL, and Triglycerides)?",
    },
    "heart_rate": {
        "title": "Resting Heart Rate",
        "unit": "bpm",
        "normal_range": "60 – 100 bpm",
        "optimal_max": 85.0,
        "borderline_max": 100.0,
        "why_it_matters": "How many times your heart beats each minute when you are sitting quietly.",
        "high_explanation": "Your resting pulse is elevated, meaning your heart is working faster than usual.",
        "normal_explanation": "Your heart has a steady, relaxed resting rhythm.",
        "action_tip": "Ensure 7-8 hours of quality sleep and reduce high-caffeine energy drinks.",
        "doctor_q": "Is my resting heart rate within expected limits for my physical activity level?",
    },
    "skin_thickness": {
        "title": "Subcutaneous Fat Distribution",
        "unit": "mm",
        "normal_range": "10 – 30 mm",
        "optimal_max": 25.0,
        "borderline_max": 35.0,
        "why_it_matters": "An indicator of body fat distribution.",
        "high_explanation": "Higher body fat reserves contribute to metabolic resistance.",
        "normal_explanation": "Healthy body fat distribution.",
        "action_tip": "Consistent daily movement helps mobilize body fat stores.",
        "doctor_q": "How does my body composition affect my overall risk profile?",
    },
    "pregnancies": {
        "title": "Pregnancy History",
        "unit": "count",
        "normal_range": "Obstetric Profile",
        "optimal_max": 2.0,
        "borderline_max": 5.0,
        "why_it_matters": "Pregnancies temporarily alter hormones and glucose tolerance.",
        "high_explanation": "Past gestational hormone shifts slightly contribute to long-term metabolic risk.",
        "normal_explanation": "No significant pregnancy-related metabolic strain.",
        "action_tip": "Maintain regular metabolic screening postpartum and into adulthood.",
        "doctor_q": "Did my pregnancy history indicate any risk of gestational diabetes?",
    },
}


class GeminiService:
    """
    Google Gemini Clinical AI Engine for Explainable Biomarker Attributions and Summarization.
    """

    def __init__(self):
        self.model_name = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

    def _get_client(self) -> Optional[Any]:
        api_key = getattr(settings, "GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "")
        if not api_key or not HAS_GENAI:
            return None
        try:
            return genai.Client(api_key=api_key)
        except Exception as e:
            logger.warning(f"Failed to initialize Google GenAI client: {e}")
            return None

    def generate_summary(self, text_to_summarize: str) -> str:
        """
        Generates a concise, clear summary of input text using Google Gemini 2.5 Flash.
        """
        client = self._get_client()
        if not client:
            return self._fallback_text_summary(text_to_summarize)

        prompt = f"Provide a clear, simple, and easy-to-understand summary of the following text in plain English:\n\n{text_to_summarize}"
        try:
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            if response and hasattr(response, "text") and response.text:
                return response.text.strip()
            return self._fallback_text_summary(text_to_summarize)
        except Exception as e:
            logger.error(f"Gemini generate_summary API error: {e}")
            return self._fallback_text_summary(text_to_summarize)

    def explain_biomarkers(
        self,
        patient_id: str,
        prediction_label: str,
        risk_score: float,
        model_type: str,
        xai_method: str,
        attributions: List[Dict[str, Any]],
        vitals: Optional[Dict[str, float]] = None,
        language: str = "en",
    ) -> Dict[str, Any]:
        """
        Generates a 100% human-friendly, plain-language explanation designed for
        someone with ZERO medical knowledge, translating complex AI Shapley values into clear insights.
        """
        client = self._get_client()

        # Extract positive (risk-increasing) and negative (protective) features
        pos_features = [
            a for a in attributions
            if a.get("direction") == "positive" or (a.get("importance", 0) > 0 and not a.get("direction"))
        ]
        neg_features = [
            a for a in attributions
            if a.get("direction") == "negative" or (a.get("importance", 0) < 0)
        ]

        pos_sorted = sorted(pos_features, key=lambda x: abs(x.get("importance", 0)), reverse=True)
        neg_sorted = sorted(neg_features, key=lambda x: abs(x.get("importance", 0)), reverse=True)

        # Generate structured biomarker highlights
        highlights = self._build_biomarker_highlights(attributions, vitals)

        # Generate doctor questions and lifestyle tips
        doctor_questions = self._build_doctor_questions(pos_sorted)
        lifestyle_tips = self._build_lifestyle_tips(pos_sorted)

        if not client:
            logger.info("Using built-in human-friendly clinical explainability engine (GEMINI_API_KEY not configured)")
            summary_text = self._fallback_biomarker_explanation(
                patient_id=patient_id,
                prediction_label=prediction_label,
                risk_score=risk_score,
                model_type=model_type,
                xai_method=xai_method,
                pos_features=pos_sorted,
                neg_features=neg_sorted,
                vitals=vitals,
                language=language,
            )
            return {
                "summary": summary_text,
                "provider": "TrustMed Human-First Clinical AI",
                "model": "plain-language-engine",
                "is_live": False,
                "doctor_questions": doctor_questions,
                "lifestyle_tips": lifestyle_tips,
                "biomarker_highlights": highlights,
            }

        # Build prompt for Gemini with strict plain-English rules
        lang_instruction = "Write in simple, conversational English."
        if language == "ta":
            lang_instruction = "Write in simple, warm, everyday Tamil (தமிழ்) that any common person can easily understand."
        elif language == "hi":
            lang_instruction = "Write in simple, warm, everyday Hindi (हिन्दी) that any common person can easily understand."

        risk_percentage = f"{risk_score * 100:.1f}%"

        prompt = f"""You are a warm, caring, and encouraging medical doctor explaining health check results to a patient who has ZERO medical knowledge.
Your goal is to explain their test results in simple, everyday language so they feel informed, empowered, and not scared.

PATIENT REPORT DETAILS:
- Patient ID: {patient_id}
- Assessed Risk Level: {prediction_label} (Estimated risk probability: {risk_percentage})
- Recorded Health Numbers: {vitals or 'Standard Clinical Panel'}

KEY HEALTH NUMBERS RAISING RISK:
{chr(10).join([f"- {f.get('feature')}: measured value = {f.get('value')}" for f in pos_sorted[:4]])}

GOOD HEALTH NUMBERS PROTECTING THEM:
{chr(10).join([f"- {f.get('feature')}: measured value = {f.get('value')}" for f in neg_sorted[:4]])}

CRITICAL RULES FOR YOUR EXPLANATION:
1. NO MEDICAL JARGON: NEVER use technical words like 'Shapley attribution', 'SHAP', 'XGBoost', 'biomarker trajectory', 'mitigating clinical severity', or 'metabolic review'.
2. CLEAR STRUCTURE:
   - 🌟 **What Does Your Health Result Mean?**: Explain what {risk_percentage} risk means in simple, reassuring words (it's an early warning alert to take care of your body, NOT a permanent diagnosis).
   - ⚠️ **The Health Numbers Raising Your Risk (Why is it high?)**: For each high factor (like Blood Sugar or BMI), explain in 1-2 easy sentences WHAT it is, and WHY it raises risk in everyday terms (e.g. how extra sugar stays in the blood or how body weight makes insulin work harder).
   - 🛡️ **The Good News (What Is Working For You)**: Mention the healthy numbers that are protecting them and keeping them strong.
   - 💡 **Simple, Everyday Steps You Can Take Today**: 3 easy, practical daily lifestyle tips (e.g., a 20-minute walk after meals, drinking water instead of soda/sugar, seeing their doctor for a routine follow-up).
3. {lang_instruction}
4. Keep the tone warm, clear, and reassuring.
"""

        try:
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            if response and hasattr(response, "text") and response.text:
                return {
                    "summary": response.text.strip(),
                    "provider": "Google Gemini",
                    "model": self.model_name,
                    "is_live": True,
                    "doctor_questions": doctor_questions,
                    "lifestyle_tips": lifestyle_tips,
                    "biomarker_highlights": highlights,
                }
        except Exception as e:
            logger.error(f"Gemini explain_biomarkers API error: {e}")

        # Fallback if API call fails
        fallback_summary = self._fallback_biomarker_explanation(
            patient_id=patient_id,
            prediction_label=prediction_label,
            risk_score=risk_score,
            model_type=model_type,
            xai_method=xai_method,
            pos_features=pos_sorted,
            neg_features=neg_sorted,
            vitals=vitals,
            language=language,
        )
        return {
            "summary": fallback_summary,
            "provider": "TrustMed Human-First Clinical AI",
            "model": "plain-language-engine",
            "is_live": False,
            "doctor_questions": doctor_questions,
            "lifestyle_tips": lifestyle_tips,
            "biomarker_highlights": highlights,
        }

    def _build_biomarker_highlights(
        self,
        attributions: List[Dict[str, Any]],
        vitals: Optional[Dict[str, float]] = None,
    ) -> List[Dict[str, Any]]:
        highlights = []
        for attr in attributions:
            feat_name = attr.get("feature", "")
            feat_key = feat_name.lower()
            val = attr.get("value")
            if val is None and vitals and feat_key in vitals:
                val = vitals[feat_key]

            info = BIOMARKER_BENCHMARKS.get(feat_key, {
                "title": feat_name.replace("_", " ").title(),
                "unit": "",
                "normal_range": "Standard Reference Range",
                "optimal_max": 999999.0,
                "borderline_max": 999999.0,
                "why_it_matters": "A vital health indicator.",
                "action_tip": "Discuss optimal targets with your physician.",
            })

            # Determine status
            status = "optimal"
            if val is not None:
                opt_max = info.get("optimal_max", 999999.0)
                bord_max = info.get("borderline_max", 999999.0)
                if val > bord_max:
                    status = "elevated"
                elif val > opt_max:
                    status = "borderline"

            highlights.append({
                "feature": feat_name,
                "title": info["title"],
                "value": val,
                "unit": info.get("unit", ""),
                "status": status,
                "normal_range": info.get("normal_range", "Normal"),
                "why_it_matters": info.get("why_it_matters", ""),
                "action_tip": info.get("action_tip", ""),
            })

        # Sort elevated first, then borderline, then optimal
        status_order = {"elevated": 0, "borderline": 1, "optimal": 2}
        return sorted(highlights, key=lambda x: status_order.get(x["status"], 3))

    def _build_doctor_questions(self, pos_sorted: List[Dict[str, Any]]) -> List[str]:
        questions = []
        for f in pos_sorted[:3]:
            feat_key = f.get("feature", "").lower()
            info = BIOMARKER_BENCHMARKS.get(feat_key)
            if info and "doctor_q" in info:
                questions.append(info["doctor_q"])

        if not questions:
            questions = [
                "What is my target healthy range for these lab values?",
                "Are there specific dietary changes that can help improve my metabolic numbers?",
                "When should we recheck these blood markers to monitor progress?",
            ]
        else:
            questions.append("When should we schedule a follow-up test to check my progress?")

        return questions

    def _build_lifestyle_tips(self, pos_sorted: List[Dict[str, Any]]) -> List[str]:
        tips = []
        for f in pos_sorted[:3]:
            feat_key = f.get("feature", "").lower()
            info = BIOMARKER_BENCHMARKS.get(feat_key)
            if info and "action_tip" in info:
                tips.append(info["action_tip"])

        if not tips:
            tips = [
                "Aim for a 20-30 minute brisk walk after your largest meal of the day.",
                "Drink 2-3 liters of clean water daily and limit sweetened drinks.",
                "Incorporate more leafy greens, legumes, and whole grains into your daily meals.",
            ]
        return tips

    def _fallback_text_summary(self, text: str) -> str:
        sentences = [s.strip() for s in text.split(".") if s.strip()]
        if len(sentences) <= 2:
            return text
        return ". ".join(sentences[:3]) + "."

    def _fallback_biomarker_explanation(
        self,
        patient_id: str,
        prediction_label: str,
        risk_score: float,
        model_type: str,
        xai_method: str,
        pos_features: List[Dict[str, Any]],
        neg_features: List[Dict[str, Any]],
        vitals: Optional[Dict[str, float]] = None,
        language: str = "en",
    ) -> str:
        risk_pct = f"{risk_score * 100:.1f}%"

        # Format positive features into friendly explanations
        pos_explanations = []
        for f in pos_features[:3]:
            feat_key = f.get("feature", "").lower()
            val = f.get("value")
            info = BIOMARKER_BENCHMARKS.get(feat_key, {
                "title": f.get("feature", "").replace("_", " ").title(),
                "why_it_matters": "This number is currently higher than ideal.",
                "high_explanation": "It is adding strain to your body's daily balance.",
                "unit": "",
            })
            val_str = f" ({val} {info.get('unit', '')})".replace(" ()", "") if val is not None else ""
            pos_explanations.append(f"**{info['title']}{val_str}**: {info.get('high_explanation', info['why_it_matters'])}")

        # Format negative/protective features into friendly explanations
        neg_explanations = []
        for f in neg_features[:2]:
            feat_key = f.get("feature", "").lower()
            val = f.get("value")
            info = BIOMARKER_BENCHMARKS.get(feat_key, {
                "title": f.get("feature", "").replace("_", " ").title(),
                "normal_explanation": "This reading is in a safe, healthy zone and helps protect your body.",
                "unit": "",
            })
            val_str = f" ({val} {info.get('unit', '')})".replace(" ()", "") if val is not None else ""
            neg_explanations.append(f"**{info['title']}{val_str}**: {info.get('normal_explanation', 'Working well to support your health.')}")

        if language == "ta":
            return (
                f"### 🌟 உங்கள் பரிசோதனை முடிவு என்ன சொல்கிறது? ({patient_id})\n\n"
                f"- **எளிமையான புரிதல்**: உங்கள் உடல்நிலை பரிசோதனையில் அபாய அளவு **{risk_pct}** ஆகக் காட்டுகிறது ({prediction_label}). இது உங்களுக்கு உடனடியாக நோய் உள்ளது என்று அர்த்தமல்ல; மாறாக, உங்கள் உடல் சில விஷயங்களில் கூடுதல் கவனம் கேட்கிறது என்பதற்கான ஆரம்ப எச்சரிக்கை.\n\n"
                f"### ⚠️ கூடுதல் கவனம் தேவைப்படும் முக்கிய எண்கள்:\n"
                + "\n".join([f"- {p}" for p in pos_explanations]) + "\n\n"
                f"### 🛡️ உங்களுக்கு சாதகமாக இருக்கும் நல்ல விஷயங்கள்:\n"
                + ("\n".join([f"- {n}" for n in neg_explanations]) if neg_explanations else "- உங்கள் இதயத் துடிப்பு மற்றும் பிற உடல்நிலைக் காரணிகள் சீராக உள்ளன.") + "\n\n"
                f"### 💡 நீங்கள் இன்றே தொடங்கக்கூடிய எளிய வழிகள்:\n"
                f"1. **உங்கள் மருத்துவரை அணுகவும்**: இந்த அறிக்கையை உங்கள் குடும்ப மருத்துவரிடம் காட்டி ஒரு எளிய ரத்தப் பரிசோதனை (HbA1c) செய்துகொள்ளுங்கள்.\n"
                f"2. **உணவில் எளிய மாற்றம்**: குளிர்பானங்கள் மற்றும் அதிக இனிப்பு உணவுகளைக் குறைத்து, காய்கறிகள் மற்றும் தண்ணீரை அதிகமாகச் சேர்க்கவும்.\n"
                f"3. **தினசரி நடைப்பயிற்சி**: தினமும் சாப்பிட்ட பிறகு 20-30 நிமிடங்கள் மெதுவாக நடப்பது உங்கள் ரத்த சர்க்கரையைக் குறைக்க உதவும்."
            )
        elif language == "hi":
            return (
                f"### 🌟 आपकी जांच रिपोर्ट का आसान मतलब ({patient_id})\n\n"
                f"- **सरल व्याख्या**: आपकी स्वास्थ्य जांच में जोखिम का स्तर **{risk_pct}** आया है ({prediction_label}). इसका मतलब यह नहीं है कि आपको कोई बीमारी पक्की हो गई है; यह केवल एक प्रारंभिक संकेत है कि आपके शरीर को अभी थोड़ी अतिरिक्त देखभाल की ज़रूरत है.\n\n"
                f"### ⚠️ जिन स्वास्थ्य नंबरों पर ध्यान देना ज़रूरी है:\n"
                + "\n".join([f"- {p}" for p in pos_explanations]) + "\n\n"
                f"### 🛡️ अच्छी बातें जो आपके स्वास्थ्य की रक्षा कर रही हैं:\n"
                + ("\n".join([f"- {n}" for n in neg_explanations]) if neg_explanations else "- आपकी हृदय गति और सामान्य रक्तचाप संतुलन बनाए रखने में मदद कर रहे हैं.") + "\n\n"
                f"### 💡 आसान कदम जो आप आज से उठा सकते हैं:\n"
                f"1. **डॉक्टर से सलाह लें**: इस रिपोर्ट को अपने डॉक्टर को दिखाएं और आवश्यक बुनियादी रक्त जांच कराएं.\n"
                f"2. **खान-पान में छोटा सुधार**: मीठे पेय और जंक फूड कम करें, और हरी सब्जियां व भरपूर पानी पिएं.\n"
                f"3. **रोज़ाना हल्का टहलना**: भोजन के बाद 20-30 मिनट की हल्की सैर रक्त शर्करा को नियंत्रित रखने में बहुत मददगार होती है."
            )

        # English (Default) - Human-first, zero medical knowledge friendly
        pos_list_str = "\n".join([f"- {p}" for p in pos_explanations]) if pos_explanations else "- Your overall metabolic numbers are showing elevated patterns."
        neg_list_str = "\n".join([f"- {n}" for n in neg_explanations]) if neg_explanations else "- Your other vital signs remain stable and are helping protect your body."

        return (
            f"### 🌟 What Does Your Health Result Mean? ({patient_id})\n\n"
            f"- **In Simple Terms**: Your health assessment shows an estimated risk level of **{risk_pct}** ({prediction_label}). "
            f"Please remember: **this is NOT a final disease diagnosis**. It is an early-warning signal showing where your body is experiencing extra strain, giving you the power to take action early.\n\n"
            f"### ⚠️ The Health Numbers Raising Your Risk (Why is it high?)\n"
            f"{pos_list_str}\n\n"
            f"### 🛡️ The Good News (What is working in your favor?)\n"
            f"{neg_list_str}\n\n"
            f"### 💡 Simple, Everyday Steps You Can Take Today:\n"
            f"1. **Share this with your doctor**: Take this report to your regular doctor for a quick confirmation check (such as a routine HbA1c blood test).\n"
            f"2. **Make small, easy food swaps**: Cut down on sugary drinks, sodas, and processed white flour. Drink plenty of water and add more colorful vegetables to your plate.\n"
            f"3. **Take a daily 20-minute walk**: Moving your body—especially a light walk right after meals—helps your muscles naturally burn off extra blood sugar."
        )

    def answer_health_question(
        self,
        question: str,
        context: Optional[str] = None,
        language: str = "en",
    ) -> Dict[str, Any]:
        """
        Answers a patient's health question in simple, compassionate, jargon-free language.
        """
        client = self._get_client()

        lang_instruction = "Respond in simple, everyday English."
        if language == "ta":
            lang_instruction = "Respond in simple, everyday Tamil (தமிழ்)."
        elif language == "hi":
            lang_instruction = "Respond in simple, everyday Hindi (हिन्दी)."

        if not client:
            return self._fallback_health_answer(question, language)

        prompt = f"""You are a warm, compassionate, and expert medical AI assistant helping an everyday patient understand their health.
The patient has asked the following question:
"{question}"

Additional Patient Lab / Report Context (if any):
{context or 'No specific lab attached. Answer generally and safely.'}

Instructions:
1. Provide a warm, clear, 2-3 paragraph answer in plain conversational language.
2. Avoid dense medical jargon. If you use a medical term, explain it immediately with a simple analogy.
3. Be encouraging and provide practical, safe daily tips.
4. Remind them gently to discuss any medication or specific symptom changes with their primary doctor.
5. {lang_instruction}
"""

        try:
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            if response and hasattr(response, "text") and response.text:
                return {
                    "answer": response.text.strip(),
                    "provider": "Google Gemini",
                    "model": self.model_name,
                    "suggested_followups": [
                        "What foods help stabilize morning blood sugar?",
                        "How many minutes of exercise are recommended per week?",
                        "What questions should I ask my doctor at my next visit?",
                    ],
                }
        except Exception as e:
            logger.error(f"Gemini answer_health_question error: {e}")

        return self._fallback_health_answer(question, language)

    def _fallback_health_answer(self, question: str, language: str = "en") -> Dict[str, Any]:
        q_lower = question.lower()
        if "rice" in q_lower or "carb" in q_lower or "food" in q_lower or "diet" in q_lower:
            ans = (
                "**Diet & Nutrition Guidance:**\n\n"
                "You do not need to completely eliminate foods you enjoy, but portion control and smart combinations make a huge difference. "
                "When eating carbohydrates (like rice, bread, or potatoes), combine them with fiber-rich vegetables (spinach, broccoli) and lean proteins (lentils, paneer, eggs, chicken). "
                "Fiber and protein slow down digestion, preventing sudden blood sugar spikes after meals.\n\n"
                "💡 **Quick Tip**: Try having a small bowl of fresh salad or vegetables before your main meal!"
            )
        elif "exercise" in q_lower or "walk" in q_lower or "activity" in q_lower:
            ans = (
                "**Physical Activity & Movement:**\n\n"
                "Regular daily movement is one of the most powerful natural medicines for metabolic health. "
                "A simple 15-20 minute brisk walk after lunch or dinner directly prompts your leg muscles to soak up glucose from your bloodstream without needing extra insulin.\n\n"
                "💡 **Goal**: Aim for 150 minutes of moderate activity per week (about 30 minutes, 5 days a week)."
            )
        elif "sugar" in q_lower or "glucose" in q_lower or "hba1c" in q_lower:
            ans = (
                "**Understanding Blood Sugar & Glucose:**\n\n"
                "Glucose is the primary fuel our bodies make from food. When our cells are insulin-resistant, glucose stays trapped in the blood instead of entering cells for energy. "
                "Over time, high blood sugar can cause fatigue and stress your blood vessels. "
                "Maintaining steady meal timing, staying well-hydrated, and walking after eating help bring numbers into a healthy range.\n\n"
                "💡 **Medical Check**: Ask your doctor for an HbA1c test, which measures your 3-month blood sugar average."
            )
        else:
            ans = (
                "**Personal Health Insights:**\n\n"
                "Small, consistent daily lifestyle choices have a compounding positive effect on your long-term health numbers. "
                "Staying hydrated, getting 7–8 hours of restful sleep, reducing refined sugars, and moving daily are foundational for healthy blood pressure, weight, and blood sugar balance.\n\n"
                "🩺 **Next Step**: Make sure to discuss your specific symptoms and lab readings with your healthcare provider for personalized medical advice."
            )

        if language == "ta":
            ans = "உங்கள் உடல்நிலை குறித்த சந்தேகங்களுக்கு எளிய உணவு முறை, நடைப்பயிற்சி மற்றும் போதுமான தூக்கம் மிக முக்கியம். உங்கள் மருத்துவரிடம் ஆலோசனை பெறவும்."
        elif language == "hi":
            ans = "आपके स्वास्थ्य के लिए संतुलित आहार, नियमित सैर और पर्याप्त नींद बहुत महत्वपूर्ण हैं। अधिक जानकारी के लिए अपने चिकित्सक से परामर्श करें।"

        return {
            "answer": ans,
            "provider": "TrustMed Human-First Clinical AI",
            "model": "plain-language-engine",
            "suggested_followups": [
                "What foods help stabilize morning blood sugar?",
                "How many minutes of exercise are recommended per week?",
                "What questions should I ask my doctor at my next visit?",
            ],
        }


gemini_service = GeminiService()

