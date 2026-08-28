"""
TrustMed-AI Backend Internationalization (i18n) Engine.
Provides comprehensive multi-language support (English, Tamil, Hindi)
for clinical biomarkers, medical guidelines, diagnostic classifications,
and compliance explanations.
"""

from typing import Optional, Dict, Any


def normalize_language(lang: Optional[str]) -> str:
    """Normalizes input language code or header to 'en', 'ta', or 'hi'."""
    if not lang:
        return "en"
    clean = lang.strip().lower()
    if clean.startswith("ta") or "tamil" in clean:
        return "ta"
    if clean.startswith("hi") or "hindi" in clean:
        return "hi"
    return "en"


# Biomarker Name Translations
BIOMARKER_NAMES: Dict[str, Dict[str, str]] = {
    "glucose_level": {
        "en": "Fasting Blood Glucose",
        "ta": "இரத்த சர்க்கரை அளவு (Fasting Glucose)",
        "hi": "फास्टिंग ब्लड ग्लूकोज (Fasting Glucose)",
    },
    "pp_glucose": {
        "en": "Post-Prandial Glucose (PPBS)",
        "ta": "உணவுக்குப் பின் இரத்த சர்க்கரை (PPBS)",
        "hi": "भोजन के बाद रक्त शर्करा (PPBS)",
    },
    "blood_pressure": {
        "en": "Systolic Blood Pressure",
        "ta": "சிஸ்டாலிக் இரத்த அழுத்தம் (Systolic BP)",
        "hi": "सिस्टोलिक रक्तचाप (Systolic BP)",
    },
    "bmi": {
        "en": "Body Mass Index (BMI)",
        "ta": "உடல் நிறை குறியீடு (BMI)",
        "hi": "बॉडी मास इंडेक्स (BMI)",
    },
    "cholesterol": {
        "en": "Total Cholesterol",
        "ta": "மொத்த கொலஸ்ட்ரால் (Total Cholesterol)",
        "hi": "कुल कोलेस्ट्रॉल (Total Cholesterol)",
    },
    "triglycerides": {
        "en": "Serum Triglycerides",
        "ta": "சீரம் ட்ரைகிளிசரைடுகள் (Triglycerides)",
        "hi": "सीरम ट्राइग्लिसराइड्स (Triglycerides)",
    },
    "hdl": {
        "en": "HDL Cholesterol (Good)",
        "ta": "நல்ல கொலஸ்ட்ரால் (HDL)",
        "hi": "अच्छा कोलेस्ट्रॉल (HDL)",
    },
    "ldl": {
        "en": "LDL Cholesterol (Bad)",
        "ta": "கெட்ட கொலஸ்ட்ரால் (LDL)",
        "hi": "खराब कोलेस्ट्रॉल (LDL)",
    },
    "vldl": {
        "en": "VLDL Cholesterol",
        "ta": "மிகக் குறைந்த அடர்த்தி கொலஸ்ட்ரால் (VLDL)",
        "hi": "वीएलडीएल कोलेस्ट्रॉल (VLDL)",
    },
    "cholesterol_hdl_ratio": {
        "en": "Total Cholesterol / HDL Ratio",
        "ta": "மொத்த கொலஸ்ட்ரால் / HDL விகிதம்",
        "hi": "कुल कोलेस्ट्रॉल / एचडीएल अनुपात",
    },
    "heart_rate": {
        "en": "Resting Heart Rate",
        "ta": "ஓய்வு நேர இதய துடிப்பு (Heart Rate)",
        "hi": "विश्राम हृदय गति (Heart Rate)",
    },
    "insulin": {
        "en": "Fasting Serum Insulin",
        "ta": "பாஸ்டிங் சீரம் இன்சுலின் (Insulin)",
        "hi": "फास्टिंग सीरम इंसुलिन (Insulin)",
    },
}

