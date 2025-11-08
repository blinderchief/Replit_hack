"""
Gestalt Greenhouse: Emotion Alchemy Lab
Creative emotion fusion system for exploring complex emotional states
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from datetime import datetime
from typing import List, Dict, Optional
from pydantic import BaseModel
import google.generativeai as genai
import os
import json

from app.core.database import get_db
from app.models.echo import Echo
from app.models.user_profile import UserProfile

router = APIRouter(prefix="/api/alchemy", tags=["alchemy"])

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class FusionRequest(BaseModel):
    user_id: str
    emotion1: str
    emotion2: str


class EmotionToken(BaseModel):
    name: str
    color: str
    description: str


# Predefined emotion tokens for the lab
EMOTION_PALETTE = [
    {"name": "Joy", "color": "from-yellow-400 to-orange-400", "description": "Bright, expansive, warm"},
    {"name": "Sadness", "color": "from-blue-500 to-indigo-600", "description": "Deep, heavy, reflective"},
    {"name": "Anger", "color": "from-red-500 to-red-700", "description": "Hot, intense, energizing"},
    {"name": "Fear", "color": "from-purple-600 to-gray-700", "description": "Sharp, alerting, protective"},
    {"name": "Disgust", "color": "from-green-700 to-yellow-700", "description": "Repelling, boundary-setting"},
    {"name": "Curiosity", "color": "from-sky-400 to-teal-400", "description": "Light, seeking, open"},
    {"name": "Shame", "color": "from-gray-600 to-gray-800", "description": "Shrinking, hidden, heavy"},
    {"name": "Pride", "color": "from-purple-400 to-pink-400", "description": "Uplifting, confident, shining"},
    {"name": "Envy", "color": "from-green-600 to-emerald-700", "description": "Yearning, comparing, reaching"},
    {"name": "Gratitude", "color": "from-pink-300 to-rose-400", "description": "Warm, open, tender"},
    {"name": "Anxiety", "color": "from-yellow-600 to-red-600", "description": "Buzzing, racing, urgent"},
    {"name": "Calm", "color": "from-blue-300 to-green-300", "description": "Soft, steady, grounded"},
    {"name": "Excitement", "color": "from-orange-400 to-pink-500", "description": "Sparking, forward, alive"},
    {"name": "Loneliness", "color": "from-indigo-700 to-blue-800", "description": "Hollow, aching, distant"},
    {"name": "Love", "color": "from-pink-400 to-red-400", "description": "Radiant, connecting, full"},
    {"name": "Confusion", "color": "from-purple-500 to-gray-500", "description": "Foggy, uncertain, swirling"}
]


async def generate_emotion_fusion(emotion1: str, emotion2: str, user_context: Optional[Dict] = None) -> Dict:
    """
    Uses Gemini to generate creative, therapeutic fusion of two emotions.
    This is Gestalt psychology meets emotional alchemy - exploring how emotions combine
    to create new, complex emotional states.
    """
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    context_text = ""
    if user_context:
        context_text = f"\n\nUSER CONTEXT:\n- Recent mood trend: {user_context.get('mood_trend', 'neutral')}\n- Common emotions: {', '.join(user_context.get('common_emotions', []))}"
    
    prompt = f"""You are an emotional alchemy guide in the EchoBloom app's "Gestalt Greenhouse" - an experimental lab for exploring complex emotional states.

THE FUSION REQUEST:
Emotion 1: {emotion1}
Emotion 2: {emotion2}
{context_text}

YOUR TASK: Generate a creative, therapeutic "emotion fusion" that:
1. COMBINES these emotions into a new, named complex emotional state
2. EXPLORES how these emotions interact (do they conflict? complement? transform each other?)
3. VALIDATES the complexity (emotions rarely exist in isolation)
4. Uses VIVID, METAPHORICAL language (like describing an alchemical experiment)

FUSION PHILOSOPHY:
- Emotions are not "good" or "bad" - they're information
- Complex emotions deserve creative names (e.g., "bitter nostalgia", "fierce tenderness")
- Fusion should feel like discovering something that was always there but unnamed
- Use sensory metaphors: textures, temperatures, colors, movements

