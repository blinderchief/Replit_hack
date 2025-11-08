from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import echo, consent, sessions, sensors, search_seeds, auth, activities, analytics, whisperer, patterns, weave, simulate, soundscape, alchemy
from app.core.config import settings
from app.core.database import create_tables

app = FastAPI(title="EchoBloom Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(echo.router, prefix="/api", tags=["echo"])
app.include_router(consent.router, prefix="/api", tags=["consent"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
app.include_router(sensors.router, prefix="/api", tags=["sensors"])
app.include_router(search_seeds.router, prefix="/api", tags=["search"])
app.include_router(activities.router, tags=["activities"])
app.include_router(analytics.router, tags=["analytics"])
app.include_router(whisperer.router, tags=["whisperer"])
app.include_router(patterns.router, tags=["patterns"])
app.include_router(weave.router, tags=["weave"])
app.include_router(simulate.router, tags=["simulate"])
app.include_router(soundscape.router, tags=["soundscape"])
app.include_router(alchemy.router, tags=["alchemy"])

@app.on_event("startup")
async def startup_event():
    await create_tables()

@app.get("/")
async def root():
    return {"message": "Welcome to EchoBloom API"}