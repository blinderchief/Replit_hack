"""
Dawn Weaves - Predictive mood alerts with AI-generated shield stories
Analyzes historical patterns to forecast challenging days and provides proactive support
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import defaultdict
import google.generativeai as genai
import os

from app.core.database import get_db
from app.models.echo import Echo
from app.models.user_profile import UserProfile

router = APIRouter(prefix="/api/patterns", tags=["patterns"])

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_day_of_week_patterns(echoes: List[Echo]) -> Dict:
    """Analyze historical mood patterns by day of week"""
    # Group echoes by day of week
    day_moods = defaultdict(list)
    
    for echo in echoes:
        day_name = echo.created_at.strftime('%A')  # Monday, Tuesday, etc.
        day_moods[day_name].append(echo.mood_score)
    
    # Calculate average mood for each day
    day_averages = {}
    for day, scores in day_moods.items():
        if len(scores) >= 2:  # Need at least 2 data points
            day_averages[day] = {
                'avg_mood': sum(scores) / len(scores),
                'count': len(scores),
                'min_mood': min(scores),
                'max_mood': max(scores)
            }
    
    # Find days with consistently low mood (avg < -0.1)
    challenging_days = []
    for day, stats in day_averages.items():
        if stats['avg_mood'] < -0.1 and stats['count'] >= 2:
            challenging_days.append({
                'day': day,
                'avg_mood': stats['avg_mood'],
                'confidence': min(stats['count'] / 5, 1.0),  # Max confidence at 5 samples
                'sample_size': stats['count']
            })
    
    # Sort by avg mood (worst first)
    challenging_days.sort(key=lambda x: x['avg_mood'])
    
    return {
        'day_patterns': day_averages,
        'challenging_days': challenging_days,
        'has_patterns': len(challenging_days) > 0
    }

def get_next_occurrence(day_name: str) -> datetime:
    """Calculate next occurrence of a given day"""
    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    target_day_index = days_of_week.index(day_name)
    today = datetime.now()
    current_day_index = today.weekday()
    
    # Calculate days until next occurrence
    days_ahead = (target_day_index - current_day_index) % 7
    if days_ahead == 0:
        days_ahead = 7  # If it's today, predict for next week
    
    next_date = today + timedelta(days=days_ahead)
    return next_date

async def generate_shield_story(day: str, mood_context: Dict, user_profile: UserProfile) -> Dict:
    """Generate empowering shield story using Gemini"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    avg_mood = mood_context.get('avg_mood', 0)
    confidence = mood_context.get('confidence', 0)
    next_date = get_next_occurrence(day)
    
    prompt = f"""You are a compassionate storyteller in EchoBloom wellness app, creating "Dawn Weaves" - protective stories for challenging days.

USER CONTEXT:
- Predicted challenging day: {day}
- Historical mood pattern: {avg_mood:.2f} (negative scale)
- Prediction confidence: {int(confidence * 100)}%
- Next occurrence: {next_date.strftime('%B %d, %Y')}
- User wellness score: {user_profile.wellness_score}

TASK: Create a brief, empowering "shield story" to help the user prepare for {day}.

STORY ELEMENTS:
1. Acknowledge the pattern without judgment
2. Reframe {day} as an opportunity for gentle self-care
3. Offer 2-3 micro-rituals specific to common {day} challenges
4. End with a hopeful metaphor (dawn/sunrise theme)

TONE: Warm, poetic, empowering. Like a wise friend's letter.

FORMAT AS JSON:
{{
  "title": "Dawn Weave for [Day]",
  "story": "2-3 paragraph narrative (150-200 words)",
  "micro_rituals": [
    {{
      "time": "morning|afternoon|evening",
      "action": "Specific 2-minute ritual",
      "why": "Brief reason (1 sentence)"
    }}
  ],
  "affirmation": "One empowering sentence to carry through the day",
  "metaphor": "Closing nature/dawn metaphor (1 sentence)"
}}

Keep it brief, actionable, and deeply empathetic."""
    
    try:
        response = model.generate_content(prompt)
        
        # Parse response
        import json
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        story_data = json.loads(response_text)
        
        return {
            "success": True,
            "shield_story": story_data,
            "predicted_day": day,
            "next_date": next_date.isoformat(),
            "confidence": confidence
        }
    
    except Exception as e:
        # Fallback shield story
        return {
            "success": False,
            "shield_story": {
                "title": f"Dawn Weave for {day}",
                "story": f"I've noticed {day}s tend to be heavier for you. That's not a weakness—it's wisdom your body is sharing. This {day}, you have permission to move slower, rest deeper, and ask for what you need. Your garden doesn't judge the clouds; it knows every season has purpose.",
                "micro_rituals": [
                    {
                        "time": "morning",
                        "action": "Start your day 10 minutes earlier for gentle stretching",
                        "why": "Eases tension before the day begins"
                    },
                    {
                        "time": "afternoon",
                        "action": "Step outside for 3 deep breaths of fresh air",
                        "why": "Resets your nervous system mid-day"
                    },
                    {
                        "time": "evening",
                        "action": "Write down one thing that didn't go wrong",
                        "why": "Shifts focus to resilience over struggle"
                    }
                ],
                "affirmation": f"I am allowed to have hard {day}s, and I'm learning to hold myself through them.",
                "metaphor": "Even the dawn takes time to unfold—first a whisper of light, then a full bloom of sky."
            },
            "predicted_day": day,
            "next_date": next_date.isoformat(),
            "confidence": confidence,
            "error": str(e)
        }

