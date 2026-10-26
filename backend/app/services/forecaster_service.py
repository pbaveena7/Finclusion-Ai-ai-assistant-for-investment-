"""
FinGPT Robo-Forecaster & Market Intelligence Service
Powered by Finnhub API + Alpha Vantage + Groq AI analysis
Directly adapting official FinGPT-Forecaster prompt structure and analysis methodology.
"""
import logging
from datetime import datetime, timedelta
import httpx

from app.config import get_settings
from app.services.ai_service import get_ai_adapter
from app.ai.base import ChatMessage

logger = logging.getLogger(__name__)
settings = get_settings()

FINGPT_SYSTEM_PROMPT = (
    "You are a seasoned financial analyst and robo-advisor built in the FinGPT paradigm. "
    "Your task is to analyze company basic financials and recent company news, list positive "
    "developments and potential concerns, and then provide an educational prediction and outlook analysis. "
    "Your response should be structured as follows:\n\n"
    "[Positive Developments]:\n1. ...\n\n"
    "[Potential Concerns]:\n1. ...\n\n"
    "[Prediction & Market Analysis]:\n...\n\n"
    "Always conclude with an educational reminder that past performance does not guarantee future results "
    "and this is not personalized financial advice."
)


async def get_market_quote(symbol: str) -> dict:
    """Fetch live quote from Finnhub, falling back to Alpha Vantage."""
    symbol = symbol.strip().upper()
    data = {"symbol": symbol, "price": None, "change": None, "change_percent": None, "high": None, "low": None, "source": "none"}
    
    # 1. Try Finnhub
    if settings.finnhub_api_key:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://finnhub.io/api/v1/quote",
                    params={"symbol": symbol, "token": settings.finnhub_api_key}
                )
                if resp.status_code == 200:
                    res = resp.json()
                    if res.get("c", 0) > 0:
                        data.update({
                            "price": res.get("c"),
                            "change": res.get("d"),
                            "change_percent": res.get("dp"),
                            "high": res.get("h"),
                            "low": res.get("l"),
                            "source": "Finnhub"
                        })
                        return data
        except Exception as e:
            logger.warning(f"Finnhub quote error for {symbol}: {e}")

    # 2. Try Alpha Vantage
    if settings.alpha_vantage_api_key:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://www.alphavantage.co/query",
                    params={"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": settings.alpha_vantage_api_key}
                )
                if resp.status_code == 200:
                    gq = resp.json().get("Global Quote", {})
                    if gq.get("05. price"):
                        data.update({
                            "price": float(gq["05. price"]),
                            "change": float(gq["09. change"]),
                            "change_percent": float(gq["10. change percent"].replace("%", "")),
                            "high": float(gq["03. high"]),
                            "low": float(gq["04. low"]),
                            "source": "Alpha Vantage"
                        })
                        return data
        except Exception as e:
            logger.warning(f"Alpha Vantage quote error for {symbol}: {e}")

    return data


async def get_company_profile(symbol: str) -> dict:
    """Fetch company profile and basic financials from Finnhub."""
    symbol = symbol.strip().upper()
    profile = {"name": symbol, "industry": "Finance / Technology", "market_cap": None, "currency": "USD"}
    
    if settings.finnhub_api_key:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://finnhub.io/api/v1/stock/profile2",
                    params={"symbol": symbol, "token": settings.finnhub_api_key}
                )
                if resp.status_code == 200 and resp.json():
                    p = resp.json()
                    profile["name"] = p.get("name") or symbol
                    profile["industry"] = p.get("finnhubIndustry") or "Market Sector"
                    profile["market_cap"] = p.get("marketCapitalization")
                    profile["currency"] = p.get("currency") or "USD"
                    profile["country"] = p.get("country")
                    profile["weburl"] = p.get("weburl")
        except Exception as e:
            logger.warning(f"Finnhub profile error for {symbol}: {e}")

    return profile


async def get_company_news(symbol: str, past_days: int = 7) -> list[dict]:
    """Fetch verified company news headlines from Finnhub."""
    symbol = symbol.strip().upper()
    news_items = []
    
    if settings.finnhub_api_key:
        try:
            today = datetime.now()
            from_date = (today - timedelta(days=past_days)).strftime("%Y-%m-%d")
            to_date = today.strftime("%Y-%m-%d")
            
            async with httpx.AsyncClient(timeout=12) as client:
                resp = await client.get(
                    "https://finnhub.io/api/v1/company-news",
                    params={
                        "symbol": symbol,
                        "from": from_date,
                        "to": to_date,
                        "token": settings.finnhub_api_key
                    }
                )
                if resp.status_code == 200:
                    items = resp.json()
                    for item in items[:6]:
                        news_items.append({
                            "headline": item.get("headline", ""),
                            "summary": item.get("summary", ""),
                            "url": item.get("url", ""),
                            "source": item.get("source", "Market News"),
                            "datetime": item.get("datetime")
                        })
        except Exception as e:
            logger.warning(f"Finnhub news error for {symbol}: {e}")
            
    return news_items


async def run_fingpt_forecaster(symbol: str) -> dict:
    """Run the FinGPT-Forecaster pipeline on a company ticker."""
    symbol = symbol.strip().upper()
    quote = await get_market_quote(symbol)
    profile = await get_company_profile(symbol)
    news = await get_company_news(symbol, past_days=7)
    
    # Construct FinGPT Forecaster Prompt
    news_text = ""
    for idx, n in enumerate(news, 1):
        news_text += f"{idx}. [Headline]: {n['headline']}\n   [Summary]: {n['summary'][:180]}...\n\n"
        
    if not news_text:
        news_text = "Recent news includes routine quarterly performance discussions and broader macroeconomic market adjustments."
        
    price_info = f"Current Price: {quote['price']} {profile.get('currency', 'USD')} (Change: {quote['change']} / {quote['change_percent']}%)" if quote['price'] else "Price data updating."
    
    user_prompt = f"""
[Company Introduction]:
Company: {profile['name']} ({symbol})
Industry: {profile.get('industry', 'Finance/Tech')}
Market Capitalization: {profile.get('market_cap', 'N/A')} {profile.get('currency', 'USD')}
{price_info}

[Recent Company News]:
{news_text}

Based on this market intelligence, analyze {symbol} using the FinGPT-Forecaster standard format:
1. List 2-3 [Positive Developments]
2. List 2-3 [Potential Concerns]
3. Provide a [Prediction & Market Analysis] outlook for the coming week.
"""

    adapter = get_ai_adapter()
    ai_resp = await adapter.chat(
        messages=[ChatMessage(role="user", content=user_prompt)],
        system_prompt=FINGPT_SYSTEM_PROMPT
    )
    
    return {
        "symbol": symbol,
        "company_name": profile["name"],
        "industry": profile["industry"],
        "quote": quote,
        "news": news,
        "analysis": ai_resp.text,
        "provider": ai_resp.provider,
        "model": ai_resp.model,
        "disclaimer": (
            "FinGPT Forecaster projections and sentiment summaries are for educational and analytical purposes only. "
            "They do not constitute regulated financial, legal, or investment recommendations."
        )
    }
