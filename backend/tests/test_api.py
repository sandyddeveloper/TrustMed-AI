import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app

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


def test_dual_ensemble_random_forest_with_ipfs():
    payload = {
        "patient_id": "PAT-RF-001",
        "features": {
            "age": 62.0,
            "blood_pressure": 142.0,
            "glucose_level": 150.0,
            "bmi": 31.0,
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
    assert data["ipfs_cid"].startswith("ipfs://")


def test_dual_ensemble_xgboost_with_aore_masking():
    payload = {
        "patient_id": "PAT-XGB-002",
        "features": {
            "age": 55.0,
            "blood_pressure": 130.0,
            "glucose_level": 115.0,
            "bmi": 27.5,
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


def test_chest_xray_gradcam_endpoint():
    img = Image.new("RGB", (256, 256), color=(120, 120, 120))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    files = {"file": ("test_xray.png", img_bytes, "image/png")}
    data = {"patient_id": "PAT-TEST-XRAY"}

    response = client.post("/api/v1/ai/xray-gradcam", data=data, files=files)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["patient_id"] == "PAT-TEST-XRAY"
    assert "primary_finding" in res_json
    assert res_json["gradcam_ipfs_cid"].startswith("ipfs://")
    assert res_json["gradcam_preview_base64"].startswith("data:image/png;base64,")


def test_practitioner_profile_and_certificate():
    # 1. Get profile
    res_get = client.get("/api/v1/practitioner/profile")
    assert res_get.status_code == 200
    prof = res_get.json()
    assert "name" in prof
    assert "npi_number" in prof

    # 2. Update profile
    res_put = client.put("/api/v1/practitioner/profile", json={"institution": "Johns Hopkins Medicine"})
    assert res_put.status_code == 200
    assert res_put.json()["institution"] == "Johns Hopkins Medicine"

    # 3. Generate Audit Certificate
    res_cert = client.get("/api/v1/practitioner/audit-certificate/PAT-8091")
    assert res_cert.status_code == 200
    cert = res_cert.json()
    assert cert["patient_id"] == "PAT-8091"
    assert cert["record_hash"].startswith("0x")


def test_system_settings():
    res_get = client.get("/api/v1/settings")
    assert res_get.status_code == 200
    settings_data = res_get.json()
    assert "default_model" in settings_data

    res_put = client.put("/api/v1/settings", json={"risk_threshold": 0.55})
    assert res_put.status_code == 200
    assert res_put.json()["risk_threshold"] == 0.55


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


def test_web3_status():
    response = client.get("/api/v1/web3/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_connected" in data


def test_web3_anchor():
    payload = {
        "record_id": "REC-PHASE2-PINATA",
        "record_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        "ipfs_cid": "ipfs://QmPhase2SecREXAIEncryptedPayloadSnapshot",
    }
    response = client.post("/api/v1/web3/anchor", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "anchored"
