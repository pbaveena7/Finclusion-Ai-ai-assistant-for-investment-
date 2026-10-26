"""Tests for financial calculators."""
import pytest
import os
os.environ.setdefault("AI_PROVIDER", "none")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test_finclusion.db")

import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db
from app.services.calculator_service import (
    calculate_sip, calculate_swp, calculate_ppf, calculate_nps
)


@pytest_asyncio.fixture
async def client():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ─── Unit tests ────────────────────────────────────────────────────────────

def test_sip_basic():
    r = calculate_sip(1000, 12, 12)
    assert r.total_invested == 12000.0
    assert r.estimated_future_value > r.total_invested
    assert r.estimated_gains > 0


def test_sip_zero_return():
    r = calculate_sip(1000, 0, 12)
    assert r.estimated_future_value == 12000.0
    assert r.estimated_gains == 0.0


def test_sip_invalid():
    with pytest.raises(ValueError):
        calculate_sip(-100, 12, 12)
    with pytest.raises(ValueError):
        calculate_sip(1000, 12, 0)


def test_swp_basic():
    r = calculate_swp(100_000, 2000, 8, 24)
    assert r.total_withdrawn > 0
    assert r.estimated_remaining_balance >= 0


def test_swp_overdraw():
    r = calculate_swp(10_000, 50_000, 0, 12)
    assert r.estimated_remaining_balance == 0.0


def test_ppf_basic():
    r = calculate_ppf(100_000, 15, 7.1)
    assert r.estimated_maturity_value > r.total_invested
    assert r.total_invested == 1_500_000.0


def test_ppf_invalid_duration():
    with pytest.raises(ValueError):
        calculate_ppf(50_000, 10)


def test_ppf_exceeds_limit():
    with pytest.raises(ValueError):
        calculate_ppf(200_000, 15)


def test_nps_basic():
    r = calculate_nps(5000, 20, 10)
    assert r.estimated_corpus > r.total_contributed
    assert abs(r.estimated_lump_sum_60pct + r.estimated_annuity_corpus_40pct - r.estimated_corpus) < 1


# ─── API tests ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_sip_api(client):
    resp = await client.post("/api/calculators/sip", json={
        "monthly_investment": 5000,
        "annual_return_pct": 12,
        "duration_months": 120,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_invested"] == 600_000.0
    assert data["estimated_future_value"] > 600_000.0


@pytest.mark.asyncio
async def test_sip_api_invalid(client):
    resp = await client.post("/api/calculators/sip", json={
        "monthly_investment": -100,
        "annual_return_pct": 12,
        "duration_months": 12,
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_swp_api(client):
    resp = await client.post("/api/calculators/swp", json={
        "initial_investment": 500_000,
        "monthly_withdrawal": 3000,
        "annual_return_pct": 8,
        "duration_months": 60,
    })
    assert resp.status_code == 200
    assert "estimated_remaining_balance" in resp.json()


@pytest.mark.asyncio
async def test_ppf_api(client):
    resp = await client.post("/api/calculators/ppf", json={
        "annual_investment": 100_000,
        "duration_years": 15,
        "assumed_annual_rate_pct": 7.1,
    })
    assert resp.status_code == 200
    assert resp.json()["estimated_maturity_value"] > 1_500_000


@pytest.mark.asyncio
async def test_nps_api(client):
    resp = await client.post("/api/calculators/nps", json={
        "monthly_contribution": 5000,
        "duration_years": 25,
        "assumed_annual_return_pct": 10,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "estimated_corpus" in data
