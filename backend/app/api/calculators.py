"""Financial calculator API endpoints."""
from fastapi import APIRouter, HTTPException
from app.schemas import (
    SIPRequest, SIPResponse,
    SWPRequest, SWPResponse,
    PPFRequest, PPFResponse,
    NPSRequest, NPSResponse,
)
from app.services.calculator_service import (
    calculate_sip, calculate_swp, calculate_ppf, calculate_nps,
)

router = APIRouter()


@router.post("/sip", response_model=SIPResponse)
async def sip_calculator(req: SIPRequest):
    try:
        result = calculate_sip(req.monthly_investment, req.annual_return_pct, req.duration_months)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return SIPResponse(**result.__dict__)


@router.post("/swp", response_model=SWPResponse)
async def swp_calculator(req: SWPRequest):
    try:
        result = calculate_swp(req.initial_investment, req.monthly_withdrawal, req.annual_return_pct, req.duration_months)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return SWPResponse(**result.__dict__)


@router.post("/ppf", response_model=PPFResponse)
async def ppf_calculator(req: PPFRequest):
    try:
        result = calculate_ppf(req.annual_investment, req.duration_years, req.assumed_annual_rate_pct)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return PPFResponse(**result.__dict__)


@router.post("/nps", response_model=NPSResponse)
async def nps_calculator(req: NPSRequest):
    try:
        result = calculate_nps(req.monthly_contribution, req.duration_years, req.assumed_annual_return_pct)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return NPSResponse(**result.__dict__)
