"""Pydantic schemas for request/response validation."""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional


# ─── Chat ───────────────────────────────────────────────

class ChatMessageSchema(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None
    language: str = "en"


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    provider: str
    model: str
    disclaimer: str


# ─── SIP ────────────────────────────────────────────────

class SIPRequest(BaseModel):
    monthly_investment: float = Field(..., gt=0)
    annual_return_pct: float = Field(..., ge=0, le=100)
    duration_months: int = Field(..., ge=1, le=600)


class SIPResponse(BaseModel):
    monthly_investment: float
    annual_return_pct: float
    duration_months: int
    total_invested: float
    estimated_future_value: float
    estimated_gains: float
    disclaimer: str


# ─── SWP ────────────────────────────────────────────────

class SWPRequest(BaseModel):
    initial_investment: float = Field(..., gt=0)
    monthly_withdrawal: float = Field(..., ge=0)
    annual_return_pct: float = Field(..., ge=0, le=100)
    duration_months: int = Field(..., ge=1, le=600)


class SWPResponse(BaseModel):
    initial_investment: float
    monthly_withdrawal: float
    annual_return_pct: float
    duration_months: int
    estimated_remaining_balance: float
    total_withdrawn: float
    disclaimer: str


# ─── PPF ────────────────────────────────────────────────

class PPFRequest(BaseModel):
    annual_investment: float = Field(..., gt=0, le=150_000)
    duration_years: int = Field(..., ge=15, le=50)
    assumed_annual_rate_pct: float = Field(7.1, ge=0, le=20)


class PPFResponse(BaseModel):
    annual_investment: float
    duration_years: int
    assumed_annual_rate_pct: float
    total_invested: float
    estimated_maturity_value: float
    estimated_interest_earned: float
    notes: str
    disclaimer: str


# ─── NPS ────────────────────────────────────────────────

class NPSRequest(BaseModel):
    monthly_contribution: float = Field(..., gt=0)
    duration_years: int = Field(..., ge=1, le=40)
    assumed_annual_return_pct: float = Field(10.0, ge=0, le=30)


class NPSResponse(BaseModel):
    monthly_contribution: float
    duration_years: int
    assumed_annual_return_pct: float
    total_contributed: float
    estimated_corpus: float
    estimated_lump_sum_60pct: float
    estimated_annuity_corpus_40pct: float
    notes: str


# ─── News ───────────────────────────────────────────────

class NewsArticleSchema(BaseModel):
    title: str
    description: str
    url: str
    source: str
    published_at: str
    sentiment: str


class NewsResponseSchema(BaseModel):
    articles: list[NewsArticleSchema]
    configured: bool
    message: str
    disclaimer: str


# ─── Fraud ──────────────────────────────────────────────

class FraudRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class FraudIndicatorSchema(BaseModel):
    category: str
    description: str
    matched_text: str


class FraudResponseSchema(BaseModel):
    input_text: str
    risk_level: str
    risk_score: int
    indicators: list[FraudIndicatorSchema]
    url_flags: list[str]
    summary: str
    disclaimer: str


# ─── Profile ────────────────────────────────────────────

class ProfileSchema(BaseModel):
    id: Optional[str] = None
    monthly_income: float = 0.0
    monthly_expenses: float = 0.0
    current_savings: float = 0.0
    existing_debt: float = 0.0
    age_range: str = ""
    risk_tolerance: str = "moderate"
    investment_horizon_years: int = 5
    language: str = "en"

    model_config = ConfigDict(from_attributes=True)


class ProfileSummary(BaseModel):
    monthly_savings: float
    emergency_fund_target: float
    savings_rate_pct: float
    risk_explanation: str
    illustrative_allocation: dict


# ─── Goals ──────────────────────────────────────────────

class GoalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(0.0, ge=0)
    target_date: str = ""
    category: str = "general"


class GoalSchema(GoalCreate):
    id: str
    profile_id: str
    progress_pct: float = 0.0

    model_config = ConfigDict(from_attributes=True)
