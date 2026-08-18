from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class HealthCheckResponse(BaseModel):
    status: str = Field(default="healthy", description="Overall health status")
    app_name: str
    app_env: str
    timestamp: datetime
    services: Dict[str, Any] = Field(default_factory=dict, description="Status of connected services (DB, Web3, ML)")
