// Shared TypeScript types for the MusicMind application

export interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
  loudness: number;
}

export interface Badge {
  type: "content" | "collaborative" | "context" | "trending";
  label: string;
  emoji: string;
}

export interface ScoreBreakdown {
  total: number;
  content: number;
  collaborative: number;
  popularity: number;
  context: number;
}

export interface Track {
  track_id: string;
  track_name: string;
  artists: string;
  album_name: string;
  genre: string;
  popularity: number;
  duration_ms: number;
  explicit: boolean;
  mood: string;
  mood_key: string;
  mood_emoji: string;
  cluster: number;
  features: AudioFeatures;
  scores?: ScoreBreakdown;
  badges?: Badge[];
}

export interface Activity {
  key: string;
  name: string;
  emoji: string;
  description: string;
}

export interface MoodQuadrant {
  key: string;
  name: string;
  emoji: string;
  description: string;
  valence_range: [number, number];
  energy_range: [number, number];
}

export interface RecommendRequest {
  track_id: string;
  mood?: string;
  activity?: string;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  n: number;
}

export interface HybridWeights {
  alpha: number;  // content
  beta: number;   // collaborative
  gamma: number;  // popularity
  delta: number;  // context
}
