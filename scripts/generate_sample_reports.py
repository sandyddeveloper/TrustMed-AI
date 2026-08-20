import os
from PIL import Image, ImageDraw

def generate_sample_image_report(output_path: str, title: str, patient_id: str, name: str, age: int, gender: str, vitals_data: list, status_notes: list):
    """Generates a high-resolution authentic clinical laboratory diagnostic report image."""
    width, height = 1000, 1300
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Header Banner
    draw.rectangle([(0, 0), (width, 130)], fill=(15, 118, 110)) # Deep Emerald

    # Hospital / Lab Title
    draw.text((45, 20), "TRUSTMED ACADEMIC HEALTH SYSTEM", fill=(255, 255, 255))
    draw.text((45, 50), "Department of Laboratory Medicine & Diagnostic Endocrinology", fill=(204, 251, 241))
    draw.text((45, 80), f"Clinical Panel: {title}", fill=(255, 255, 255))
    draw.text((45, 105), "CAP / CLIA Accredited Laboratory - ISO 15189 Certified - SecRE-XAI Verified", fill=(204, 251, 241))

    # Barcode representation
    for x_b in range(750, 940, 4):
        w_bar = 2 if x_b % 8 == 0 else 1
        draw.line([(x_b, 30), (x_b, 90)], fill=(255, 255, 255), width=w_bar)
    draw.text((760, 95), "ACC-2026-89410", fill=(204, 251, 241))

    # Patient Demographic Box
    draw.rectangle([(40, 150), (960, 260)], outline=(203, 213, 225), fill=(248, 250, 252), width=2)
    draw.text((60, 165), f"Patient Identifier (PID): {patient_id}", fill=(15, 23, 42))
    draw.text((60, 195), f"Patient Full Name: {name}", fill=(15, 23, 42))
    draw.text((60, 225), f"Biological Gender: {gender}", fill=(15, 23, 42))

    draw.text((540, 165), "Medical Record No: REC-84950", fill=(15, 23, 42))
    draw.text((540, 195), f"Patient Age: {age} Years", fill=(15, 23, 42))
    draw.text((540, 225), "Collection Date: 2026-08-19 (Fasting 12h)", fill=(15, 23, 42))

    # Table Header
    y = 285
    draw.rectangle([(40, y), (960, y + 40)], fill=(241, 245, 249))
    draw.text((60, y + 12), "BIOMARKER TEST NAME", fill=(51, 65, 85))
    draw.text((400, y + 12), "OBSERVED VALUE", fill=(51, 65, 85))
    draw.text((600, y + 12), "CLINICAL REFERENCE RANGE", fill=(51, 65, 85))
    draw.text((840, y + 12), "FLAG / STATUS", fill=(51, 65, 85))

    # Data Rows
    y += 50
    for row_name, val_str, ref_str, status_str, text_color in vitals_data:
        draw.rectangle([(40, y), (960, y + 50)], outline=(226, 232, 240), fill=(255, 255, 255), width=1)
        draw.text((60, y + 16), row_name, fill=(15, 23, 42))
        draw.text((400, y + 16), val_str, fill=(15, 23, 42))
        draw.text((600, y + 16), ref_str, fill=(100, 116, 139))
        draw.text((840, y + 16), status_str, fill=text_color)
        y += 60

    # Clinical Notes Box
    y += 20
    draw.rectangle([(40, y), (960, y + 190)], outline=(203, 213, 225), fill=(248, 250, 252), width=1)
    draw.text((60, y + 15), "AUTHORITATIVE CLINICAL GUIDELINE BENCHMARKS (ADA / AHA / WHO / NCEP):", fill=(15, 23, 42))
    
    note_y = y + 45
    for note in status_notes:
        draw.text((60, note_y), f"- {note}", fill=(51, 65, 85))
        note_y += 26

    # Digital Signature & EVM Hash
    y += 215
    draw.rectangle([(40, y), (960, y + 90)], outline=(167, 243, 208), fill=(240, 253, 250), width=1)
    draw.text((60, y + 15), "OFFICIAL PATHOLOGIST DIGITAL CERTIFICATION", fill=(15, 118, 110))
    draw.text((60, y + 40), "Pathologist: Dr. Marcus Sterling, MD, FCAP (Lic #MD-782910)", fill=(51, 65, 85))
    draw.text((60, y + 62), "SHA-256 Digest: 0x8a92f7c19b884210e5f29d74a01c38e92f1503c8 (Verified On-Chain)", fill=(100, 116, 139))

    # Footer
    draw.rectangle([(0, height - 50), (width, height)], fill=(241, 245, 249))
    draw.text((40, height - 32), "TrustMed-AI Clinical Decision Support System - Confidential Medical Document - HIPAA Protected", fill=(100, 116, 139))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Generated image report at: {output_path}")


