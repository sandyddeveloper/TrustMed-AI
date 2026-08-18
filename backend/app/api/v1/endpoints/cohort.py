import hashlib
import json
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.practitioner import (
    BatchInferenceRequest,
    BatchInferenceResponse,
)
from backend.app.services.ai_engine import ai_engine
from backend.app.services.ipfs_service import ipfs_service
from backend.app.core.logging import logger

router = APIRouter()


@router.post(
    "/batch-predict",
    response_model=BatchInferenceResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch Clinical Cohort Risk & SecRE Compliance Analyzer",
)
def run_batch_cohort_analysis(payload: BatchInferenceRequest):
    """
    Ingests multiple patient records concurrently, evaluates dual ensemble predictions,
    computes cohort-level SecRE metrics (SR/ER), and creates an aggregated cryptographic proof.
    """
    if not payload.patients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cohort must contain at least one patient record.",
        )

    patient_results = []
    high_risk_count = 0
    total_sr = 0.0
    total_er = 0.0
    total_risk = 0.0

    for patient in payload.patients:
        features = {
            "age": patient.age,
            "blood_pressure": patient.blood_pressure,
            "glucose_level": patient.glucose_level,
            "bmi": patient.bmi,
            "cholesterol": patient.cholesterol,
            "heart_rate": patient.heart_rate,
        }

        res = ai_engine.predict_and_explain(
            patient_id=patient.patient_id,
            features=features,
            model_type=payload.model_type or "xgboost",
            explain=True,
            pin_to_ipfs=False,
        )

        if res.prediction >= 0.5:
            high_risk_count += 1

        total_risk += res.prediction
        total_sr += res.secre_compliance.security_rate
        total_er += res.secre_compliance.explainability_rate

        patient_results.append({
            "patient_id": res.patient_id,
            "prediction": res.prediction,
            "prediction_label": res.prediction_label,
            "confidence": res.confidence,
            "security_rate": res.secre_compliance.security_rate,
            "explainability_rate": res.secre_compliance.explainability_rate,
            "top_risk_factor": res.feature_attributions[0].feature if res.feature_attributions else "N/A",
        })

    n = len(payload.patients)
    mean_risk = round(total_risk / n, 4)
    cohort_sr = round(total_sr / n, 4)
    cohort_er = round(total_er / n, 4)

    # Cryptographic Batch Hash
    batch_raw = json.dumps({
        "cohort_name": payload.cohort_name,
        "patients": [p.model_dump() for p in payload.patients],
        "mean_risk": mean_risk,
    }, sort_keys=True)
    batch_hash = "0x" + hashlib.sha256(batch_raw.encode()).hexdigest()

    # Pin Cohort Snapshot to IPFS
    ipfs_cid = None
    if payload.pin_batch_to_ipfs:
        ipfs_cid = ipfs_service.pin_json_to_ipfs({
            "cohort_name": payload.cohort_name,
            "total_patients": n,
            "high_risk_count": high_risk_count,
            "mean_risk": mean_risk,
            "cohort_sr": cohort_sr,
            "cohort_er": cohort_er,
            "batch_hash": batch_hash,
        }, f"cohort_{payload.cohort_name}")

    return BatchInferenceResponse(
        cohort_name=payload.cohort_name,
        total_patients=n,
        high_risk_count=high_risk_count,
        low_risk_count=n - high_risk_count,
        mean_risk_score=mean_risk,
        cohort_security_rate=cohort_sr,
        cohort_explainability_rate=cohort_er,
        batch_record_hash=batch_hash,
        ipfs_cid=ipfs_cid,
        patient_results=patient_results,
    )
