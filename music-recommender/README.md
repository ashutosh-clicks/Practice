# MusicMind 🎵

A full-stack **Hybrid Music Recommendation System** built as an ML portfolio project.

## Architecture

```
hybrid_score = α × content_sim + β × collaborative_sim + γ × popularity + δ × context_alignment
```

| Signal | Source | Method |
|--------|--------|--------|
| **Content-Based** | Spotify (~114K tracks) | K-Means clustering + Cosine similarity on audio features |
| **Collaborative** | Last.fm HetRec 2011 | Item-based CF on 92K user-artist scrobbles |
| **Context-Aware** | Activity profiles | Cosine similarity to mood/activity feature vectors |
| **Popularity** | Spotify | Play-count normalised boost |

## Quick Start

### 1. Download Datasets

**Spotify Tracks Dataset** (Kaggle):
```bash
pip install kaggle
kaggle datasets download maharshipandya/-spotify-tracks-dataset
# Unzip → rename to dataset.csv → move to backend/data/spotify/
```

**Last.fm HetRec 2011** (free, no account needed):
- Download from: https://grouplens.org/datasets/hetrec-2011/
- Extract `hetrec2011-lastfm-2k.zip`
- Copy `artists.dat` and `user_artists.dat` → `backend/data/lastfm/`

### 2. Set Up Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python initialize.py           # train & save models (~5-10 min)
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

## Project Structure

```
music-recommender/
├── backend/
│   ├── context_engine.py      # Mood & activity profiles (Russell's Circumplex Model)
│   ├── recommender.py         # Core hybrid ML engine
│   ├── main.py                # FastAPI REST API
│   ├── initialize.py          # One-time model training script
│   ├── models/                # Saved K-Means + scalers (auto-generated)
│   ├── data/
│   │   ├── spotify/           # Place dataset.csv here
│   │   └── lastfm/            # Place artists.dat + user_artists.dat here
│   └── notebooks/
│       ├── 01_EDA_spotify.py  # Spotify EDA (distributions, heatmaps, mood map)
│       ├── 02_EDA_lastfm.py   # Last.fm EDA (play counts, sparsity)
│       ├── 03_clustering.py   # K-Means: elbow method, silhouette, PCA viz
│       └── 04_collaborative_filtering.py  # Item-based CF analysis
└── frontend/
    ├── app/                   # Next.js App Router
    ├── components/
    │   ├── SearchBar          # Fuzzy track search
    │   ├── SongCard           # Track card with radar chart + badges
    │   ├── RecommendationGrid # 10-track animated grid with skeletons
    │   ├── ContextPanel       # Activity selector + mood quadrant + sliders
    │   └── FeatureRadarChart  # Recharts radar of audio features
    ├── lib/api.ts             # Typed FastAPI client
    └── types/index.ts         # Shared TypeScript interfaces
```

## ML Concepts Demonstrated

- K-Means clustering with Elbow method & Silhouette score selection
- Cosine similarity for content-based ranking
- Sparse matrix construction with scipy.sparse
- TF-IDF / log-normalisation for play count bias reduction
- Item-based collaborative filtering (on-demand computation)
- Hybrid score fusion with tunable weights
- Russell's Circumplex Model for mood classification
- Activity-profile cosine similarity for context alignment
- Cold-start handling (falls back to content-only when CF has no signal)
