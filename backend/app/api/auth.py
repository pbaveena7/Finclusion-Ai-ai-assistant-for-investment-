"""Authentication endpoints: Register, Login, Current User."""
import re
import uuid
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User

router = APIRouter()

EMAIL_REGEX = re.compile(r"^[\w\.-]+@([\w\.-]+\.)+[\w-]{2,4}$")


def hash_pw(password: str) -> str:
    """Standard SHA-256 password hash for local SQLite database."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    token: str


@router.post("/register", response_model=UserResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    clean_email = req.email.strip().lower()
    if not clean_email or not EMAIL_REGEX.match(clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address."
        )

    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # Check if user already exists
    res = await db.execute(select(User).where(User.email == clean_email))
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in."
        )

    display_name = req.name.strip() or clean_email.split("@")[0].capitalize()

    user = User(
        id=str(uuid.uuid4()),
        email=clean_email,
        name=display_name,
        hashed_password=hash_pw(req.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        token=f"finclusion_{user.id}"
    )


@router.post("/login", response_model=UserResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    clean_email = req.email.strip().lower()
    if not clean_email or not req.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both email and password are required."
        )

    res = await db.execute(select(User).where(User.email == clean_email))
    user = res.scalar_one_or_none()

    if not user or user.hashed_password != hash_pw(req.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination."
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        token=f"finclusion_{user.id}"
    )
