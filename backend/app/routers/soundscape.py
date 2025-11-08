from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from datetime import datetime, timedelta
import google.generativeai as genai
import json

from app.core.database import get_db
from app.models.echo import Echo

router = APIRouter(prefix="/api/soundscape")

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class SoundscapeRequest(BaseModel):
    user_id: str
    include_recent_echoes: int = 5  # How many recent echoes to analyze


def analyze_garden_mood(echoes: List[Dict], plants_by_type: Dict) -> Dict[str, Any]:
    """
    Analyzes the overall mood and composition of the user's garden.
    Returns metrics used for soundscape generation.
    """
    if not echoes:
        return {
            "overall_mood": 0.0,
            "mood_variance": 0.0,
            "dominant_emotions": [],
            "garden_density": 0,
            "plant_diversity": 0,
            "emotional_intensity": 0.0
        }
    
    # Calculate mood metrics
    mood_scores = [echo.get("mood_score", 0) for echo in echoes]
    avg_mood = sum(mood_scores) / len(mood_scores) if mood_scores else 0
    
    # Calculate variance (emotional stability indicator)
    if len(mood_scores) > 1:
        mood_variance = sum((m - avg_mood) ** 2 for m in mood_scores) / len(mood_scores)
    else:
        mood_variance = 0
    
    # Extract and count emotions
    emotion_counts = {}
    for echo in echoes:
        for emotion in echo.get("emotion_tags", []):
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Sort by frequency
    dominant_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    dominant_emotions = [emotion for emotion, _ in dominant_emotions]
    
    # Calculate garden composition
    total_plants = sum(plants_by_type.values())
    plant_diversity = len(plants_by_type)
    
    # Emotional intensity (based on absolute mood values)
    emotional_intensity = sum(abs(m) for m in mood_scores) / len(mood_scores) if mood_scores else 0
    
    return {
        "overall_mood": round(avg_mood, 2),
        "mood_variance": round(mood_variance, 3),
        "dominant_emotions": dominant_emotions,
        "garden_density": total_plants,
        "plant_diversity": plant_diversity,
        "emotional_intensity": round(emotional_intensity, 2)
    }


def generate_audio_layers_with_gemini(garden_state: Dict) -> Dict[str, Any]:
    """
    Uses Gemini to map garden mood to Web Audio API parameters.
    Returns configuration for oscillators, frequencies, and effects.
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""You are a therapeutic soundscape designer specializing in procedural audio generation.

Based on this user's wellness garden state, generate Web Audio API parameters for a soothing ambient soundscape:

Garden Metrics:
- Overall Mood: {garden_state['overall_mood']} (-1.0 to 1.0, where -1 is low, 1 is elevated)
- Mood Variance: {garden_state['mood_variance']} (emotional stability, lower = more stable)
- Dominant Emotions: {', '.join(garden_state['dominant_emotions'])}
- Garden Density: {garden_state['garden_density']} plants
- Plant Diversity: {garden_state['plant_diversity']} types
- Emotional Intensity: {garden_state['emotional_intensity']}

Design Philosophy:
- Low mood (-1.0 to -0.3): Grounding, slower tempos, warm bass drones, gentle nature sounds
- Neutral mood (-0.3 to 0.3): Balanced, soft pads, ambient textures, meditative tones
- Elevated mood (0.3 to 1.0): Uplifting, brighter harmonics, crystalline tones, birdsong

- High variance: More dynamic modulation, varied rhythms
- Low variance: Steady drones, consistent textures

Generate a JSON object with these Web Audio API parameters:

{{
  "base_drone": {{
    "frequency": <number 40-200 Hz, lower for low mood>,
    "type": "<sine|triangle|sawtooth, sine for calm>",
    "gain": <number 0.1-0.3>,
    "detune": <number -10 to 10>
  }},
  "harmonic_pad": {{
    "frequency": <number 200-600 Hz, higher for elevated mood>,
    "type": "<sine|triangle>",
    "gain": <number 0.05-0.2>,
    "detune": <number -5 to 5>
  }},
  "high_shimmer": {{
    "frequency": <number 800-2000 Hz, crystalline tones for positive mood>,
    "type": "sine",
    "gain": <number 0.02-0.1>,
    "detune": <number -3 to 3>,
    "enabled": <boolean, true if mood > 0.2>
  }},
  "rhythm_pulse": {{
    "frequency": <number 1-3 Hz for LFO modulation>,
    "depth": <number 0.1-0.5, higher for high variance>,
    "enabled": <boolean, true if variance > 0.2>
  }},
  "filter": {{
    "type": "lowpass",
    "frequency": <number 500-3000 Hz, higher = brighter>,
    "q": <number 0.5-2.0>
  }},
  "reverb": {{
    "wetness": <number 0.2-0.6, higher for spacious feel>,
    "decay": <number 2-8 seconds>
  }},
  "nature_sounds": [
    {{
      "type": "<rain|wind|birds|stream|forest>",
      "volume": <number 0.1-0.4>,
      "reason": "<Why this sound fits the mood>"
    }}
  ],
  "emotional_tone": "<1-2 words describing the soundscape>",
  "therapeutic_intent": "<1 sentence explaining the healing purpose>"
}}

Important:
- Ensure all frequencies are physiologically calming (avoid dissonance)
- Lower frequencies for grounding, higher for uplift
- Return ONLY valid JSON, no markdown, no explanation."""

        response = model.generate_content(prompt)
        audio_config = json.loads(response.text.strip())
        
        return audio_config
        
    except Exception as e:
        print(f"Gemini audio generation failed: {e}")
        # Fallback: neutral calming soundscape
        return generate_fallback_soundscape(garden_state["overall_mood"])


