"""GET /api/health — reports backend status and AI provider readiness."""
from fastapi import APIRouter
from app.config import get_settings
from app.services.ai_service import get_ai_adapter

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health():
    adapter = get_ai_adapter()
    ready = await adapter.is_ready()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "ai_provider": settings.ai_provider,
        "ai_model": adapter.model_name,
        "ai_ready": ready,
        "news_configured": bool(settings.news_api_key),
        "finnhub_configured": bool(settings.finnhub_api_key),
        "alpha_vantage_configured": bool(settings.alpha_vantage_api_key),
    }
