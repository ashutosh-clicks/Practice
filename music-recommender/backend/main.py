"""
FastAPI application — Music Recommendation System API.
Serves content-based, collaborative, and context-aware recommendations.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from recommender import MusicRecommender


# ── Singleton recommender instance ──────────────────────────
recommender = MusicRecommender(model_dir="models")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load trained models on startup."""
    model_path = "models/kmeans.pkl"
    if os.path.exists(model_path):
        print("Loading pre-trained models...")
        recommender.load()
    else:
        print(
            "\n⚠️  No trained models found.\n"
            "   Run  python initialize.py  first to train and save models.\n"
        )
    yield


app = FastAPI(
    title="MusicMind API",
    description="Hybrid music recommendation: content-based (Spotify) + collaborative (Last.fm) + context-aware",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ───────────────────────────────
class RecommendRequest(BaseModel):
    track_id: str = Field(..., description="Seed track ID")
    mood: Optional[str] = Field(None, description="Mood key: happy | calm | sad | intense | neutral")
    activity: Optional[str] = Field(None, description="Activity key: focus | study | workout | sleep | party | meditation | commute | creative")
    alpha: float = Field(0.40, ge=0.0, le=1.0, description="Content-based weight")
    beta: float = Field(0.30, ge=0.0, le=1.0, description="Collaborative filtering weight")
    gamma: float = Field(0.10, ge=0.0, le=1.0, description="Popularity weight")
    delta: float = Field(0.20, ge=0.0, le=1.0, description="Context-alignment weight")
    n: int = Field(10, ge=1, le=50, description="Number of recommendations")


class ExplainRequest(BaseModel):
    seed_track_id: str
    rec_track_id: str
    mood: Optional[str] = None
    activity: Optional[str] = None


# ── Endpoints ────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": recommender.is_fitted,
        "tracks_loaded": len(recommender.spotify_df) if recommender.spotify_df is not None else 0,
    }


@app.get("/search")
def search_tracks(
    query: str = Query(..., min_length=1, description="Search query (track name or artist)"),
    n: int = Query(10, ge=1, le=30),
):
    """Fuzzy search for tracks by name or artist."""
    if not recommender.is_fitted:
        raise HTTPException(status_code=503, detail="Models not loaded. Run initialize.py first.")
    try:
        results = recommender.search(query, n=n)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend")
def get_recommendations(body: RecommendRequest):
    """Generate hybrid recommendations for a seed track."""
    if not recommender.is_fitted:
        raise HTTPException(status_code=503, detail="Models not loaded. Run initialize.py first.")
    try:
        results = recommender.recommend(
            track_id=body.track_id,
            mood=body.mood,
            activity=body.activity,
            alpha=body.alpha,
            beta=body.beta,
            gamma=body.gamma,
            delta=body.delta,
            n=body.n,
        )
        return {"recommendations": results, "count": len(results)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain")
def explain_recommendation(body: ExplainRequest):
    """Explain why a track was recommended for a given seed."""
    if not recommender.is_fitted:
        raise HTTPException(status_code=503, detail="Models not loaded. Run initialize.py first.")
    try:
        result = recommender.explain(
            seed_track_id=body.seed_track_id,
            rec_track_id=body.rec_track_id,
            mood=body.mood,
            activity=body.activity,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/activities")
def list_activities():
    """Return all available activity profiles."""
    return {"activities": recommender.get_activities()}


@app.get("/moods")
def list_moods():
    """Return all mood quadrant definitions."""
    return {"moods": recommender.get_moods()}