# Status Badge Localizations
STATUS_LABELS: Dict[str, Dict[str, str]] = {
    "OPTIMAL": {
        "en": "OPTIMAL",
        "ta": "சிறந்தது (OPTIMAL)",
        "hi": "इष्टतम (OPTIMAL)",
    },
    "BORDERLINE": {
        "en": "BORDERLINE",
        "ta": "எல்லைக்கோடு (BORDERLINE)",
        "hi": "सीमावर्ती (BORDERLINE)",
    },
    "ELEVATED": {
        "en": "ELEVATED",
        "ta": "அதிகரித்தது (ELEVATED)",
        "hi": "बढ़ा हुआ (ELEVATED)",
    },
    "CRITICAL": {
        "en": "CRITICAL",
        "ta": "ஆபத்தானது (CRITICAL)",
        "hi": "गंभीर (CRITICAL)",
    },
    "LOW": {
        "en": "LOW",
        "ta": "குறைவானது (LOW)",
        "hi": "कम (LOW)",
    },
}

# Guideline Authorities Localizations
GUIDELINE_SOURCES: Dict[str, Dict[str, str]] = {
    "ADA": {
        "en": "American Diabetes Association (ADA)",
        "ta": "அமெரிக்க நீரிழிவு சங்கம் (ADA 2026)",
        "hi": "अमेरिकन डायबिटीज एसोसिएशन (ADA 2026)",
    },
    "AHA": {
        "en": "American Heart Association (AHA/ACC)",
        "ta": "அமெரிக்க இதய சங்கம் (AHA/ACC)",
        "hi": "अमेरिकन हार्ट एसोसिएशन (AHA/ACC)",
    },
    "WHO": {
        "en": "World Health Organization (WHO)",
        "ta": "உலக சுகாதார அமைப்பு (WHO)",
        "hi": "विश्व स्वास्थ्य संगठन (WHO)",
    },
    "NCEP": {
        "en": "National Cholesterol Education Program (NCEP)",
        "ta": "தேசிய கொலஸ்ட்ரால் கல்வி திட்டம் (NCEP ATP III)",
        "hi": "राष्ट्रीय कोलेस्ट्रॉल शिक्षा कार्यक्रम (NCEP ATP III)",
    },
    "ENDOCRINE": {
        "en": "Endocrine Society Clinical Practice Guidelines",
        "ta": "எண்டோகிரைன் சொசைட்டி மருத்துவ வழிகாட்டுதல்கள்",
        "hi": "एंडोक्राइन सोसाइटी क्लिनिकल प्रैक्टिस गाइडलाइन्स",
    },
}

# Diagnostic Risk Prediction Labels
DIAGNOSTIC_LABELS: Dict[str, Dict[str, str]] = {
    "high_risk": {
        "en": "Diabetic / High Risk",
        "ta": "நீரிழிவு / அதிக ஆபத்து (Diabetic / High Risk)",
        "hi": "मधुमेह / उच्च जोखिम (Diabetic / High Risk)",
    },
    "low_risk": {
        "en": "Non-Diabetic / Low Risk",
        "ta": "நீரிழிவு இல்லை / குறைந்த ஆபத்து (Non-Diabetic / Low Risk)",
        "hi": "गैर-मधुमेह / कम जोखिम (Non-Diabetic / Low Risk)",
    },
}


def get_biomarker_name(key: str, lang: str = "en") -> str:
    """Returns localized biomarker name."""
    lang = normalize_language(lang)
    return BIOMARKER_NAMES.get(key, {}).get(lang, BIOMARKER_NAMES.get(key, {}).get("en", key))


def get_guideline_source(key: str, lang: str = "en") -> str:
    """Returns localized guideline source name."""
    lang = normalize_language(lang)
    return GUIDELINE_SOURCES.get(key, {}).get(lang, GUIDELINE_SOURCES.get(key, {}).get("en", key))


def get_diagnostic_label(risk_score: float, lang: str = "en") -> str:
    """Returns localized diagnostic risk assessment label."""
    lang = normalize_language(lang)
    key = "high_risk" if risk_score >= 0.5 else "low_risk"
    return DIAGNOSTIC_LABELS[key].get(lang, DIAGNOSTIC_LABELS[key]["en"])


