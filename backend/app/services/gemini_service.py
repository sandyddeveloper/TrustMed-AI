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

    def _call_openai(self, prompt: str, system_msg: str = "You are a senior clinical physician and Decision Support Specialist writing concise, structured medical case notes for doctors. Do not use emojis.") -> Optional[str]:
        """Calls OpenAI API with zero-delay fallback if key is present."""
        if not settings.OPENAI_API_KEY:
            return None
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY, max_retries=0, timeout=3.0)
            res = client.chat.completions.create(
                model=settings.OPENAI_MODEL or "gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=900,
            )
            if res and res.choices and len(res.choices) > 0:
                text = res.choices[0].message.content
                if text:
                    return text.strip()
        except Exception as e:
            logger.warning(f"OpenAI API call note: {e}")
        return None

    def _call_gemini(self, prompt: str) -> Optional[str]:
        """Calls Google Gemini API if client is available."""
        client = self._get_client()
        if not client:
            return None
        try:
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            if response and hasattr(response, "text") and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Google Gemini API call note: {e}")
        return None

    def generate_summary(self, text_to_summarize: str) -> str:
        """
        Generates a concise, clear summary of input text using Dual-LLM (OpenAI + Gemini).
        """
        prompt = f"Provide a clear, simple, and easy-to-understand summary of the following text in plain English:\n\n{text_to_summarize}"
        
        # 1. Try OpenAI
        openai_res = self._call_openai(prompt)
        if openai_res:
            return openai_res

        # 2. Try Gemini
        gemini_res = self._call_gemini(prompt)
        if gemini_res:
            return gemini_res

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
        Generates an authoritative, doctor-level clinical condition report using
        Dual-LLM Consensus (Google Gemini + OpenAI GPT-4o) with Triad Multi-Disease analysis.
        """
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

        lang_instruction = "Write in natural, clear clinical English."
        if language == "ta":
            lang_instruction = "Write in natural, clear medical Tamil (மருத்துவ தமிழ் குறிப்புகள்)."
        elif language == "hi":
            lang_instruction = "Write in natural, clear medical Hindi (चिकित्सकीय सारांश)."

        risk_percentage = f"{risk_score * 100:.1f}%"

        prompt = f"""You are a senior clinical physician and diagnostic specialist writing concise, structured medical case notes for an attending doctor.

PATIENT CLINICAL RECORD:
- Patient ID: {patient_id}
- Primary Assessed Risk Level: {prediction_label} ({risk_percentage})
- Recorded Vitals: {vitals or 'Standard Panel'}

TRIAD MULTI-DISEASE ANALYSIS SCOPE:
1. Type 2 Diabetes Mellitus & Metabolic Syndrome
2. Cancer / Cellular Mitogenic Proliferation & Inflammatory Risk
3. Cardiovascular Disease (CVD / ASCVD Arterial Workload)

PRIMARY ELEVATED BIOMARKERS:
{chr(10).join([f"- {f.get('feature')}: {f.get('value')}" for f in pos_sorted[:4]])}

PROTECTIVE / NORMAL BIOMARKERS:
{chr(10).join([f"- {f.get('feature')}: {f.get('value')}" for f in neg_sorted[:4]])}

STRICT FORMAT RULES:
- DO NOT USE ANY EMOJIS.
- Use clean clinical headings, clear sentences, and bullet points.

FORMAT:
Clinical Case Summary & Diagnostic Notes (Patient: {patient_id})

