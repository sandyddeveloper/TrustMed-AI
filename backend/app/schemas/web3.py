from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class Web3StatusResponse(BaseModel):
    is_connected: bool
    network: str
    chain_id: int
    latest_block: Optional[int] = None
    provider_uri: str


class AnchorRecordRequest(BaseModel):
    record_id: str = Field(..., description="Unique medical record ID")
    record_hash: str = Field(..., description="SHA-256 or Keccak-256 hash of record payload")
    ipfs_cid: Optional[str] = Field(default=None, description="IPFS Content ID if stored off-chain")
    patient_id: Optional[str] = Field(default=None, description="Patient identifier")
    diagnostic_result: Optional[str] = Field(default=None, description="Diagnostic classification label")
    confidence_score: Optional[float] = Field(default=None, description="Prediction confidence")
    risk_score: Optional[float] = Field(default=None, description="Computed risk probability")
    clinician_address: Optional[str] = Field(default=None, description="Signing clinician wallet address")
    metadata: Optional[Dict[str, Any]] = None


class AnchorRecordResponse(BaseModel):
    status: str
    record_id: str
    record_hash: str
    ipfs_cid: Optional[str] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    recorded_at: Optional[str] = None


class VerifyRecordRequest(BaseModel):
    record_id: str = Field(..., description="Unique medical record identifier to verify")
    claimed_hash: Optional[str] = Field(default=None, description="Optional claimed local hash for instant comparison")


class VerifyRecordResponse(BaseModel):
    record_id: str
    is_authentic: bool
    local_hash: str
    blockchain_hash: Optional[str] = None
    ipfs_cid: Optional[str] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    verified_at: str
    authenticity_badge: str = Field(..., description="'VERIFIED_AUTHENTIC' or 'TAMPER_DETECTED'")
    message: str


class AuditRecordItem(BaseModel):
    record_id: str
    patient_id: Optional[str] = None
    action: str = "DIAGNOSTIC_ANCHORED"
    patient_data_hash: Optional[str] = None
    diagnostic_result: Optional[str] = None
    confidence_score: Optional[float] = None
    risk_score: Optional[float] = None
    ipfs_cid: Optional[str] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    clinician_address: Optional[str] = None
    created_at: Optional[str] = None
    is_verified: bool = True
