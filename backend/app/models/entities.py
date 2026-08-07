import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import BigInteger, Boolean, Float, ForeignKey, Integer, String, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.core.constants import (
    UserRole, SessionState, EventType, RiskLevel,
    DiagnosisCategory, DecisionAction, OrderStatus, PaymentStatus
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(String(50), default=UserRole.CUSTOMER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    whatsapp_optin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dnd_registered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    device_type: Mapped[str] = mapped_column(String(50), default="desktop", nullable=False)
    browser: Mapped[str] = mapped_column(String(50), default="chrome", nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    state: Mapped[SessionState] = mapped_column(String(50), default=SessionState.ACTIVE, nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="sessions")
    events: Mapped[List["SessionEvent"]] = relationship("SessionEvent", back_populates="session", cascade="all, delete-orphan")
    cart: Mapped[Optional["Cart"]] = relationship("Cart", back_populates="session", uselist=False)
    risk_predictions: Mapped[List["RiskPrediction"]] = relationship("RiskPrediction", back_populates="session")
    diagnoses: Mapped[List["Diagnosis"]] = relationship("Diagnosis", back_populates="session")
    recommendations: Mapped[List["Recommendation"]] = relationship("Recommendation", back_populates="session")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="session")


class SessionEvent(Base):
    __tablename__ = "session_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type: Mapped[EventType] = mapped_column(String(50), nullable=False, index=True)
    page_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    element_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="events")


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    item_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    items_json: Mapped[dict] = mapped_column(JSON, default=list, nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="cart")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id"), nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    discount_applied: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(String(50), default=OrderStatus.PENDING, nullable=False)


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    gateway: Mapped[str] = mapped_column(String(50), default="Razorpay", nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(String(50), default=PaymentStatus.INITIATED, nullable=False)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    top_features: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="v1.0.0", nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="risk_predictions")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    primary_category: Mapped[DiagnosisCategory] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    root_cause_summary: Mapped[str] = mapped_column(Text, nullable=False)
    behavioral_signals: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="diagnoses")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    recommended_action: Mapped[DecisionAction] = mapped_column(String(50), nullable=False)
    business_justification: Mapped[str] = mapped_column(Text, nullable=False)
    expected_margin_impact: Mapped[float] = mapped_column(Float, nullable=False)
    is_approved_by_critic: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="recommendations")


class PolicyCheck(Base):
    __tablename__ = "policy_checks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id"), nullable=False)
    action: Mapped[DecisionAction] = mapped_column(String(50), nullable=False)
    is_compliant: Mapped[bool] = mapped_column(Boolean, nullable=False)
    violations: Mapped[dict] = mapped_column(JSON, default=list, nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id"), nullable=False)
    channel: Mapped[str] = mapped_column(String(50), nullable=False)  # EMAIL, WHATSAPP, POPUP
    recipient: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="DELIVERED", nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    input_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    output_data: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, nullable=False)

    session: Mapped["Session"] = relationship("Session", back_populates="audit_logs")


class Analytics(Base):
    __tablename__ = "analytics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    total_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    high_risk_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rescued_sessions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    recovery_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    incremental_revenue: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_discounts_given: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
