"""POST /api/chat and GET /api/chat/history"""
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import ChatHistory
from app.schemas import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_adapter
from app.ai.base import ChatMessage
from app.security.sanitize import sanitize_input

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_HISTORY = 10  # messages kept per session


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    session_id = req.session_id or str(uuid.uuid4())
    user_text = sanitize_input(req.message)

    # Load recent history
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.created_at.desc())
        .limit(MAX_HISTORY)
    )
    history_rows = list(reversed(result.scalars().all()))
    history_msgs = [ChatMessage(role=r.role, content=r.content) for r in history_rows]
    history_msgs.append(ChatMessage(role="user", content=user_text))

    # Save user message
    db.add(ChatHistory(session_id=session_id, role="user", content=user_text))
    await db.flush()

    # AI call
    adapter = get_ai_adapter()
    try:
        ai_resp = await adapter.chat(history_msgs)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("AI chat error")
        raise HTTPException(status_code=500, detail="AI service error. Please try again.")

    # Save assistant reply
    db.add(ChatHistory(
        session_id=session_id,
        role="assistant",
        content=ai_resp.text,
        provider=ai_resp.provider,
        model=ai_resp.model,
    ))
    await db.commit()

    return ChatResponse(
        reply=ai_resp.text,
        session_id=session_id,
        provider=ai_resp.provider,
        model=ai_resp.model,
        disclaimer=ai_resp.disclaimer,
    )


@router.get("/history")
async def get_history(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.created_at.asc())
    )
    rows = result.scalars().all()
    return {
        "session_id": session_id,
        "messages": [
            {"role": r.role, "content": r.content, "created_at": r.created_at.isoformat()}
            for r in rows
        ],
    }
