"""GET /api/news"""
from fastapi import APIRouter
from app.schemas import NewsResponseSchema
from app.services.news_service import fetch_news

router = APIRouter()


@router.get("", response_model=NewsResponseSchema)
async def news(q: str = "finance OR investment OR stock OR mutual fund OR RBI OR SEBI", page_size: int = 10):
    result = await fetch_news(query=q, page_size=min(page_size, 20))
    return NewsResponseSchema(
        articles=[a.__dict__ for a in result.articles],
        configured=result.configured,
        message=result.message,
        disclaimer=result.disclaimer,
    )