def generate_sample_pdf_report(output_path: str, title: str, patient_id: str, name: str, age: int, gender: str, fbs: float, bp_sys: float, bp_dia: float, bmi: float, chol: float, insulin: float, hr: float):
    """Generates a standard compliant clinical laboratory PDF document."""
    
    pdf_text = f"""TRUSTMED ACADEMIC HEALTH SYSTEM - CLINICAL LABORATORY MEDICINE
Comprehensive Health & Metabolic Biomarker Examination Report
Accreditation: CAP / CLIA Certified - SecRE-XAI Standards Compliant

========================================================================================
PATIENT DEMOGRAPHIC & CLINICAL ENCOUNTER
========================================================================================
Patient Identifier (PID) : {patient_id}          Medical Record Number (MRN) : REC-84950
Patient Full Name        : {name}          Patient Age                 : {age} Years
Biological Gender        : {gender}                    Specimen Collection Date    : 2026-08-19
Ordering Clinician       : Dr. Marcus Sterling, MD       Accession Number            : ACC-2026-89410
========================================================================================
BIOMARKER TEST NAME                OBSERVED VALUE        REFERENCE RANGE        CLINICAL STATUS
========================================================================================
Fasting Blood Sugar (FBS)          {fbs:.1f} mg/dL          70.0 - 99.0 mg/dL      {"ELEVATED (ADA)" if fbs > 100 else "NORMAL"}
Blood Pressure (Systolic/Diastolic){bp_sys:.0f}/{bp_dia:.0f} mmHg          90-119 / 60-79 mmHg    {"STAGE 2 HYPERTENSION" if bp_sys >= 140 else ("ELEVATED" if bp_sys >= 120 else "OPTIMAL")}
Body Mass Index (BMI)              {bmi:.1f} kg/m2          18.5 - 24.9 kg/m2      {"OBESE (WHO)" if bmi >= 30 else ("OVERWEIGHT" if bmi >= 25 else "NORMAL")}
Total Serum Cholesterol            {chol:.1f} mg/dL         < 200.0 mg/dL          {"HIGH (NCEP)" if chol >= 240 else ("BORDERLINE" if chol >= 200 else "OPTIMAL")}
Fasting Serum Insulin              {insulin:.1f} uIU/mL          2.0 - 25.0 uIU/mL      {"ELEVATED" if insulin > 25 else "OPTIMAL"}
Resting Heart Rate                 {hr:.0f} bpm               60 - 100 bpm           {"NORMAL" if 60 <= hr <= 100 else "ELEVATED"}
========================================================================================
CLINICAL INTERPRETATION & ACTIONABLE NEXT STEPS:
- Glucose observed at {fbs:.1f} mg/dL evaluated against American Diabetes Association (ADA) plasma guidelines.
- Blood pressure of {bp_sys:.0f}/{bp_dia:.0f} mmHg evaluated against AHA/ACC 2017 clinical standards.
- Lipid profile and body mass index evaluated against WHO / NCEP ATP III guidelines.
- Verified values eligible for SecRE-XAI Dual-Ensemble Risk Inference and EVM Blockchain Anchoring.
========================================================================================
Digitally Certified by: Dr. Marcus Sterling, MD, FCAP (License #MD-782910)
Cryptographic Hash: 0x8a92f7c19b884210e5f29d74a01c38e92f1503c8 (TrustMedAudit.sol Verified)
"""

    # Format into PDF stream
    escaped_lines = []
    for line in pdf_text.strip().split("\n"):
        clean = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        escaped_lines.append(f"({clean}) Tj")

    stream_body = "BT\n/F1 9 Tf\n40 760 Td\n13 TL\n" + "\nT*\n".join(escaped_lines) + "\nET"
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
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000224 00000 n 
0000001850 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1920
%%EOF
"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="ascii") as f:
        f.write(content)
    print(f"Generated PDF report at: {output_path}")