def generate_fallback_soundscape(mood: float) -> Dict[str, Any]:
    """
    Generates a safe default soundscape based on mood.
    """
    if mood < -0.3:
        # Grounding soundscape for low mood
        return {
            "base_drone": {
                "frequency": 80,
                "type": "sine",
                "gain": 0.25,
                "detune": 0
            },
            "harmonic_pad": {
                "frequency": 240,
                "type": "triangle",
                "gain": 0.12,
                "detune": -3
            },
            "high_shimmer": {
                "frequency": 0,
                "type": "sine",
                "gain": 0,
                "detune": 0,
                "enabled": False
            },
            "rhythm_pulse": {
                "frequency": 0,
                "depth": 0,
                "enabled": False
            },
            "filter": {
                "type": "lowpass",
                "frequency": 800,
                "q": 1.0
            },
            "reverb": {
                "wetness": 0.4,
                "decay": 5
            },
            "nature_sounds": [
                {
                    "type": "rain",
                    "volume": 0.25,
                    "reason": "Grounding and comforting for difficult moments"
                }
            ],
            "emotional_tone": "Grounding embrace",
            "therapeutic_intent": "This soundscape offers a warm sonic anchor to help you feel held and safe."
        }
    elif mood > 0.3:
        # Uplifting soundscape for elevated mood
        return {
            "base_drone": {
                "frequency": 120,
                "type": "sine",
                "gain": 0.2,
                "detune": 2
            },
            "harmonic_pad": {
                "frequency": 480,
                "type": "sine",
                "gain": 0.15,
                "detune": 3
            },
            "high_shimmer": {
                "frequency": 1200,
                "type": "sine",
                "gain": 0.08,
                "detune": 0,
                "enabled": True
            },
            "rhythm_pulse": {
                "frequency": 2,
                "depth": 0.3,
                "enabled": True
            },
            "filter": {
                "type": "lowpass",
                "frequency": 2400,
                "q": 0.8
            },
            "reverb": {
                "wetness": 0.5,
                "decay": 6
            },
            "nature_sounds": [
                {
                    "type": "birds",
                    "volume": 0.3,
                    "reason": "Celebrating your positive energy with uplifting birdsong"
                }
            ],
            "emotional_tone": "Luminous flow",
            "therapeutic_intent": "This soundscape mirrors and amplifies your elevated state with bright, crystalline tones."
        }
    else:
        # Balanced neutral soundscape
        return {
            "base_drone": {
                "frequency": 100,
                "type": "sine",
                "gain": 0.22,
                "detune": 0
            },
            "harmonic_pad": {
                "frequency": 360,
                "type": "triangle",
                "gain": 0.13,
                "detune": 0
            },
            "high_shimmer": {
                "frequency": 900,
                "type": "sine",
                "gain": 0.05,
                "detune": 0,
                "enabled": True
            },
            "rhythm_pulse": {
                "frequency": 1.5,
                "depth": 0.2,
                "enabled": False
            },
            "filter": {
                "type": "lowpass",
                "frequency": 1500,
                "q": 1.0
            },
            "reverb": {
                "wetness": 0.45,
                "decay": 4
            },
            "nature_sounds": [
                {
                    "type": "stream",
                    "volume": 0.2,
                    "reason": "Gentle flow to maintain your equilibrium"
                }
            ],
            "emotional_tone": "Calm presence",
            "therapeutic_intent": "This soundscape supports your balanced state with gentle, meditative textures."
        }


