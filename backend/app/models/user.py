from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base


class User(Base):
    """User Model."""
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    wallet_address: Mapped[str] = mapped_column(String(42), nullable=True, index=True)


class MedicalRecordAudit(Base):
    """Audit log for records, AI explanations, and Web3 anchor hashes."""
    __tablename__ = "medical_record_audits"

    record_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    ipfs_cid: Mapped[str] = mapped_column(String(100), nullable=True)
    tx_hash: Mapped[str] = mapped_column(String(66), nullable=True, index=True)
    ai_prediction_summary: Mapped[str] = mapped_column(Text, nullable=True)
