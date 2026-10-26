"""
Finclusion AI — FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.api import health, chat, calculators, news, fraud, profile, goals, forecaster, auth, recommender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Finclusion AI backend …")
    await init_db()
    logger.info("Database initialised.")
    yield
    logger.info("Shutting down Finclusion AI backend.")


app = FastAPI(
    title="Finclusion AI API",
    description=(
        "Local FinGPT-powered financial literacy assistant. "
        "Educational use only — not regulated financial advice."
    ),
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(calculators.router, prefix="/api/calculators", tags=["Calculators"])
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(fraud.router, prefix="/api/fraud", tags=["Fraud"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(goals.router, prefix="/api/goals", tags=["Goals"])
app.include_router(forecaster.router, prefix="/api/forecaster", tags=["FinGPT Forecaster"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(recommender.router, prefix="/api/recommender", tags=["Stock Recommender"])
