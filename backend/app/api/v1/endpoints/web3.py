import json
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.user import MedicalRecordAudit
from backend.app.schemas.web3 import (
    Web3StatusResponse,
    AnchorRecordRequest,
    AnchorRecordResponse,
    VerifyRecordRequest,
    VerifyRecordResponse,
    AuditRecordItem,
)
from backend.app.services.web3_client import web3_client
from backend.app.core.logging import logger

router = APIRouter()


@router.get(
    "/status",
    response_model=Web3StatusResponse,
    summary="Web3 Network Status",
)
def get_web3_status():
    """
    Returns connectivity and block details from the configured Web3 node/provider.
    """
    status_dict = web3_client.get_status()
    return Web3StatusResponse(**status_dict)


@router.post(
    "/anchor",
    response_model=AnchorRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Anchor Medical Record Hash On-Chain & Synchronize Persistence",
)
def anchor_record(
    payload: AnchorRecordRequest,
    db: Session = Depends(get_db),
):
    """
    Anchors a cryptographic hash of a medical record and its IPFS CID to the blockchain,
    and synchronizes persistence in the PostgreSQL/SQLite audit table.
    """
    try:
        result = web3_client.anchor_record(
            record_id=payload.record_id,
            record_hash=payload.record_hash,
            ipfs_cid=payload.ipfs_cid,
        )

        # Synchronize with database audit trail
        try:
            audit_entry = MedicalRecordAudit(
                record_id=payload.record_id,
                patient_id=payload.patient_id or payload.record_id,
                action="DIAGNOSTIC_ANCHORED",
                patient_data_json=json.dumps(payload.metadata or {}) if payload.metadata else None,
                patient_data_hash=payload.record_hash,
                diagnostic_result=payload.diagnostic_result or "High Risk",
                confidence_score=payload.confidence_score,
                risk_score=payload.risk_score,
                ipfs_cid=payload.ipfs_cid,
                tx_hash=result.get("tx_hash"),
                block_number=result.get("block_number"),
                clinician_address=payload.clinician_address or "0x71C84010a3b08803450942475E2582775a6fA6f1",
                ai_prediction_summary=f"Prediction: {payload.risk_score or 'N/A'} (Confidence: {payload.confidence_score or 'N/A'})",
                is_verified=True,
            )
            db.add(audit_entry)
            db.commit()
        except Exception as db_err:
            logger.warning(f"Audit log persistence note: {db_err}")
            db.rollback()

        return AnchorRecordResponse(
            status=result["status"],
            record_id=result["record_id"],
            record_hash=result["record_hash"],
            ipfs_cid=result.get("ipfs_cid"),
            tx_hash=result.get("tx_hash"),
            block_number=result.get("block_number"),
            recorded_at=result.get("timestamp"),
        )
    except Exception as e:
        logger.error(f"Error anchoring record {payload.record_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to anchor record: {str(e)}",
        )


@router.post(
    "/verify",
    response_model=VerifyRecordResponse,
    status_code=status.HTTP_200_OK,
    summary="1-Click Cryptographic Integrity Verification Check",
)
def verify_record_integrity(
    payload: VerifyRecordRequest,
    db: Session = Depends(get_db),
):
    """
    Executes Module 6 One-Click Cryptographic Integrity Verification:
    Compares the local claimed SHA-256 hash against the immutable on-chain record hash.
    """
    try:
        # Check database for historical record if claimed_hash is not provided
        claimed_hash = payload.claimed_hash
        if not claimed_hash:
            db_record = db.query(MedicalRecordAudit).filter(
                MedicalRecordAudit.record_id == payload.record_id
            ).first()
            if db_record and db_record.patient_data_hash:
                claimed_hash = db_record.patient_data_hash
            else:
                claimed_hash = "0x0000000000000000000000000000000000000000000000000000000000000000"

        verification = web3_client.verify_record_integrity(
            record_id=payload.record_id,
            claimed_hash=claimed_hash,
        )
        return VerifyRecordResponse(**verification)
    except Exception as e:
        logger.error(f"Integrity verification error for record {payload.record_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}",
        )


@router.get(
    "/records",
    response_model=List[AuditRecordItem],
    status_code=status.HTTP_200_OK,
    summary="List Synchronized Blockchain Audit Records",
)
def get_audit_records(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Returns recent on-chain anchored diagnostic records synchronized with the database.
    """
    records = db.query(MedicalRecordAudit).order_by(MedicalRecordAudit.id.desc()).limit(limit).all()
    results = []
    for r in records:
        results.append(
            AuditRecordItem(
                record_id=r.record_id,
                patient_id=r.patient_id,
                action=r.action,
                patient_data_hash=r.patient_data_hash,
                diagnostic_result=r.diagnostic_result,
                confidence_score=r.confidence_score,
                risk_score=r.risk_score,
                ipfs_cid=r.ipfs_cid,
                tx_hash=r.tx_hash,
                block_number=r.block_number,
                clinician_address=r.clinician_address,
                created_at=r.created_at.isoformat() if hasattr(r, "created_at") and r.created_at else datetime.utcnow().isoformat(),
                is_verified=r.is_verified,
            )
        )
    return results
