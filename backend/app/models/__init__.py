"""SQLAlchemy ORM models."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, String, Text, Float, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    monthly_income: Mapped[float] = mapped_column(Float, default=0.0)
    monthly_expenses: Mapped[float] = mapped_column(Float, default=0.0)
    current_savings: Mapped[float] = mapped_column(Float, default=0.0)
    existing_debt: Mapped[float] = mapped_column(Float, default=0.0)
    age_range: Mapped[str] = mapped_column(String(20), default="")
    risk_tolerance: Mapped[str] = mapped_column(String(20), default="moderate")
    investment_horizon_years: Mapped[int] = mapped_column(Integer, default=5)
    language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id: Mapped[str] = mapped_column(String(36), default="default")
    name: Mapped[str] = mapped_column(String(200))
    target_amount: Mapped[float] = mapped_column(Float)
    current_amount: Mapped[float] = mapped_column(Float, default=0.0)
    target_date: Mapped[str] = mapped_column(String(20), default="")
    category: Mapped[str] = mapped_column(String(50), default="general")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), index=True)
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    provider: Mapped[str] = mapped_column(String(100), default="")
    model: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), default="")
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

