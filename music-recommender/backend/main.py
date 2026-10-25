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
from lastfm_user import LastFmUserService


# ── Singleton instances ───────────────────────────────────────
recommender = MusicRecommender(model_dir="models")
lastfm_user_service = LastFmUserService(recommender=recommender)


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
    search_by: str = Query("all", description="Scope: all | track | artist"),
    n: int = Query(10, ge=1, le=30),
):
    """Search tracks by name, artist, or both."""
    if not recommender.is_fitted:
        raise HTTPException(status_code=503, detail="Models not loaded. Run initialize.py first.")
    try:
        results = recommender.search(query, search_by=search_by, n=n)
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


@app.get("/random")
def get_random_tracks(n: int = Query(5, ge=1, le=20)):
    """Return random popular tracks for the surprise me feature."""
    if not recommender.is_fitted:
        raise HTTPException(status_code=503, detail="Models not loaded.")
    return {"tracks": recommender.get_random_tracks(n=n)}


@app.get("/stats")
def get_model_stats():
    """Return ML model architecture metrics and dataset statistics."""
    if not recommender.is_fitted:
        raise HTTPException(status_code=503, detail="Models not loaded.")
    return recommender.get_stats()


class ImportArtRequest(BaseModel):
    api_key: Optional[str] = None
    limit: int = Field(50, ge=5, le=500)


@app.get("/album-art")
def get_album_art(
    track_id: str = Query(..., description="Track ID"),
    artist: str = Query(..., description="Artist name"),
    track: str = Query(..., description="Track name"),
    album: Optional[str] = Query(None, description="Album name"),
    lastfm_key: Optional[str] = Query(None, description="Last.fm API key"),
):
    """Retrieve high-res album art for a track from Last.fm or fallback."""
    url = recommender.album_art.get_art_url(
        track_id=track_id,
        artist=artist,
        track_name=track,
        album_name=album,
        lastfm_key=lastfm_key,
    )
    return {"image_url": url, "track_id": track_id}


@app.post("/import-lastfm-art")
def import_lastfm_art(body: ImportArtRequest):
    """Batch import album art for popular catalog tracks."""
    if recommender.spotify_df is None:
        raise HTTPException(status_code=503, detail="Dataset not loaded.")
    res = recommender.album_art.batch_import_art(
        recommender.spotify_df,
        lastfm_key=body.api_key,
        limit=body.limit,
    )
    return res


@app.get("/album-art/status")
def get_art_status():
    """Return album art cache statistics."""
    cached = len(recommender.album_art.cache) if hasattr(recommender, "album_art") else 0
    total = len(recommender.spotify_df) if recommender.spotify_df is not None else 0
    return {
        "cached_count": cached,
        "total_tracks": total,
        "has_lastfm_key": bool(os.environ.get("LASTFM_API_KEY")),
    }


@app.get("/user-profile")
def get_user_profile(
    username: str = Query(..., min_length=1, description="Last.fm username"),
    period: str = Query("weekly", description="Period: weekly | monthly | yearly"),
    api_key: Optional[str] = Query(None, description="Optional custom Last.fm API key"),
):
    """Retrieve Last.fm profile and listening trends for weekly, monthly, or yearly periods."""
    try:
        data = lastfm_user_service.get_user_profile(username=username, period=period, api_key=api_key)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


