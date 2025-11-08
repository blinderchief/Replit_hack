from sqlalchemy import Column, Integer, String, DateTime, Float, JSON
from sqlalchemy.sql import func
from app.models import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)  # Clerk ID
    username = Column(String)
    email = Column(String)
    
    # Wellness Metrics
    total_echoes = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    mood_average = Column(Float, default=0.0)  # -1 to 1
    wellness_score = Column(Integer, default=50)  # 0-100
    
    # Achievements
    achievements = Column(JSON, default=list)  # ["first_bloom", "week_warrior", etc.]
    badges = Column(JSON, default=list)
    
    # Activity Stats
    weekly_active_days = Column(Integer, default=0)
    monthly_reflections = Column(Integer, default=0)
    gratitude_count = Column(Integer, default=0)
    
    # Preferences
    preferred_activities = Column(JSON, default=list)
    notification_settings = Column(JSON, default=dict)
    ritual_preferences = Column(JSON, default=dict)  # Quiz responses
    
    # Mood Trends
    mood_trend_direction = Column(String, default="stable")  # "improving", "declining", "stable"
    
    last_active = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "total_echoes": self.total_echoes,
            "current_streak": self.current_streak,
            "longest_streak": self.longest_streak,
            "mood_average": self.mood_average,
            "wellness_score": self.wellness_score,
            "achievements": self.achievements or [],
            "badges": self.badges or [],
            "weekly_active_days": self.weekly_active_days,
            "monthly_reflections": self.monthly_reflections,
            "gratitude_count": self.gratitude_count,
            "preferred_activities": self.preferred_activities or [],
            "ritual_preferences": self.ritual_preferences or {},
            "mood_trend_direction": self.mood_trend_direction,
            "last_active": self.last_active.isoformat() if self.last_active else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
