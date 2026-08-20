from typing import List, Optional
from pydantic import BaseModel, Field


class RoleCount(BaseModel):
    role: str
    count: int


class MonthlyAggregate(BaseModel):
    period: str
    assessment_count: int
    anchored_count: int


class AdminSummaryStats(BaseModel):
    """
    Privacy-preserving aggregated statistics for Admin.
    Strictly NO PII (No names, phones, emails, individual records or vitals).
    """
    total_registered_users: int = Field(..., description="Total accounts in system")
    total_patients: int = Field(..., description="Total patient accounts")
    total_clinicians: int = Field(..., description="Total clinician accounts")
    total_admins: int = Field(..., description="Total admin accounts")
    total_diagnostic_assessments: int = Field(..., description="Total AI risk predictions executed")
    total_blockchain_anchors: int = Field(..., description="Total cryptographic records anchored on-chain")
    system_security_compliance_rate: float = Field(..., description="Aggregate SecRE-XAI compliance rate (0.0 to 1.0)")
    active_evm_network: str = Field(default="Ethereum Sepolia / Public Node")
    smart_contract_status: str = Field(default="ONLINE (TrustMedAudit.sol)")
    roles_distribution: List[RoleCount] = Field(default_factory=list)
    recent_activity_timeline: List[MonthlyAggregate] = Field(default_factory=list)
    privacy_shield_active: bool = Field(default=True, description="Enforces cryptographic masking of all personal data")