EXAMPLES OF GOOD FUSIONS:
- Anger + Curiosity = "Fiery Inquiry" - A burning need to understand what hurt you, transforming rage into investigative energy
- Sadness + Gratitude = "Bittersweet Abundance" - Honoring loss while holding what remains, like autumn leaves falling from a full tree
- Fear + Excitement = "Electric Anticipation" - The trembling before a leap, where terror and thrill become indistinguishable

FORMAT AS JSON:
{{
  "fusion_name": "2-4 word poetic name (capitalize each word)",
  "fusion_description": "2-3 sentence description of this complex state (80-120 words)",
  "visual_metaphor": "What this fusion looks like as a garden element (1-2 sentences, vivid imagery)",
  "alchemical_formula": "Poetic equation showing the transformation (e.g., 'Rage × Wonder = Discovery forged in flame')",
  "when_this_appears": "When you might experience this fusion in real life (1 sentence)",
  "therapeutic_insight": "What this fusion teaches you about yourself (1-2 sentences)",
  "color_palette": "Describe the colors this fusion would have (e.g., 'Deep crimson bleeding into curious gold')",
  "texture": "Physical texture descriptor (e.g., 'Rough like tree bark, but warm like sun-heated stone')",
  "movement_quality": "How this emotion moves (e.g., 'Spiraling inward then exploding outward')"
}}

