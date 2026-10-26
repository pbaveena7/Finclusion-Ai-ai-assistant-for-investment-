"""Tests for the FastAPI application."""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Patch settings before importing app
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
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["app"] == "Finclusion AI"
    assert "ai_provider" in data
    assert "ai_ready" in data


@pytest.mark.asyncio
async def test_chat_no_provider(client):
    resp = await client.post("/api/chat", json={"message": "What is SIP?"})
    # Should fail with 503 because AI_PROVIDER=none
    assert resp.status_code == 503
    assert "No AI provider" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_chat_history(client):
    resp = await client.get("/api/chat/history", params={"session_id": "test-session"})
    assert resp.status_code == 200
    data = resp.json()
    assert "messages" in data
    assert isinstance(data["messages"], list)
