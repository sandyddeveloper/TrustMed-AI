from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.db.base import Base
from backend.app.db.session import engine, SessionLocal
from backend.app.models.user import User
from backend.app.core.security import get_password_hash
from backend.app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    logger.info(f"Starting {settings.APP_NAME} in [{settings.APP_ENV}] mode...")
    
    # Initialize database tables on startup
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Database table initialization warning: {e}")

    # Seed or synchronize the pre-configured Admin account
    try:
        with SessionLocal() as db:
            admin_phone = "9345693386"
            admin_user = db.query(User).filter(
                (User.phone_number == admin_phone) | (User.email == "admin@trustmed.ai")
            ).first()

            if not admin_user:
                admin_user = User(
                    email="admin@trustmed.ai",
                    phone_number=admin_phone,
                    patient_id="ADM-2026-0001",
                    record_number="REC-ADMIN-01",
                    hashed_password=get_password_hash("250825"),
                    first_name="System",
                    last_name="Admin",
                    full_name="TrustMed System Administrator",
                    role="Admin",
                    is_superuser=True,
                    is_active=True,
                )
                db.add(admin_user)
                db.commit()
                logger.info(f"Admin account created: Phone: {admin_phone}, Role: Admin")
            else:
                admin_user.phone_number = admin_phone
                admin_user.hashed_password = get_password_hash("250825")
                admin_user.role = "Admin"
                admin_user.is_superuser = True
                admin_user.is_active = True
                db.commit()
                logger.info(f"Admin account credentials verified (Phone: {admin_phone})")
    except Exception as err:
        logger.warning(f"Admin seeding notice: {err}")

    yield

    logger.info(f"Shutting down {settings.APP_NAME}...")
    engine.dispose()


def create_application() -> FastAPI:
    """Factory function for FastAPI application instance."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="Production-grade API for Explainable AI (XAI) & Web3 Healthcare Integrations.",
        version="0.1.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
        docs_url=f"{settings.API_V1_STR}/docs" if settings.DEBUG else None,
        redoc_url=f"{settings.API_V1_STR}/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # CORS configuration with regex support for Vercel, ngrok, and all local/production origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_origin_regex=r"https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Mount API Routers
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "environment": settings.APP_ENV,
            "docs": f"{settings.API_V1_STR}/docs" if settings.DEBUG else "Disabled in production",
            "health": f"{settings.API_V1_STR}/health",
        }

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS if not settings.DEBUG else 1,
    )
