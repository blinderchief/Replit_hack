"""
Foresight Florals - Future-Self Simulations
What-if scenarios showing potential garden states based on user choices
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pydantic import BaseModel
import google.generativeai as genai
import os

from app.core.database import get_db
from app.models.echo import Echo
from app.models.user_profile import UserProfile
from app.models.activity import BreathingSession, JournalEntry, GratitudeEntry, GroundingSession

router = APIRouter(prefix="/api/simulate", tags=["simulate"])

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class SimulationRequest(BaseModel):
    user_id: str
    what_if_scenario: str  # e.g., "I start journaling daily", "I stop activities"
    timeframe_days: int = 30

def calculate_current_trajectory(echoes: List[Echo], activities: List) -> Dict:
    """Analyze current patterns to establish baseline trajectory"""
    if not echoes:
        return {
            "baseline_mood": 0,
            "trend": "neutral",
            "activity_frequency": 0
        }
    
    recent_echoes = echoes[:14]  # Last 2 weeks
    older_echoes = echoes[14:28] if len(echoes) > 14 else []
    
    recent_avg = sum(e.mood_score for e in recent_echoes) / len(recent_echoes)
    older_avg = sum(e.mood_score for e in older_echoes) / len(older_echoes) if older_echoes else recent_avg
    
    trend = "improving" if recent_avg > older_avg + 0.1 else "declining" if recent_avg < older_avg - 0.1 else "stable"
    
    # Activity frequency (per week)
    activity_freq = len([a for a in activities if a.completed_at >= datetime.utcnow() - timedelta(days=7)])
    
    return {
        "baseline_mood": recent_avg,
        "trend": trend,
        "activity_frequency": activity_freq,
        "echo_count": len(echoes),
        "consistency": len(recent_echoes) / 14  # Consistency score
    }

async def generate_scenario_simulations(
    what_if: str,
    current_state: Dict,
    profile: UserProfile
) -> Dict:
    """Generate 3 future scenarios using Gemini"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = f"""You are a compassionate future-self simulator in EchoBloom wellness app.

USER'S CURRENT STATE:
- Baseline mood: {current_state['baseline_mood']:.2f}
- Trend: {current_state['trend']}
- Activity frequency: {current_state['activity_frequency']} per week
- Wellness score: {profile.wellness_score}
- Echo consistency: {current_state['consistency']:.0%}

WHAT-IF SCENARIO: "{what_if}"

TASK: Generate 3 future garden states (30 days from now) based on this scenario:
1. **Pessimistic** - If things go poorly/they abandon the change
2. **Realistic** - Most likely outcome with moderate effort
3. **Optimistic** - If they fully commit to the change

For each scenario, provide:
- Garden state description (visual metaphor)
- Predicted wellness score change
- Key outcomes (3 bullets)
- Emotional tone

Be honest but compassionate. Avoid toxic positivity.

FORMAT AS JSON:
{{
  "scenarios": [
    {{
      "type": "pessimistic",
      "title": "Short title (3-5 words)",
      "garden_state": "Visual description of garden appearance (2-3 sentences)",
      "wellness_delta": -10,  // Change from current score
      "mood_prediction": -0.2,  // Change from baseline
      "key_outcomes": [
        "Outcome 1",
        "Outcome 2",
        "Outcome 3"
      ],
      "emotional_tone": "Word describing emotional state",
      "gentle_warning": "Compassionate 1-sentence caution"
    }},
    {{
      "type": "realistic",
      "title": "Short title",
      "garden_state": "Visual garden description",
      "wellness_delta": 5,
      "mood_prediction": 0.1,
      "key_outcomes": ["...", "...", "..."],
      "emotional_tone": "...",
      "encouragement": "Supportive 1-sentence note"
    }},
    {{
      "type": "optimistic",
      "title": "Short title",
      "garden_state": "Visual garden description",
      "wellness_delta": 20,
      "mood_prediction": 0.3,
      "key_outcomes": ["...", "...", "..."],
      "emotional_tone": "...",
      "inspiration": "Aspirational 1-sentence vision"
    }}
  ],
  "suggested_first_step": "One concrete micro-action to start (1 sentence)"
}}