Make it poetic, therapeutic, and deeply validating of emotional complexity. This is about honoring the full spectrum of human feeling."""
    
    try:
        response = model.generate_content(prompt)
        
        # Parse response
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        fusion_data = json.loads(response_text)
        
        return {
            "success": True,
            "fusion": fusion_data,
            "emotions_used": [emotion1, emotion2],
            "created_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        # Fallback fusion
        return {
            "success": False,
            "fusion": {
                "fusion_name": "Complex Wholeness",
                "fusion_description": f"When {emotion1.lower()} meets {emotion2.lower()}, they create a space where both can exist without canceling each other out. This is the emotional reality of being human—holding multiple truths at once, like a garden that contains both withering and blooming in the same moment.",
                "visual_metaphor": "A tree whose branches hold both autumn leaves falling and spring buds emerging, proving that transitions contain multitudes.",
                "alchemical_formula": f"{emotion1} ⚗️ {emotion2} = The Courage to Feel Everything",
                "when_this_appears": f"This fusion appears when life asks you to hold {emotion1.lower()} and {emotion2.lower()} simultaneously, refusing to choose one emotional truth over another.",
                "therapeutic_insight": "Your capacity to feel complex, seemingly contradictory emotions is not confusion—it's wisdom. You are large enough to contain multitudes.",
                "color_palette": "Swirling gradients where opposing colors meet but don't merge, creating new hues at their borders",
                "texture": "Like silk and sandpaper woven together—contradictory yet somehow cohesive",
                "movement_quality": "A double helix spiraling, two forces orbiting each other without colliding"
            },
            "emotions_used": [emotion1, emotion2],
            "created_at": datetime.utcnow().isoformat(),
            "error": str(e)
        }


@router.post("/fuse")
async def fuse_emotions(
    request: FusionRequest,
    db: Session = Depends(get_db)
):
    """
    Fuse two emotions into a creative, complex emotional state.
    This is the main endpoint for the Gestalt Greenhouse experiment.
    """
    try:
        # Fetch user context for more personalized fusions
        user_context = None
        try:
            # Get user's recent emotional patterns
            result = await db.execute(
                select(Echo)
                .where(Echo.user_id == request.user_id)
                .order_by(desc(Echo.created_at))
                .limit(10)
            )
            recent_echoes = result.scalars().all()
            
            if recent_echoes:
                all_emotions = []
                mood_scores = []
                for echo in recent_echoes:
                    all_emotions.extend(echo.emotion_tags)
                    mood_scores.append(echo.mood_score)
                
                avg_mood = sum(mood_scores) / len(mood_scores)
                
                # Count emotion frequency
                from collections import Counter
                emotion_counts = Counter(all_emotions)
                common_emotions = [emotion for emotion, _ in emotion_counts.most_common(3)]
                
                user_context = {
                    "mood_trend": "positive" if avg_mood > 0.2 else "challenging" if avg_mood < -0.2 else "balanced",
                    "common_emotions": common_emotions
                }
        except Exception as e:
            print(f"Could not fetch user context: {e}")
        
        # Generate fusion
        fusion_response = await generate_emotion_fusion(
            request.emotion1,
            request.emotion2,
            user_context
        )
        
        return fusion_response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emotion fusion failed: {str(e)}")


@router.get("/emotion-palette")
async def get_emotion_palette():
    """
    Get the palette of emotion tokens available for fusion experiments.
    """
    return {
        "emotions": EMOTION_PALETTE,
        "total": len(EMOTION_PALETTE),
        "message": "Drag and drop emotions to explore complex feelings",
        "philosophy": "Emotions rarely exist in isolation. The Gestalt Greenhouse lets you explore how they combine, conflict, and create new emotional realities."
    }


@router.get("/suggested-pairs/{user_id}")
async def get_suggested_emotion_pairs(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Suggest emotion pairs based on the user's recent echoes.
    Helps users explore tensions they might be experiencing.
    """
    try:
        # Get recent echoes
        result = await db.execute(
            select(Echo)
            .where(Echo.user_id == user_id)
            .order_by(desc(Echo.created_at))
            .limit(15)
        )
        recent_echoes = result.scalars().all()
        
        if not recent_echoes:
            return {
                "suggested_pairs": [],
                "message": "Plant some echoes to get personalized suggestions"
            }
        
        # Extract emotions
        all_emotions = []
        for echo in recent_echoes:
            all_emotions.extend(echo.emotion_tags)
        
        # Find most common emotions
        from collections import Counter
        emotion_counts = Counter(all_emotions)
        top_emotions = [emotion for emotion, _ in emotion_counts.most_common(4)]
        
        # Generate suggested pairs based on common tensions
        suggestions = []
        
        # Common emotional tensions to explore
        if "Joy" in top_emotions and "Sadness" in top_emotions:
            suggestions.append({
                "emotion1": "Joy",
                "emotion2": "Sadness",
                "reason": "You've been experiencing both - explore how they coexist"
            })
        
        if "Anger" in top_emotions and ("Sadness" in top_emotions or "Fear" in top_emotions):
            suggestions.append({
                "emotion1": "Anger",
                "emotion2": "Sadness" if "Sadness" in top_emotions else "Fear",
                "reason": "Anger often masks other feelings - discover what's beneath"
            })
        
        if "Anxiety" in top_emotions and "Excitement" in top_emotions:
            suggestions.append({
                "emotion1": "Anxiety",
                "emotion2": "Excitement",
                "reason": "These feel similar physically - explore their edge"
            })
        
        if "Gratitude" in top_emotions and any(e in top_emotions for e in ["Sadness", "Loneliness", "Grief"]):
            sad_emotion = next((e for e in ["Sadness", "Loneliness", "Grief"] if e in top_emotions), "Sadness")
            suggestions.append({
                "emotion1": "Gratitude",
                "emotion2": sad_emotion,
                "reason": "Bittersweet moments hold both - name what you're feeling"
            })
        
        if "Shame" in top_emotions and "Pride" in top_emotions:
            suggestions.append({
                "emotion1": "Shame",
                "emotion2": "Pride",
                "reason": "You're holding contradictory self-views - explore the tension"
            })
        
        # If no specific tensions found, suggest based on most common emotion
        if not suggestions and top_emotions:
            most_common = top_emotions[0]
            # Suggest pairing with a complementary emotion
            complements = {
                "Joy": "Sadness",
                "Anger": "Curiosity",
                "Fear": "Excitement",
                "Sadness": "Gratitude",
                "Anxiety": "Calm",
                "Shame": "Pride"
            }
            
            complement = complements.get(most_common, "Curiosity")
            suggestions.append({
                "emotion1": most_common,
                "emotion2": complement,
                "reason": f"You've been feeling {most_common.lower()} often - explore it through a different lens"
            })
        
        return {
            "suggested_pairs": suggestions[:3],  # Return top 3
            "based_on_emotions": top_emotions,
            "message": "These pairings might resonate with your recent experiences"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")


@router.get("/fusion-history/{user_id}")
async def get_fusion_history(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get user's fusion experiment history.
    Future feature: Will store fusions in database.
    """
    # TODO: Implement database storage for fusion experiments
    
    return {
        "message": "Fusion history coming soon",
        "description": "Your emotion alchemy experiments will be saved here",
        "future_feature": "Database storage for persistent fusion library"
    }
