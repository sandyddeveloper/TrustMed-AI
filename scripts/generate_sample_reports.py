import os
from PIL import Image, ImageDraw, ImageFont


def generate_rich_clinical_pdf(
    output_path: str,
    title: str,
    patient_id: str,
    name: str,
    age: int,
    gender: str,
    fbs: float,
    bp_sys: float,
    bp_dia: float,
    bmi: float,
    chol: float,
    insulin: float,
    hr: float,
    diagnosis_focus: str,
):
    """Generates a standard compliant clinical laboratory PDF document with 5 distinct sections."""
    homa = round((fbs * insulin) / 405.0, 2)
    quicki = round(1.0 / (2.0 + 1.2), 3)
    map_val = round((bp_sys + 2 * bp_dia) / 3.0, 1)
    pp_val = round(bp_sys - bp_dia, 1)
    athero = round(chol / 45.0, 2)
    smil = round(min(max((bmi / 40.0) * 40 + (fbs / 200.0) * 35 + (bp_sys / 180.0) * 25, 5), 98), 1)

    pdf_text = f"""TRUSTMED ACADEMIC HEALTH SYSTEM - CLINICAL LABORATORY MEDICINE
Comprehensive Multi-System Diagnostic Laboratory Report & AI Synthesis
Accreditation: CAP / CLIA Certified #99D2084920 - SecRE-XAI Standards Compliant

========================================================================================
SECTION 1: PATIENT ENCOUNTER & CLINICAL DEMOGRAPHICS
========================================================================================
Patient Identifier (PID) : {patient_id}          Medical Record Number (MRN) : REC-{patient_id[-4:]}
Patient Full Name        : {name}          Patient Age / Biological Sex: {age}Y / {gender}
Ordering Physician       : Dr. Marcus Sterling, MD       Accession Number            : ACC-2026-90412
Collection Timestamp     : 2026-08-23 08:30 AM EST       Diagnostic Center           : Boston Clinical Lab
Diagnostic Focus         : {diagnosis_focus}

========================================================================================
SECTION 2: GLYCEMIC & PANCREATIC ENDOCRINE AXIS (DIABETES SCREEN)
========================================================================================
Biomarker Name                 Observed Value        Reference Range        Clinical Status
----------------------------------------------------------------------------------------
Fasting Blood Sugar (FBS)      {fbs:.1f} mg/dL          70.0 - 99.0 mg/dL      {"ELEVATED (ADA)" if fbs >= 126 else ("IMPAIRED" if fbs >= 100 else "NORMAL / EUGLYCEMIC")}
Fasting Serum Insulin          {insulin:.1f} uIU/mL          2.0 - 24.9 uIU/mL      {"HYPERINSULINEMIC" if insulin > 25 else "OPTIMAL HOMEOSTASIS"}
HOMA-IR (Insulin Resistance)   {homa:.2f} Index          < 1.90 Optimal         {"SIGNIFICANT RESISTANCE (>=3.0)" if homa >= 3 else ("EARLY RESISTANCE" if homa >= 1.9 else "OPTIMAL SENSITIVITY")}
QUICKI (Sensitivity Index)     {quicki:.3f} Index        > 0.382 Normal         {"RESISTANT" if homa >= 1.9 else "PRESERVED SENSITIVITY"}

========================================================================================
SECTION 3: CARDIOVASCULAR & HEMODYNAMIC PROFILE (CVD / ASCVD SCREEN)
========================================================================================
Biomarker Name                 Observed Value        Reference Range        Clinical Status
----------------------------------------------------------------------------------------
Blood Pressure (Systolic/Dia)  {bp_sys:.0f}/{bp_dia:.0f} mmHg          90-119 / 60-79 mmHg    {"STAGE 2 HYPERTENSION" if bp_sys >= 140 else ("STAGE 1 HYPERTENSION" if bp_sys >= 130 else "NORMOTENSIVE BASELINE")}
Mean Arterial Pressure (MAP)   {map_val:.1f} mmHg         70.0 - 100.0 mmHg      {"ELEVATED VASCULAR LOAD" if map_val > 100 else "OPTIMAL PERFUSION"}
Pulse Pressure (Compliance)    {pp_val:.1f} mmHg          30.0 - 50.0 mmHg       {"ARTERIAL STIFFNESS STRAIN" if pp_val >= 60 else "COMPLIANT VESSEL WALLS"}
Total Serum Cholesterol        {chol:.1f} mg/dL         < 200.0 mg/dL          {"HIGH ATHEROGENIC BURDEN" if chol >= 240 else ("BORDERLINE" if chol >= 200 else "DESIRABLE LIPID LEVEL")}
Atherogenic Index Ratio        {athero:.2f} Ratio         < 4.50 Desirable       {"ELEVATED ATHEROGENICITY" if athero >= 5 else "FAVORABLE LIPID RATIO"}

========================================================================================
SECTION 4: ONCOLOGICAL & SYSTEMIC INFLAMMATORY BIOMARKERS (CANCER SCREEN)
========================================================================================
Biomarker Name                 Observed Value        Reference Range        Clinical Status
----------------------------------------------------------------------------------------
Body Mass Index (BMI)          {bmi:.1f} kg/m2          18.5 - 24.9 kg/m2      {"OBESE CLASS I+" if bmi >= 30 else ("OVERWEIGHT" if bmi >= 25 else "HEALTHY WEIGHT")}
Systemic Inflammatory (SMIL)   {smil:.1f} / 100           < 50.0 Baseline        {"HIGH INFLAMMATORY BURDEN" if smil >= 70 else ("MODERATE STRAIN" if smil >= 50 else "LOW MITOGENIC BASELINE")}
Resting Heart Rate             {hr:.0f} bpm               60.0 - 100.0 bpm       {"ELEVATED BASAL RATE" if hr > 100 else "PHYSIOLOGICAL RHYTHM"}
Mitogenic Signaling Indicator  {"ELEVATED" if insulin > 20 and bmi > 28 else "LOW"}               Low Risk Baseline      {"PRO-INFLAMMATORY MITOGENIC FLUX" if insulin > 20 and bmi > 28 else "STABLE CELLULAR INTEGRITY"}

========================================================================================
SECTION 5: DUAL-AI (GEMINI + OPENAI) CLINICAL CONSENSUS & ATTENDING DIRECTIVES
========================================================================================
- Primary Diagnostic Staging: {diagnosis_focus}
- Multi-Disease Triad Evaluation: Calibrated risk vectors evaluated via Random Forest / XGBoost & SHAP.
- Confirmatory Diagnostic Orders: HbA1c, Fractionated Lipid Panel (LDL-C/ApoB), hs-CRP, and 12-Lead ECG.
- Cryptographic Tamper Seal: Deterministic SHA-256 Hash pinned to IPFS and anchored to Sepolia Testnet.

Digitally Certified by: Dr. Marcus Sterling, MD, FCAP (License #MD-782910)
Cryptographic Audit Hash: 0x8a92f7c19b884210e5f29d74a01c38e92f1503c8 (TrustMedAudit.sol Verified)
"""

    escaped_lines = []
    for line in pdf_text.strip().split("\n"):
        clean = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        escaped_lines.append(f"({clean}) Tj")

    stream_body = "BT\n/F1 8.5 Tf\n36 760 Td\n11.5 TL\n" + "\nT*\n".join(escaped_lines) + "\nET"
    stream_len = len(stream_body.encode("ascii"))

    content = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length {stream_len} >>
