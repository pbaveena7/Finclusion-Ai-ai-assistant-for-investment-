"""API endpoint for FinGPT Market Intelligence & Robo-Forecaster."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.forecaster_service import run_fingpt_forecaster, get_market_quote

router = APIRouter()


class ForecastRequest(BaseModel):
    symbol: str = "AAPL"


@router.post("/forecast")
async def forecast_stock(req: ForecastRequest):
    if not req.symbol or not req.symbol.strip():
        raise HTTPException(status_code=400, detail="Stock ticker symbol is required.")
    try:
        result = await run_fingpt_forecaster(req.symbol)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting engine error: {str(e)}")


@router.get("/quote/{symbol}")
async def stock_quote(symbol: str):
    if not symbol:
        raise HTTPException(status_code=400, detail="Symbol required")
    return await get_market_quote(symbol)
