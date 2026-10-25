"use client";

import { Activity, MoodQuadrant, HybridWeights } from "@/types";
import styles from "./ContextPanel.module.css";

interface Props {
  activities: Activity[];
  moods: MoodQuadrant[];
  selectedActivity?: string;
  selectedMood?: string;
  weights: HybridWeights;
  onContextChange: (mood?: string, activity?: string) => void;
  onWeightsChange: (weights: HybridWeights) => void;
}

const WEIGHT_CONFIG = [
  { key: "alpha" as const, label: "🎵 Content",       description: "K-Means audio similarity",     color: "var(--badge-content-text)" },
  { key: "beta"  as const, label: "👥 Collaborative",  description: "Last.fm listener overlap",     color: "var(--badge-collab-text)" },
  { key: "gamma" as const, label: "🔥 Popularity",     description: "Spotify popularity boost",     color: "var(--badge-trending-text)" },
  { key: "delta" as const, label: "🎯 Context",        description: "Mood & activity alignment",    color: "var(--badge-context-text)" },
];

export default function ContextPanel({
  activities, moods, selectedActivity, selectedMood,
  weights, onContextChange, onWeightsChange,
}: Props) {
  const handleActivity = (key: string) => {
    const next = selectedActivity === key ? undefined : key;
    onContextChange(selectedMood, next);
  };

  const handleMood = (key: string) => {
    const next = selectedMood === key ? undefined : key;
    onContextChange(next, selectedActivity);
  };

  const handleWeight = (key: keyof HybridWeights, rawValue: number) => {
    onWeightsChange({ ...weights, [key]: rawValue / 100 });
  };

  return (
    <div className={styles.panel}>
      {/* ── Activity selector ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎯 Activity</h3>
        <p className={styles.sectionHint}>What are you doing right now?</p>
        <div className={styles.activityGrid}>
          {activities.map((act) => (
            <button
              key={act.key}
              id={`activity-${act.key}`}
              className={`${styles.activityCard} ${selectedActivity === act.key ? styles.activityActive : ""}`}
              onClick={() => handleActivity(act.key)}
              aria-pressed={selectedActivity === act.key}
              title={act.description}
            >
              <span className={styles.activityEmoji}>{act.emoji}</span>
              <span className={styles.activityLabel}>{act.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Mood selector ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🧠 Mood</h3>
        <p className={styles.sectionHint}>How are you feeling?</p>
        <div className={styles.moodGrid}>
          {moods.map((mood) => (
            <button
              key={mood.key}
              id={`mood-${mood.key}`}
              className={`${styles.moodCard} ${selectedMood === mood.key ? styles.moodActive : ""}`}
              onClick={() => handleMood(mood.key)}
              aria-pressed={selectedMood === mood.key}
              title={mood.description}
            >
              <span className={styles.moodEmoji}>{mood.emoji}</span>
              <span className={styles.moodName}>{mood.name}</span>
            </button>
          ))}
        </div>

        {/* Mood quadrant visual */}
        <MoodQuadrantMap selectedMood={selectedMood} moods={moods} />
      </section>

      {/* ── Hybrid weight sliders ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>⚖️ Hybrid Weights</h3>
        <p className={styles.sectionHint}>Tune the recommendation formula in real time</p>
        <div className={styles.sliders}>
          {WEIGHT_CONFIG.map(({ key, label, description, color }) => (
            <div key={key} className={styles.sliderRow}>
              <div className={styles.sliderMeta}>
                <span className={styles.sliderLabel} style={{ color }}>{label}</span>
                <span className={styles.sliderValue}>{Math.round(weights[key] * 100)}%</span>
              </div>
              <p className={styles.sliderDesc}>{description}</p>
              <input
                id={`slider-${key}`}
                type="range"
                min={0} max={100}
                value={Math.round(weights[key] * 100)}
                onChange={(e) => handleWeight(key, Number(e.target.value))}
                className={styles.slider}
                aria-label={`${label} weight`}
                style={{ "--thumb-color": color } as React.CSSProperties}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Active context summary */}
      {(selectedActivity || selectedMood) && (
        <div className={styles.activeSummary}>
          <p className={styles.summaryLabel}>Active context</p>
          {selectedActivity && (
            <span className={styles.summaryTag}>
              {activities.find((a) => a.key === selectedActivity)?.emoji} {activities.find((a) => a.key === selectedActivity)?.name}
            </span>
          )}
          {selectedMood && (
            <span className={styles.summaryTagMood}>
              {moods.find((m) => m.key === selectedMood)?.emoji} {moods.find((m) => m.key === selectedMood)?.name}
            </span>
          )}
          <button
            id="clear-context"
            className={styles.clearBtn}
            onClick={() => onContextChange(undefined, undefined)}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Mood quadrant mini-map ── */
function MoodQuadrantMap({ selectedMood, moods }: { selectedMood?: string; moods: MoodQuadrant[] }) {
  const quadrants = [
    { key: "intense", x: 0,   y: 0   },
    { key: "happy",   x: 50,  y: 0   },
    { key: "sad",     x: 0,   y: 50  },
    { key: "calm",    x: 50,  y: 50  },
  ];

  return (
    <div className={styles.quadrantMap} aria-hidden="true" title="Mood quadrant (valence × energy)">
      <span className={styles.quadrantAxisX}>Valence →</span>
      <span className={styles.quadrantAxisY}>Energy ↑</span>
      {quadrants.map(({ key, x, y }) => {
        const mood = moods.find((m) => m.key === key);
        if (!mood) return null;
        return (
          <div
            key={key}
            className={`${styles.quadrant} ${selectedMood === key ? styles.quadrantActive : ""}`}
            style={{ left: `${x}%`, top: `${y}%`, width: "50%", height: "50%" }}
          >
            <span className={styles.quadrantEmoji}>{mood.emoji}</span>
          </div>
        );
      })}
    </div>
  );
}
