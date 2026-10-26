"""POST /api/fraud/check"""
from fastapi import APIRouter, HTTPException
from app.schemas import FraudRequest, FraudResponseSchema, FraudIndicatorSchema
from app.services.fraud_service import analyze_message

router = APIRouter()


@router.post("/check", response_model=FraudResponseSchema)
async def fraud_check(req: FraudRequest):
    try:
        result = analyze_message(req.text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return FraudResponseSchema(
        input_text=result.input_text,
        risk_level=result.risk_level,
        risk_score=result.risk_score,
        indicators=[FraudIndicatorSchema(**i.__dict__) for i in result.indicators],
        url_flags=result.url_flags,
        summary=result.summary,
        disclaimer=result.disclaimer,
    )
