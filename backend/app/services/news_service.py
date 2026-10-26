"""
News Service — fetches financial news from NewsAPI.org
If no API key is configured, returns a configuration message instead of fake news.
"""
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, field

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

FINANCE_KEYWORDS = "banking OR economy OR investment OR \"mutual fund\" OR \"stock market\" OR SEBI OR RBI"


@dataclass
class NewsArticle:
    title: str
    description: str
    url: str
    source: str
    published_at: str
    sentiment: str = "neutral"  # "positive" | "neutral" | "negative"


@dataclass
class NewsResponse:
    articles: list[NewsArticle] = field(default_factory=list)
    configured: bool = True
    message: str = ""
    disclaimer: str = (
        "News sentiment is an educational indicator only. "
        "It is not a buy/sell signal or investment recommendation."
    )


def _simple_sentiment(text: str) -> str:
    """
    Lightweight keyword-based sentiment.
    Replaces FinBERT when a full ML stack is not available.
    FinBERT can be plugged in here when transformers is installed.
    """
    lower = text.lower()
    positive_words = ["rise", "gain", "surge", "rally", "growth", "profit", "bullish", "record", "high", "beat"]
    negative_words = ["fall", "drop", "crash", "loss", "decline", "bearish", "cut", "default", "concern", "risk"]
    pos = sum(1 for w in positive_words if w in lower)
    neg = sum(1 for w in negative_words if w in lower)
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"


async def fetch_news(query: str = FINANCE_KEYWORDS, page_size: int = 10) -> NewsResponse:
    key = settings.news_api_key
    if not key:
        return NewsResponse(
            articles=[],
            configured=False,
            message=(
                "NEWS_API_KEY is not configured. "
                "Get a free key at https://newsapi.org/register and add it to backend/.env"
            ),
        )

    params = {
        "q": query,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": page_size,
        "apiKey": key,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(settings.news_api_url, params=params)
        resp.raise_for_status()
        data = resp.json()
        articles = []
        for a in data.get("articles", []):
            text = f"{a.get('title', '')} {a.get('description', '')}"
            articles.append(NewsArticle(
                title=a.get("title", "No title"),
                description=a.get("description", "") or "",
                url=a.get("url", ""),
                source=a.get("source", {}).get("name", "Unknown"),
                published_at=a.get("publishedAt", datetime.now(timezone.utc).isoformat()),
                sentiment=_simple_sentiment(text),
            ))
        return NewsResponse(articles=articles)
    except httpx.HTTPStatusError as e:
        logger.error("NewsAPI error: %s", e)
        return NewsResponse(
            articles=[],
            configured=True,
            message=f"NewsAPI returned error {e.response.status_code}.",
        )
    except Exception as e:
        logger.error("News fetch failed: %s", e)
        return NewsResponse(
            articles=[],
            configured=True,
            message="Could not fetch news. Check your network and NEWS_API_KEY.",
        )
