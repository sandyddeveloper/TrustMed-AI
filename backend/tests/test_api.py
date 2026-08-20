import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.base import Base
from backend.app.db.session import engine

# Ensure tables exist for test run
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "TrustMed-AI" in data["message"]


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "services" in data


def test_auth_signup_and_login_flow():
    # 1. Signup a new clinician
    unique_id = "testclinician_99"
    signup_payload = {
        "email": f"{unique_id}@hospital.org",
        "password": "SecurePassword123!",
        "phone_number": "+1-555-999-8877",
        "first_name": "Sarah",
        "last_name": "Chen",
        "age": 42,
        "gender": "Female",
        "address": "789 Medical Center Dr, Boston, MA",
        "role": "Chief Medical Officer",
        "npi_number": "1928374650",
    }
    res_signup = client.post("/api/v1/auth/signup", json=signup_payload)
    if res_signup.status_code == 400:
        # User already exists from prior run, proceed to login
        pass
    else:
        assert res_signup.status_code == 201
        signup_data = res_signup.json()
        assert "access_token" in signup_data
        assert signup_data["user"]["email"] == f"{unique_id}@hospital.org"

    # 2. Login with phone_number & password
    login_payload = {
        "phone_number": "+1-555-999-8877",
        "password": "SecurePassword123!",
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # 3. Authenticated /me endpoint
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["phone_number"] == "+1-555-999-8877"


def test_dual_ensemble_random_forest_with_ipfs():
    payload = {
        "patient_id": "PAT-RF-001",
        "features": {
            "age": 62.0,
            "blood_pressure": 142.0,
            "glucose_level": 150.0,
            "bmi": 31.0,
            "insulin": 120.0,
            "cholesterol": 225.0,
            "heart_rate": 80.0,
        },
        "model_type": "random_forest",
        "explain": True,
        "xai_method": "shap",
        "pin_to_ipfs": True,
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "random_forest"
    assert "secre_compliance" in data
    assert data["secre_compliance"]["is_compliant"] is True
    assert data["secre_compliance"]["security_rate"] == 1.0
    assert data["deterministic_hash"].startswith("0x")
    assert data["ipfs_cid"].startswith("ipfs://")


def test_dual_ensemble_xgboost_with_aore_masking():
    payload = {
        "patient_id": "PAT-XGB-002",
        "features": {
            "age": 55.0,
            "blood_pressure": 130.0,
            "glucose_level": 115.0,
            "bmi": 27.5,
            "insulin": 85.0,
            "cholesterol": 195.0,
            "heart_rate": 72.0,
        },
        "model_type": "xgboost",
        "explain": True,
        "xai_method": "shap",
        "mask_demographics": True,
        "pin_to_ipfs": True,
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "xgboost"
    assert data["cross_val_auc"] >= 0.90
    masked_features = [f for f in data["feature_attributions"] if f["is_masked"]]
    assert len(masked_features) > 0
    assert data["ipfs_cid"] is not None


def test_secre_physiological_violation_detection():
    payload = {
        "patient_id": "PAT-VIOLATION",
        "features": {
            "age": 180.0,
            "blood_pressure": 400.0,
            "glucose_level": 100.0,
            "bmi": 25.0,
            "insulin": 75.0,
            "cholesterol": 200.0,
            "heart_rate": 75.0,
        },
        "model_type": "random_forest",
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["secre_compliance"]["is_compliant"] is False
    assert data["secre_compliance"]["security_rate"] < 1.0
    assert len(data["secre_compliance"]["violations"]) >= 2


def test_web3_anchor_and_integrity_verification():
    record_id = "REC-INTEGRITY-001"
    record_hash = "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b"
    
    # 1. Anchor record
    payload = {
        "record_id": record_id,
        "record_hash": record_hash,
        "ipfs_cid": "ipfs://QmSecREVerificationSnapshotTest",
        "diagnostic_result": "Diabetic / High Risk",
        "confidence_score": 0.942,
        "risk_score": 0.885,
    }
    res_anchor = client.post("/api/v1/web3/anchor", json=payload)
    assert res_anchor.status_code == 201
    assert res_anchor.json()["status"] == "anchored"

    # 2. 1-Click Verification with matching hash
    verify_payload = {
        "record_id": record_id,
        "claimed_hash": record_hash,
    }
    res_verify = client.post("/api/v1/web3/verify", json=verify_payload)
    assert res_verify.status_code == 200
    verify_data = res_verify.json()
    assert verify_data["is_authentic"] is True
    assert verify_data["authenticity_badge"] == "VERIFIED_AUTHENTIC"

    # 3. 1-Click Verification with tampered hash
    tampered_payload = {
        "record_id": record_id,
        "claimed_hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    }
    res_tamper = client.post("/api/v1/web3/verify", json=tampered_payload)
    assert res_tamper.status_code == 200
    assert res_tamper.json()["is_authentic"] is False
    assert res_tamper.json()["authenticity_badge"] == "TAMPER_DETECTED"


def test_batch_cohort_analyzer():
    payload = {
        "cohort_name": "Test Clinical Cohort",
        "patients": [
            {"patient_id": "PAT-C1", "age": 65.0, "blood_pressure": 150.0, "glucose_level": 160.0, "bmi": 32.0, "cholesterol": 230.0, "heart_rate": 82.0},
            {"patient_id": "PAT-C2", "age": 30.0, "blood_pressure": 115.0, "glucose_level": 88.0, "bmi": 22.0, "cholesterol": 160.0, "heart_rate": 68.0},
        ],
        "model_type": "xgboost",
        "pin_batch_to_ipfs": True,
    }
    response = client.post("/api/v1/cohort/batch-predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_patients"] == 2
    assert "cohort_security_rate" in data
    assert data["batch_record_hash"].startswith("0x")


def test_admin_login_and_summary():
    # 1. Login with Admin credentials
    login_res = client.post(
        "/api/v1/auth/login",
        json={"phone_number": "9345693386", "password": "250825"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    token = login_data["access_token"]
    assert login_data["user"]["role"] == "Admin"

    # 2. Access Admin Summary with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    summary_res = client.get("/api/v1/admin/summary", headers=headers)
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert "total_registered_users" in summary_data
    assert "total_patients" in summary_data
    assert summary_data["privacy_shield_active"] is True
    # Ensure NO PII is exposed
    assert "emails" not in summary_data
    assert "phone_numbers" not in summary_data
    assert "medical_records" not in summary_data


def test_report_upload_and_clinical_benchmarks():
    # 1. Test Report Extraction from simulated lab report text/document
    report_text = """
    CENTRAL CLINICAL LABORATORY
    Patient ID: PAT-REPORT-994
    Patient Name: Johnathan Doe
    Age: 52
    ---------------------------
    Fasting Blood Sugar (FBS): 142 mg/dL (Normal: 70-99)
    Blood Pressure: 138/88 mmHg
    Body Mass Index: 28.5 kg/m2
    Total Cholesterol: 215 mg/dL
    Resting Heart Rate: 78 bpm
    Fasting Insulin: 18.0 uIU/mL
    """
    files = {"file": ("clinical_report.txt", io.BytesIO(report_text.encode("utf-8")), "text/plain")}
    res = client.post("/api/v1/reports/upload-extract", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["detected_patient_id"] == "PAT-REPORT-994"
    assert data["extracted_vitals"]["glucose_level"] == 142.0
    assert data["extracted_vitals"]["blood_pressure"] == 138.0
    assert data["extracted_vitals"]["bmi"] == 28.5

    # Check Benchmarks
    benchmarks = data["benchmark_summary"]
    assert benchmarks["total_metrics_evaluated"] >= 5
    assert any(b["key"] == "glucose_level" and b["status"] == "CRITICAL" for b in benchmarks["benchmarks"])
    assert any(b["key"] == "blood_pressure" and b["status"] == "ELEVATED" for b in benchmarks["benchmarks"])

    # 2. Test Recalculate Benchmarks on Modified Values
    recalc_payload = {
        "vitals": {
            "glucose_level": 88.0,  # Now normal
            "blood_pressure": 115.0,  # Now normal
            "bmi": 22.4,  # Now normal
            "cholesterol": 175.0,
            "heart_rate": 72.0,
        }
    }
    recalc_res = client.post("/api/v1/reports/evaluate-benchmarks", json=recalc_payload)
    assert recalc_res.status_code == 200
    recalc_data = recalc_res.json()["benchmark_summary"]
    assert recalc_data["optimal_count"] == 5
    assert recalc_data["critical_count"] == 0
    assert recalc_data["overall_health_index"] == 100.0


def test_multi_language_backend_benchmark_responses_tamil_and_hindi():
    """Test that backend returns authentic Tamil and Hindi clinical benchmark interpretations."""
    payload = {
        "vitals": {
            "glucose_level": 168.0,
            "blood_pressure": 154.0,
            "bmi": 32.8,
            "cholesterol": 245.0,
            "heart_rate": 86.0,
        },
        "language": "ta",
    }
    
    # 1. Test Tamil Benchmark Evaluation
    res_ta = client.post("/api/v1/reports/evaluate-benchmarks", json=payload, headers={"Accept-Language": "ta"})
    assert res_ta.status_code == 200
    summary_ta = res_ta.json()["benchmark_summary"]
    assert len(summary_ta["benchmarks"]) >= 5
    
    glucose_b_ta = next(b for b in summary_ta["benchmarks"] if b["key"] == "glucose_level")
    assert "இரத்த சர்க்கரை" in glucose_b_ta["name"]
    assert "நீரிழிவு" in glucose_b_ta["interpretation"]
    assert "அமெரிக்க நீரிழிவு சங்கம்" in glucose_b_ta["guideline_source"]
    assert any("நீரிழிவு" in c for c in summary_ta["primary_clinical_concerns"])

    # 2. Test Hindi Benchmark Evaluation
    payload_hi = {**payload, "language": "hi"}
    res_hi = client.post("/api/v1/reports/evaluate-benchmarks", json=payload_hi, headers={"Accept-Language": "hi"})
    assert res_hi.status_code == 200
    summary_hi = res_hi.json()["benchmark_summary"]
    
    glucose_b_hi = next(b for b in summary_hi["benchmarks"] if b["key"] == "glucose_level")
    assert "ग्लूकोज" in glucose_b_hi["name"]
    assert "मधुमेह" in glucose_b_hi["interpretation"]
    assert "अमेरिकन डायबिटीज एसोसिएशन" in glucose_b_hi["guideline_source"]
    assert any("मधुमेह" in c for c in summary_hi["primary_clinical_concerns"])


def test_multi_language_ai_inference_prediction_labels():
    """Test that backend AI inference returns localized prediction labels in Tamil and Hindi."""
    features = {
        "age": 54.0,
        "blood_pressure": 154.0,
        "glucose_level": 168.0,
        "bmi": 32.8,
        "insulin": 28.0,
        "cholesterol": 245.0,
        "heart_rate": 86.0,
    }

    # Tamil Inference
    res_ta = client.post("/api/v1/ai/predict", json={
        "patient_id": "PAT-TEST-TA",
        "features": features,
        "language": "ta",
    })
    assert res_ta.status_code == 200
    data_ta = res_ta.json()
    assert "நீரிழிவு / அதிக ஆபத்து" in data_ta["prediction_label"]

    # Hindi Inference
    res_hi = client.post("/api/v1/ai/predict", json={
        "patient_id": "PAT-TEST-HI",
        "features": features,
        "language": "hi",
    })
    assert res_hi.status_code == 200
    data_hi = res_hi.json()
    assert "मधुमेह / उच्च जोखिम" in data_hi["prediction_label"]
