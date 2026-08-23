import json
import time
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Depends, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.user import PatientAssessmentRecord
from backend.app.schemas.ai import (
    MedicalInferenceRequest,
    MedicalInferenceResponse,
    SummaryRequest,
    SummaryResponse,
    BiomarkerExplanationRequest,
    BiomarkerExplanationResponse,
    CopilotChatRequest,
    CopilotChatResponse,
)
from backend.app.services.ai_engine import ai_engine
from backend.app.services.gemini_service import gemini_service
from backend.app.core.i18n import normalize_language
from backend.app.core.logging import logger

router = APIRouter()


@router.post(
    "/predict",
    response_model=MedicalInferenceResponse,
    status_code=status.HTTP_200_OK,
    summary="SecRE-XAI Dual Ensemble Inference & Auto-Save",
)
def predict_and_explain(
    payload: MedicalInferenceRequest,
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    db: Session = Depends(get_db),
):
    """
    Executes clinical prediction via Random Forest or XGBoost, evaluates SecRE-XAI compliance (SR/ER),
    calculates AORE-constrained SHAP / LIME feature attributions, computes deterministic SHA-256 hash,
    and automatically persists the assessment into the database for future patient visits.
    """
    try:
        resolved_lang = normalize_language(payload.language or accept_language or "en")
        response = ai_engine.predict_and_explain(
            patient_id=payload.patient_id,
            features=payload.features,
            model_type=payload.model_type or "random_forest",
            explain=payload.explain,
            xai_method=payload.xai_method or "shap",
            mask_demographics=payload.mask_demographics,
            strict_compliance=payload.strict_compliance,
            pin_to_ipfs=payload.pin_to_ipfs,
            language=resolved_lang,
        )

        # Auto-persist assessment in database
        try:
            record_id = f"REC-{int(time.time())}-{uuid.uuid4().hex[:6]}"
            attributions_list = [a.model_dump() for a in response.feature_attributions] if response.feature_attributions else []
            
            db_record = PatientAssessmentRecord(
                record_id=record_id,
                patient_id=payload.patient_id,
                report_name=f"Assessment ({response.prediction_label})",
                vitals_json=json.dumps(payload.features),
                prediction_label=response.prediction_label,
                risk_score=response.prediction,
                confidence=response.confidence,
                model_type=response.model_type,
                xai_method=response.xai_method or "shap",
                attributions_json=json.dumps(attributions_list),
                security_rate=response.secre_compliance.security_rate,
                explainability_rate=response.secre_compliance.explainability_rate,
                deterministic_hash=response.deterministic_hash,
                ipfs_cid=response.ipfs_cid,
                ai_explanation=response.ai_explanation,
            )
            db.add(db_record)
            db.commit()
            logger.info(f"Assessment auto-saved to DB for {payload.patient_id} (Record: {record_id})")
        except Exception as db_err:
            logger.warning(f"Could not auto-save assessment to DB: {db_err}")
            db.rollback()

        return response
    except ValueError as ve:
        logger.warning(f"Compliance validation halted inference for patient {payload.patient_id}: {ve}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        logger.error(f"Inference error for patient {payload.patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}",
        )


@router.post(
    "/summarize",
    response_model=SummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Google Gemini Text Summarization",
)
def summarize_endpoint(req: SummaryRequest):
    """
    Generates a concise summary of the provided text using Google Gemini 2.5 Flash.
    """
    try:
        summary = gemini_service.generate_summary(req.text)
        return SummaryResponse(summary=summary, provider="Google Gemini")
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {str(e)}",
        )


@router.post(
    "/explain-biomarkers",
    response_model=BiomarkerExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="Google Gemini Biomarker Impact & Feature Interpretation",
)
def explain_biomarkers_endpoint(
    req: BiomarkerExplanationRequest,
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
):
    """
    Generates an expert clinical natural language interpretation of SHAP/LIME
    biomarker attributions for patient and practitioner review.
    """
    try:
        resolved_lang = normalize_language(req.language or accept_language or "en")
        attributions_dict = [a.model_dump() for a in req.attributions]
        result = gemini_service.explain_biomarkers(
            patient_id=req.patient_id,
            prediction_label=req.prediction_label,
            risk_score=req.risk_score,
            model_type=req.model_type,
            xai_method=req.xai_method,
            attributions=attributions_dict,
            vitals=req.vitals,
            language=resolved_lang,
        )
        return BiomarkerExplanationResponse(**result)
    except Exception as e:
        logger.error(f"Biomarker explanation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate biomarker explanation: {str(e)}",
        )


@router.post(
    "/copilot-chat",
    response_model=CopilotChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Interactive AI Health Copilot Q&A",
)
def copilot_chat_endpoint(
    req: CopilotChatRequest,
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
):
    """
    Answers patient health questions with empathetic, plain-language guidance.
    """
    try:
        resolved_lang = normalize_language(req.language or accept_language or "en")
        result = gemini_service.answer_health_question(
            question=req.question,
            context=req.context,
            language=resolved_lang,
        )
        return CopilotChatResponse(**result)
    except Exception as e:
        logger.error(f"Copilot chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer health question: {str(e)}",
        )

