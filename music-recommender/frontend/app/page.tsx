"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Radio,
  SlidersHorizontal,
  Sparkles,
  Users,
  TrendingUp,
  Headphones,
  Dices,
  BarChart2,
  Image as ImageIcon,
  Info,
  RotateCcw,
  Share2,
  Music,
  Target,
  LucideIcon,
  X,
  AlertCircle,
  Compass,
  User,
} from "lucide-react";
import { Track, HybridWeights, Activity, MoodQuadrant, ExplanationData } from "@/types";
import {
  searchTracks,
  getRecommendations,
  getActivities,
  getMoods,
  explainRecommendation,
  checkHealth,
  getRandomTracks,
} from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import RecommendationGrid from "@/components/RecommendationGrid";
import ContextPanel from "@/components/ContextPanel";
import ExplanationModal from "@/components/ExplanationModal";
import HowItWorksModal from "@/components/HowItWorksModal";
import ModelStatsModal from "@/components/ModelStatsModal";
import LastFmImportModal from "@/components/LastFmImportModal";
import ProfileView from "@/components/ProfileView";
import styles from "./page.module.css";


const DEFAULT_WEIGHTS: HybridWeights = { alpha: 0.4, beta: 0.3, gamma: 0.1, delta: 0.2 };

interface PresetItem {
  label: string;
  icon: LucideIcon;
  weights: HybridWeights;
  activity?: string;
}

