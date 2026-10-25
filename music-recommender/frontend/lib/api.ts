import {
  Track,
  RecommendRequest,
  Activity,
  MoodQuadrant,
  ExplanationData,
  ModelStats,
  ImportArtResponse,
  AlbumArtStatus,
  TrendPeriod,
  UserProfileData,
} from "@/types";

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

export async function searchTracks(query: string, searchBy = "all", n = 10): Promise<Track[]> {
  const data = await apiFetch<{ results: Track[] }>(
    `/search?query=${encodeURIComponent(query)}&search_by=${searchBy}&n=${n}`
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

export async function getRandomTracks(n = 5): Promise<Track[]> {
  const data = await apiFetch<{ tracks: Track[] }>(`/random?n=${n}`);
  return data.tracks;
}

export async function getModelStats(): Promise<ModelStats> {
  return apiFetch<ModelStats>("/stats");
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean; tracks_loaded: number }> {
  return apiFetch("/health");
}

export async function importLastFmArt(apiKey?: string, limit = 50): Promise<ImportArtResponse> {
  return apiFetch<ImportArtResponse>("/import-lastfm-art", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey || null, limit }),
  });
}

export async function getAlbumArtStatus(): Promise<AlbumArtStatus> {
  return apiFetch<AlbumArtStatus>("/album-art/status");
}

export async function getUserProfile(
  username: string,
  period: TrendPeriod = "weekly",
  apiKey?: string
): Promise<UserProfileData> {
  const params = new URLSearchParams({
    username: username.trim(),
    period,
  });
  if (apiKey) params.append("api_key", apiKey.trim());
  return apiFetch<UserProfileData>(`/user-profile?${params.toString()}`);
}