Base predictions on behavioral science, not wishful thinking."""
    
    try:
        response = model.generate_content(prompt)
        
        # Parse response
        import json
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        simulation_data = json.loads(response_text)
        
        return {
            "success": True,
            "simulations": simulation_data,
            "what_if_scenario": what_if,
            "baseline_state": current_state
        }
    
    except Exception as e:
        # Fallback simulations
        return {
            "success": False,
            "simulations": {
                "scenarios": [
                    {
                        "type": "pessimistic",
                        "title": "The Withering Garden",
                        "garden_state": f"Your garden shows signs of neglect. Without following through on '{what_if}', familiar patterns return. Flowers that were budding close their petals. The soil grows harder, less receptive to new seeds.",
                        "wellness_delta": -8,
                        "mood_prediction": -0.15,
                        "key_outcomes": [
                            "Return to old coping patterns",
                            "Decreased motivation over time",
                            "Missed opportunity for growth"
                        ],
                        "emotional_tone": "resigned",
                        "gentle_warning": "Not following through isn't failure—it's information about what you need to change."
                    },
                    {
                        "type": "realistic",
                        "title": "The Growing Garden",
                        "garden_state": f"Your garden adapts to '{what_if}' with steady progress. Some days are easier than others. New flowers bloom alongside old ones. The garden learns your rhythm, growing at its own pace.",
                        "wellness_delta": 7,
                        "mood_prediction": 0.12,
                        "key_outcomes": [
                            "Gradual mood improvement",
                            "Increased self-awareness",
                            "Building sustainable habits"
                        ],
                        "emotional_tone": "hopeful",
                        "encouragement": "Progress doesn't have to be perfect to be real."
                    },
                    {
                        "type": "optimistic",
                        "title": "The Thriving Garden",
                        "garden_state": f"Your garden flourishes beyond expectation. '{what_if}' becomes second nature. Flowers bloom in colors you didn't know existed. The soil is rich, every seed finds purchase. Other gardeners stop to admire your growth.",
                        "wellness_delta": 18,
                        "mood_prediction": 0.28,
                        "key_outcomes": [
                            "Significant wellness improvement",
                            "Positive habit momentum",
                            "Inspiring your support network"
                        ],
                        "emotional_tone": "empowered",
                        "inspiration": "This future is possible when you meet yourself with consistency and compassion."
                    }
                ],
                "suggested_first_step": f"Start with just 5 minutes today of '{what_if}' without judgment—small roots grow deep gardens."
            },
            "what_if_scenario": what_if,
            "baseline_state": current_state,
            "error": str(e)
        }

@router.post("/futures")
async def simulate_futures(
    request: SimulationRequest,
    db: Session = Depends(get_db)
):
    """Generate future-self simulations based on what-if scenario"""
    try:
        # Fetch user data
        result = await db.execute(
            select(Echo)
            .where(Echo.user_id == request.user_id)
            .order_by(desc(Echo.created_at))
            .limit(30)
        )
        echoes = result.scalars().all()
        
        # Fetch all activity types
        activities = []
        
        # Breathing sessions
        breathing_result = await db.execute(
            select(BreathingSession)
            .where(BreathingSession.user_id == request.user_id)
            .order_by(desc(BreathingSession.completed_at))
            .limit(20)
        )
        activities.extend(breathing_result.scalars().all())
        
        # Journal entries
        journal_result = db.execute(
            select(JournalEntry)
            .where(JournalEntry.user_id == request.user_id)
            .order_by(desc(JournalEntry.completed_at))
            .limit(20)
        )
        activities.extend(journal_result.scalars().all())
        
        # Gratitude entries
        gratitude_result = db.execute(
            select(GratitudeEntry)
            .where(GratitudeEntry.user_id == request.user_id)
            .order_by(desc(GratitudeEntry.completed_at))
            .limit(20)
        )
        activities.extend(gratitude_result.scalars().all())
        
        # Grounding sessions
        grounding_result = db.execute(
            select(GroundingSession)
            .where(GroundingSession.user_id == request.user_id)
            .order_by(desc(GroundingSession.completed_at))
            .limit(20)
        )
        activities.extend(grounding_result.scalars().all())
        
        # Fetch profile
        profile_result = db.execute(
            select(UserProfile).where(UserProfile.user_id == request.user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Calculate current trajectory
        current_state = calculate_current_trajectory(list(echoes), list(activities))
        
        # Generate simulations
        simulation_response = await generate_scenario_simulations(
            request.what_if_scenario,
            current_state,
            profile
        )
        
        return {
            **simulation_response,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@router.get("/suggested-scenarios/{user_id}")
async def get_suggested_scenarios(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get AI-suggested what-if scenarios based on user patterns"""
    try:
        # Fetch recent echoes
        result = await db.execute(
            select(Echo)
            .where(Echo.user_id == user_id)
            .order_by(desc(Echo.created_at))
            .limit(10)
        )
        echoes = result.scalars().all()
        
        if not echoes:
            return {
                "suggestions": [
                    "I start journaling every morning",
                    "I practice gratitude daily",
                    "I commit to weekly therapy check-ins"
                ],
                "note": "Default suggestions - plant more echoes for personalized scenarios"
            }
        
        # Analyze patterns to suggest scenarios
        from collections import Counter
        all_emotions = []
        for echo in echoes:
            all_emotions.extend(echo.emotion_tags)
        
        emotion_counts = Counter(all_emotions)
        top_emotion = emotion_counts.most_common(1)[0][0] if emotion_counts else "neutral"
        
        avg_mood = sum(e.mood_score for e in echoes) / len(echoes)
        
        # Generate contextual suggestions
        suggestions = []
        
        if avg_mood < -0.1:
            suggestions.append("I schedule weekly therapy or support group sessions")
            suggestions.append("I practice self-compassion exercises daily")
        
        if 'anxiety' in [e.lower() for e in all_emotions]:
            suggestions.append("I commit to 10 minutes of breathwork each morning")
            suggestions.append("I limit social media to 30 minutes per day")
        
        if 'gratitude' in [e.lower() for e in all_emotions]:
            suggestions.append("I write 3 gratitudes every night before bed")
        
        # Default suggestions
        suggestions.extend([
            "I start a creative hobby (art, music, writing)",
            "I build a morning routine that nourishes me",
            "I reach out to a friend weekly for connection"
        ])
        
        return {
            "suggestions": suggestions[:6],  # Return top 6
            "based_on": {
                "echo_count": len(echoes),
                "dominant_emotion": top_emotion,
                "avg_mood": avg_mood
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion generation failed: {str(e)}")
