import json
import time
import uuid
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, HTTPException, Header, Query, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.models.user import PatientAssessmentRecord
from backend.app.schemas.report import (
    ReportUploadResponse,
    BenchmarkEvaluateRequest,
    BenchmarkEvaluateResponse,
    SaveAssessmentRequest,
    PatientAssessmentItem,
    PatientAssessmentHistoryResponse,
    DoctorDecisionRequest,
    DoctorDecisionResponse,
)
from backend.app.services.document_parser import parse_uploaded_document
from backend.app.services.benchmarks import evaluate_clinical_benchmarks
from backend.app.services.web3_client import web3_client
from backend.app.models.user import MedicalRecordAudit
from backend.app.core.i18n import normalize_language
from backend.app.core.logging import logger
import hashlib
from datetime import datetime

router = APIRouter()


@router.post(
    "/upload-extract",
    response_model=ReportUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload, Parse and Auto-Save Medical PDF / Image Report",
)
async def upload_and_extract_report(
    file: UploadFile = File(..., description="PDF, PNG, JPG, or Scan of Clinical Report"),
    patient_id: Optional[str] = Query(None, description="Optional patient identifier to bind record"),
    lang: Optional[str] = Query(None, description="Language code ('en', 'ta', 'hi')"),
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    db: Session = Depends(get_db),
):
    """
    Ingests uploaded medical documents (PDFs, Image Scans, Lab Reports),
    extracts physiological biomarkers with field-level confidence scores,
    calculates clinical benchmarks, and auto-saves the extracted assessment in the database.
    """
    try:
        file_bytes = await file.read()
        if not file_bytes or len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        resolved_lang = normalize_language(lang or accept_language or "en")
        logger.info(f"Processing uploaded medical document: {file.filename} ({len(file_bytes)} bytes) [Language: {resolved_lang}]")
        parsed_data = parse_uploaded_document(file_bytes, file.filename or "medical_report.pdf", language=resolved_lang)

        # Auto-persist into database so patient can revisit anytime
        target_patient_id = patient_id or parsed_data.get("detected_patient_id") or "PAT-DEFAULT"
        record_id = f"REC-{int(time.time())}-{uuid.uuid4().hex[:6]}"

        try:
            db_record = PatientAssessmentRecord(
                record_id=record_id,
                patient_id=target_patient_id,
                report_name=file.filename or "Uploaded Medical Document",
                vitals_json=json.dumps(parsed_data.get("extracted_vitals", {})),
                benchmarks_json=json.dumps(parsed_data.get("benchmark_summary", {}), default=str),
            )
            db.add(db_record)
            db.commit()
            logger.info(f"Report auto-saved to database for patient {target_patient_id} (Record: {record_id})")
        except Exception as db_err:
            logger.warning(f"Could not auto-save uploaded report to DB: {db_err}")
            db.rollback()

        return ReportUploadResponse(**parsed_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing medical document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document parsing error: {str(e)}",
        )


@router.post(
    "/save-assessment",
    response_model=PatientAssessmentItem,
    status_code=status.HTTP_200_OK,
    summary="Save or Update Patient Diagnostic Assessment in Database",
)
def save_assessment_endpoint(
    payload: SaveAssessmentRequest,
    db: Session = Depends(get_db),
):
    """
    Persists full diagnostic inference, vitals, XAI attributions, and Gemini plain-English summaries
    into PostgreSQL / SQLite so patients never lose their assessments.
    """
    try:
        record_id = payload.record_id or f"REC-{int(time.time())}-{uuid.uuid4().hex[:6]}"
        
        # Check if record exists
        existing = db.query(PatientAssessmentRecord).filter(
            PatientAssessmentRecord.record_id == record_id
        ).first()

        vitals_str = json.dumps(payload.vitals) if payload.vitals else "{}"
        attributions_str = json.dumps(payload.attributions) if payload.attributions else "[]"
        benchmarks_str = json.dumps(payload.benchmark_summary.model_dump() if payload.benchmark_summary else {})

        if existing:
            existing.report_name = payload.report_name or existing.report_name
            existing.vitals_json = vitals_str
            existing.prediction_label = payload.prediction_label or existing.prediction_label
            existing.risk_score = payload.risk_score if payload.risk_score is not None else existing.risk_score
            existing.confidence = payload.confidence if payload.confidence is not None else existing.confidence
            existing.model_type = payload.model_type or existing.model_type
            existing.xai_method = payload.xai_method or existing.xai_method
            existing.attributions_json = attributions_str
            existing.benchmarks_json = benchmarks_str
            existing.ai_explanation = payload.ai_explanation or existing.ai_explanation
            existing.security_rate = payload.security_rate or existing.security_rate
            existing.explainability_rate = payload.explainability_rate or existing.explainability_rate
            existing.deterministic_hash = payload.deterministic_hash or existing.deterministic_hash
            existing.ipfs_cid = payload.ipfs_cid or existing.ipfs_cid
            if payload.doctor_decision:
                existing.doctor_decision = payload.doctor_decision
            if payload.doctor_notes:
                existing.doctor_notes = payload.doctor_notes
            if payload.doctor_signed_at:
                existing.doctor_signed_at = payload.doctor_signed_at
            db.commit()
            db.refresh(existing)
            target = existing
        else:
            target = PatientAssessmentRecord(
                record_id=record_id,
                patient_id=payload.patient_id,
                report_name=payload.report_name or "Diagnostic Assessment",
                vitals_json=vitals_str,
                prediction_label=payload.prediction_label,
                risk_score=payload.risk_score,
                confidence=payload.confidence,
                model_type=payload.model_type or "random_forest",
                xai_method=payload.xai_method or "shap",
                attributions_json=attributions_str,
                benchmarks_json=benchmarks_str,
                ai_explanation=payload.ai_explanation,
                security_rate=payload.security_rate or 1.0,
                explainability_rate=payload.explainability_rate or 1.0,
                deterministic_hash=payload.deterministic_hash,
                ipfs_cid=payload.ipfs_cid,
                doctor_decision=payload.doctor_decision,
                doctor_notes=payload.doctor_notes,
                doctor_signed_at=payload.doctor_signed_at,
            )
            db.add(target)
            db.commit()
            db.refresh(target)

        return _format_db_record(target)
    except Exception as e:
        logger.error(f"Error saving assessment record: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save assessment to database: {str(e)}",
        )