def get_biomarker_interpretation(key: str, val: float, status: str, lang: str = "en") -> str:
    """Returns authoritative clinical interpretation text in requested language."""
    lang = normalize_language(lang)

    if key == "glucose_level":
        if status == "LOW":
            if lang == "ta":
                return f"{val} mg/dL இரத்த சர்க்கரை அளவு இயல்பை விடக் குறைவு (<70 mg/dL). இரத்தச் சர்க்கரைக் குறைவு (ஹைபோகிளைசீமியா) அபாயம்."
            elif lang == "hi":
                return f"{val} mg/dL फास्टिंग बेसलाइन से कम है (<70 mg/dL)। हाइपोग्लाइसीमिया (निम्न रक्त शर्करा) का जोखिम।"
            return f"{val} mg/dL is below fasting baseline (<70 mg/dL). Risk of hypoglycemia."
        elif status == "OPTIMAL":
            if lang == "ta":
                return f"{val} mg/dL இயல்பான ஆரோக்கியமான உண்ணாவிரத வரம்பிற்குள் உள்ளது (70-99 mg/dL)."
            elif lang == "hi":
                return f"{val} mg/dL सामान्य स्वस्थ फास्टिंग सीमा (70-99 mg/dL) के भीतर है।"
            return f"{val} mg/dL is within the normal healthy fasting range (70-99 mg/dL)."
        elif status == "BORDERLINE":
            if lang == "ta":
                return f"{val} mg/dL ஆரம்ப நிலை நீரிழிவு / முன்-நீரிழிவு நிலையைக் குறிக்கிறது (100-125 mg/dL)."
            elif lang == "hi":
                return f"{val} mg/dL बिगड़ा हुआ फास्टिंग ग्लूकोज (प्री-डायबिटीज: 100-125 mg/dL) दर्शाता है।"
            return f"{val} mg/dL indicates Impaired Fasting Glucose (Pre-diabetes: 100-125 mg/dL)."
        else:
            if lang == "ta":
                return f"{val} mg/dL நீரிழிவு நோய்க்கான கண்டறியும் வரம்பை விட அதிகமாக உள்ளது (>=126 mg/dL)."
            elif lang == "hi":
                return f"{val} mg/dL मधुमेह (डायबिटीज मेलिटस) की नैदानिक सीमा से अधिक है (>=126 mg/dL)।"
            return f"{val} mg/dL exceeds the diagnostic threshold for Diabetes Mellitus (>=126 mg/dL)."

    elif key == "blood_pressure":
        if status == "LOW":
            if lang == "ta":
                return f"{val} mmHg இயல்பான சிஸ்டாலிக் வரம்பிற்குக் குறைவு (குறைந்த இரத்த அழுத்தம்: <90 mmHg)."
            elif lang == "hi":
                return f"{val} mmHg सामान्य सिस्टोलिक सीमा से कम है (हाइपोटेंशन: <90 mmHg)।"
            return f"{val} mmHg is below normal systolic range (Hypotension: <90 mmHg)."
        elif status == "OPTIMAL":
            if lang == "ta":
                return f"{val} mmHg உகந்த சிஸ்டாலிக் இரத்த அழுத்த வரம்பிற்குள் உள்ளது (90-119 mmHg)."
            elif lang == "hi":
                return f"{val} mmHg इष्टतम सिस्टोलिक रक्तचाप दिशानिर्देशों (90-119 mmHg) के भीतर है।"
            return f"{val} mmHg is within optimal systolic blood pressure guidelines."
        elif status == "BORDERLINE":
            if lang == "ta":
                return f"{val} mmHg அதிகரித்த இரத்த அழுத்தமாக வகைப்படுத்தப்பட்டுள்ளது (120-129 mmHg)."
            elif lang == "hi":
                return f"{val} mmHg को बढ़े हुए रक्तचाप (120-129 mmHg) के रूप में वर्गीकृत किया गया है।"
            return f"{val} mmHg is categorized as Elevated Blood Pressure (120-129 mmHg)."
        elif status == "ELEVATED":
            if lang == "ta":
                return f"{val} mmHg நிலை 1 உயர் இரத்த அழுத்த அளவுகோல்களைக் குறிக்கிறது (130-139 mmHg)."
            elif lang == "hi":
                return f"{val} mmHg स्टेज 1 उच्च रक्तचाप (हाइपरटेंशन: 130-139 mmHg) मानदंडों को पूरा करता है।"
            return f"{val} mmHg meets Stage 1 Hypertension criteria (130-139 mmHg)."
        else:
            if lang == "ta":
                return f"{val} mmHg நிலை 2 தீவிர உயர் இரத்த அழுத்தத்தைக் குறிக்கிறது (>=140 mmHg)."
            elif lang == "hi":
                return f"{val} mmHg स्टेज 2 गंभीर उच्च रक्तचाप (>=140 mmHg) को इंगित करता है।"
            return f"{val} mmHg indicates Stage 2 Hypertension (>=140 mmHg)."

    elif key == "bmi":
        if status == "LOW":
            if lang == "ta":
                return f"BMI {val} kg/m² குறைந்த உடல் எடையைக் குறிக்கிறது (<18.5)."
            elif lang == "hi":
                return f"BMI {val} kg/m² कम वजन (अंडरवेट) वर्गीकरण को इंगित करता है (<18.5)।"
            return f"BMI of {val} kg/m² indicates underweight classification (<18.5)."
        elif status == "OPTIMAL":
            if lang == "ta":
                return f"BMI {val} kg/m² இயல்பான ஆரோக்கியமான எடை வரம்பிற்குள் உள்ளது (18.5-24.9)."
            elif lang == "hi":
                return f"BMI {val} kg/m² मानक स्वस्थ वजन सीमा (18.5-24.9) के भीतर है।"
            return f"BMI of {val} kg/m² is within the standard healthy weight range (18.5-24.9)."
        elif status == "BORDERLINE":
            if lang == "ta":
                return f"BMI {val} kg/m² அதிக உடல் எடையைக் குறிக்கிறது (25.0-29.9)."
            elif lang == "hi":
                return f"BMI {val} kg/m² को अधिक वजन (ओवरवेट: 25.0-29.9) के रूप में वर्गीकृत किया गया है।"
            return f"BMI of {val} kg/m² is categorized as overweight (25.0-29.9)."
        else:
            if lang == "ta":
                return f"BMI {val} kg/m² மருத்துவ ரீதியான உடல் பருமனை குறிக்கிறது (வகுப்பு I/II/III: >=30)."
            elif lang == "hi":
                return f"BMI {val} kg/m² क्लिनिकल मोटापे (ओबेसिटी: >=30) को इंगित करता है।"
            return f"BMI of {val} kg/m² indicates clinical obesity (Class I/II/III: >=30)."

    elif key == "cholesterol":
        if status == "OPTIMAL":
            if lang == "ta":
                return f"மொத்த கொலஸ்ட்ரால் {val} mg/dL விரும்பத்தக்க பாதுகாப்பான வரம்பிற்குள் உள்ளது (<200 mg/dL)."
            elif lang == "hi":
                return f"कुल कोलेस्ट्रॉल {val} mg/dL वांछनीय सुरक्षित सीमा (<200 mg/dL) के भीतर है।"
            return f"Total cholesterol of {val} mg/dL is within the desirable range (<200 mg/dL)."
        elif status == "BORDERLINE":
            if lang == "ta":
                return f"மொத்த கொலஸ்ட்ரால் {val} mg/dL எல்லைக்கோடு அளவு உயர்வாக உள்ளது (200-239 mg/dL)."
            elif lang == "hi":
                return f"कुल कोलेस्ट्रॉल {val} mg/dL बॉर्डरलाइन उच्च (200-239 mg/dL) है।"
            return f"Total cholesterol of {val} mg/dL is borderline high (200-239 mg/dL)."
        else:
            if lang == "ta":
                return f"மொத்த கொலஸ்ட்ரால் {val} mg/dL மிக அதிக கொழுப்பு அபாயத்தைக் குறிக்கிறது (>=240 mg/dL)."
            elif lang == "hi":
                return f"कुल कोलेस्ट्रॉल {val} mg/dL हाइपरकोलेस्ट्रोलेमिया (>=240 mg/dL) को इंगित करता है।"
            return f"Total cholesterol of {val} mg/dL indicates hypercholesterolemia (>=240 mg/dL)."

    elif key == "heart_rate":
        if status == "LOW":
            if lang == "ta":
                return f"ஓய்வு இதயத் துடிப்பு {val} bpm பிராடி கார்டியாவைக் குறிக்கிறது (<60 bpm)."
            elif lang == "hi":
                return f"विश्राम नाड़ी दर {val} bpm ब्रैडीकार्डिया (धीमी गति: <60 bpm) को इंगित करती है।"
            return f"Resting pulse of {val} bpm indicates Bradycardia (<60 bpm)."
        elif status == "OPTIMAL":
            if lang == "ta":
                return f"ஓய்வு இதயத் துடிப்பு {val} bpm இயல்பான வரம்பிற்குள் உள்ளது (60-100 bpm)."
            elif lang == "hi":
                return f"विश्राम नाड़ी दर {val} bpm सामान्य सीमा (60-100 bpm) के भीतर है।"
            return f"Resting pulse of {val} bpm is within normal resting parameters (60-100 bpm)."
        else:
            if lang == "ta":
                return f"ஓய்வு இதயத் துடிப்பு {val} bpm டாக்கிகார்டியாவைக் குறிக்கிறது (>100 bpm)."
            elif lang == "hi":
                return f"विश्राम नाड़ी दर {val} bpm टैचीकार्डिया (तेज गति: >100 bpm) को इंगित करती है।"
            return f"Resting pulse of {val} bpm indicates Tachycardia (>100 bpm)."

    elif key == "insulin":
        if status == "OPTIMAL":
            if lang == "ta":
                return f"பாஸ்டிங் இன்சுலின் {val} uIU/mL ஆரோக்கியமான அடித்தள அளவிற்குள் உள்ளது (2-25 uIU/mL)."
            elif lang == "hi":
                return f"फास्टिंग इंसुलिन {val} uIU/mL स्वस्थ बेसल मापदंडों (2-25 uIU/mL) के अनुरूप है।"
            return f"Fasting insulin of {val} uIU/mL conforms to healthy basal parameters (2-25 uIU/mL)."
        else:
            if lang == "ta":
                return f"பாஸ்டிங் இன்சுலின் {val} uIU/mL இன்சுலின் எதிர்ப்புத் தன்மையைக் குறிக்கிறது (>25 uIU/mL)."
            elif lang == "hi":
                return f"फास्टिंग इंसुलिन {val} uIU/mL इंसुलिन प्रतिरोध (हाइपरइंसुलिनमिया: >25 uIU/mL) को इंगित करता है।"
            return f"Fasting insulin of {val} uIU/mL indicates potential hyperinsulinemia / insulin resistance (>25 uIU/mL)."

    return f"{key}: {val} ({status})"


