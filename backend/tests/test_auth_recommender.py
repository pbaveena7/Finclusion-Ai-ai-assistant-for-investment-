"""Tests for Authentication, FinGPT Forecaster, and Stock Recommender APIs."""
import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient, ASGITransport

import os
os.environ.setdefault("AI_PROVIDER", "none")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_finclusion.db")

from app.main import app
from app.database import init_db


@pytest_asyncio.fixture
async def client():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_auth_workflow(client):
    test_email = f"user_{uuid.uuid4().hex[:8]}@finclusion.ai"
    test_password = "SecurePassword123"

    # 1. Register
    reg_resp = await client.post("/api/auth/register", json={
        "email": test_email,
        "password": test_password,
        "name": "Audit Test User"
    })
    assert reg_resp.status_code == 200
    user_data = reg_resp.json()
    assert user_data["email"] == test_email
    assert user_data["name"] == "Audit Test User"
    assert "token" in user_data

    # 2. Duplicate registration should fail
    dup_resp = await client.post("/api/auth/register", json={
        "email": test_email,
        "password": test_password,
        "name": "Duplicate"
    })
    assert dup_resp.status_code == 400

    # 3. Successful Login
    login_resp = await client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert login_resp.status_code == 200
    assert login_resp.json()["email"] == test_email

    # 4. Wrong password login fails
    bad_login = await client.post("/api/auth/login", json={
        "email": test_email,
        "password": "WrongPassword999"
    })
    assert bad_login.status_code == 401


@pytest.mark.asyncio
async def test_stock_recommender(client):
    req_payload = {
        "investment_amount": 50000,
        "target_amount": 150000,
        "time_limit_years": 4,
        "risk_preference": "moderate"
    }
    resp = await client.post("/api/recommender/recommend", json=req_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["investment_amount"] == 50000
    assert data["target_amount"] == 150000
    assert data["required_cagr"] > 0
    assert "recommended_stocks" in data
    assert len(data["recommended_stocks"]) > 0

    first_pick = data["recommended_stocks"][0]
    assert "symbol" in first_pick
    assert "allocation_pct" in first_pick
    assert "mlp_hedge_fund_confidence" in first_pick


@pytest.mark.asyncio
async def test_stock_recommender_invalid_inputs(client):
    # Non-positive values should be rejected by validation
    resp = await client.post("/api/recommender/recommend", json={
        "investment_amount": -100,
        "target_amount": 1000,
        "time_limit_years": 2
    })
    assert resp.status_code == 422
