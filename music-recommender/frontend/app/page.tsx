"use client";

import { useState, useCallback, useEffect } from "react";
import { Track, HybridWeights, Activity, MoodQuadrant, ExplanationData } from "@/types";
import { searchTracks, getRecommendations, getActivities, getMoods, explainRecommendation, checkHealth } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import RecommendationGrid from "@/components/RecommendationGrid";
import ContextPanel from "@/components/ContextPanel";
import ExplanationModal from "@/components/ExplanationModal";
import HowItWorksModal from "@/components/HowItWorksModal";
import styles from "./page.module.css";

const DEFAULT_WEIGHTS: HybridWeights = { alpha: 0.4, beta: 0.3, gamma: 0.1, delta: 0.2 };

const PRESETS: Record<string, { label: string; emoji: string; weights: HybridWeights; activity?: string }> = {
  balanced: {
    label: "Balanced",
    emoji: "⚖️",
    weights: { alpha: 0.40, beta: 0.30, gamma: 0.10, delta: 0.20 },
  },
  sonic: {
    label: "Sonic Match",
    emoji: "🎯",
    weights: { alpha: 0.70, beta: 0.10, gamma: 0.05, delta: 0.15 },
  },
  discovery: {
    label: "Discovery",
    emoji: "👥",
    weights: { alpha: 0.15, beta: 0.65, gamma: 0.05, delta: 0.15 },
  },
  hits: {
    label: "Hit Radio",
    emoji: "🔥",
    weights: { alpha: 0.20, beta: 0.20, gamma: 0.50, delta: 0.10 },
  },
  ambient: {
    label: "Focus",
    emoji: "🧘",
    weights: { alpha: 0.25, beta: 0.15, gamma: 0.05, delta: 0.55 },
    activity: "focus",
  },
};


