"""Tests for fraud detection."""
import pytest
import os
os.environ.setdefault("AI_PROVIDER", "none")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_finclusion.db")

import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db
from app.services.fraud_service import analyze_message


@pytest_asyncio.fixture
async def client():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ─── Unit tests ────────────────────────────────────────────────────────────

def test_clean_message():
    r = analyze_message("I want to learn about SIP investing.")
    assert r.risk_level == "low"
    assert r.risk_score == 0


def test_guaranteed_return():
    r = analyze_message("Guaranteed 100% profit in 30 days! Risk-free investment!")
    assert r.risk_level in ("medium", "high")
    assert any(i.category == "Guaranteed Returns" for i in r.indicators)


def test_urgency():
    r = analyze_message("Act now! Limited time offer expires tonight! Only 3 spots left!")
    assert len(r.indicators) > 0


def test_otp_request():
    r = analyze_message("Please share your OTP to complete the investment process.")
    assert any(i.category == "Sensitive Info Request" for i in r.indicators)


def test_empty_input():
    with pytest.raises(ValueError):
        analyze_message("")


def test_suspicious_url():
    r = analyze_message("Visit http://sebi-official-scheme.bit.ly/invest for guaranteed returns.")
    assert r.risk_level in ("medium", "high")


# ─── API tests ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_fraud_api_clean(client):
    resp = await client.post("/api/fraud/check", json={"text": "Learn about SIP today."})
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_level"] == "low"


@pytest.mark.asyncio
async def test_fraud_api_high_risk(client):
    resp = await client.post("/api/fraud/check", json={
        "text": "Guaranteed 200% returns! SEBI approved! Act NOW! Share your OTP to receive profits!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_level"] == "high"
    assert data["risk_score"] >= 40
    assert len(data["indicators"]) >= 2


@pytest.mark.asyncio
async def test_fraud_api_empty(client):
    resp = await client.post("/api/fraud/check", json={"text": ""})
    assert resp.status_code == 422