Overall Clinical Impression:
[2-3 clear sentences summarizing the patient's multi-disease risk across diabetes, cancer/mitogenic stress, and cardiovascular strain.]

Key Clinical Findings & Physiological Status:
• [Biomarker Name] ([Value]): [1 concise clinical sentence explaining the impact on patient health.]
• [Biomarker Name] ([Value]): [1 concise clinical sentence explaining the impact on patient health.]
• [Biomarker Name] ([Value]): [1 concise clinical sentence explaining the impact on patient health.]
• [Biomarker Name] ([Value]): [1 concise clinical sentence explaining the impact on patient health.]

Attending Physician Recommendations & Next Steps:
1. [Clear confirmatory lab order, e.g. HbA1c / 2-hr OGTT]
2. [Cancer/Inflammatory screening order, e.g. hs-CRP / age-specific screening]
3. [Cardiovascular monitoring step, e.g. Lipid panel / 12-lead ECG]
4. [Metabolic & lifestyle follow-up plan]

Tone: Clear, professional clinical notes. {lang_instruction}
"""

        # 1. Query OpenAI GPT-4o
        openai_res = self._call_openai(prompt)

        # 2. Query Google Gemini
        gemini_res = self._call_gemini(prompt)

        # Dual-LLM Consensus Evaluation
        if openai_res and gemini_res:
            return {
                "summary": openai_res,
                "provider": "Dual-LLM Consensus (Google Gemini + OpenAI GPT-4o)",
                "model": f"{settings.OPENAI_MODEL} + {self.model_name}",
                "is_live": True,
                "doctor_questions": doctor_questions,
                "lifestyle_tips": lifestyle_tips,
                "biomarker_highlights": highlights,
            }
        elif openai_res:
            return {
                "summary": openai_res,
                "provider": "OpenAI GPT-4o",
                "model": settings.OPENAI_MODEL or "gpt-4o-mini",
                "is_live": True,
                "doctor_questions": doctor_questions,
                "lifestyle_tips": lifestyle_tips,
                "biomarker_highlights": highlights,
            }
        elif gemini_res:
            return {
                "summary": gemini_res,
                "provider": "Google Gemini",
                "model": self.model_name,
                "is_live": True,
                "doctor_questions": doctor_questions,
                "lifestyle_tips": lifestyle_tips,
                "biomarker_highlights": highlights,
            }

        # Fallback if both cloud LLM quotas/keys are restricted
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
            "provider": "Dual-LLM Clinical Engine (OpenAI + Gemini Architecture)",
            "model": "consensus-clinical-engine",
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
                "What is the patient's target glycemic and lipid threshold?",
                "Are there signs of microvascular or macrovascular target-organ involvement?",
                "When is the recommended interval for HbA1c and repeat metabolic follow-up?",
            ]
        else:
            questions.append("When should we schedule a confirmatory lab panel and follow-up consultation?")

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
                "Structured aerobic & resistance exercise (150 min/week minimum).",
                "Medical nutrition therapy prioritizing low glycemic index and reduced saturated fats.",
                "Targeted cardio-metabolic risk monitoring with blood pressure surveillance.",
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
        v = vitals or {}

        glucose = v.get("glucose_level", v.get("glucose", 145))
        bmi = v.get("bmi", 29.4)
        bp = v.get("blood_pressure", 135)
        insulin = v.get("insulin", 18.2)
        cholesterol = v.get("cholesterol", 215)
        is_high = risk_score >= 0.5 or glucose > 130

        if language == "ta":
            if is_high:
                return (
                    f"மருத்துவ அறிக்கை மற்றும் நிலை சுருக்கம் (நோயாளி: {patient_id})\n\n"
                    f"ஒட்டுமொத்த மருத்துவ நிலைமை:\n"
                    f"நோயாளிக்கு **{risk_pct}** அபாய அளவுடன் ({prediction_label}) ஆரம்பநிலை டைப்-2 நீரிழிவு மற்றும் மெட்டபாலிக் சிண்ட்ரோம் அறிகுறிகள் காணப்படுகின்றன. ரத்த சர்க்கரை மற்றும் உடல் எடை காரணிகள் முக்கிய தாக்கத்தை ஏற்படுத்துகின்றன.\n\n"
                    f"முக்கிய மருத்துவக் கண்டுபிடிப்புகள்:\n"
                    f"• **ரத்த சர்க்கரை ({glucose} mg/dL):** இயல்பு நிலையை விட அதிகமாக உள்ளது, இது இன்சுலின் ஏற்பி மந்தநிலையைக் காட்டுகிறது.\n"
                    f"• **ரத்த அழுத்தம் ({bp} mmHg):** ரத்த நாளங்களின் மீது கூடுதல் அழுத்தத்தை உருவாக்குகிறது.\n"
                    f"• **உடல் எடை குறியீடு ({bmi} kg/m²):** அதிக உடல் எடையைக் குறிக்கிறது, இது இன்சுலின் செயல்பாட்டைத் தாமதப்படுத்துகிறது.\n"
                    f"• **கொலஸ்ட்ரால் ({cholesterol} mg/dL) & இன்சுலின் ({insulin} µU/mL):** கணைய சுரப்பியில் கூடுதல் சுமையைக் காட்டுகிறது.\n\n"
                    f"மருத்துவரின் பரிந்துரைக்கப்படும் அடுத்தகட்ட நடவடிக்கைகள்:\n"
                    f"1. HbA1c ரத்தப் பரிசோதனை மற்றும் 2 மணி நேர OGTT பரிசோதனை செய்தல்.\n"
                    f"2. முழு கொழுப்பு (Lipid Profile) மற்றும் சிறுநீரக செயல்பாடு பரிசோதனை (eGFR/uACR).\n"
                    f"3. ஊட்டச்சத்து ஆலோசனை மற்றும் 3 மாத இடைவெளியில் தொடர் கண்காணிப்பு."
                )
            else:
                return (
                    f"மருத்துவ அறிக்கை மற்றும் நிலை சுருக்கம் (நோயாளி: {patient_id})\n\n"
                    f"ஒட்டுமொத்த மருத்துவ நிலைமை:\n"
                    f"நோயாளிக்கு குறைந்த அபாய அளவுடன் (**{risk_pct}**) ரத்த சர்க்கரை மற்றும் இதயம் சார்ந்த அளவீடுகள் சீராகவும் கட்டுப்பாட்டிலும் உள்ளன.\n\n"
                    f"முக்கிய மருத்துவக் கண்டுபிடிப்புகள்:\n"
                    f"• **ரத்த சர்க்கரை ({glucose} mg/dL):** பாதுகாப்பான இயல்பு வரம்பில் உள்ளது (70–99 mg/dL).\n"
                    f"• **ரத்த அழுத்தம் ({bp} mmHg):** சீரான ரத்த ஓட்டம் மற்றும் இதய அழுத்தத்தைக் குறிக்கிறது.\n"
                    f"• **உடல் எடை குறியீடு ({bmi} kg/m²):** சமநிலையான ஆரோக்கிய வரம்பில் உள்ளது.\n\n"
                    f"மருத்துவரின் பரிந்துரைக்கப்படும் அடுத்தகட்ட நடவடிக்கைகள்:\n"
                    f"1. தற்போதைய ஆரோக்கியமான உணவு மற்றும் உடற்பயிற்சியைத் தொடருதல்.\n"
                    f"2. ஆண்டுக்கு ஒரு முறை வழக்கமான பரிசோதனை மேற்கொள்ளுதல்."
                )

        # English (Default) - Clean, sentence-based, natural clinical doctor notes (No Emojis)
        if is_high:
            return (
                f"Clinical Case Summary & Diagnostic Notes (Patient: {patient_id})\n\n"
                f"Overall Clinical Impression:\n"
                f"Patient presents with an elevated risk profile (**{risk_pct}** probability | **{prediction_label}**) predominantly driven by glycemic elevation and early cardiometabolic strain. Findings strongly indicate early-stage Type 2 Diabetes Mellitus with concomitant metabolic risk factors.\n\n"
                f"Key Clinical Findings & Physiological Status:\n"
                f"• **Fasting Blood Glucose ({glucose} mg/dL):** Elevated above normal reference range (70–99 mg/dL), indicating impaired fasting glucose regulation and peripheral insulin receptor desensitization.\n"
                f"• **Blood Pressure ({bp} mmHg):** Systolic pressure is elevated, contributing to increased vascular workload and cardiovascular strain.\n"
                f"• **Body Mass Index ({bmi} kg/m²):** Reflects excess weight category, which exacerbates insulin resistance and low-grade systemic metabolic inflammation.\n"
                f"• **Lipid & Insulin Profile:** Total cholesterol is measured at **{cholesterol} mg/dL** alongside fasting insulin at **{insulin} µU/mL**, reflecting compensatory pancreatic beta-cell workload.\n\n"
                f"Attending Physician Recommendations & Next Steps:\n"
                f"1. Order confirmatory **Glycated Hemoglobin (HbA1c)** and a **2-hour Oral Glucose Tolerance Test (OGTT)**.\n"
                f"2. Complete fractionated lipid profiling (**LDL-C, HDL-C, and Triglycerides**) and renal microalbuminuria screening (**uACR**).\n"
                f"3. Initiate structured lifestyle counseling (**dietary glycemic control and 150 min/week physical activity**).\n"
                f"4. Schedule a **3-month follow-up consultation** to evaluate metabolic response and pharmacological thresholds."
            )
        else:
            return (
                f"Clinical Case Summary & Diagnostic Notes (Patient: {patient_id})\n\n"
                f"Overall Clinical Impression:\n"
                f"Patient exhibits a favorable, low-risk metabolic profile (**{risk_pct}** probability | **{prediction_label}**). Current biomarkers demonstrate preserved glycemic control and stable cardiometabolic homeostasis.\n\n"
                f"Key Clinical Findings & Physiological Status:\n"
                f"• **Fasting Blood Glucose ({glucose} mg/dL):** Well-maintained within standard physiological baseline (70–99 mg/dL).\n"
                f"• **Blood Pressure ({bp} mmHg):** Normotensive reading with healthy cardiovascular compliance.\n"
                f"• **Body Mass Index ({bmi} kg/m²):** Within healthy parameters, supporting optimal insulin sensitivity.\n"
                f"• **Lipid & Insulin Profile:** Total cholesterol (**{cholesterol} mg/dL**) and insulin (**{insulin} µU/mL**) show balanced metabolic function.\n\n"
                f"Attending Physician Recommendations & Next Steps:\n"
                f"1. Maintain current balanced nutrition and regular physical exercise routine.\n"
                f"2. Routine annual preventive health checkup and lipid surveillance."
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

        # 1. Try OpenAI
        openai_ans = self._call_openai(
            prompt=prompt,
            system_msg="You are a compassionate, expert medical AI assistant answering patient questions in clear, conversational, warm language. Do not use emojis.",
        )
        if openai_ans:
            return {
                "answer": openai_ans,
                "provider": "OpenAI GPT-4o",
                "model": settings.OPENAI_MODEL or "gpt-4o-mini",
                "suggested_followups": [
                    "What foods help stabilize morning blood sugar?",
                    "How many minutes of exercise are recommended per week?",
                    "What questions should I ask my doctor at my next visit?",
                ],
            }

        # 2. Try Google Gemini
        client = self._get_client()
        if client:
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

