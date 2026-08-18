from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PractitionerProfile(BaseModel):
    practitioner_id: str = Field(default="PRAC-7029-MD", description="Unique Practitioner Identifier")
    name: str = Field(default="Dr. Sarah Jenkins, MD, FACC", description="Clinician Full Name & Titles")
    email: str = Field(default="s.jenkins@trustmed.org", description="Clinical Email")
    specialty: str = Field(default="Cardiovascular Medicine & Critical Care", description="Medical Specialty")
    institution: str = Field(default="TrustMed Academic Medical Center", description="Hospital / Affiliation")
    npi_number: str = Field(default="1849204912", description="National Provider Identifier (NPI)")
    license_number: str = Field(default="MD-CA-9847291", description="State Medical Board License")
    wallet_address: str = Field(default="0x71C8401d2f9a941C618b7606e902123985Fda6f1", description="Verified EVM Signer Address")
    role: str = Field(default="Chief Medical Officer", description="Role in CDSS")
    total_signed_diagnoses: int = Field(default=142, description="Total diagnostic records cryptographically signed")
    mean_security_rate: float = Field(default=0.94, description="Average SecRE Security Rate compliance")
    secre_certified: bool = Field(default=True, description="SecRE-XAI IEEE Access Certification Status")


class PractitionerProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    specialty: Optional[str] = None
    institution: Optional[str] = None
    license_number: Optional[str] = None
    role: Optional[str] = None


class SystemSettings(BaseModel):
    default_model: str = Field(default="xgboost", description="Default model: 'xgboost' or 'random_forest'")
    default_xai_method: str = Field(default="shap", description="Default XAI method: 'shap' or 'lime'")
    risk_threshold: float = Field(default=0.50, description="Risk classification threshold (0.0 to 1.0)")
    auto_mask_demographics: bool = Field(default=False, description="AORE auto-masking of age/demographics")
    strict_boundary_enforcement: bool = Field(default=True, description="Enforce strict rejection on vital violations")
    ipfs_auto_pin: bool = Field(default=True, description="Automatically pin XAI explanations and heatmaps to Pinata IPFS")
    active_evm_network: str = Field(default="sepolia", description="'sepolia', 'amoy', or 'localhost'")
    ipfs_gateway_url: str = Field(default="https://ipfs.io/ipfs/", description="Public IPFS Gateway")
    alert_email_notifications: bool = Field(default=True, description="Send notifications for High Risk patients")


class SystemSettingsUpdate(BaseModel):
    default_model: Optional[str] = None
    default_xai_method: Optional[str] = None
    risk_threshold: Optional[float] = None
    auto_mask_demographics: Optional[bool] = None
    strict_boundary_enforcement: Optional[bool] = None
    ipfs_auto_pin: Optional[bool] = None
    active_evm_network: Optional[str] = None
    ipfs_gateway_url: Optional[str] = None
    alert_email_notifications: Optional[bool] = None


class AuditCertificateResponse(BaseModel):
    certificate_id: str
    patient_id: str
    practitioner_name: str
    practitioner_license: str
    risk_score: float
    risk_label: str
    model_version: str
    security_rate: float
    explainability_rate: float
    record_hash: str
    ipfs_cid: Optional[str] = None
    evm_contract_address: str
    blockchain_network: str
    issued_at: str
    standard: str = "SecRE-XAI (IEEE Access / FDA Title 21 CFR Part 11)"


class CohortPatientItem(BaseModel):
    patient_id: str
    age: float
    blood_pressure: float
    glucose_level: float
    bmi: float
    cholesterol: float
    heart_rate: float


class BatchInferenceRequest(BaseModel):
    cohort_name: str = Field(default="Cardiovascular Risk Cohort A", description="Cohort identifier")
    patients: List[CohortPatientItem]
    model_type: Optional[str] = "xgboost"
    pin_batch_to_ipfs: bool = True


class BatchInferenceResponse(BaseModel):
    cohort_name: str
    total_patients: int
    high_risk_count: int
    low_risk_count: int
    mean_risk_score: float
    cohort_security_rate: float
    cohort_explainability_rate: float
    batch_record_hash: str
    ipfs_cid: Optional[str] = None
    patient_results: List[Dict[str, Any]]