@router.post(
    "/doctor-decision",
    response_model=DoctorDecisionResponse,
    status_code=status.HTTP_200_OK,
    summary="Record Doctor's Final Clinical Decision & Sign On-Chain",
)
def save_doctor_clinical_decision(
    payload: DoctorDecisionRequest,
    db: Session = Depends(get_db),
):
    """
    Module 11 & CDSS Final Decision:
    Stores the Doctor's final clinical judgment and notes, re-hashes the complete
    signed diagnostic package with SHA-256, and anchors the final decision to the blockchain audit log.
    """
    try:
        # 1. Fetch or create patient assessment record
        db_record = db.query(PatientAssessmentRecord).filter(
            PatientAssessmentRecord.record_id == payload.record_id
        ).first()

        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        if db_record:
            db_record.doctor_decision = payload.doctor_decision
            db_record.doctor_notes = payload.doctor_notes or ""
            db_record.doctor_signed_at = now_str
        else:
            db_record = PatientAssessmentRecord(
                record_id=payload.record_id,
                patient_id=payload.patient_id,
                report_name="Clinical Decision Signed Assessment",
                doctor_decision=payload.doctor_decision,
                doctor_notes=payload.doctor_notes or "",
                doctor_signed_at=now_str,
            )
            db.add(db_record)

        # 2. Compute signed cryptographic SHA-256 hash
        signed_payload = {
            "record_id": payload.record_id,
            "patient_id": payload.patient_id,
            "doctor_decision": payload.doctor_decision,
            "doctor_notes": payload.doctor_notes or "",
            "signed_at": now_str,
            "initial_hash": db_record.deterministic_hash or "0x00",
        }
        signed_hash_bytes = hashlib.sha256(json.dumps(signed_payload, sort_keys=True).encode("utf-8")).hexdigest()
        signed_hash = f"0x{signed_hash_bytes}"

        tx_hash = None
        if payload.reanchor_blockchain:
            try:
                anchor_res = web3_client.anchor_record(
                    record_id=f"DECISION-{payload.record_id}",
                    record_hash=signed_hash,
                )
                tx_hash = anchor_res.get("tx_hash")

                # Also create an audit log entry
                audit_entry = MedicalRecordAudit(
                    record_id=payload.record_id,
                    patient_id=payload.patient_id,
                    action="DOCTOR_FINAL_DECISION_SIGNED",
                    patient_data_json=json.dumps(signed_payload),
                    patient_data_hash=signed_hash,
                    diagnostic_result=payload.doctor_decision,
                    tx_hash=tx_hash,
                    clinician_address="0x71C84010a3b08803450942475E2582775a6fA6f1",
                    ai_prediction_summary=f"Doctor Clinical Decision: {payload.doctor_decision} | Notes: {payload.doctor_notes[:100] if payload.doctor_notes else 'None'}",
                    is_verified=True,
                )
                db.add(audit_entry)
            except Exception as anchor_err:
                logger.warning(f"Web3 anchoring note for doctor decision: {anchor_err}")

        db.commit()
        db.refresh(db_record)

        return DoctorDecisionResponse(
            status="SUCCESS",
            record_id=payload.record_id,
            patient_id=payload.patient_id,
            doctor_decision=payload.doctor_decision,
            doctor_notes=payload.doctor_notes or "",
            doctor_signed_at=now_str,
            tx_hash=tx_hash,
            record_hash=signed_hash,
            message="Doctor's final clinical decision securely recorded and anchored for audit verification.",
        )
    except Exception as e:
        logger.error(f"Error saving doctor clinical decision: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record doctor decision: {str(e)}",
        )


