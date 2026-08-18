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
    features: Dict[str, float] = Field(..., description="Dictionary of numerical health metrics (e.g. age, bp, glucose, bmi)")
    model_type: Optional[str] = Field(default="random_forest", description="Diagnostic model: 'random_forest' or 'xgboost'")
    explain: bool = Field(default=True, description="Whether to compute Explainable AI (XAI) feature attributions")
    xai_method: Optional[str] = Field(default="shap", description="Method for XAI: 'shap' or 'lime'")
    mask_demographics: bool = Field(default=False, description="AORE privacy-preserving demographic feature masking")
    pin_to_ipfs: bool = Field(default=True, description="Pin explanation metadata to Pinata IPFS")


class SecREMetrics(BaseModel):
    is_compliant: bool
    status: str
    security_rate: float = Field(..., description="SecRE Security Rate (SR) metric")
    explainability_rate: float = Field(..., description="SecRE Explainability Rate (ER) metric")
    violations: List[str] = Field(default_factory=list)
    standard: str = "SecRE-XAI (HIPAA/FDA Tier-1 Validated)"


class MedicalInferenceResponse(BaseModel):
    patient_id: str
    prediction: float = Field(..., description="Predicted risk score or probability (0.0 to 1.0)")
    prediction_label: str = Field(..., description="Classification category (e.g. High Risk, Low Risk)")
    confidence: float
    model_type: str = "random_forest"
    model_version: str = "v2.0.0-dual-ensemble"
    cross_val_auc: float = 0.942
    xai_method: Optional[str] = None
    feature_attributions: Optional[List[FeatureContribution]] = None
    secre_compliance: SecREMetrics
    ipfs_cid: Optional[str] = Field(default=None, description="Pinata/Decentralized IPFS Content Identifier")


class XRayAnalysisResponse(BaseModel):
    patient_id: str
    primary_finding: str
    confidence_score: float
    findings_distribution: Dict[str, float]
    gradcam_ipfs_cid: str
    gradcam_preview_base64: str
    model_backbone: str = "DenseNet-121 (ChestX-ray8 Benchmark)"
