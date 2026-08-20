from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    health,
    auth,
    ai,
    web3,
    practitioner,
    settings as settings_endpoint,
    cohort,
    admin,
    reports,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Identity & Auth Gateway"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Privacy Shield & Summary"])
api_router.include_router(reports.router, prefix="/reports", tags=["Document Ingestion & Clinical Benchmarks"])
api_router.include_router(ai.router, prefix="/ai", tags=["Explainable AI"])
api_router.include_router(cohort.router, prefix="/cohort", tags=["Batch Cohort Analyzer"])
api_router.include_router(web3.router, prefix="/web3", tags=["Web3 & Blockchain"])
api_router.include_router(practitioner.router, prefix="/practitioner", tags=["Practitioner Profile"])
api_router.include_router(settings_endpoint.router, prefix="/settings", tags=["System Settings"])
