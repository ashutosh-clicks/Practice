"""
Core Music Recommendation Engine
Hybrid system: K-Means content-based (Spotify) + Item-based CF (Last.fm) + Context-aware (mood/activity).
"""
from __future__ import annotations

import os
import pickle
import warnings
from typing import Optional

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from thefuzz import process as fuzzy_process

from context_engine import ACTIVITY_PROFILES, ContextEngine, MOOD_BY_KEY

warnings.filterwarnings("ignore")

# ── Feature columns used for K-Means and context alignment ──
FEATURE_COLS = [
    "danceability", "energy", "loudness_norm", "speechiness",
    "acousticness", "instrumentalness", "liveness", "valence", "tempo_norm",
]

N_CLUSTERS = 60  # Tunable via elbow analysis in notebooks


class MusicRecommender:
    """
    Hybrid music recommendation engine.

    Recommendation signal sources:
        1. Content-based   — K-Means clustering + cosine similarity on Spotify audio features
        2. Collaborative   — Item-based CF using Last.fm user-artist listening history
        3. Context-aware   — Activity/mood profile alignment
        4. Popularity      — Spotify popularity score boost
    """

    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir

        # Spotify / content layer
        self.spotify_df: Optional[pd.DataFrame] = None
        self.feature_matrix: Optional[np.ndarray] = None   # (N, 9) scaled features
        self.kmeans: Optional[KMeans] = None
        self.scaler: Optional[StandardScaler] = None
        self.loudness_scaler: Optional[MinMaxScaler] = None
        self.tempo_scaler: Optional[MinMaxScaler] = None

        # Last.fm / collaborative layer
        self.artists_df: Optional[pd.DataFrame] = None
        self.artist_matrix: Optional[csr_matrix] = None    # (n_artists, n_users)
        self.code_to_artist_name: dict[int, str] = {}
        self.artist_name_to_code: dict[str, int] = {}

        # Context engine
        self.context_engine = ContextEngine()
        self.is_fitted = False

    # ─────────────────────────────────────────────────────────
    # Data Loading
    # ─────────────────────────────────────────────────────────

    def load_data(
        self,
        spotify_path: str,
        lastfm_artists_path: str,
        lastfm_user_artists_path: str,
    ) -> None:
        """Load and preprocess both datasets."""
        print("Loading Spotify dataset...")
        self.spotify_df = pd.read_csv(spotify_path)
        self._preprocess_spotify()

        print("Loading Last.fm dataset...")
        self._load_lastfm(lastfm_artists_path, lastfm_user_artists_path)
        print("Both datasets loaded successfully.\n")

    def _preprocess_spotify(self) -> None:
        df = self.spotify_df.copy()

        # Normalize column names for different dataset versions
        df.columns = df.columns.str.lower().str.strip()
        if "id" in df.columns and "track_id" not in df.columns:
            df.rename(columns={"id": "track_id"}, inplace=True)

        # Required feature columns
        raw_feature_cols = [
            "danceability", "energy", "loudness", "speechiness",
            "acousticness", "instrumentalness", "liveness", "valence", "tempo",
        ]
        df = df.dropna(subset=raw_feature_cols)
        df = df.drop_duplicates(subset=["track_name", "artists"]).reset_index(drop=True)

        # Normalize loudness (-60 to 0 dB → [0, 1])
        self.loudness_scaler = MinMaxScaler()
        df["loudness_norm"] = self.loudness_scaler.fit_transform(df[["loudness"]])

        # Normalize tempo (0–250 BPM → [0, 1])
        self.tempo_scaler = MinMaxScaler()
        df["tempo_norm"] = self.tempo_scaler.fit_transform(df[["tempo"]])

        # Classify each track's mood quadrant
        df["mood"] = df.apply(
            lambda r: self.context_engine.classify_mood(r["valence"], r["energy"]).name,
            axis=1,
        )
        df["mood_key"] = df.apply(
            lambda r: self.context_engine.classify_mood(r["valence"], r["energy"]).key,
            axis=1,
        )
        df["mood_emoji"] = df.apply(
            lambda r: self.context_engine.classify_mood(r["valence"], r["energy"]).emoji,
            axis=1,
        )

        # Lower-cased artist name for fuzzy matching bridge to Last.fm
        df["artists_lower"] = df["artists"].str.lower().str.strip()

        self.spotify_df = df.reset_index(drop=True)
        print(f"  Spotify: {len(df):,} unique tracks across {df['track_genre'].nunique() if 'track_genre' in df.columns else '?'} genres.")

    def _load_lastfm(self, artists_path: str, user_artists_path: str) -> None:
        # Load artist catalog
        artists_df = pd.read_csv(artists_path, sep="\t", encoding="utf-8", on_bad_lines="skip")
        artists_df.columns = artists_df.columns.str.lower()
        if "id" in artists_df.columns:
            artists_df.rename(columns={"id": "artist_id"}, inplace=True)
        artists_df["name_lower"] = artists_df["name"].str.lower().str.strip()
        artists_df = artists_df.dropna(subset=["name_lower"]).reset_index(drop=True)

        # Load user-artist listening records
        ua_df = pd.read_csv(user_artists_path, sep="\t", encoding="utf-8", on_bad_lines="skip")
        ua_df.columns = ua_df.columns.str.lower()
        # Expected columns: userid, artistid, weight

        # Build categorical codes for sparse matrix construction
        user_cat = ua_df["userid"].astype("category")
        artist_cat = ua_df["artistid"].astype("category")

        # Log-normalize play counts to reduce super-listener dominance
        weights = np.log1p(ua_df["weight"].values.astype(float))

        # Sparse matrix: rows = artists, cols = users  (artists x users)
        artist_user_matrix = csr_matrix(
            (weights, (artist_cat.cat.codes.values, user_cat.cat.codes.values)),
            shape=(artist_cat.nunique(), user_cat.nunique()),
        )
        self.artist_matrix = artist_user_matrix

        # Build code ↔ artist_id mappings
        code_to_artist_id = dict(enumerate(artist_cat.cat.categories))
        artist_id_to_code = {v: k for k, v in code_to_artist_id.items()}

        # Map artist codes → lowercase names for fast lookup
        artists_df["code"] = artists_df["artist_id"].map(artist_id_to_code)
        artists_df = artists_df.dropna(subset=["code"]).copy()
        artists_df["code"] = artists_df["code"].astype(int)

        self.artists_df = artists_df
        self.code_to_artist_name = {int(r["code"]): r["name_lower"] for _, r in artists_df.iterrows()}
        self.artist_name_to_code = {v: k for k, v in self.code_to_artist_name.items()}

        print(
            f"  Last.fm: {user_cat.nunique():,} users · {artist_cat.nunique():,} artists · "
            f"{len(ua_df):,} listening records."
        )

    # ─────────────────────────────────────────────────────────
    # Training
    # ─────────────────────────────────────────────────────────

    def fit(self, n_clusters: int = N_CLUSTERS) -> None:
        """Train K-Means on the Spotify feature matrix."""
        if self.spotify_df is None:
            raise RuntimeError("Call load_data() before fit().")

        print(f"Training K-Means (k={n_clusters})...")
        raw = self.spotify_df[FEATURE_COLS].values
        self.scaler = StandardScaler()
        self.feature_matrix = self.scaler.fit_transform(raw)

        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
        cluster_labels = self.kmeans.fit_predict(self.feature_matrix)
        self.spotify_df["cluster"] = cluster_labels

        counts = np.bincount(cluster_labels)
        print(
            f"  Done. Cluster sizes: min={counts.min()} · max={counts.max()} · mean={counts.mean():.0f}"
        )
        self.is_fitted = True

    # ─────────────────────────────────────────────────────────
    # Persistence
    # ─────────────────────────────────────────────────────────

    def save(self) -> None:
        """Persist trained models and processed data to disk."""
        os.makedirs(self.model_dir, exist_ok=True)
        with open(f"{self.model_dir}/kmeans.pkl", "wb") as f:
            pickle.dump(self.kmeans, f)
        with open(f"{self.model_dir}/scaler.pkl", "wb") as f:
            pickle.dump(self.scaler, f)
        with open(f"{self.model_dir}/norm_scalers.pkl", "wb") as f:
            pickle.dump({"loudness": self.loudness_scaler, "tempo": self.tempo_scaler}, f)
        with open(f"{self.model_dir}/artist_matrix.pkl", "wb") as f:
            pickle.dump(self.artist_matrix, f)
        with open(f"{self.model_dir}/artist_mappings.pkl", "wb") as f:
            pickle.dump(
                {"code_to_name": self.code_to_artist_name, "name_to_code": self.artist_name_to_code},
                f,
            )
        self.spotify_df.to_parquet(f"{self.model_dir}/spotify_processed.parquet", index=False)
        if self.artists_df is not None:
            self.artists_df.to_parquet(f"{self.model_dir}/lastfm_artists.parquet", index=False)
        print(f"Models saved to {self.model_dir}/")

    def load(self) -> None:
        """Load pre-trained models from disk."""
        with open(f"{self.model_dir}/kmeans.pkl", "rb") as f:
            self.kmeans = pickle.load(f)
        with open(f"{self.model_dir}/scaler.pkl", "rb") as f:
            self.scaler = pickle.load(f)
        with open(f"{self.model_dir}/norm_scalers.pkl", "rb") as f:
            ns = pickle.load(f)
            self.loudness_scaler = ns["loudness"]
            self.tempo_scaler = ns["tempo"]
        with open(f"{self.model_dir}/artist_matrix.pkl", "rb") as f:
            self.artist_matrix = pickle.load(f)
        with open(f"{self.model_dir}/artist_mappings.pkl", "rb") as f:
            mp = pickle.load(f)
            self.code_to_artist_name = mp["code_to_name"]
            self.artist_name_to_code = mp["name_to_code"]

        self.spotify_df = pd.read_parquet(f"{self.model_dir}/spotify_processed.parquet")
        artists_path = f"{self.model_dir}/lastfm_artists.parquet"
        if os.path.exists(artists_path):
            self.artists_df = pd.read_parquet(artists_path)

        # Reconstruct feature matrix (not stored — fast to recompute)
        self.feature_matrix = self.scaler.transform(self.spotify_df[FEATURE_COLS].values)
        self.is_fitted = True
        print(f"Models loaded. {len(self.spotify_df):,} tracks ready.")

    # ─────────────────────────────────────────────────────────
    # Search
    # ─────────────────────────────────────────────────────────

    def search(self, query: str, n: int = 10) -> list[dict]:
        """Fuzzy search tracks by name or artist."""
        combined = (self.spotify_df["track_name"] + " - " + self.spotify_df["artists"]).str.lower()
        matches = fuzzy_process.extract(query.lower().strip(), combined.tolist(), limit=n * 4)

        results = []
        seen_ids: set[str] = set()
        for _, score, idx in matches:
            if score < 40:
                continue
            row = self.spotify_df.iloc[idx]
            tid = str(row.get("track_id", idx))
            if tid in seen_ids:
                continue
            seen_ids.add(tid)
            results.append(self._row_to_dict(row))
            if len(results) >= n:
                break
        return results

    # ─────────────────────────────────────────────────────────
    # Recommendation
    # ─────────────────────────────────────────────────────────

    def recommend(
        self,
        track_id: str,
        mood: Optional[str] = None,
        activity: Optional[str] = None,
        alpha: float = 0.40,
        beta: float = 0.30,
        gamma: float = 0.10,
        delta: float = 0.20,
        n: int = 10,
    ) -> list[dict]:
        """
        Generate hybrid recommendations for a seed track.

        hybrid_score = α·content + β·collaborative + γ·popularity + δ·context_alignment

        Args:
            track_id : Seed track ID.
            mood     : Mood key ('happy', 'calm', 'sad', 'intense', 'neutral') or None.
            activity : Activity key ('focus', 'workout', …) or None.
            alpha    : Content-based weight.
            beta     : Collaborative filtering weight.
            gamma    : Popularity weight.
            delta    : Context-alignment weight.
            n        : Number of results.
        """
        seed_pos = self._find_track_position(track_id)
        seed_row = self.spotify_df.iloc[seed_pos]
        seed_features = self.feature_matrix[seed_pos]
        seed_cluster = int(seed_row["cluster"])

        # 1. Content scores (all candidates from same cluster + overflow)
        content_scores = self._content_scores(seed_features, seed_cluster, n_candidates=300)

        # 2. Collaborative scores (on-demand, single artist vector query)
        first_artist = str(seed_row["artists_lower"]).split(";")[0].strip()
        collab_artist_map = self._collaborative_artist_scores(first_artist)
        collab_scores = self._map_artist_scores_to_tracks(collab_artist_map)

        # 3. Popularity scores normalised to [0, 1]
        popularity_scores = self.spotify_df["popularity"].values / 100.0

        # 4. Context alignment scores
        if activity or mood:
            context_series = self.context_engine.compute_alignment_scores(
                self.spotify_df, activity, self.loudness_scaler, self.tempo_scaler
            )
            context_scores = context_series.values
        else:
            context_scores = np.zeros(len(self.spotify_df))
            delta = 0.0

        # 5. Build candidate pool: top content + top collab additions
        candidate_positions: list[int] = list(content_scores.keys())
        if collab_artist_map:
            top_collab_pos = sorted(
                range(len(collab_scores)), key=lambda i: collab_scores[i], reverse=True
            )[:150]
            candidate_positions += [p for p in top_collab_pos if p not in set(candidate_positions)]

        # Remove seed itself
        candidate_positions = [p for p in candidate_positions if p != seed_pos]

        # 6. Compute and sort hybrid scores
        scored = []
        for pos in candidate_positions:
            c = content_scores.get(pos, 0.0)
            cf = float(collab_scores[pos])
            pop = float(popularity_scores[pos])
            ctx = float(context_scores[pos])
            total = alpha * c + beta * cf + gamma * pop + delta * ctx
            scored.append((pos, total, c, cf, pop, ctx))

        scored.sort(key=lambda x: x[1], reverse=True)

        # 7. Optional hard mood filter (applied after scoring to keep ordering)
        if mood:
            mood_name = MOOD_BY_KEY.get(mood, None)
            if mood_name:
                filtered = [s for s in scored if self.spotify_df.iloc[s[0]]["mood_key"] == mood]
                if len(filtered) >= n:
                    scored = filtered

        # 8. Assemble results
        results = []
        for pos, total, c, cf, pop, ctx in scored[:n]:
            row = self.spotify_df.iloc[pos]
            rec = self._row_to_dict(row)
            rec["scores"] = {
                "total": round(total, 4),
                "content": round(c, 4),
                "collaborative": round(cf, 4),
                "popularity": round(pop, 4),
                "context": round(ctx, 4),
            }
            rec["badges"] = self._build_badges(c, cf, ctx, pop, mood, activity)
            results.append(rec)

        return results

    def explain(
        self,
        seed_track_id: str,
        rec_track_id: str,
        mood: Optional[str] = None,
        activity: Optional[str] = None,
    ) -> dict:
        """Return a human-readable explanation of why rec_track was recommended."""
        seed_pos = self._find_track_position(seed_track_id)
        rec_pos = self._find_track_position(rec_track_id)
        seed_row = self.spotify_df.iloc[seed_pos]
        rec_row = self.spotify_df.iloc[rec_pos]

        seed_feat = self.feature_matrix[seed_pos]
        rec_feat = self.feature_matrix[rec_pos]
        content_sim = float(cosine_similarity(seed_feat.reshape(1, -1), rec_feat.reshape(1, -1))[0][0])
        same_cluster = int(seed_row["cluster"]) == int(rec_row["cluster"])

        reasons = [f"Audio similarity score: {content_sim:.1%}"]
        if same_cluster:
            reasons.insert(0, f"Both tracks share the same audio cluster (#{int(seed_row['cluster'])})")
        if mood:
            reasons.append(f"Requested mood filter: {MOOD_BY_KEY[mood].name}")
        if activity and activity in ACTIVITY_PROFILES:
            reasons.append(f"Optimised for activity: {ACTIVITY_PROFILES[activity]['name']}")

        compare_features = ["danceability", "energy", "valence", "acousticness", "instrumentalness", "tempo"]
        feature_comparison = {
            feat: {
                "seed": round(float(seed_row[feat]), 3),
                "recommended": round(float(rec_row[feat]), 3),
                "similar": abs(float(seed_row[feat]) - float(rec_row[feat])) < 0.15,
            }
            for feat in compare_features
        }

        return {
            "seed_track": self._row_to_dict(seed_row),
            "recommended_track": self._row_to_dict(rec_row),
            "reasons": reasons,
            "feature_comparison": feature_comparison,
        }

    def get_activities(self) -> list[dict]:
        return self.context_engine.get_activity_list()

    def get_moods(self) -> list[dict]:
        return self.context_engine.get_mood_list()

    # ─────────────────────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────────────────────

    def _find_track_position(self, track_id: str) -> int:
        mask = self.spotify_df["track_id"].astype(str) == str(track_id)
        positions = np.where(mask.values)[0]
        if len(positions) == 0:
            raise ValueError(f"Track not found: {track_id}")
        return int(positions[0])

    def _content_scores(
        self, seed_features: np.ndarray, seed_cluster: int, n_candidates: int = 300
    ) -> dict[int, float]:
        """Return {position: cosine_sim} for up to n_candidates tracks."""
        cluster_pos = np.where(self.spotify_df["cluster"].values == seed_cluster)[0]
        cluster_feats = self.feature_matrix[cluster_pos]
        sims = cosine_similarity(seed_features.reshape(1, -1), cluster_feats)[0]

        # Top N from same cluster
        top_n = min(n_candidates, len(cluster_pos))
        top_idx = np.argpartition(sims, -top_n)[-top_n:]
        scores = {int(cluster_pos[i]): float(sims[i]) for i in top_idx}

        # Overflow: add best 10% from other clusters
        other_pos = np.where(self.spotify_df["cluster"].values != seed_cluster)[0]
        if len(other_pos) > 0:
            other_feats = self.feature_matrix[other_pos]
            other_sims = cosine_similarity(seed_features.reshape(1, -1), other_feats)[0]
            threshold = np.percentile(other_sims, 90)
            overflow = {int(other_pos[i]): float(other_sims[i]) for i in range(len(other_pos)) if other_sims[i] >= threshold}
            scores.update(overflow)

        return scores

    def _collaborative_artist_scores(self, artist_name: str) -> dict[str, float]:
        """On-demand item-based CF: find artists similar to artist_name via Last.fm."""
        if self.artist_matrix is None or not self.artist_name_to_code:
            return {}

        all_names = list(self.artist_name_to_code.keys())
        match = fuzzy_process.extractOne(artist_name, all_names, score_cutoff=70)
        if match is None:
            return {}

        matched_name, _, _ = match
        artist_code = self.artist_name_to_code[matched_name]
        artist_vec = self.artist_matrix[artist_code]  # sparse (1, n_users)

        # Compute similarity between this artist and all others (on-demand)
        sims = cosine_similarity(artist_vec, self.artist_matrix)[0]  # shape (n_artists,)
        sims[artist_code] = 0.0  # exclude self

        top_codes = np.argsort(sims)[::-1][:100]
        return {
            self.code_to_artist_name[int(code)]: float(sims[code])
            for code in top_codes
            if sims[code] > 0 and int(code) in self.code_to_artist_name
        }

    def _map_artist_scores_to_tracks(self, artist_scores: dict[str, float]) -> np.ndarray:
        """Convert artist-level CF scores to a per-track score array."""
        scores = np.zeros(len(self.spotify_df), dtype=float)
        if not artist_scores:
            return scores

        max_score = max(artist_scores.values()) or 1.0
        for i, artist_lower in enumerate(self.spotify_df["artists_lower"].str.split(";").str[0].str.strip()):
            if artist_lower in artist_scores:
                scores[i] = artist_scores[artist_lower] / max_score  # normalise to [0, 1]
        return scores

    def _build_badges(
        self, c: float, cf: float, ctx: float, pop: float,
        mood: Optional[str], activity: Optional[str]
    ) -> list[dict]:
        badges = []
        if c > 0.65:
            badges.append({"type": "content", "label": "Strong content match", "emoji": "🎵"})
        elif c > 0.35:
            badges.append({"type": "content", "label": "Same audio cluster", "emoji": "🎵"})
        if cf > 0.25:
            badges.append({"type": "collaborative", "label": "Listeners also liked", "emoji": "👥"})
        if ctx > 0.5 and (mood or activity):
            label = (
                ACTIVITY_PROFILES[activity]["name"] if activity else f"{mood} mood match"
            )
            badges.append({"type": "context", "label": f"Fits: {label}", "emoji": "🎯"})
        if pop > 0.70:
            badges.append({"type": "trending", "label": "Trending", "emoji": "🔥"})
        return badges

    def _row_to_dict(self, row: pd.Series) -> dict:
        return {
            "track_id": str(row.get("track_id", "")),
            "track_name": str(row.get("track_name", "")),
            "artists": str(row.get("artists", "")),
            "album_name": str(row.get("album_name", "")),
            "genre": str(row.get("track_genre", "")),
            "popularity": int(row.get("popularity", 0)),
            "duration_ms": int(row.get("duration_ms", 0)),
            "explicit": bool(row.get("explicit", False)),
            "mood": str(row.get("mood", "Neutral")),
            "mood_key": str(row.get("mood_key", "neutral")),
            "mood_emoji": str(row.get("mood_emoji", "😐")),
            "cluster": int(row.get("cluster", -1)),
            "features": {
                "danceability": round(float(row.get("danceability", 0)), 3),
                "energy": round(float(row.get("energy", 0)), 3),
                "valence": round(float(row.get("valence", 0)), 3),
                "tempo": round(float(row.get("tempo", 0)), 1),
                "acousticness": round(float(row.get("acousticness", 0)), 3),
                "instrumentalness": round(float(row.get("instrumentalness", 0)), 3),
                "speechiness": round(float(row.get("speechiness", 0)), 3),
                "liveness": round(float(row.get("liveness", 0)), 3),
                "loudness": round(float(row.get("loudness", 0)), 2),
            },
        }
