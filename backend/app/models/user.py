from sqlalchemy import String, Boolean, Text, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base


class User(Base):
    """User / Patient / Clinician Model."""
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=True)
    patient_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=True)
    record_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)
    gender: Mapped[str] = mapped_column(String(20), nullable=True)
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    role: Mapped[str] = mapped_column(String(100), default="Patient")
    npi_number: Mapped[str] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    wallet_address: Mapped[str] = mapped_column(String(42), nullable=True, index=True)


class MedicalRecordAudit(Base):
    """Audit log for records, AI explanations, and Web3 anchor hashes."""
    __tablename__ = "medical_record_audits"

    record_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    patient_id: Mapped[str] = mapped_column(String(64), index=True, nullable=True)
    action: Mapped[str] = mapped_column(String(100), default="DIAGNOSTIC_ANCHORED")
    patient_data_json: Mapped[str] = mapped_column(Text, nullable=True)
    patient_data_hash: Mapped[str] = mapped_column(String(66), nullable=True, index=True)
    diagnostic_result: Mapped[str] = mapped_column(String(100), nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=True)
    ipfs_cid: Mapped[str] = mapped_column(String(100), nullable=True)
    tx_hash: Mapped[str] = mapped_column(String(66), nullable=True, index=True)
    block_number: Mapped[int] = mapped_column(Integer, nullable=True)
    clinician_address: Mapped[str] = mapped_column(String(100), nullable=True)
    ai_prediction_summary: Mapped[str] = mapped_column(Text, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    doctor_decision: Mapped[str] = mapped_column(String(100), nullable=True)
    doctor_notes: Mapped[str] = mapped_column(Text, nullable=True)
    doctor_signed_at: Mapped[str] = mapped_column(String(50), nullable=True)


class PatientAssessmentRecord(Base):
    """Stores full patient assessment, uploaded report vitals, XAI attributions, and clinical summaries."""
    __tablename__ = "patient_assessments"

    record_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    patient_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    report_name: Mapped[str] = mapped_column(String(255), default="Medical Report / Manual Entry")
    
    # Extracted or entered vitals (JSON dict)
    vitals_json: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Diagnostic Prediction
    prediction_label: Mapped[str] = mapped_column(String(100), nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=True)
    model_type: Mapped[str] = mapped_column(String(50), default="random_forest")
    xai_method: Mapped[str] = mapped_column(String(50), default="shap")
    
    # Feature attributions and benchmarks (JSON formatted)
    attributions_json: Mapped[str] = mapped_column(Text, nullable=True)
    benchmarks_json: Mapped[str] = mapped_column(Text, nullable=True)
    ai_explanation: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Compliance & hash
    security_rate: Mapped[float] = mapped_column(Float, default=1.0)
    explainability_rate: Mapped[float] = mapped_column(Float, default=1.0)
    deterministic_hash: Mapped[str] = mapped_column(String(66), nullable=True)
    ipfs_cid: Mapped[str] = mapped_column(String(100), nullable=True)

    # Doctor Final Clinical Decision (Module 11 - CDSS Paradigm)
    doctor_decision: Mapped[str] = mapped_column(String(100), nullable=True)
    doctor_notes: Mapped[str] = mapped_column(Text, nullable=True)
    doctor_signed_at: Mapped[str] = mapped_column(String(50), nullable=True)