@router.get(
    "/history",
    response_model=PatientAssessmentHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Patient Assessment & Upload History",
)
def get_patient_history(
    patient_id: Optional[str] = Query(None, description="Patient identifier to filter records"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Retrieves all past medical assessments, lab reports, and AI predictions for the patient.
    """
    try:
        query = db.query(PatientAssessmentRecord)
        if patient_id:
            query = query.filter(
                (PatientAssessmentRecord.patient_id == patient_id) |
                (PatientAssessmentRecord.patient_id == "PAT-DEFAULT")
            )
        
        records = query.order_by(desc(PatientAssessmentRecord.created_at)).limit(limit).all()
        formatted = [_format_db_record(r) for r in records]

        return PatientAssessmentHistoryResponse(
            total_count=len(formatted),
            records=formatted,
        )
    except Exception as e:
        logger.error(f"Error fetching patient assessment history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch assessment history: {str(e)}",
        )


@router.get(
    "/latest",
    response_model=Optional[PatientAssessmentItem],
    status_code=status.HTTP_200_OK,
    summary="Get Most Recent Assessment for Patient",
)
def get_latest_patient_assessment(
    patient_id: Optional[str] = Query(None, description="Patient identifier"),
    db: Session = Depends(get_db),
):
    """
    Retrieves the most recent assessment so the patient dashboard can restore
    previous findings immediately on login.
    """
    try:
        query = db.query(PatientAssessmentRecord)
        if patient_id:
            query = query.filter(
                (PatientAssessmentRecord.patient_id == patient_id) |
                (PatientAssessmentRecord.patient_id == "PAT-DEFAULT")
            )
        
        latest = query.order_by(desc(PatientAssessmentRecord.created_at)).first()
        if not latest:
            return None

        return _format_db_record(latest)
    except Exception as e:
        logger.error(f"Error fetching latest assessment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch latest assessment: {str(e)}",
        )


@router.delete(
    "/history/{record_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a Past Assessment Record",
)
def delete_assessment_record(
    record_id: str,
    db: Session = Depends(get_db),
):
    try:
        record = db.query(PatientAssessmentRecord).filter(
            PatientAssessmentRecord.record_id == record_id
        ).first()
        if not record:
            raise HTTPException(status_code=404, detail="Assessment record not found.")

        db.delete(record)
        db.commit()
        return {"status": "success", "message": f"Record {record_id} deleted."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")


@router.post(
    "/evaluate-benchmarks",
    response_model=BenchmarkEvaluateResponse,
    status_code=status.HTTP_200_OK,
    summary="Recalculate Clinical Benchmarks on Modified Values",
)
def evaluate_benchmarks_endpoint(
    payload: BenchmarkEvaluateRequest,
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
):
    """
    Recalculates clinical guidelines and benchmark deviations in requested language
    whenever a patient or clinician modifies or corrects extracted biomarker values.
    """
    try:
        resolved_lang = normalize_language(payload.language or accept_language or "en")
        summary = evaluate_clinical_benchmarks(payload.vitals, language=resolved_lang)
        return BenchmarkEvaluateResponse(benchmark_summary=summary)
    except Exception as e:
        logger.error(f"Error evaluating benchmarks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Benchmark evaluation error: {str(e)}",
        )


def _format_db_record(r: PatientAssessmentRecord) -> PatientAssessmentItem:
    vitals = {}
    if r.vitals_json:
        try:
            vitals = json.loads(r.vitals_json)
        except Exception:
            pass

    attributions = []
    if r.attributions_json:
        try:
            attributions = json.loads(r.attributions_json)
        except Exception:
            pass

    benchmarks = None
    if r.benchmarks_json:
        try:
            benchmarks = json.loads(r.benchmarks_json)
        except Exception:
            pass

    return PatientAssessmentItem(
        record_id=r.record_id,
        patient_id=r.patient_id,
        report_name=r.report_name or "Diagnostic Assessment",
        vitals=vitals,
        prediction_label=r.prediction_label,
        risk_score=r.risk_score,
        confidence=r.confidence,
        model_type=r.model_type or "random_forest",
        xai_method=r.xai_method or "shap",
        attributions=attributions,
        benchmark_summary=benchmarks,
        ai_explanation=r.ai_explanation,
        security_rate=r.security_rate or 1.0,
        explainability_rate=r.explainability_rate or 1.0,
        deterministic_hash=r.deterministic_hash,
        ipfs_cid=r.ipfs_cid,
        doctor_decision=r.doctor_decision,
        doctor_notes=r.doctor_notes,
        doctor_signed_at=r.doctor_signed_at,
        created_at=r.created_at.isoformat() if r.created_at else None,
    )

