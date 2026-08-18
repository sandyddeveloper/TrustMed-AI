import base64
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from backend.app.schemas.ai import (
    MedicalInferenceRequest,
    MedicalInferenceResponse,
    XRayAnalysisResponse,
)
from backend.app.services.ai_engine import ai_engine
from backend.app.services.vision_xai import vision_xai_engine
from backend.app.services.ipfs_service import ipfs_service
from backend.app.core.logging import logger

router = APIRouter()


@router.post(
    "/predict",
    response_model=MedicalInferenceResponse,
    status_code=status.HTTP_200_OK,
    summary="SecRE-XAI Dual Ensemble Inference & IPFS Pinning",
)
def predict_and_explain(payload: MedicalInferenceRequest):
    """
    Executes clinical prediction via Random Forest or XGBoost, evaluates SecRE-XAI compliance (SR/ER),
    calculates AORE-constrained SHAP / LIME feature attributions, and pins metadata to Pinata IPFS.
    """
    try:
        response = ai_engine.predict_and_explain(
            patient_id=payload.patient_id,
            features=payload.features,
            model_type=payload.model_type or "random_forest",
            explain=payload.explain,
            xai_method=payload.xai_method or "shap",
            mask_demographics=payload.mask_demographics,
            pin_to_ipfs=payload.pin_to_ipfs,
        )
        return response
    except Exception as e:
        logger.error(f"Inference error for patient {payload.patient_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}",
        )


@router.post(
    "/xray-gradcam",
    response_model=XRayAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="NIH ChestX-ray8 Multi-Label Classification & Grad-CAM Heatmap",
)
async def analyze_xray(
    patient_id: str = Form("PAT-XRAY-001"),
    file: UploadFile = File(...),
):
    """
    Analyzes Chest X-Ray radiograph using DenseNet-121, extracts spatial Grad-CAM attention heatmap,
    and pins the visual explanation artifact to decentralized IPFS.
    """
    try:
        contents = await file.read()
        analysis = vision_xai_engine.analyze_xray(contents)

        # Pin visual Grad-CAM image to Pinata IPFS
        filename = f"gradcam_{patient_id}.png"
        ipfs_cid = ipfs_service.pin_image_to_ipfs(analysis["gradcam_image_bytes"], filename)

        # Base64 preview for instant UI display
        b64_img = base64.b64encode(analysis["gradcam_image_bytes"]).decode("utf-8")

        return XRayAnalysisResponse(
            patient_id=patient_id,
            primary_finding=analysis["primary_finding"],
            confidence_score=analysis["confidence_score"],
            findings_distribution=analysis["findings_distribution"],
            gradcam_ipfs_cid=ipfs_cid,
            gradcam_preview_base64=f"data:image/png;base64,{b64_img}",
            model_backbone="DenseNet-121 (ChestX-ray8 Benchmark)",
        )
    except Exception as e:
        logger.error(f"X-ray Grad-CAM processing error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process radiographic image: {str(e)}",
        )
