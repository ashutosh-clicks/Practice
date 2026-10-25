import { Track, RecommendRequest, Activity, MoodQuadrant, ExplanationData } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json() as Promise<T>;
}

export async function searchTracks(query: string, n = 10): Promise<Track[]> {
  const data = await apiFetch<{ results: Track[] }>(
    `/search?query=${encodeURIComponent(query)}&n=${n}`
  );
  return data.results;
}

export async function getRecommendations(body: RecommendRequest): Promise<Track[]> {
  const data = await apiFetch<{ recommendations: Track[] }>("/recommend", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data.recommendations;
}

export async function explainRecommendation(
  seedTrackId: string,
  recTrackId: string,
  mood?: string,
  activity?: string
): Promise<ExplanationData> {
  return apiFetch<ExplanationData>("/explain", {
    method: "POST",
    body: JSON.stringify({
      seed_track_id: seedTrackId,
      rec_track_id: recTrackId,
      mood,
      activity,
    }),
  });
}

export async function getActivities(): Promise<Activity[]> {
  const data = await apiFetch<{ activities: Activity[] }>("/activities");
  return data.activities;
}

export async function getMoods(): Promise<MoodQuadrant[]> {
  const data = await apiFetch<{ moods: MoodQuadrant[] }>("/moods");
  return data.moods;
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean; tracks_loaded: number }> {
  return apiFetch("/health");
}

