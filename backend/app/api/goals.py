"""GET /api/goals, POST /api/goals"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Goal
from app.schemas import GoalCreate, GoalSchema

router = APIRouter()


def _to_schema(g: Goal) -> GoalSchema:
    progress = min((g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0, 100)
    return GoalSchema(
        id=g.id,
        profile_id=g.profile_id,
        name=g.name,
        target_amount=g.target_amount,
        current_amount=g.current_amount,
        target_date=g.target_date,
        category=g.category,
        progress_pct=round(progress, 1),
    )


@router.get("", response_model=list[GoalSchema])
async def list_goals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).order_by(Goal.created_at.desc()))
    return [_to_schema(g) for g in result.scalars().all()]


@router.post("", response_model=GoalSchema, status_code=201)
async def create_goal(data: GoalCreate, db: AsyncSession = Depends(get_db)):
    goal = Goal(
        id=str(uuid.uuid4()),
        profile_id="default",
        **data.model_dump(),
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return _to_schema(goal)


@router.put("/{goal_id}", response_model=GoalSchema)
async def update_goal(goal_id: str, data: GoalCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    for field, value in data.model_dump().items():
        setattr(goal, field, value)
    await db.commit()
    await db.refresh(goal)
    return _to_schema(goal)


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Goal).where(Goal.id == goal_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    await db.delete(goal)
    await db.commit()
