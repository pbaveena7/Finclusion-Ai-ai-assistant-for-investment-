"""API Router for Target Stock Recommendations using Hedge Fund Neural Network & Finnhub."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.recommender_service import calculate_target_stock_allocation

router = APIRouter()


class TargetStockRequest(BaseModel):
    investment_amount: float = Field(..., gt=0, description="Initial lump sum or capital in INR/USD")
    target_amount: float = Field(..., gt=0, description="Desired final corpus target")
    time_limit_years: float = Field(..., gt=0, description="Investment timeframe in years")
    risk_preference: Optional[str] = "moderate"


@router.post("/recommend")
async def recommend_stocks(req: TargetStockRequest) -> Dict[str, Any]:
    try:
        result = await calculate_target_stock_allocation(
            investment_amount=req.investment_amount,
            target_amount=req.target_amount,
            time_limit_years=req.time_limit_years,
            risk_preference=req.risk_preference or "moderate"
        )
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation engine error: {str(e)}"
        )
