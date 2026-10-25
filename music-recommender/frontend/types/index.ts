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
  image_url?: string | null;
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

export interface FeatureComparisonItem {
  seed: number;
  recommended: number;
  similar: boolean;
}

export interface ExplanationData {
  seed_track: Track;
  recommended_track: Track;
  reasons: string[];
  feature_comparison: Record<string, FeatureComparisonItem>;
}

export interface ModelStats {
  tracks_count: number;
  clusters_count: number;
  features_used: string[];
  artists_count: number;
  interactions_count: number;
  sparsity_pct: number;
  genres_count: number;
}

export interface ImportArtResponse {
  newly_imported: number;
  already_cached: number;
  total_cached: number;
  total_tracks: number;
}

export interface AlbumArtStatus {
  cached_count: number;
  total_tracks: number;
  has_lastfm_key: boolean;
}

export type TrendPeriod = "weekly" | "monthly" | "yearly";

export interface UserInfo {
  username: string;
  real_name: string;
  avatar: string;
  total_playcount: number;
  artist_count: number;
  track_count: number;
  registered: string;
}

export interface UserSummary {
  period_scrobbles: number;
  daily_average: number;
  listening_hours: number;
  top_genre: string;
  mood_alignment: string;
  diversity_score: number;
}

export interface TrendPoint {
  label: string;
  date: string;
  scrobbles: number;
}

export interface ListeningTrends {
  chart_type: "daily" | "monthly" | "yearly";
  points: TrendPoint[];
  peak: TrendPoint;
  average: number;
}

export interface ProfileArtist {
  rank: number;
  name: string;
  playcount: number;
  image: string;
  url: string;
}

export interface ProfileTrack {
  rank: number;
  name: string;
  artist: string;
  playcount: number;
  image: string;
  duration: number;
  url: string;
}

export interface ProfileAlbum {
  rank: number;
  name: string;
  artist: string;
  playcount: number;
  image: string;
  url: string;
}

export interface UserAcousticProfile {
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  tempo: number;
  dominant_genre: string;
  mood_label: string;
  mood_key: string;
}

export interface UserProfileData {
  user: UserInfo;
  period: TrendPeriod;
  period_label: string;
  summary: UserSummary;
  trends: ListeningTrends;
  top_artists: ProfileArtist[];
  top_tracks: ProfileTrack[];
  top_albums: ProfileAlbum[];
  acoustic_profile: UserAcousticProfile;
}