@router.post("/generate")
async def generate_soundscape(request: SoundscapeRequest):
    """
    Generates a therapeutic soundscape based on the user's garden state.
    
    Returns Web Audio API parameters for real-time synthesis in the browser.
    """
    from app.core.database import get_db_connection
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch recent echoes
        cursor.execute("""
            SELECT id, content, mood_score, emotion_tags, seed_type, created_at
            FROM echoes
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (request.user_id, request.include_recent_echoes))
        
        echo_rows = cursor.fetchall()
        echoes = [
            {
                "id": row[0],
                "content": row[1],
                "mood_score": row[2],
                "emotion_tags": json.loads(row[3]) if row[3] else [],
                "seed_type": row[4],
                "created_at": row[5]
            }
            for row in echo_rows
        ]
        
        if not echoes:
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="No echoes found. Plant your first echo to generate a soundscape."
            )
        
        # Count plants by type
        cursor.execute("""
            SELECT seed_type, COUNT(*) as count
            FROM echoes
            WHERE user_id = ?
            GROUP BY seed_type
        """, (request.user_id,))
        
        plants_by_type = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        # Analyze garden mood
        garden_state = analyze_garden_mood(echoes, plants_by_type)
        
        # Generate audio configuration with Gemini
        audio_config = generate_audio_layers_with_gemini(garden_state)
        
        return {
            "success": True,
            "audio_config": audio_config,
            "garden_state": garden_state,
            "timestamp": datetime.now().isoformat(),
            "message": f"Generated {audio_config.get('emotional_tone', 'therapeutic')} soundscape based on {len(echoes)} recent reflections"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating soundscape: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate soundscape: {str(e)}")


@router.get("/presets")
async def get_soundscape_presets():
    """
    Returns pre-designed soundscape presets for users to explore.
    """
    presets = [
        {
            "name": "Grounding Rain",
            "description": "Deep bass drones with gentle rain - for centering and stability",
            "mood_range": [-1.0, -0.3],
            "preview": {
                "base_drone": {"frequency": 80, "type": "sine", "gain": 0.25},
                "nature_sounds": [{"type": "rain", "volume": 0.3}]
            }
        },
        {
            "name": "Forest Meditation",
            "description": "Balanced pads with forest ambience - for contemplation",
            "mood_range": [-0.3, 0.3],
            "preview": {
                "base_drone": {"frequency": 100, "type": "sine", "gain": 0.22},
                "nature_sounds": [{"type": "forest", "volume": 0.25}]
            }
        },
        {
            "name": "Crystal Dawn",
            "description": "Bright harmonics with birdsong - for elevated energy",
            "mood_range": [0.3, 1.0],
            "preview": {
                "harmonic_pad": {"frequency": 480, "type": "sine", "gain": 0.15},
                "high_shimmer": {"frequency": 1200, "type": "sine", "gain": 0.08, "enabled": True},
                "nature_sounds": [{"type": "birds", "volume": 0.3}]
            }
        },
        {
            "name": "Ocean Breath",
            "description": "Slow wave-like modulation - for breathwork and relaxation",
            "mood_range": [-0.5, 0.5],
            "preview": {
                "base_drone": {"frequency": 90, "type": "sine", "gain": 0.23},
                "rhythm_pulse": {"frequency": 0.3, "depth": 0.4, "enabled": True},
                "nature_sounds": [{"type": "stream", "volume": 0.25}]
            }
        }
    ]
    
    return {
        "presets": presets,
        "total": len(presets),
        "message": "Explore these curated soundscapes designed for different emotional states"
    }


@router.get("/current-mood/{user_id}")
async def get_current_mood_for_sound(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Quick endpoint to get the user's current mood for immediate soundscape generation.
    Used by the frontend to show a "Play My Garden Sound" button.
    """
    try:
        # Get most recent echo
        result = await db.execute(
            select(Echo)
            .where(Echo.user_id == user_id)
            .order_by(desc(Echo.created_at))
            .limit(1)
        )
        echo = result.scalar_one_or_none()
        
        if not echo:
            return {
                "has_data": False,
                "message": "No echoes yet - plant your first reflection to unlock soundscapes"
            }
        
        mood_score = echo.mood_score
        emotions = echo.emotion_tags if echo.emotion_tags else []
        
        # Determine soundscape style
        if mood_score < -0.3:
            style = "Grounding & Warm"
            suggestion = "Your garden calls for deep, anchoring tones"
        elif mood_score > 0.3:
            style = "Bright & Uplifting"
            suggestion = "Your garden radiates with crystalline energy"
        else:
            style = "Balanced & Meditative"
            suggestion = "Your garden hums with calm equilibrium"
        
        return {
            "has_data": True,
            "current_mood": round(mood_score, 2),
            "dominant_emotion": emotions[0] if emotions else "neutral",
            "soundscape_style": style,
            "suggestion": suggestion
        }
        
    except Exception as e:
        print(f"Error fetching mood for sound: {e}")
        raise HTTPException(status_code=500, detail=str(e))
