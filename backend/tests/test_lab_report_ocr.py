import pytest
from backend.app.services.document_parser import parse_medical_report_text, parse_uploaded_document
from backend.app.services.benchmarks import evaluate_clinical_benchmarks


def test_marvel_diagnostic_centre_report_parsing():
    """
    Tests exact parsing against the real-world lab report from Marvel Diagnostic Centre:
    Patient: Mr. J. Mohan.
    Age / Sex: 50 Yrs. / Male
    S. No.: 820326
    Bl. Glucose ( F ) : 156.0 mg/dl
    Bl. Glucose ( PP ) : 249.8 mg/dl
    Sr. T. Cholesterol : 196.3 mg/dl
    Sr. Triglycerides : 267.0 mg/dl
    Sr. HDL - Cholesterol : 38.8 mg/dl
    LDL - Cholesterol : 104.4 mg/dl
    VLDL - Cholesterol : 53.1 mg/dl
    T. Cholesterol / HDL Ratio : 5.0
    """
    sample_ocr_text = """
    MARVEL DIAGNOSTIC CENTRE
    No. 3/7, 1st Cross Street, Devanesan Nagar, Peerkankaranai, Chennai - 600 063.
    Mobile: 87545 96253 / 90032 98357
    
    Patient Name: Mr. J. Mohan.
    Age / Sex: 50 Yrs. / Male
    Ref. by Dr. : SELF
    Date: 15. 03. 2026
    S. No.: 820326
    Mobile No.: 9789897960
    
    LABORATORY REPORT
    BIOCHEMISTRY
    Test Value Unit Reference range
    Bl. Glucose ( F ) : 156.0 mg/dl 70 - 110
    ( GOD & PAP Trinder's Method )
    Bl. Glucose ( PP ) : 249.8 mg/dl 70 - 140
    ( GOD & PAP Trinder's Method )
    
    LIPID PROFILE
    Sr. T. Cholesterol : 196.3 mg/dl 140 - 250
    ( CHOD / PAP Trinder's Method )
    Sr. Triglycerides : 267.0 mg/dl Upto 150
    ( GPO - PAP Trinder's Method )
    Sr. HDL - Cholesterol : 38.8 mg/dl Male : 30 - 70 Female : 30 - 85
    ( PVS - PEGME Method 5 th Gen)
    LDL - Cholesterol : 104.4 mg/dl < 100
    VLDL - Cholesterol : 53.1 mg/dl 20 - 30
    T. Cholesterol / HDL Ratio : 5.0 < 4.5
    
    *End of Report*
    """

    vitals, confidences, pid, name = parse_medical_report_text(sample_ocr_text)

    # Validate demographics
    assert name == "Mr. J. Mohan." or "Mohan" in name
    assert pid == "820326"
    assert vitals.get("age") == 50.0

    # Validate Fasting & PP Glucose
    assert vitals.get("glucose_level") == 156.0
    assert vitals.get("pp_glucose") == 249.8

    # Validate Lipid Profile
    assert vitals.get("cholesterol") == 196.3
    assert vitals.get("triglycerides") == 267.0
    assert vitals.get("hdl") == 38.8
    assert vitals.get("ldl") == 104.4
    assert vitals.get("vldl") == 53.1
    assert vitals.get("cholesterol_hdl_ratio") == 5.0

    # Validate clinical benchmarks
    benchmarks = evaluate_clinical_benchmarks(vitals, language="en")
    assert benchmarks.total_metrics_evaluated >= 6
    assert benchmarks.critical_count >= 1  # Fasting glucose 156.0 or PP glucose 249.8 is CRITICAL diabetes threshold
