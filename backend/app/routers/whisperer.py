"""
Garden Whisperer Mode - Proactive AI nudges for intervention
Detects patterns of low mood and provides personalized support
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, and_
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import google.generativeai as genai
import os

from app.core.database import get_db
from app.models.echo import Echo
from app.models.user_profile import UserProfile

router = APIRouter(prefix="/api/whisperer", tags=["whisperer"])

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_mood_pattern(echoes: List[Echo]) -> Dict:
    """Analyze recent echoes for concerning patterns"""
    if len(echoes) < 3:
        return {
            "needs_intervention": False,
            "pattern_type": "insufficient_data",
            "severity": 0
        }
    
    # Get last 7 days of echoes
    recent_echoes = echoes[:7]
    mood_scores = [echo.mood_score for echo in recent_echoes]
    
    # Count low mood days (mood_score < -0.2)
    low_mood_days = sum(1 for score in mood_scores if score < -0.2)
    avg_mood = sum(mood_scores) / len(mood_scores)
    
    # Detect patterns
    needs_intervention = False
    pattern_type = "stable"
    severity = 0
    
    if low_mood_days >= 3:
        needs_intervention = True
        pattern_type = "declining_trend"
        severity = min(low_mood_days, 5)  # Scale 1-5
    elif avg_mood < -0.3:
        needs_intervention = True
        pattern_type = "persistent_low"
        severity = 3
    elif len(recent_echoes) >= 3:
        # Check for sudden drop
        recent_avg = sum(mood_scores[:3]) / 3
        if recent_avg < -0.2 and recent_avg < avg_mood - 0.3:
            needs_intervention = True
            pattern_type = "sudden_drop"
            severity = 4
    
    return {
        "needs_intervention": needs_intervention,
        "pattern_type": pattern_type,
        "severity": severity,
        "low_mood_days": low_mood_days,
        "avg_mood": avg_mood,
        "recent_emotions": [echo.emotion_tags for echo in recent_echoes[:3]]
    }

async def generate_whisperer_nudge(pattern: Dict, user_profile: UserProfile) -> Dict:
    """Generate personalized nudge using Gemini"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Extract context
    severity = pattern.get('severity', 3)
    pattern_type = pattern.get('pattern_type', 'unknown')
    recent_emotions = pattern.get('recent_emotions', [])
    
    # Build contextual prompt
    prompt = f"""You are the Garden Whisperer, a gentle AI companion in EchoBloom wellness app.

USER CONTEXT:
- Pattern detected: {pattern_type}
- Severity level: {severity}/5
- Recent emotions: {', '.join([', '.join(emotions) for emotions in recent_emotions if emotions])}
- Wellness score: {user_profile.wellness_score}

TASK: Generate a warm, proactive nudge to support the user. Follow these tiers:

RESCUE TIERS:
1. Quick (Severity 1-2): Gentle reminder + mood-food suggestion
2. Medium (Severity 3): Activity recommendation + encouragement
3. Deep (Severity 4-5): Compassionate check-in + sojourn suggestion

TONE: Empathetic, non-judgmental, conversational. Like a wise friend.

FORMAT YOUR RESPONSE AS JSON:
{{
  "message": "2-3 sentence warm check-in",
  "rescue_tier": "quick|medium|deep",
  "suggestions": [
    {{
      "type": "food|activity|sojourn",
      "title": "Short title",
      "description": "1 sentence description",
      "icon": "emoji"
    }}
  ],
  "affirmation": "One empowering sentence"
}}

Keep it brief, actionable, and hopeful."""
    
    try:
        response = model.generate_content(prompt)
        
        # Parse Gemini response
        import json
        response_text = response.text.strip()
        
        # Extract JSON from markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        nudge_data = json.loads(response_text)
        
        return {
            "success": True,
            "nudge": nudge_data,
            "pattern": pattern_type,
            "severity": severity
        }
    
    except Exception as e:
        # Fallback nudge if Gemini fails
        return {
            "success": False,
            "nudge": {
                "message": "I've noticed your garden could use some extra care. You're not alone in this. 🌿",
                "rescue_tier": "medium",
                "suggestions": [
                    {
                        "type": "activity",
                        "title": "Breathing Exercise",
                        "description": "5 minutes of guided breathing to ground yourself",
                        "icon": "🌬️"
                    },
                    {
                        "type": "activity",
                        "title": "Gratitude Practice",
                        "description": "Name 3 small things that brought you comfort today",
                        "icon": "🙏"
                    }
                ],
                "affirmation": "Your feelings are valid, and small steps create big growth."
            },
            "pattern": pattern_type,
            "severity": severity,
            "error": str(e)
        }

