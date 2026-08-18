from typing import Generator
from sqlalchemy.orm import Session
from backend.app.db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Dependency to retrieve database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
