"use client";

import { useState, useCallback, useEffect } from "react";
import { Track, HybridWeights, Activity, MoodQuadrant, ExplanationData } from "@/types";
import { searchTracks, getRecommendations, getActivities, getMoods, explainRecommendation } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import RecommendationGrid from "@/components/RecommendationGrid";
import ContextPanel from "@/components/ContextPanel";
import ExplanationModal from "@/components/ExplanationModal";
import styles from "./page.module.css";

const DEFAULT_WEIGHTS: HybridWeights = { alpha: 0.4, beta: 0.3, gamma: 0.1, delta: 0.2 };

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

  useEffect(() => {
    getActivities().then(setActivities).catch(() => {});
    getMoods().then(setMoods).catch(() => {});
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

  return (
    <div className={styles.appShell}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎵</span>
            <span className={styles.logoText}>MusicMind</span>
          </div>
          <p className={styles.tagline}>Hybrid AI music recommendations — content · collaborative · context-aware</p>
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
    </div>
  );
}