export default function Home() {
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [seedTrack, setSeedTrack] = useState<Track | null>(null);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [selectedActivity, setSelectedActivity] = useState<string | undefined>(undefined);
  const [weights, setWeights] = useState<HybridWeights>(DEFAULT_WEIGHTS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [moods, setMoods] = useState<MoodQuadrant[]>([]);
  const [explainingTrack, setExplainingTrack] = useState<Track | null>(null);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [recLimit, setRecLimit] = useState<number>(10);
  const [activePreset, setActivePreset] = useState<string>("balanced");
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [tracksLoaded, setTracksLoaded] = useState<number | null>(null);

  useEffect(() => {
    getActivities().then(setActivities).catch(() => {});
    getMoods().then(setMoods).catch(() => {});
    checkHealth()
      .then((h) => setTracksLoaded(h.tracks_loaded))
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSeedTrack(null);
    setRecommendations([]);
    try {
      const results = await searchTracks(query, 8);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectSeed = useCallback(async (track: Track) => {
    setSeedTrack(track);
    setSearchResults([]);
    setIsRecommending(true);
    try {
      const recs = await getRecommendations({
        track_id: track.track_id,
        mood: selectedMood,
        activity: selectedActivity,
        ...weights,
        n: 10,
      });
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecommending(false);
    }
  }, [selectedMood, selectedActivity, weights]);

  const handleContextChange = useCallback(async (mood?: string, activity?: string) => {
    setSelectedMood(mood);
    setSelectedActivity(activity);
    if (!seedTrack) return;
    setIsRecommending(true);
    try {
      const recs = await getRecommendations({
        track_id: seedTrack.track_id,
        mood,
        activity,
        ...weights,
        n: 10,
      });
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecommending(false);
    }
  }, [seedTrack, weights]);

  const handleWeightsChange = useCallback(async (newWeights: HybridWeights) => {
    setWeights(newWeights);
    if (!seedTrack) return;
    setIsRecommending(true);
    try {
      const recs = await getRecommendations({
        track_id: seedTrack.track_id,
        mood: selectedMood,
        activity: selectedActivity,
        ...newWeights,
        n: 10,
      });
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecommending(false);
    }
  }, [seedTrack, selectedMood, selectedActivity]);

  const handleExplain = useCallback(async (recTrack: Track) => {
    if (!seedTrack) return;
    setExplainingTrack(recTrack);
    setIsExplaining(true);
    setExplanationData(null);
    try {
      const exp = await explainRecommendation(
        seedTrack.track_id,
        recTrack.track_id,
        selectedMood,
        selectedActivity
      );
      setExplanationData(exp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  }, [seedTrack, selectedMood, selectedActivity]);

  const handleSelectPreset = useCallback(
    async (presetKey: string) => {
      const preset = PRESETS[presetKey];
      if (!preset) return;
      setActivePreset(presetKey);
      setWeights(preset.weights);
      const nextActivity = preset.activity ?? selectedActivity;
      if (preset.activity) setSelectedActivity(preset.activity);

      if (!seedTrack) return;
      setIsRecommending(true);
      try {
        const recs = await getRecommendations({
          track_id: seedTrack.track_id,
          mood: selectedMood,
          activity: nextActivity,
          ...preset.weights,
          n: 10,
        });
        setRecommendations(recs);
      } catch (err) {
        console.error(err);
      } finally {
        setIsRecommending(false);
      }
    },
    [seedTrack, selectedMood, selectedActivity]
  );

  const handleResetAll = useCallback(() => {
    setSeedTrack(null);
    setRecommendations([]);
    setSearchResults([]);
    setSelectedMood(undefined);
    setSelectedActivity(undefined);
    setWeights(DEFAULT_WEIGHTS);
    setActivePreset("balanced");
  }, []);

  return (
    <div className={styles.appShell}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Brand Group */}
          <div className={styles.brandGroup}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎵</span>
              <span className={styles.logoText}>MusicMind</span>
            </div>
            <span className={styles.versionBadge}>Hybrid ML</span>
          </div>

          {/* Quick Presets */}
          <div className={styles.presetsGroup} role="group" aria-label="Recommendation Presets">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                className={`${styles.presetBtn} ${activePreset === key ? styles.presetBtnActive : ""}`}
                onClick={() => handleSelectPreset(key)}
                title={`Preset: ${p.label}`}
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Header Controls */}
          <div className={styles.headerActions}>
            <div className={styles.healthBadge} title="API & Machine Learning Models Status">
              <span className={styles.healthDot} />
              <span>{tracksLoaded !== null ? `${tracksLoaded} Tracks` : "Models Active"}</span>
            </div>

            <button
              type="button"
              className={styles.headerBtn}
              onClick={() => setIsHowItWorksOpen(true)}
              aria-label="How MusicMind works"
            >
              <span>ℹ️</span>
              <span>How It Works</span>
            </button>

            {(seedTrack || selectedMood || selectedActivity) && (
              <button
                type="button"
                className={`${styles.headerBtn} ${styles.resetBtn}`}
                onClick={handleResetAll}
                aria-label="Reset all selections"
                title="Clear current track and context filters"
              >
                <span>🔄</span>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        {/* ── Sidebar: Context Panel ── */}
        <aside className={styles.sidebar}>
          <ContextPanel
            activities={activities}
            moods={moods}
            selectedActivity={selectedActivity}
            selectedMood={selectedMood}
            weights={weights}
            onContextChange={handleContextChange}
            onWeightsChange={handleWeightsChange}
          />
        </aside>

        {/* ── Main content ── */}
        <main className={styles.main}>
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />

          {searchError && (
            <div className={styles.errorBanner} role="alert">
              ⚠️ {searchError} — Is the API server running?
            </div>
          )}

          {/* Search results picker */}
          {searchResults.length > 0 && (
            <section className={styles.searchResults}>
              <h2 className={styles.sectionTitle}>Select a seed track</h2>
              <div className={styles.searchGrid}>
                {searchResults.map((track) => (
                  <SongCard
                    key={track.track_id}
                    track={track}
                    variant="compact"
                    onClick={() => handleSelectSeed(track)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Seed track */}
          {seedTrack && (
            <section className={styles.seedSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.seedLabel}>Now recommending based on</span>
              </h2>
              <SongCard track={seedTrack} variant="seed" />
            </section>
          )}

          {/* Recommendations */}
          {(recommendations.length > 0 || isRecommending) && (
            <section className={styles.recsSection}>
              <div className={styles.recsHeader}>
                <div className={styles.recsTitleGroup}>
                  <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                    Recommended Songs
                  </h2>
                  {selectedActivity && (
                    <span className={styles.contextBadge}>
                      {activities.find((a) => a.key === selectedActivity)?.emoji}{" "}
                      {activities.find((a) => a.key === selectedActivity)?.name}
                    </span>
                  )}
                  {selectedMood && (
                    <span className={styles.moodBadge}>
                      {moods.find((m) => m.key === selectedMood)?.emoji}{" "}
                      {moods.find((m) => m.key === selectedMood)?.name}
                    </span>
                  )}
                </div>

                <div className={styles.countSelector} role="group" aria-label="Show top recommendations count">
                  <button
                    type="button"
                    className={`${styles.countBtn} ${recLimit === 5 ? styles.countBtnActive : ""}`}
                    onClick={() => setRecLimit(5)}
                  >
                    Top 5
                  </button>
                  <button
                    type="button"
                    className={`${styles.countBtn} ${recLimit === 10 ? styles.countBtnActive : ""}`}
                    onClick={() => setRecLimit(10)}
                  >
                    Top 10
                  </button>
                </div>
              </div>

              <RecommendationGrid
                tracks={recommendations.slice(0, recLimit)}
                isLoading={isRecommending}
                onExplain={handleExplain}
                onSelectAsSeed={handleSelectSeed}
              />
            </section>
          )}

          {/* Empty state */}
          {!seedTrack && searchResults.length === 0 && !isSearching && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎧</div>
              <h2 className={styles.emptyTitle}>Find your next favourite song</h2>
              <p className={styles.emptySubtitle}>
                Search for a track you love, pick a mood or activity on the left,
                and let MusicMind discover the perfect next song for you.
              </p>
              <div className={styles.emptyHints}>
                <span className={styles.hint}>🎵 Content match via K-Means clusters</span>
                <span className={styles.hint}>👥 Collaborative filtering via Last.fm</span>
                <span className={styles.hint}>🎯 Context-aware via activity profiles</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Explanation Modal */}
      <ExplanationModal
        isOpen={!!explainingTrack}
        onClose={() => setExplainingTrack(null)}
        data={explanationData}
        isLoading={isExplaining}
      />

      {/* How It Works Architecture Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
}

