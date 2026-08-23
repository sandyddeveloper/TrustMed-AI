from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class FeatureContribution(BaseModel):
    feature: str
    value: float
    importance: float
    direction: str = Field(..., description="'positive' (increases risk) or 'negative' (decreases risk)")
    is_masked: bool = Field(default=False, description="AORE privacy-masked flag")


class MedicalInferenceRequest(BaseModel):
    patient_id: str = Field(..., description="Unique patient or sample identifier")
    features: Dict[str, float] = Field(..., description="Dictionary of numerical health metrics (e.g. age, blood_pressure, glucose_level, bmi, insulin, cholesterol, heart_rate)")
    model_type: Optional[str] = Field(default="random_forest", description="Diagnostic model: 'random_forest' or 'xgboost'")
    explain: bool = Field(default=True, description="Whether to compute Explainable AI (XAI) feature attributions")
    xai_method: Optional[str] = Field(default="shap", description="Method for XAI: 'shap' or 'lime'")
    mask_demographics: bool = Field(default=False, description="AORE privacy-preserving demographic feature masking")
    strict_compliance: bool = Field(default=False, description="Halt inference if any physiological bounds are breached")
    pin_to_ipfs: bool = Field(default=True, description="Pin explanation metadata to Pinata IPFS")
    language: Optional[str] = Field(default="en", description="Localization language: 'en', 'ta', or 'hi'")


class SecREMetrics(BaseModel):
    is_compliant: bool
    status: str
    security_rate: float = Field(..., description="SecRE Security Rate (SR) metric")
    explainability_rate: float = Field(..., description="SecRE Explainability Rate (ER) metric")
    violations: List[str] = Field(default_factory=list)
    standard: str = "SecRE-XAI (HIPAA/FDA Tier-1 Validated)"


class DiseaseRiskAssessment(BaseModel):
    disease_name: str = Field(..., description="Name of the evaluated disease: 'Type 2 Diabetes', 'Cancer / Oncological Risk', 'Cardiovascular Disease (CVD)'")
    risk_score: float = Field(..., description="Calibrated risk score between 0.0 and 1.0")
    risk_percentage: str = Field(..., description="Formatted percentage string, e.g. '86.6%'")
    risk_level: str = Field(..., description="'HIGH_RISK', 'MODERATE_RISK', or 'LOW_RISK'")
    clinical_stage: str = Field(..., description="Clinical staging description")
    primary_driver: str = Field(..., description="Primary biomarker driving the disease risk")
    confirmatory_test: str = Field(..., description="Recommended confirmatory diagnostic test")


class DerivedClinicalMetrics(BaseModel):
    homa_ir: float = Field(..., description="Homeostatic Model Assessment of Insulin Resistance")
    homa_ir_status: str = Field(..., description="Insulin resistance tier: Optimal, Early Resistance, Significant Resistance")
    quicki: float = Field(..., description="Quantitative Insulin Sensitivity Check Index")
    mean_arterial_pressure: float = Field(..., description="Estimated Mean Arterial Pressure in mmHg")
    pulse_pressure: float = Field(..., description="Estimated Pulse Pressure in mmHg")
    atherogenic_ratio: float = Field(..., description="Total Cholesterol-to-HDL proxy atherogenic index")
    metabolic_inflammatory_score: float = Field(..., description="Composite 0-100 systemic metabolic inflammatory burden score")
    bmr_estimate_kcal: int = Field(..., description="Estimated Basal Metabolic Rate in kcal/day")


class MedicalInferenceResponse(BaseModel):
    patient_id: str
    prediction: float = Field(..., description="Predicted risk score or probability (0.0 to 1.0)")
    prediction_label: str = Field(..., description="Classification category (e.g. Diabetic / High Risk vs Non-Diabetic / Low Risk)")
    confidence: float = Field(..., description="Calibrated model prediction confidence")
    model_type: str = "random_forest"
    model_version: str = "v2.0.0-dual-ensemble"
    cross_val_auc: float = 0.942
    xai_method: Optional[str] = None
    feature_attributions: Optional[List[FeatureContribution]] = None
    secre_compliance: SecREMetrics
    deterministic_hash: Optional[str] = Field(default=None, description="Deterministic SHA-256 record hash for blockchain anchoring")
    ipfs_cid: Optional[str] = Field(default=None, description="Pinata/Decentralized IPFS Content Identifier")
    ai_explanation: Optional[str] = Field(default=None, description="Doctor-level clinical condition synthesis and AI reasoning summary")
    multi_disease_risks: Optional[List[DiseaseRiskAssessment]] = Field(default=None, description="Triad multi-disease predictions: Diabetes, Cancer, and Cardiovascular")
    derived_metrics: Optional[DerivedClinicalMetrics] = Field(default=None, description="Complete derived clinical statistics and physiological indices")


class SummaryRequest(BaseModel):
    text: str = Field(..., description="Text content to be summarized by Gemini")


class SummaryResponse(BaseModel):
    summary: str = Field(..., description="Generated summary from Gemini")
    provider: str = Field(default="Google Gemini")


class BiomarkerExplanationRequest(BaseModel):
    patient_id: str = Field(default="PAT-UNKNOWN")
    prediction_label: str = Field(default="Assessed Risk")
    risk_score: float = Field(default=0.0)
    model_type: str = Field(default="random_forest")
    xai_method: str = Field(default="shap")
    attributions: List[FeatureContribution] = Field(default_factory=list)
    vitals: Optional[Dict[str, float]] = None
    language: Optional[str] = Field(default="en")


class BiomarkerExplanationResponse(BaseModel):
    summary: str
    provider: str = "Google Gemini"
    model: str = "gemini-2.5-flash"
    is_live: bool = True
    doctor_questions: Optional[List[str]] = None
    lifestyle_tips: Optional[List[str]] = None
    biomarker_highlights: Optional[List[Dict[str, Any]]] = None


class CopilotChatRequest(BaseModel):
    question: str = Field(..., description="Patient question for AI Health Copilot")
    context: Optional[str] = Field(default=None, description="Optional medical report or vital context")
    language: Optional[str] = Field(default="en", description="Target language")


class CopilotChatResponse(BaseModel):
    answer: str
    provider: str = "Google Gemini"
    model: str = "gemini-2.5-flash"
    suggested_followups: List[str] = Field(default_factory=list)



