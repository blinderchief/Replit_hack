from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from app.core.config import settings
from typing import Dict, Any

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = settings.secret_key

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class PreferencesUpdate(BaseModel):
    user_id: str
    preferences: Dict[str, Any]

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    hashed_password = pwd_context.hash(user.password)
    new_user = User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    await db.commit()
    return {"message": "User registered"}

@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(User.__table__.select().where(User.email == user.email))
    db_user = result.fetchone()
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": access_token}

@router.post("/preferences")
async def save_preferences(data: PreferencesUpdate, db: AsyncSession = Depends(get_db)):
    """Save user ritual preferences from quiz"""
    try:
        # Get or create user profile
        result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == data.user_id)
        )
        profile = result.scalar_one_or_none()
        
        if not profile:
            profile = UserProfile(
                user_id=data.user_id,
                ritual_preferences=data.preferences
            )
            db.add(profile)
        else:
            profile.ritual_preferences = data.preferences
        
        await db.commit()
        await db.refresh(profile)
        
        return {"message": "Preferences saved", "profile": profile.to_dict()}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preferences/{user_id}")
async def get_preferences(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user preferences"""
    result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        return {"preferences": {}}
    
    return {"preferences": profile.ritual_preferences or {}}