"""
Whisper Weave - AI-Coauthored Tales
Transforms weekly echoes into empathetic narrative therapy fables
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, and_
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pydantic import BaseModel
import google.generativeai as genai
import os

from app.core.database import get_db
from app.models.echo import Echo
from app.models.user_profile import UserProfile

router = APIRouter(prefix="/api/weave", tags=["weave"])

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def aggregate_weekly_echoes(echoes: List[Echo]) -> Dict:
    """Aggregate echo data for narrative generation"""
    if not echoes:
        return {
            "has_data": False,
            "message": "No echoes to weave into a story yet"
        }
    
    # Extract narrative elements
    all_emotions = []
    mood_journey = []
    key_moments = []
    
    for echo in echoes:
        all_emotions.extend(echo.emotion_tags)
        mood_journey.append({
            'date': echo.created_at.strftime('%A, %B %d'),
            'mood': echo.mood_score,
            'content_preview': echo.content[:100] + '...' if len(echo.content) > 100 else echo.content
        })
        
        # Identify key moments (high/low mood, significant emotions)
        if abs(echo.mood_score) > 0.3:
            key_moments.append({
                'type': 'peak' if echo.mood_score > 0.3 else 'valley',
                'emotions': echo.emotion_tags,
                'snippet': echo.content[:80]
            })
    
    # Calculate narrative arc
    from collections import Counter
    emotion_counts = Counter(all_emotions)
    dominant_emotions = [emotion for emotion, _ in emotion_counts.most_common(3)]
    
    avg_mood = sum(m['mood'] for m in mood_journey) / len(mood_journey)
    mood_variance = max(m['mood'] for m in mood_journey) - min(m['mood'] for m in mood_journey)
    
    return {
        "has_data": True,
        "echo_count": len(echoes),
        "dominant_emotions": dominant_emotions,
        "mood_journey": mood_journey,
        "key_moments": key_moments[:5],  # Top 5 key moments
        "narrative_arc": {
            "avg_mood": avg_mood,
            "emotional_range": mood_variance,
            "journey_type": "growth" if mood_journey[-1]['mood'] > mood_journey[0]['mood'] else "challenge"
        }
    }

async def generate_fable(narrative_data: Dict, user_profile: UserProfile) -> Dict:
    """Generate empathetic fable using Gemini"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    dominant_emotions = ', '.join(narrative_data['dominant_emotions'])
    arc = narrative_data['narrative_arc']
    key_moments = narrative_data['key_moments']
    
    # Build key moments summary
    moments_text = []
    for i, moment in enumerate(key_moments[:3], 1):
        moments_text.append(f"{i}. {moment['type'].capitalize()}: {moment['snippet']}")
    moments_summary = '\n'.join(moments_text)
    
    prompt = f"""You are a narrative therapist crafting a "Whisper Weave" - a therapeutic fable for the EchoBloom app.

USER'S WEEK SUMMARY:
- Echoes shared: {narrative_data['echo_count']}
- Dominant emotions: {dominant_emotions}
- Journey type: {arc['journey_type']}
- Emotional range: {arc['emotional_range']:.2f}
- Average mood: {arc['avg_mood']:.2f}

KEY MOMENTS FROM THEIR WEEK:
{moments_summary}

TASK: Craft a short fable (400-600 words) that:
1. Mirrors their emotional journey through nature metaphors
2. Transforms challenges into growth narratives
3. Validates all emotions without toxic positivity
4. Ends with gentle hope and self-compassion

STYLE: 
- Whimsical yet wise (like a Studio Ghibli film meets narrative therapy)
- Use "the gardener" as the protagonist (representing the user)
- Include sensory details (sounds, textures, colors)
- Weave in their dominant emotions as garden elements

STRUCTURE:
- Opening: Set the scene in a mystical garden
- Journey: Mirror their week's emotional arc
- Turning point: A moment of realization/acceptance
- Resolution: Gentle wisdom about growth

FORMAT AS JSON:
{{
  "title": "Poetic 3-5 word title",
  "fable": "Full 400-600 word narrative in paragraphs",
  "moral": "One sentence distilled wisdom",
  "garden_metaphor": "What their week's garden looked like (2 sentences)",
  "reflection_prompt": "Gentle question to ponder (1 sentence)"
}}

Make it deeply personal to their journey, not generic. This is narrative therapy."""
    
    try:
        response = model.generate_content(prompt)
        
        # Parse response
        import json
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        fable_data = json.loads(response_text)
        
        return {
            "success": True,
            "tale": fable_data,
            "narrative_data": narrative_data,
            "created_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        # Fallback fable
        return {
            "success": False,
            "tale": {
                "title": "The Garden of Tender Seasons",
                "fable": f"""Once, there was a gardener who tended a peculiar plot of land where emotions bloomed like flowers. This week, the garden had seen {narrative_data['echo_count']} new seeds planted, each one carrying a feeling: {dominant_emotions}.

The gardener walked through rows of {dominant_emotions.split(',')[0] if dominant_emotions else 'mixed'} blooms, some petals bright and open, others curled tight against storms they'd weathered. The garden never apologized for its seasons. When clouds gathered, the garden didn't pretend to be sunny. When frost came, it didn't force spring.

There were days the gardener knelt in the soil, hands deep in earth that held both joy and sorrow. They learned that trying to pull out the sad flowers only disturbed the roots of the happy ones—everything was connected, everything belonged.

One evening, as twilight painted the garden in soft purples and golds, the gardener noticed something: even on the hardest days, they had kept showing up. Even when blooms wilted, new seeds were already forming. The garden taught them that growth isn't always upward—sometimes it's deeper, quieter, rooting down through dark soil to find nutrients the surface never knew existed.

The gardener realized their week was not a problem to fix but a story to honor. Every emotion had earned its place in the garden. And in that acceptance, something shifted. The garden didn't change, but the gardener's relationship to it softened.

As stars emerged, the gardener whispered to their garden: "Thank you for teaching me that I don't have to bloom in every season to still be growing." """,
                "moral": "A garden's worth is not in constant blooming, but in honest seasons.",
                "garden_metaphor": f"Your week's garden held {narrative_data['echo_count']} diverse seeds, creating a landscape of {dominant_emotions}. It was neither perfectly sunny nor endlessly stormy—it was truthfully, beautifully yours.",
                "reflection_prompt": "What would change if you saw your emotions as seasons your garden is meant to experience, rather than problems to solve?"
            },
            "narrative_data": narrative_data,
            "created_at": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@router.post("/create-tale")
async def create_tale(
    user_id: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Generate AI-coauthored tale from recent echoes"""
    try:
        # Fetch echoes from specified time period
        start_date = datetime.utcnow() - timedelta(days=days)
        
        result = db.execute(
            select(Echo)
            .where(and_(
                Echo.user_id == user_id,
                Echo.created_at >= start_date
            ))
            .order_by(desc(Echo.created_at))
        )
        echoes = result.scalars().all()
        
        if len(echoes) < 3:
            return {
                "success": False,
                "message": f"Need at least 3 echoes to weave a tale. You have {len(echoes)}.",
                "suggestion": "Keep planting echoes this week, and return for your story!"
            }
        
        # Fetch user profile
        profile_result = db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Aggregate narrative data
        narrative_data = aggregate_weekly_echoes(list(echoes))
        
        if not narrative_data['has_data']:
            return {
                "success": False,
                "message": narrative_data['message']
            }
        
        # Generate fable
        tale_response = await generate_fable(narrative_data, profile)
        
        return tale_response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tale creation failed: {str(e)}")

@router.get("/tale-library/{user_id}")
async def get_tale_library(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user's tale generation history (stub for future database storage)"""
    # Future: Store tales in database with user_id, created_at, tale_data
    # For now, return placeholder indicating this is a real-time generation feature
    
    return {
        "message": "Tales are generated in real-time from your echoes",
        "suggestion": "Generate a new tale to see your week's story",
        "future_feature": "Tale library with saved favorites coming soon"
    }

@router.get("/preview-data/{user_id}")
async def preview_narrative_data(
    user_id: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Preview what narrative data exists for tale generation"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        result = db.execute(
            select(Echo)
            .where(and_(
                Echo.user_id == user_id,
                Echo.created_at >= start_date
            ))
            .order_by(desc(Echo.created_at))
        )
        echoes = result.scalars().all()
        
        narrative_data = aggregate_weekly_echoes(list(echoes))
        
        return {
            "ready_for_tale": len(echoes) >= 3,
            "echo_count": len(echoes),
            "narrative_preview": narrative_data if narrative_data['has_data'] else None
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")


# ==================== AFFIRMATION WEAVINGS ====================

class AffirmationRequest(BaseModel):
    user_id: str
    echo_id: int
    echo_content: str
    mood_score: float
    emotion_tags: List[str]


async def generate_affirmation(echo_data: Dict, user_profile: UserProfile) -> Dict:
    """
    Transmutes negative/difficult echoes into resilience mantras using Gemini.
    This is therapeutic alchemy - validating pain while offering transformative reframes.
    """
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    vent_text = echo_data['content']
    mood = echo_data['mood_score']
    emotions = ', '.join(echo_data['emotions'])
    
    prompt = f"""You are an empathetic alchemy guide in the EchoBloom app, practicing "Affirmation Weaving" - a therapeutic technique that transmutes difficult emotions into resilience mantras.

THE USER'S VENT:
"{vent_text}"

EMOTIONAL STATE:
- Mood score: {mood:.2f} (negative scale)
- Dominant emotions: {emotions}

YOUR TASK: Transform this difficult moment into an "Affirmation Weaving" - a poetic mantra that:
1. VALIDATES the pain/struggle (no toxic positivity)
2. REFRAMES it through a growth/resilience lens
3. EMPOWERS the user with self-compassion
4. Uses POETIC, MEMORABLE language (like spoken word poetry)

STYLE GUIDELINES:
- 2-4 short stanzas (total 60-120 words)
- Use metaphors from nature, alchemy, or weaving
- Rhythm that feels like a gentle chant or affirmation
- Address the user as "you" or "I" (alternating)
- Balance acknowledgment of pain with gentle hope

EXAMPLES OF TONE:
❌ BAD: "Everything happens for a reason! Be positive!"
✅ GOOD: "I name this feeling. I let it breathe. Even in darkness, I am weaving light."

❌ BAD: "Just think happy thoughts!"
✅ GOOD: "This ache is not failure—it's the garden composting last season's growth. I trust the transformation I cannot yet see."

FORMAT AS JSON:
{{
  "title": "2-4 word poetic title (e.g., 'Weaving Through Storms')",
  "affirmation": "The full mantra/poem (60-120 words, in 2-4 stanzas)",
  "mantra_line": "One powerful sentence to repeat (10-15 words max)",
  "emotional_acknowledgment": "1 sentence validating their struggle",
  "garden_metaphor": "What this difficult moment is creating in their garden (1-2 sentences)",
  "voice_guidance": "Suggested tone for voice reading: 'gentle', 'grounding', 'empowering', or 'soothing'"
}}

Remember: This is not about denying pain. It's about honoring it while offering a thread of resilience to hold onto."""
    
    try:
        response = model.generate_content(prompt)
        
        # Parse response
        import json
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        affirmation_data = json.loads(response_text)
        
        return {
            "success": True,
            "affirmation": affirmation_data,
            "original_echo": echo_data,
            "created_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        # Fallback affirmation
        return {
            "success": False,
            "affirmation": {
                "title": "The Tender Alchemy",
                "affirmation": """I see you, heavy feeling.
You are not my enemy—
you are information,
a messenger from the parts of me
that need listening.

I do not have to transform you right now.
I do not have to fix or force or flee.
I can simply say:
"I am here. I am feeling this.
And I am still whole."

Even in this difficulty,
I am weaving resilience
with each breath I choose to take.""",
                "mantra_line": "I honor what I feel, and I am still whole.",
                "emotional_acknowledgment": f"What you're experiencing with {emotions} is real and valid.",
                "garden_metaphor": "This difficult emotion is like compost in your garden—transforming what feels broken into nutrients for future growth.",
                "voice_guidance": "gentle"
            },
            "original_echo": echo_data,
            "created_at": datetime.utcnow().isoformat(),
            "error": str(e)
        }


@router.post("/affirmation")
async def create_affirmation(
    request: AffirmationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate an Affirmation Weaving from a negative/difficult echo.
    Auto-triggered by frontend when user plants an echo with mood_score < -0.2
    """
    try:
        # Fetch user profile
        profile_result = db.execute(
            select(UserProfile).where(UserProfile.user_id == request.user_id)
        )
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Prepare echo data
        echo_data = {
            "content": request.echo_content,
            "mood_score": request.mood_score,
            "emotions": request.emotion_tags,
            "echo_id": request.echo_id
        }
        
        # Generate affirmation
        affirmation_response = await generate_affirmation(echo_data, profile)
        
        # TODO: Store affirmation in user profile's affirmations JSON column
        # This would require a database migration to add the column
        
        return affirmation_response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Affirmation creation failed: {str(e)}")


@router.get("/affirmations/{user_id}")
async def get_affirmation_vault(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get user's Weave Vault - collection of saved affirmations.
    Future feature: Will retrieve from database storage.
    """
    # TODO: Implement database storage for affirmations
    # For now, return placeholder
    
    return {
        "message": "Weave Vault coming soon",
        "description": "Your affirmations will be saved here for revisiting during difficult times",
        "future_feature": "Database storage for persistent affirmation library"
    }


@router.get("/check-for-affirmation/{user_id}")
async def check_if_needs_affirmation(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Check if the user's most recent echo qualifies for an affirmation weaving.
    Used by frontend to auto-trigger affirmation modal.
    """
    try:
        # Get most recent echo
        result = db.execute(
            select(Echo)
            .where(Echo.user_id == user_id)
            .order_by(desc(Echo.created_at))
            .limit(1)
        )
        echo = result.scalar_one_or_none()
        
        if not echo:
            return {
                "needs_affirmation": False,
                "message": "No echoes yet"
            }
        
        # Trigger affirmation for negative moods (< -0.2)
        needs_affirmation = echo.mood_score < -0.2
        
        return {
            "needs_affirmation": needs_affirmation,
            "echo_id": echo.id,
            "mood_score": echo.mood_score,
            "emotion_tags": echo.emotion_tags,
            "message": "This moment deserves gentle support" if needs_affirmation else "No affirmation needed right now"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Check failed: {str(e)}")
