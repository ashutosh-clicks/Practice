"""
Mood & Context-Aware Engine
Based on Russell's Circumplex Model of Affect for mood mapping.
Provides activity-specific audio feature target profiles.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from dataclasses import dataclass
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from typing import Optional


# ──────────────────────────────────────────────
# Mood Quadrants  (Russell's Circumplex Model)
# ──────────────────────────────────────────────
@dataclass
class MoodQuadrant:
    key: str
    name: str
    emoji: str
    valence_min: float
    valence_max: float
    energy_min: float
    energy_max: float
    description: str


MOOD_QUADRANTS: list[MoodQuadrant] = [
    MoodQuadrant("happy",    "Happy / Euphoric",  "😊", 0.6, 1.0, 0.6, 1.0, "Upbeat, positive, and energetic"),
    MoodQuadrant("calm",     "Calm / Peaceful",   "😌", 0.6, 1.0, 0.0, 0.4, "Relaxed, content, and mellow"),
    MoodQuadrant("sad",      "Sad / Melancholic", "😔", 0.0, 0.4, 0.0, 0.4, "Reflective, emotional, subdued"),
    MoodQuadrant("intense",  "Angry / Intense",   "😤", 0.0, 0.4, 0.6, 1.0, "High energy, dark, or aggressive"),
    MoodQuadrant("neutral",  "Neutral",           "😐", 0.4, 0.6, 0.4, 0.6, "Balanced, neither too high nor too low"),
]

MOOD_BY_KEY: dict[str, MoodQuadrant] = {m.key: m for m in MOOD_QUADRANTS}


# ──────────────────────────────────────────────
# Activity Profiles
# ──────────────────────────────────────────────
# Feature order matches CONTEXT_FEATURE_COLS exactly:
# danceability, energy, loudness_norm, speechiness,
# acousticness, instrumentalness, liveness, valence, tempo_norm
CONTEXT_FEATURE_COLS = [
    "danceability", "energy", "loudness_norm", "speechiness",
    "acousticness", "instrumentalness", "liveness", "valence", "tempo_norm",
]

ACTIVITY_PROFILES: dict[str, dict] = {
    "focus": {
        "name": "Deep Focus / Coding",
        "emoji": "🎯",
        "description": "Minimal distractions, maximum flow state",
        "features": [0.35, 0.45, 0.55, 0.05, 0.35, 0.85, 0.10, 0.50, 0.45],
    },
    "study": {
        "name": "Studying",
        "emoji": "📚",
        "description": "Calm focus for reading and learning",
        "features": [0.30, 0.35, 0.40, 0.04, 0.55, 0.75, 0.08, 0.45, 0.38],
    },
    "workout": {
        "name": "Workout / Gym",
        "emoji": "💪",
        "description": "High-intensity power tracks",
        "features": [0.75, 0.90, 0.85, 0.15, 0.05, 0.15, 0.20, 0.75, 0.85],
    },
    "sleep": {
        "name": "Sleep / Wind Down",
        "emoji": "😴",
        "description": "Gentle and soothing for rest",
        "features": [0.25, 0.15, 0.25, 0.03, 0.80, 0.80, 0.05, 0.50, 0.20],
    },
    "party": {
        "name": "Party / Social",
        "emoji": "🎉",
        "description": "High energy crowd-pleasers",
        "features": [0.90, 0.85, 0.80, 0.20, 0.05, 0.05, 0.30, 0.90, 0.75],
    },
    "meditation": {
        "name": "Meditation / Relax",
        "emoji": "🧘",
        "description": "Ambient and mindful soundscapes",
        "features": [0.20, 0.12, 0.20, 0.03, 0.85, 0.90, 0.05, 0.55, 0.15],
    },
    "commute": {
        "name": "Commuting",
        "emoji": "🚗",
        "description": "Upbeat tunes for the journey",
        "features": [0.65, 0.68, 0.70, 0.18, 0.20, 0.10, 0.20, 0.72, 0.60],
    },
    "creative": {
        "name": "Creative Work",
        "emoji": "🎨",
        "description": "Inspiring tracks for creative flow",
        "features": [0.52, 0.55, 0.55, 0.07, 0.40, 0.50, 0.12, 0.68, 0.50],
    },
}


class ContextEngine:
    """Computes context alignment scores for tracks based on mood and activity."""

    def classify_mood(self, valence: float, energy: float) -> MoodQuadrant:
        """Classify a track into a mood quadrant using valence and energy."""
        for quadrant in MOOD_QUADRANTS:
            if (quadrant.valence_min <= valence <= quadrant.valence_max
                    and quadrant.energy_min <= energy <= quadrant.energy_max):
                return quadrant
        return MOOD_BY_KEY["neutral"]

    def compute_alignment_scores(
        self,
        df: pd.DataFrame,
        activity: Optional[str],
        loudness_scaler: MinMaxScaler,
        tempo_scaler: MinMaxScaler,
    ) -> pd.Series:
        """
        Compute cosine similarity between every track and the target activity profile.

        Returns pd.Series of float scores in [0, 1], indexed by df.index.
        Returns all-zero Series if no activity is specified.
        """
        if not activity or activity not in ACTIVITY_PROFILES:
            return pd.Series(0.0, index=df.index)

        target = np.array(ACTIVITY_PROFILES[activity]["features"]).reshape(1, -1)
        track_matrix = df[CONTEXT_FEATURE_COLS].values.copy().astype(float)

        # Fill any NaN with column means
        col_means = np.nanmean(track_matrix, axis=0)
        nan_mask = np.isnan(track_matrix)
        track_matrix[nan_mask] = np.take(col_means, np.where(nan_mask)[1])

        similarities = cosine_similarity(target, track_matrix)[0]
        return pd.Series(similarities, index=df.index)

    def get_activity_list(self) -> list[dict]:
        return [
            {"key": k, "name": v["name"], "emoji": v["emoji"], "description": v["description"]}
            for k, v in ACTIVITY_PROFILES.items()
        ]

    def get_mood_list(self) -> list[dict]:
        return [
            {
                "key": m.key,
                "name": m.name,
                "emoji": m.emoji,
                "description": m.description,
                "valence_range": [m.valence_min, m.valence_max],
                "energy_range": [m.energy_min, m.energy_max],
            }
            for m in MOOD_QUADRANTS
        ]
