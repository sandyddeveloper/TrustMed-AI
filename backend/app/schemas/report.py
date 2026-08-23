from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from backend.app.services.benchmarks import ReportBenchmarkSummary, BiomarkerBenchmark


class ReportUploadResponse(BaseModel):
    filename: str
    file_type: str
    file_size_bytes: int
    detected_patient_id: Optional[str] = None
    detected_patient_name: Optional[str] = None
    extracted_vitals: Dict[str, float]
    extraction_confidence: Dict[str, float]
    raw_text_snippet: str
    benchmark_summary: ReportBenchmarkSummary


class BenchmarkEvaluateRequest(BaseModel):
    vitals: Dict[str, float] = Field(..., description="Map of physiological vitals (glucose_level, blood_pressure, bmi, etc.)")
    language: Optional[str] = Field(default="en", description="Target localization language: 'en', 'ta', or 'hi'")


class BenchmarkEvaluateResponse(BaseModel):
    benchmark_summary: ReportBenchmarkSummary


class SaveAssessmentRequest(BaseModel):
    record_id: Optional[str] = None
    patient_id: str = Field(..., description="Patient identifier")
    report_name: Optional[str] = "Diagnostic Assessment"
    vitals: Dict[str, float] = Field(default_factory=dict)
    prediction_label: Optional[str] = None
    risk_score: Optional[float] = None
    confidence: Optional[float] = None
    model_type: Optional[str] = "random_forest"
    xai_method: Optional[str] = "shap"
    attributions: Optional[List[Dict[str, Any]]] = None
    benchmark_summary: Optional[ReportBenchmarkSummary] = None
    ai_explanation: Optional[str] = None
    security_rate: Optional[float] = 1.0
    explainability_rate: Optional[float] = 1.0
    deterministic_hash: Optional[str] = None
    ipfs_cid: Optional[str] = None
    doctor_decision: Optional[str] = None
    doctor_notes: Optional[str] = None
    doctor_signed_at: Optional[str] = None


class PatientAssessmentItem(BaseModel):
    record_id: str
    patient_id: str
    report_name: str
    vitals: Dict[str, float]
    prediction_label: Optional[str] = None
    risk_score: Optional[float] = None
    confidence: Optional[float] = None
    model_type: str = "random_forest"
    xai_method: str = "shap"
    attributions: Optional[List[Dict[str, Any]]] = None
    benchmark_summary: Optional[Dict[str, Any]] = None
    ai_explanation: Optional[str] = None
    security_rate: float = 1.0
    explainability_rate: float = 1.0
    deterministic_hash: Optional[str] = None
    ipfs_cid: Optional[str] = None
    doctor_decision: Optional[str] = None
    doctor_notes: Optional[str] = None
    doctor_signed_at: Optional[str] = None
    created_at: Optional[str] = None


class PatientAssessmentHistoryResponse(BaseModel):
    total_count: int
    records: List[PatientAssessmentItem]


class DoctorDecisionRequest(BaseModel):
    record_id: str = Field(..., description="Assessment record ID")
    patient_id: str = Field(..., description="Patient ID")
    doctor_decision: str = Field(..., description="Clinician diagnosis or final risk assessment")
    doctor_notes: Optional[str] = Field(default="", description="Detailed clinical notes and treatment recommendations")
    reanchor_blockchain: bool = Field(default=True, description="Whether to anchor the final signed clinical decision to blockchain")


class DoctorDecisionResponse(BaseModel):
    status: str
    record_id: str
    patient_id: str
    doctor_decision: str
    doctor_notes: str
    doctor_signed_at: str
    tx_hash: Optional[str] = None
    record_hash: Optional[str] = None
    message: str