def get_clinical_concern(key: str, val: float, status: str, lang: str = "en") -> Optional[str]:
    """Generates localized primary clinical concern message."""
    lang = normalize_language(lang)

    if key == "glucose_level":
        if status == "LOW":
            return "இரத்தச் சர்க்கரைக் குறைவு அபாயம் (<70 mg/dL)" if lang == "ta" else "हाइपोग्लाइसीमिया जोखिम (<70 mg/dL)" if lang == "hi" else "Hypoglycemia risk detected (<70 mg/dL)"
        elif status == "BORDERLINE":
            return f"முன்-நீரிழிவு இரத்த சர்க்கரை அதிகரிப்பு ({val} mg/dL)" if lang == "ta" else f"प्री-डायबिटिक ग्लूकोज वृद्धि ({val} mg/dL)" if lang == "hi" else f"Pre-diabetic glucose elevation ({val} mg/dL)"
        elif status == "CRITICAL":
            return f"நீரிழிவு வரம்பு மீறப்பட்டது ({val} mg/dL)" if lang == "ta" else f"हाइपरग्लाइसीमिया / मधुमेह सीमा पार ({val} mg/dL)" if lang == "hi" else f"Hyperglycemia / Diabetic threshold exceeded ({val} mg/dL)"

    elif key == "blood_pressure":
        if status == "LOW":
            return "குறைந்த இரத்த அழுத்தம் (<90 mmHg)" if lang == "ta" else "हाइपोटेंशन का पता चला (<90 mmHg)" if lang == "hi" else "Hypotension detected (<90 mmHg)"
        elif status == "BORDERLINE":
            return f"அதிகரித்த இரத்த அழுத்தம் ({val} mmHg)" if lang == "ta" else f"बढ़ा हुआ रक्तचाप ({val} mmHg)" if lang == "hi" else f"Elevated blood pressure ({val} mmHg)"
        elif status == "ELEVATED":
            return f"நிலை 1 உயர் இரத்த அழுத்தம் ({val} mmHg)" if lang == "ta" else f"स्टेज 1 उच्च रक्तचाप ({val} mmHg)" if lang == "hi" else f"Stage 1 Hypertension ({val} mmHg)"
        elif status == "CRITICAL":
            return f"நிலை 2 உயர் இரத்த அழுத்தம் ({val} mmHg)" if lang == "ta" else f"स्टेज 2 उच्च रक्तचाप ({val} mmHg)" if lang == "hi" else f"Stage 2 Hypertension ({val} mmHg)"

    elif key == "bmi":
        if status == "BORDERLINE":
            return f"அதிக உடல் நிறை குறியீடு ({val} kg/m²)" if lang == "ta" else f"अधिक वजन बीएमआई ({val} kg/m²)" if lang == "hi" else f"Overweight BMI ({val} kg/m²)"
        elif status == "CRITICAL":
            return f"மருத்துவ உடல் பருமன் (BMI {val} kg/m²)" if lang == "ta" else f"क्लिनिकल मोटापा (BMI {val} kg/m²)" if lang == "hi" else f"Clinical Obesity (BMI {val} kg/m²)"

    elif key == "cholesterol":
        if status == "BORDERLINE":
            return f"எல்லைக்கோடு கொழுப்பு ({val} mg/dL)" if lang == "ta" else f"बॉर्डरलाइन कोलेस्ट्रॉल ({val} mg/dL)" if lang == "hi" else f"Borderline cholesterol ({val} mg/dL)"
        elif status == "CRITICAL":
            return f"அதிக கொழுப்பு நிலை ({val} mg/dL)" if lang == "ta" else f"हाइपरकोलेस्ट्रोलेमिया ({val} mg/dL)" if lang == "hi" else f"Hypercholesterolemia ({val} mg/dL)"

    elif key == "heart_rate":
        if status == "CRITICAL":
            return f"விரைவான இதயத் துடிப்பு ({val} bpm)" if lang == "ta" else f"टैचीकार्डिया (तेज नाड़ी) ({val} bpm)" if lang == "hi" else f"Tachycardia detected ({val} bpm)"

    elif key == "insulin":
        if status in ("ELEVATED", "CRITICAL"):
            return f"அதிகரித்த இன்சுலின் அளவு ({val} uIU/mL)" if lang == "ta" else f"बढ़ा हुआ फास्टिंग इंसुलिन ({val} uIU/mL)" if lang == "hi" else f"Elevated fasting insulin ({val} uIU/mL)"

    return None