@router.post("/predict")
async def predict_challenging_days(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Predict challenging days based on historical patterns"""
    try:
        # Fetch historical echoes (last 60 days minimum for pattern detection)
        sixty_days_ago = datetime.utcnow() - timedelta(days=60)
        
        result = await db.execute(
            select(Echo)
            .where(and_(
                Echo.user_id == user_id,
                Echo.created_at >= sixty_days_ago
            ))
        )
        echoes = result.scalars().all()
        
        # Need at least 14 echoes for meaningful patterns
        if len(echoes) < 14:
            return {
                "has_predictions": False,
                "message": "Keep planting echoes! We need at least 2 weeks of data to detect patterns.",
                "echoes_count": len(echoes),
                "min_required": 14
            }
        
        # Fetch user profile
        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Analyze patterns
        pattern_analysis = analyze_day_of_week_patterns(list(echoes))
        
        if not pattern_analysis['has_patterns']:
            return {
                "has_predictions": False,
                "message": "Your mood patterns are beautifully varied! No consistent challenging days detected.",
                "day_patterns": pattern_analysis['day_patterns']
            }
        
        # Generate shield stories for top 2 challenging days
        predictions = []
        for challenging_day in pattern_analysis['challenging_days'][:2]:
            story_response = await generate_shield_story(
                challenging_day['day'],
                challenging_day,
                profile
            )
            predictions.append(story_response)
        
        return {
            "has_predictions": True,
            "predictions": predictions,
            "pattern_analysis": pattern_analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/dawn-drawer/{user_id}")
async def get_dawn_drawer_alerts(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get upcoming dawn weaves for the next 7 days"""
    try:
        # Get predictions
        predictions_response = await predict_challenging_days(user_id, db)
        
        if not predictions_response.get('has_predictions'):
            return {
                "alerts": [],
                "message": predictions_response.get('message', 'No alerts at this time')
            }
        
        # Filter predictions for next 7 days
        today = datetime.now()
        next_week = today + timedelta(days=7)
        
        upcoming_alerts = []
        for prediction in predictions_response['predictions']:
            alert_date = datetime.fromisoformat(prediction['next_date'])
            if today <= alert_date <= next_week:
                days_away = (alert_date - today).days
                upcoming_alerts.append({
                    **prediction,
                    'days_away': days_away,
                    'is_urgent': days_away <= 1,
                    'alert_message': f"{prediction['predicted_day']} is {days_away} day{'s' if days_away != 1 else ''} away"
                })
        
        return {
            "alerts": upcoming_alerts,
            "count": len(upcoming_alerts),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dawn drawer fetch failed: {str(e)}")