const PRESETS: Record<string, PresetItem> = {
  balanced: {
    label: "Balanced",
    icon: SlidersHorizontal,
    weights: { alpha: 0.40, beta: 0.30, gamma: 0.10, delta: 0.20 },
  },
  sonic: {
    label: "Sonic Match",
    icon: Sparkles,
    weights: { alpha: 0.70, beta: 0.10, gamma: 0.05, delta: 0.15 },
  },
  discovery: {
    label: "Discovery",
    icon: Users,
    weights: { alpha: 0.15, beta: 0.65, gamma: 0.05, delta: 0.15 },
  },
  hits: {
    label: "Hit Radio",
    icon: TrendingUp,
    weights: { alpha: 0.20, beta: 0.20, gamma: 0.50, delta: 0.10 },
  },
  ambient: {
    label: "Focus",
    icon: Headphones,
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
  const [isSurprising, setIsSurprising] = useState(false);
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
  const [isModelStatsOpen, setIsModelStatsOpen] = useState(false);
  const [isLastFmModalOpen, setIsLastFmModalOpen] = useState(false);
  const [tracksLoaded, setTracksLoaded] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"discover" | "profile">("discover");

  useEffect(() => {
    getActivities().then(setActivities).catch(() => {});
    getMoods().then(setMoods).catch(() => {});
    checkHealth()
      .then((h) => setTracksLoaded(h.tracks_loaded))
      .catch(() => {});
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = useCallback(async (query: string, searchBy = "all") => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSeedTrack(null);
    setRecommendations([]);
    try {
      const results = await searchTracks(query, searchBy, 8);
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

  const handleSurpriseMe = useCallback(async () => {
    setIsSurprising(true);
    try {
      const randomTracks = await getRandomTracks(1);
      if (randomTracks.length > 0) {
        const picked = randomTracks[0];
        showToast(`Picked: "${picked.track_name}" by ${picked.artists}`);
        await handleSelectSeed(picked);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSurprising(false);
    }
  }, [handleSelectSeed, showToast]);

  const handleExportPlaylist = useCallback(() => {
    if (!seedTrack || recommendations.length === 0) return;
    const lines = [
      `find.fm Hybrid Scrobble Playlist`,
      `Seed Track: ${seedTrack.track_name} — ${seedTrack.artists}`,
      `Filters: Mood [${selectedMood ?? "Any"}] • Activity [${selectedActivity ?? "Any"}]`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `-----------------------------------------`,
      ...recommendations.slice(0, recLimit).map((r, i) => {
        const score = r.scores ? Math.min(100, Math.max(0, Math.round(r.scores.total * 100))) : 85;
        return `${i + 1}. ${r.track_name} — ${r.artists} [${r.genre}] (${score}/100)`;
      }),
    ];
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${Math.min(recommendations.length, recLimit)} tracks to clipboard!`);
    }).catch(() => {
      showToast("Unable to copy to clipboard.");
    });
  }, [seedTrack, recommendations, recLimit, selectedMood, selectedActivity, showToast]);

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
    showToast("Filters & selections reset");
  }, [showToast]);

  const handleProfileSeed = useCallback(
    async (query: string, searchBy: "track" | "artist" | "all") => {
      setActiveTab("discover");
      showToast(`Seeding find.fm with "${query}" from Last.fm profile`);
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchTracks(query, searchBy, 8);
        if (results.length > 0) {
          setSearchResults(results);
          await handleSelectSeed(results[0]);
        } else {
          showToast(`Could not find "${query}" in catalog.`);
        }
      } catch (err: unknown) {
        console.error(err);
        setSearchError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setIsSearching(false);
      }
    },
    [handleSelectSeed, showToast]
  );

  const isEngineActive = isRecommending || isSearching || isSurprising;

  return (
    <div className={styles.appShell}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Brand Group */}
          <div className={styles.brandGroup}>
            <div className={styles.logo}>
              <span className={styles.logoBadge} aria-hidden="true">
                <Radio size={16} className={styles.logoSvg} />
              </span>
              <span className={styles.logoText}>
                find<span className={styles.logoDot}>.</span><span className={styles.logoFm}>fm</span>
              </span>
            </div>
            <span className={styles.versionBadge}>Scrobbler ML</span>

            {/* Audio Wave Visualizer */}
            <div
              className={`${styles.audioVisualizer} ${isEngineActive ? styles.audioVisualizerActive : ""}`}
              title={isEngineActive ? "ML Engine computing recommendation vectors..." : "ML Engine Ready"}
            >
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
              <span className={styles.waveBar} />
            </div>
          </div>

          {/* Primary View Navigation Tabs */}
          <div className={styles.navTabs} role="tablist" aria-label="Main Navigation">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "discover"}
              className={`${styles.navTab} ${activeTab === "discover" ? styles.navTabActive : ""}`}
              onClick={() => setActiveTab("discover")}
            >
              <Compass size={14} />
              <span>Discover</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "profile"}
              className={`${styles.navTab} ${activeTab === "profile" ? styles.navTabActive : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={14} />
              <span>Profile & Trends</span>
              <span className={styles.navTabBadge}>Last.fm</span>
            </button>
          </div>

          {/* Quick Presets (Only in Discover mode) */}
          {activeTab === "discover" && (
            <div className={styles.presetsGroup} role="group" aria-label="Recommendation Presets">
              {Object.entries(PRESETS).map(([key, p]) => {
                const PresetIcon = p.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.presetBtn} ${activePreset === key ? styles.presetBtnActive : ""}`}
                    onClick={() => handleSelectPreset(key)}
                    title={`Preset: ${p.label}`}
                  >
                    <PresetIcon size={12} className={styles.presetIcon} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Header Controls */}
          <div className={styles.headerActions}>
            {/* Surprise Me Quick Roll */}
            <button
              type="button"
              className={`${styles.headerBtn} ${styles.surpriseBtn}`}
              onClick={handleSurpriseMe}
              disabled={isSurprising}
              aria-label="Roll a random popular seed track"
              title="Pick a random popular track from catalog"
            >
              <Dices size={14} className={isSurprising ? styles.spinIcon : ""} />
              <span>{isSurprising ? "Rolling..." : "Surprise Me"}</span>
            </button>

            {/* Health Badge */}
            <div className={styles.healthBadge} title="API & Machine Learning Models Status">
              <span className={styles.healthDot} />
              <span>{tracksLoaded !== null ? `${tracksLoaded.toLocaleString()} Tracks` : "Models Active"}</span>
            </div>

            {/* Model Diagnostics */}
            <button
              type="button"
              className={styles.headerBtn}
              onClick={() => setIsModelStatsOpen(true)}
              aria-label="View ML Model Architecture & Diagnostics"
              title="Inspect K-Means clusters, Last.fm graph density, and vectors"
            >
              <BarChart2 size={14} className={styles.btnIcon} />
              <span>Diagnostics</span>
            </button>

            {/* Last.fm Album Art Importer */}
            <button
              type="button"
              className={`${styles.headerBtn} ${styles.lastfmBtn}`}
              onClick={() => setIsLastFmModalOpen(true)}
              aria-label="Last.fm Album Artwork Importer"
              title="Import and inspect official album covers from Last.fm"
            >
              <ImageIcon size={14} className={styles.btnIcon} />
              <span>Last.fm Art</span>
            </button>

            {/* How It Works Architecture Modal */}
            <button
              type="button"
              className={styles.headerBtn}
              onClick={() => setIsHowItWorksOpen(true)}
              aria-label="How find.fm works"
            >
              <Info size={14} className={styles.btnIcon} />
              <span>How It Works</span>
            </button>

            {/* Reset Button */}
            {(seedTrack || selectedMood || selectedActivity) && (
              <button
                type="button"
                className={`${styles.headerBtn} ${styles.resetBtn}`}
                onClick={handleResetAll}
                aria-label="Reset all selections"
                title="Clear current track and context filters"
              >
                <RotateCcw size={13} className={styles.btnIcon} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className={styles.toast} role="status">
          <span>{toastMessage}</span>
          <button type="button" className={styles.toastClose} onClick={() => setToastMessage(null)} aria-label="Close notification">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Main View Content ── */}
      {activeTab === "profile" ? (
        <div className={styles.profileContainer}>
          <ProfileView onSelectSeed={handleProfileSeed} />
        </div>
      ) : (
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
              <AlertCircle size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
              {searchError} — Is the API server running?
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

                <div className={styles.recsControlsGroup}>
                  {recommendations.length > 0 && (
                    <button
                      type="button"
                      className={styles.exportBtn}
                      onClick={handleExportPlaylist}
                      title="Copy recommendations list to clipboard"
                    >
                      <Share2 size={13} className={styles.btnIcon} />
                      <span>Export</span>
                    </button>
                  )}

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
              <div className={styles.emptyIconBox} aria-hidden="true">
                <Radio size={42} className={styles.emptySvg} />
              </div>
              <h2 className={styles.emptyTitle}>Find your next favorite song</h2>
              <p className={styles.emptySubtitle}>
                Search for a track you love or roll <strong>Surprise Me</strong> above, pick an activity or mood quadrant on the left,
                and let find.fm discover the perfect scrobbles for you.
              </p>
              <div className={styles.emptyActions}>
                <button type="button" className={styles.heroSurpriseBtn} onClick={handleSurpriseMe}>
                  <Dices size={15} />
                  <span>Roll a Random Seed Track</span>
                </button>
              </div>
              <div className={styles.emptyHints}>
                <span className={styles.hint}>
                  <Music size={12} className={styles.hintIcon} />
                  <span>Content match via K-Means audio clusters</span>
                </span>
                <span className={styles.hint}>
                  <Users size={12} className={styles.hintIcon} />
                  <span>Collaborative filtering via Last.fm scrobbler matrix</span>
                </span>
                <span className={styles.hint}>
                  <Target size={12} className={styles.hintIcon} />
                  <span>Context-aware via Russell Circumplex mood profiles</span>
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
      )}

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

      {/* Model Diagnostics Modal */}
      <ModelStatsModal
        isOpen={isModelStatsOpen}
        onClose={() => setIsModelStatsOpen(false)}
        currentWeights={weights}
      />

      {/* Last.fm Album Art Importer Modal */}
      <LastFmImportModal
        isOpen={isLastFmModalOpen}
        onClose={() => setIsLastFmModalOpen(false)}
        onImportComplete={() => {
          checkHealth().then((h) => setTracksLoaded(h.tracks_loaded)).catch(() => {});
          showToast("Album artwork refreshed from Last.fm!");
        }}
      />
    </div>
  );
}

