from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.practitioner import SystemSettings, SystemSettingsUpdate
from backend.app.core.logging import logger

router = APIRouter()

# In-memory persisted settings for active session
_current_settings = SystemSettings()


@router.get(
    "",
    response_model=SystemSettings,
    status_code=status.HTTP_200_OK,
    summary="Get System and Clinician Configuration",
)
def get_system_settings():
    """Returns active AI risk threshold, default ensemble model, AORE privacy flags, and EVM network."""
    return _current_settings


@router.put(
    "",
    response_model=SystemSettings,
    status_code=status.HTTP_200_OK,
    summary="Update System Configuration",
)
def update_system_settings(payload: SystemSettingsUpdate):
    """Updates AI model hyperparameters, IPFS auto-pinning, or Web3 network configuration."""
    global _current_settings
    data = payload.model_dump(exclude_unset=True)
    updated = _current_settings.model_copy(update=data)
    _current_settings = updated
    logger.info(f"System settings updated: {_current_settings}")
    return _current_settings