@router.post("/check-patterns")
async def check_patterns(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Check if user needs Garden Whisperer intervention"""
    try:
        # Fetch recent echoes (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        
        result = db.execute(
            select(Echo)
            .where(and_(
                Echo.user_id == user_id,
                Echo.created_at >= seven_days_ago
            ))
            .order_by(desc(Echo.created_at))
        )
        echoes = result.scalars().all()
        
        # Fetch user profile
        profile_result = db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Analyze pattern
        pattern = analyze_mood_pattern(list(echoes))
        
        # Generate nudge if intervention needed
        if pattern["needs_intervention"]:
            nudge_response = await generate_whisperer_nudge(pattern, profile)
            
            return {
                "needs_intervention": True,
                "pattern": pattern,
                "nudge": nudge_response["nudge"],
                "severity": pattern["severity"],
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            return {
                "needs_intervention": False,
                "pattern": pattern,
                "message": "Your garden is thriving! Keep nurturing those seeds. 🌸",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Whisperer check failed: {str(e)}")

@router.get("/mood-food-basket/{user_id}")
async def get_mood_food_basket(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Generate personalized mood-food nutrition recommendations"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    try:
        # Fetch recent echoes for context
        result = db.execute(
            select(Echo)
            .where(Echo.user_id == user_id)
            .order_by(desc(Echo.created_at))
            .limit(5)
        )
        echoes = result.scalars().all()
        
        # Extract dominant emotions
        all_emotions = []
        for echo in echoes:
            all_emotions.extend(echo.emotion_tags)
        
        from collections import Counter
        emotion_counts = Counter(all_emotions)
        top_emotions = [emotion for emotion, _ in emotion_counts.most_common(3)]
        
        prompt = f"""You are a nutrition-wellness expert in the EchoBloom app.

USER'S RECENT EMOTIONAL STATE:
- Dominant emotions: {', '.join(top_emotions) if top_emotions else 'neutral'}

TASK: Suggest 4-5 mood-boosting foods/drinks with scientific backing.

FORMAT AS JSON:
{{
  "basket_theme": "Uplifting theme name (e.g., 'Sunshine Basket', 'Grounding Greens')",
  "foods": [
    {{
      "name": "Food name",
      "emoji": "emoji",
      "benefit": "How it helps mood (1 sentence)",
      "science": "Brief nutritional fact (e.g., 'Rich in omega-3s')"
    }}
  ],
  "ritual": "Simple preparation ritual (2 sentences, mindful approach)"
}}

Focus on accessible, comforting foods. Be warm and encouraging."""
        
        response = model.generate_content(prompt)
        
        # Parse response
        import json
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        basket_data = json.loads(response_text)
        
        return {
            "success": True,
            "basket": basket_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        # Fallback basket
        return {
            "success": False,
            "basket": {
                "basket_theme": "Comfort Basket",
                "foods": [
                    {
                        "name": "Dark Chocolate",
                        "emoji": "🍫",
                        "benefit": "Boosts serotonin and dopamine for instant mood lift",
                        "science": "Rich in flavonoids and magnesium"
                    },
                    {
                        "name": "Chamomile Tea",
                        "emoji": "🍵",
                        "benefit": "Calms anxiety and promotes restful presence",
                        "science": "Contains apigenin, a natural relaxant"
                    },
                    {
                        "name": "Blueberries",
                        "emoji": "🫐",
                        "benefit": "Supports brain health and reduces stress",
                        "science": "High in antioxidants and vitamin C"
                    },
                    {
                        "name": "Almonds",
                        "emoji": "🌰",
                        "benefit": "Stabilizes mood and energy levels",
                        "science": "Packed with magnesium and vitamin E"
                    }
                ],
                "ritual": "Set aside 10 quiet minutes. Prepare your chosen food mindfully, noticing colors and aromas. Eat slowly, savoring each bite as an act of self-care."
            },
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