def main():
    # 1. High-Risk Metabolic Report
    high_risk_vitals = [
        ("Fasting Blood Sugar (FBS)", "168.0 mg/dL", "70.0 - 99.0 mg/dL", "CRITICAL HIGH", (225, 29, 72)),
        ("Systolic Blood Pressure", "154.0 mmHg", "90.0 - 119.0 mmHg", "STAGE 2", (225, 29, 72)),
        ("Body Mass Index (BMI)", "32.8 kg/m²", "18.5 - 24.9 kg/m²", "CLASS I OBESITY", (225, 29, 72)),
        ("Total Serum Cholesterol", "245.0 mg/dL", "< 200.0 mg/dL", "HIGH", (217, 119, 6)),
        ("Fasting Serum Insulin", "28.0 uIU/mL", "2.0 - 25.0 uIU/mL", "ELEVATED", (217, 119, 6)),
        ("Resting Heart Rate", "86.0 bpm", "60.0 - 100.0 bpm", "NORMAL", (13, 148, 136)),
    ]
    high_risk_notes = [
        "Fasting plasma glucose (168 mg/dL) exceeds ADA criteria for Type-2 Diabetes.",
        "Blood pressure (154 mmHg) represents Stage-2 Hypertension according to AHA 2017 guidelines.",
        "BMI (32.8) and Total Cholesterol (245 mg/dL) indicate severe metabolic syndrome risk.",
        "Immediate clinical intervention, glycemic management, and SecRE-XAI audit recommended.",
    ]

    # 2. Optimal Healthy Baseline Report
    healthy_vitals = [
        ("Fasting Blood Sugar (FBS)", "92.0 mg/dL", "70.0 - 99.0 mg/dL", "OPTIMAL", (13, 148, 136)),
        ("Systolic Blood Pressure", "118.0 mmHg", "90.0 - 119.0 mmHg", "OPTIMAL", (13, 148, 136)),
        ("Body Mass Index (BMI)", "22.4 kg/m²", "18.5 - 24.9 kg/m²", "NORMAL", (13, 148, 136)),
        ("Total Serum Cholesterol", "175.0 mg/dL", "< 200.0 mg/dL", "OPTIMAL", (13, 148, 136)),
        ("Fasting Serum Insulin", "8.2 uIU/mL", "2.0 - 25.0 uIU/mL", "OPTIMAL", (13, 148, 136)),
        ("Resting Heart Rate", "68.0 bpm", "60.0 - 100.0 bpm", "OPTIMAL", (13, 148, 136)),
    ]
    healthy_notes = [
        "Fasting blood glucose (92 mg/dL) is well within the normal physiological range (< 100 mg/dL).",
        "Normotensive blood pressure (118 mmHg) meets AHA ideal cardiovascular metrics.",
        "Healthy lipid panel and optimal body mass index indicate excellent metabolic resilience.",
        "Annual routine follow-up recommended; all biomarkers conform to baseline invariants.",
    ]

    # Generate files in sample_reports and frontend/public/sample_reports
    targets = ["sample_reports", "frontend/public/sample_reports"]
    for t in targets:
        # High Risk
        generate_sample_image_report(f"{t}/sample_clinical_report.png", "Comprehensive Metabolic Panel (High Risk)", "PAT-2026-8842", "Eleanor Vance", 54, "Female", high_risk_vitals, high_risk_notes)
        generate_sample_pdf_report(f"{t}/sample_clinical_report.pdf", "Comprehensive Metabolic Panel (High Risk)", "PAT-2026-8842", "Eleanor Vance", 54, "Female", 168.0, 154.0, 96.0, 32.8, 245.0, 28.0, 86.0)

        # Healthy
        generate_sample_image_report(f"{t}/sample_healthy_panel.png", "Executive Wellness & Metabolic Baseline", "PAT-2026-1049", "Jonathan Hayes", 38, "Male", healthy_vitals, healthy_notes)
        generate_sample_pdf_report(f"{t}/sample_healthy_panel.pdf", "Executive Wellness & Metabolic Baseline", "PAT-2026-1049", "Jonathan Hayes", 38, "Male", 92.0, 118.0, 76.0, 22.4, 175.0, 8.2, 68.0)

if __name__ == "__main__":
    main()
