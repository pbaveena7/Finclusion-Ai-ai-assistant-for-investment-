"""GET /api/profile, PUT /api/profile"""
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Profile
from app.schemas import ProfileSchema, ProfileSummary

router = APIRouter()
logger = logging.getLogger(__name__)

DEFAULT_PROFILE_ID = "default"

RISK_EXPLANATIONS = {
    "conservative": (
        "Conservative investors prefer capital preservation. "
        "Suitable instruments: FD, PPF, Debt Mutual Funds, Government Bonds. "
        "Lower expected returns, lower volatility."
    ),
    "moderate": (
        "Moderate investors balance growth with stability. "
        "Suitable instruments: Balanced/Hybrid Funds, mix of Equity and Debt. "
        "Medium expected returns, medium volatility."
    ),
    "aggressive": (
        "Aggressive investors seek higher returns and can tolerate market swings. "
        "Suitable instruments: Equity Mutual Funds, Direct Stocks, Small-cap Funds. "
        "Higher expected returns, higher volatility."
    ),
}

ALLOCATIONS = {
    "conservative": {"Debt Funds": 60, "Equity Funds": 20, "Gold/REITs": 10, "Cash/FD": 10},
    "moderate": {"Equity Funds": 50, "Debt Funds": 30, "Gold/REITs": 10, "Cash/FD": 10},
    "aggressive": {"Equity Funds": 75, "Debt Funds": 15, "Gold/REITs": 7, "Cash/FD": 3},
}


@router.get("", response_model=ProfileSchema)
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.id == DEFAULT_PROFILE_ID))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = Profile(id=DEFAULT_PROFILE_ID)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return ProfileSchema.model_validate(profile)


@router.put("", response_model=ProfileSchema)
async def update_profile(data: ProfileSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.id == DEFAULT_PROFILE_ID))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = Profile(id=DEFAULT_PROFILE_ID)
        db.add(profile)

    for field, value in data.model_dump(exclude={"id"}).items():
        if hasattr(profile, field):
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return ProfileSchema.model_validate(profile)


@router.get("/summary", response_model=ProfileSummary)
async def profile_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).where(Profile.id == DEFAULT_PROFILE_ID))
    profile = result.scalar_one_or_none()
    if not profile:
        # Auto-create default profile instead of 404
        profile = Profile(id=DEFAULT_PROFILE_ID)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    monthly_savings = max(profile.monthly_income - profile.monthly_expenses, 0)
    emergency_target = profile.monthly_expenses * 6
    savings_rate = (monthly_savings / profile.monthly_income * 100) if profile.monthly_income > 0 else 0
    risk = profile.risk_tolerance if profile.risk_tolerance in RISK_EXPLANATIONS else "moderate"

    return ProfileSummary(
        monthly_savings=round(monthly_savings, 2),
        emergency_fund_target=round(emergency_target, 2),
        savings_rate_pct=round(savings_rate, 1),
        risk_explanation=RISK_EXPLANATIONS[risk],
        illustrative_allocation=ALLOCATIONS[risk],
    )
