from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.schemas.health import HealthCheckResponse
from backend.app.core.config import settings
from backend.app.api.deps import get_db
from backend.app.services.web3_client import web3_client
from backend.app.services.ai_engine import ai_engine

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse, summary="System Health & Readiness Check")
def health_check(db: Session = Depends(get_db)):
    """
    Checks the status of the FastAPI server, database connection, Web3 provider, and AI Engine.
    """
    # Check Database connectivity
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Check Web3 connectivity
    web3_status = web3_client.get_status()

    # Check AI engine status
    ai_status = {
        "is_initialized": ai_engine.is_initialized,
        "default_method": settings.XAI_DEFAULT_METHOD,
    }

    return HealthCheckResponse(
        status="healthy" if db_status == "connected" else "degraded",
        app_name=settings.APP_NAME,
        app_env=settings.APP_ENV,
        timestamp=datetime.now(timezone.utc),
        services={
            "database": db_status,
            "web3": web3_status,
            "ai_engine": ai_status,
        },
    )