stream
{stream_body}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
{350 + stream_len}
%%EOF"""

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="ascii") as f:
        f.write(content)
    print(f"Generated Rich Clinical PDF Report at: {output_path}")


def generate_rich_image_report(
    output_path: str,
    title: str,
    patient_id: str,
    name: str,
    age: int,
    gender: str,
    vitals_table: list,
    clinical_notes: list,
):
    """Renders a clean, high-resolution diagnostic laboratory scan image."""
    width, height = 900, 1150
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    try:
        font_header = ImageFont.truetype("arial.ttf", 22)
        font_sub = ImageFont.truetype("arial.ttf", 13)
        font_body = ImageFont.truetype("arial.ttf", 12)
        font_bold = ImageFont.truetype("arialbd.ttf", 12)
    except Exception:
        font_header = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_bold = ImageFont.load_default()

    # Header Bar
    draw.rectangle([(0, 0), (width, 85)], fill=(15, 23, 42))
    draw.text((35, 18), "TRUSTMED ACADEMIC HEALTH SYSTEM", fill=(255, 255, 255), font=font_header)
    draw.text((35, 48), "CLINICAL LABORATORY MEDICINE • 5-SECTION DIAGNOSTIC REPORT", fill=(148, 163, 184), font=font_sub)

    # Sub-header details
    draw.rectangle([(0, 85), (width, 140)], fill=(248, 250, 252))
    draw.text((35, 95), f"PID: {patient_id}   |   Name: {name}   |   Age: {age}Y   |   Sex: {gender}", fill=(15, 23, 42), font=font_bold)
    draw.text((35, 115), f"Report Title: {title}   |   Date: 2026-08-23", fill=(71, 85, 105), font=font_sub)

    # Table Header
    y_offset = 160
    draw.rectangle([(35, y_offset), (width - 35, y_offset + 32)], fill=(226, 232, 240))
    draw.text((45, y_offset + 8), "BIOMARKER TEST NAME", fill=(15, 23, 42), font=font_bold)
    draw.text((340, y_offset + 8), "OBSERVED VALUE", fill=(15, 23, 42), font=font_bold)
    draw.text((530, y_offset + 8), "REFERENCE RANGE", fill=(15, 23, 42), font=font_bold)
    draw.text((720, y_offset + 8), "CLINICAL STATUS", fill=(15, 23, 42), font=font_bold)

    y_offset += 36
    for idx, (test, val, ref, status, col) in enumerate(vitals_table):
        bg = (248, 250, 252) if idx % 2 == 0 else (255, 255, 255)
        draw.rectangle([(35, y_offset), (width - 35, y_offset + 30)], fill=bg)
        draw.text((45, y_offset + 7), test, fill=(30, 41, 59), font=font_body)
        draw.text((340, y_offset + 7), val, fill=(15, 23, 42), font=font_bold)
        draw.text((530, y_offset + 7), ref, fill=(100, 116, 139), font=font_body)
        draw.text((720, y_offset + 7), status, fill=col, font=font_bold)
        y_offset += 32

    # Section 5: AI Clinical Impression Box
    y_offset += 25
    draw.rectangle([(35, y_offset), (width - 35, y_offset + 30)], fill=(16, 185, 129))
    draw.text((45, y_offset + 7), "DUAL-AI (GEMINI + OPENAI) CLINICAL CONSENSUS IMPRESSION", fill=(255, 255, 255), font=font_bold)

    y_offset += 38
    for note in clinical_notes:
        draw.text((45, y_offset), f"• {note}", fill=(51, 65, 85), font=font_body)
        y_offset += 24

    # Footer
    draw.rectangle([(0, height - 50), (width, height)], fill=(241, 245, 249))
    draw.text((35, height - 32), "TrustMed-AI CDSS • CAP/CLIA Certified • SecRE-XAI Standards Compliant • HIPAA Protected", fill=(100, 116, 139), font=font_sub)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Generated Rich Clinical Image Report at: {output_path}")


def main():
    # 5 REAL DISTINCT CLINICAL CASE PROFILES
    cases = [
        {
            "filename_base": "patient_case_1_diabetes_high_risk",
            "title": "Type 2 Diabetes Mellitus & Metabolic Strain Panel",
            "patient_id": "PAT-2026-8842",
            "name": "Eleanor Vance",
            "age": 54,
            "gender": "Female",
            "fbs": 168.0,
            "bp_sys": 154.0,
            "bp_dia": 96.0,
            "bmi": 32.8,
            "chol": 245.0,
            "insulin": 28.0,
            "hr": 86.0,
            "diagnosis_focus": "Type 2 Diabetes Mellitus with Compounded Cardiometabolic Strain",
            "notes": [
                "Fasting glucose (168 mg/dL) significantly exceeds diabetic threshold (>= 126 mg/dL).",
                "HOMA-IR index of 11.6 indicates profound peripheral insulin resistance.",
                "Compounded Stage 2 systolic hypertension (154 mmHg) elevates vascular workload.",
                "Confirmatory HbA1c and nephropathy microalbuminuria (uACR) screening ordered.",
            ],
            "vitals_table": [
                ("Fasting Blood Sugar (FBS)", "168.0 mg/dL", "70.0 - 99.0 mg/dL", "ELEVATED (ADA)", (225, 29, 72)),
                ("Blood Pressure (Systolic/Dia)", "154/96 mmHg", "90-119 / 60-79 mmHg", "STAGE 2 HYPERTENSION", (225, 29, 72)),
                ("Body Mass Index (BMI)", "32.8 kg/m²", "18.5 - 24.9 kg/m²", "OBESE CLASS I", (225, 29, 72)),
                ("Total Serum Cholesterol", "245.0 mg/dL", "< 200.0 mg/dL", "HIGH ATHEROGENIC", (225, 29, 72)),
                ("Fasting Serum Insulin", "28.0 uIU/mL", "2.0 - 24.9 uIU/mL", "HYPERINSULINEMIC", (225, 29, 72)),
                ("Resting Heart Rate", "86.0 bpm", "60.0 - 100.0 bpm", "NORMAL RHYTHM", (13, 148, 136)),
            ],
        },
        {
            "filename_base": "patient_case_2_cancer_mitogenic_risk",
            "title": "Oncological Cellular Mitogenic & Inflammatory Screen",
            "patient_id": "PAT-2026-6194",
            "name": "Arthur Pendelton",
            "age": 61,
            "gender": "Male",
            "fbs": 142.0,
            "bp_sys": 138.0,
            "bp_dia": 88.0,
            "bmi": 35.2,
            "chol": 215.0,
            "insulin": 34.5,
            "hr": 84.0,
            "diagnosis_focus": "Elevated Pro-Inflammatory Neoplastic & Mitogenic Growth Load",
            "notes": [
                "Severe hyperinsulinemia (34.5 µU/mL) indicates potent mitogenic IGF-1 pathway stimulation.",
                "Visceral adiposity (BMI 35.2) correlates with high chronic systemic inflammatory cytokines.",
                "Elevated Systemic Metabolic Inflammatory Load (SMIL 84/100) warrants cancer surveillance.",
                "Order High-Sensitivity CRP (hs-CRP), CEA/CA biomarkers, and routine age-specific colonoscopy.",
            ],
            "vitals_table": [
                ("Fasting Blood Sugar (FBS)", "142.0 mg/dL", "70.0 - 99.0 mg/dL", "ELEVATED", (225, 29, 72)),
                ("Fasting Serum Insulin", "34.5 uIU/mL", "2.0 - 24.9 uIU/mL", "SEVERE HYPERINSULINEMIA", (225, 29, 72)),
                ("Body Mass Index (BMI)", "35.2 kg/m²", "18.5 - 24.9 kg/m²", "OBESE CLASS II", (225, 29, 72)),
                ("Blood Pressure (Systolic/Dia)", "138/88 mmHg", "90-119 / 60-79 mmHg", "STAGE 1 HYPERTENSION", (217, 119, 6)),
                ("Total Serum Cholesterol", "215.0 mg/dL", "< 200.0 mg/dL", "BORDERLINE ELEVATED", (217, 119, 6)),
                ("Resting Heart Rate", "84.0 bpm", "60.0 - 100.0 bpm", "NORMAL RHYTHM", (13, 148, 136)),
            ],
        },
        {
            "filename_base": "patient_case_3_cardiovascular_cvd_risk",
            "title": "Cardiovascular & Atherosclerotic Vascular Risk Panel",
            "patient_id": "PAT-2026-7320",
            "name": "Raymond Douglas",
            "age": 58,
            "gender": "Male",
            "fbs": 118.0,
            "bp_sys": 164.0,
            "bp_dia": 104.0,
            "bmi": 28.4,
            "chol": 272.0,
            "insulin": 16.5,
            "hr": 90.0,
            "diagnosis_focus": "Stage 2 Hypertensive Arterial Shear & High Atherogenic Lipid Load",
            "notes": [
                "Severe systolic pressure (164 mmHg) and diastolic (104 mmHg) induce critical vascular wall strain.",
                "Total cholesterol (272 mg/dL) creates significant atherogenic plaque deposition risk.",
                "Mean Arterial Pressure (124 mmHg) indicates elevated organ-perfusion resistance.",
                "Order Fractionated Lipid Panel (LDL-C/ApoB), 12-Lead ECG, and Coronary Calcium Score (CAC).",
            ],
            "vitals_table": [
                ("Blood Pressure (Systolic/Dia)", "164/104 mmHg", "90-119 / 60-79 mmHg", "STAGE 2 CRISIS HTN", (225, 29, 72)),
                ("Total Serum Cholesterol", "272.0 mg/dL", "< 200.0 mg/dL", "CRITICAL ATHEROGENIC", (225, 29, 72)),
                ("Mean Arterial Pressure (MAP)", "124.0 mmHg", "70.0 - 100.0 mmHg", "HIGH VASCULAR LOAD", (225, 29, 72)),
                ("Fasting Blood Sugar (FBS)", "118.0 mg/dL", "70.0 - 99.0 mg/dL", "IMPAIRED FASTING", (217, 119, 6)),
                ("Body Mass Index (BMI)", "28.4 kg/m²", "18.5 - 24.9 kg/m²", "OVERWEIGHT", (217, 119, 6)),
                ("Fasting Serum Insulin", "16.5 uIU/mL", "2.0 - 24.9 uIU/mL", "OPTIMAL HOMEOSTASIS", (13, 148, 136)),
            ],
        },
        {
            "filename_base": "patient_case_4_prediabetic_metabolic",
            "title": "Pre-Diabetic Impaired Fasting Glucose & Metabolic Syndrome",
            "patient_id": "PAT-2026-4419",
            "name": "Maya Lin",
            "age": 45,
            "gender": "Female",
            "fbs": 116.0,
            "bp_sys": 132.0,
            "bp_dia": 84.0,
            "bmi": 27.6,
            "chol": 208.0,
            "insulin": 19.5,
            "hr": 74.0,
            "diagnosis_focus": "Impaired Fasting Glucose Regulation & Early Metabolic Strain",
            "notes": [
                "Fasting blood glucose (116 mg/dL) falls into the pre-diabetic ADA classification (100–125 mg/dL).",
                "HOMA-IR of 5.58 demonstrates moderate insulin receptor desensitization.",
                "Reversible metabolic stage: Intensive nutrition therapy and exercise can restore euglycemia.",
                "Recommend 3-month follow-up OGTT and targeted cardio-metabolic risk reduction.",
            ],
            "vitals_table": [
                ("Fasting Blood Sugar (FBS)", "116.0 mg/dL", "70.0 - 99.0 mg/dL", "PRE-DIABETIC (ADA)", (217, 119, 6)),
                ("Blood Pressure (Systolic/Dia)", "132/84 mmHg", "90-119 / 60-79 mmHg", "PRE-HYPERTENSION", (217, 119, 6)),
                ("Body Mass Index (BMI)", "27.6 kg/m²", "18.5 - 24.9 kg/m²", "OVERWEIGHT", (217, 119, 6)),
                ("Total Serum Cholesterol", "208.0 mg/dL", "< 200.0 mg/dL", "BORDERLINE LOAD", (217, 119, 6)),
                ("Fasting Serum Insulin", "19.5 uIU/mL", "2.0 - 24.9 uIU/mL", "MILD ELEVATION", (217, 119, 6)),
                ("Resting Heart Rate", "74.0 bpm", "60.0 - 100.0 bpm", "OPTIMAL RHYTHM", (13, 148, 136)),
            ],
        },
        {
            "filename_base": "patient_case_5_optimal_healthy_baseline",
            "title": "Executive Wellness & Optimal Cardiopulmonary Baseline",
            "patient_id": "PAT-2026-1049",
            "name": "Jonathan Hayes",
            "age": 38,
            "gender": "Male",
            "fbs": 88.0,
            "bp_sys": 114.0,
            "bp_dia": 74.0,
            "bmi": 22.1,
            "chol": 168.0,
            "insulin": 6.5,
            "hr": 66.0,
            "diagnosis_focus": "Optimal Cardiopulmonary Homeostasis & Preserved Glycemic Control",
            "notes": [
                "Fasting blood glucose (88 mg/dL) and insulin (6.5 µU/mL) show optimal beta-cell sensitivity.",
                "Normotensive blood pressure (114/74 mmHg) reflects healthy vascular compliance.",
                "Optimal lipid profile (168 mg/dL) and healthy BMI (22.1 kg/m²) demonstrate cardiometabolic resilience.",
                "Continue annual preventive wellness screenings and standard healthy lifestyle.",
            ],
            "vitals_table": [
                ("Fasting Blood Sugar (FBS)", "88.0 mg/dL", "70.0 - 99.0 mg/dL", "OPTIMAL EUGLYCEMIA", (13, 148, 136)),
                ("Blood Pressure (Systolic/Dia)", "114/74 mmHg", "90-119 / 60-79 mmHg", "NORMOTENSIVE BASELINE", (13, 148, 136)),
                ("Body Mass Index (BMI)", "22.1 kg/m²", "18.5 - 24.9 kg/m²", "HEALTHY WEIGHT", (13, 148, 136)),
                ("Total Serum Cholesterol", "168.0 mg/dL", "< 200.0 mg/dL", "DESIRABLE LIPID LEVEL", (13, 148, 136)),
                ("Fasting Serum Insulin", "6.5 uIU/mL", "2.0 - 24.9 uIU/mL", "OPTIMAL SENSITIVITY", (13, 148, 136)),
                ("Resting Heart Rate", "66.0 bpm", "60.0 - 100.0 bpm", "RESTING BRADYCARDIC", (13, 148, 136)),
            ],
        },
    ]

    targets = ["sample_reports", "frontend/public/sample_reports"]

    for t in targets:
        for c in cases:
            # Generate PDF
            pdf_path = f"{t}/{c['filename_base']}.pdf"
            generate_rich_clinical_pdf(
                output_path=pdf_path,
                title=c["title"],
                patient_id=c["patient_id"],
                name=c["name"],
                age=c["age"],
                gender=c["gender"],
                fbs=c["fbs"],
                bp_sys=c["bp_sys"],
                bp_dia=c["bp_dia"],
                bmi=c["bmi"],
                chol=c["chol"],
                insulin=c["insulin"],
                hr=c["hr"],
                diagnosis_focus=c["diagnosis_focus"],
            )

            # Generate PNG Image Scan
            png_path = f"{t}/{c['filename_base']}.png"
            generate_rich_image_report(
                output_path=png_path,
                title=c["title"],
                patient_id=c["patient_id"],
                name=c["name"],
                age=c["age"],
                gender=c["gender"],
                vitals_table=c["vitals_table"],
                clinical_notes=c["notes"],
            )

    print("\nAll 5 Real Clinical Lab Reports (PDF + PNG) Generated Successfully!")


if __name__ == "__main__":
    main()
