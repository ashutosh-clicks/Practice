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
  { key: "alpha" as const, label: "🎵 Content",      description: "K-Means audio similarity",   color: "var(--badge-content-text)" },
  { key: "beta"  as const, label: "👥 Collab",        description: "Last.fm listener affinity", color: "var(--badge-collab-text)" },
  { key: "gamma" as const, label: "🔥 Popularity",    description: "Global listening boost",    color: "var(--badge-trending-text)" },
  { key: "delta" as const, label: "🎯 Context",       description: "Mood & activity target",    color: "var(--badge-context-text)" },
];

const ACTIVITY_CUES: Record<string, string> = {
  focus: "Instrumental • Mid Tempo",
  study: "Acoustic • Low Valence",
  workout: "High Energy • Upbeat",
  sleep: "Ambient • Ultra Calm",
  party: "Danceable • Euphoric",
  meditation: "Organic • Low BPM",
  commute: "Driving • Steady Pulse",
  creative: "Dynamic • Expressive",
};

const MOOD_META: Record<string, { coord: string; subtitle: string; styleClass: string; activeClass: string }> = {
  happy:   { coord: "+V / +E", subtitle: "Upbeat & Joyful",      styleClass: styles.moodHappy,   activeClass: styles.moodHappyActive },
  calm:    { coord: "+V / -E", subtitle: "Peaceful & Serene",    styleClass: styles.moodCalm,    activeClass: styles.moodCalmActive },
  sad:     { coord: "-V / -E", subtitle: "Melancholic & Deep",   styleClass: styles.moodSad,     activeClass: styles.moodSadActive },
  intense: { coord: "-V / +E", subtitle: "Fiery & High-Energy",  styleClass: styles.moodIntense, activeClass: styles.moodIntenseActive },
};

export default function ContextPanel({
  activities,
  moods,
  selectedActivity,
  selectedMood,
  weights,
  onContextChange,
  onWeightsChange,
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

  const clearAllContext = () => {
    onContextChange(undefined, undefined);
  };

  return (
    <div className={styles.panel}>
      {/* ── Active Context Summary Pill ── */}
      {(selectedActivity || selectedMood) && (
        <div className={styles.activeSummary}>
          <span className={styles.summaryLabel}>Active Context Filter:</span>
          {selectedActivity && (
            <span className={styles.summaryTag}>
              {activities.find((a) => a.key === selectedActivity)?.emoji}{" "}
              {activities.find((a) => a.key === selectedActivity)?.name}
            </span>
          )}
          {selectedMood && (
            <span className={styles.summaryTagMood}>
              {moods.find((m) => m.key === selectedMood)?.emoji}{" "}
              {moods.find((m) => m.key === selectedMood)?.name}
            </span>
          )}
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={clearAllContext}
            aria-label="Clear active context filters"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Activity Selector ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span>🎯</span> Activity Alignment
          </h3>
          {selectedActivity && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => handleActivity(selectedActivity)}
            >
              Clear
            </button>
          )}
        </div>
        <p className={styles.sectionHint}>Select your current task to optimize tempo & acoustics</p>
        <div className={styles.activityGrid}>
          {activities.map((act) => {
            const isSelected = selectedActivity === act.key;
            return (
              <button
                key={act.key}
                id={`activity-${act.key}`}
                type="button"
                className={`${styles.activityCard} ${isSelected ? styles.activityActive : ""}`}
                onClick={() => handleActivity(act.key)}
                aria-pressed={isSelected}
                title={act.description}
              >
                <div className={styles.activityTopRow}>
                  <div className={styles.activityIconBox}>{act.emoji}</div>
                  {isSelected && <span className={styles.activeDot}>✓</span>}
                </div>
                <span className={styles.activityLabel}>{act.name}</span>
                <span className={styles.activityCue}>
                  {ACTIVITY_CUES[act.key] ?? "Adaptive profile"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Mood Selector (Russell Circumplex) ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span>🧠</span> Mood Quadrants
          </h3>
          {selectedMood && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => handleMood(selectedMood)}
            >
              Clear
            </button>
          )}
        </div>
        <p className={styles.sectionHint}>Russell&apos;s Circumplex Model (Valence × Energy)</p>
        <div className={styles.moodGrid}>
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.key;
            const meta = MOOD_META[mood.key] ?? {
              coord: "2D",
              subtitle: mood.description,
              styleClass: "",
              activeClass: "",
            };
            return (
              <button
                key={mood.key}
                id={`mood-${mood.key}`}
                type="button"
                className={`${styles.moodCard} ${meta.styleClass} ${isSelected ? meta.activeClass : ""}`}
                onClick={() => handleMood(mood.key)}
                aria-pressed={isSelected}
                title={mood.description}
              >
                <div className={styles.moodHeader}>
                  <span className={styles.moodEmoji}>{mood.emoji}</span>
                  <span className={styles.moodCoord}>{meta.coord}</span>
                </div>
                <span className={styles.moodName}>{mood.name.split("/")[0].trim()}</span>
                <span className={styles.moodDesc}>{meta.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* 2D Circumplex Map */}
        <div className={styles.mapWrapper}>
          <div className={styles.mapTitle}>
            <span>2D Affective Plane</span>
            <span>Arousal vs Valence</span>
          </div>
          <div className={styles.quadrantMap} role="group" aria-label="Russell Circumplex interactive plane">
            {/* Top-left: Intense */}
            <div
              className={`${styles.quadrantCell} ${selectedMood === "intense" ? styles.cellActive : ""}`}
              onClick={() => handleMood("intense")}
              title="Intense / Angry: High Energy, Low Valence"
            >
              <span className={styles.quadrantEmoji}>😤</span>
              <span className={styles.quadrantTag}>Intense</span>
            </div>
            {/* Top-right: Happy */}
            <div
              className={`${styles.quadrantCell} ${selectedMood === "happy" ? styles.cellActive : ""}`}
              onClick={() => handleMood("happy")}
              title="Happy / Euphoric: High Energy, High Valence"
            >
              <span className={styles.quadrantEmoji}>😊</span>
              <span className={styles.quadrantTag}>Happy</span>
            </div>
            {/* Bottom-left: Sad */}
            <div
              className={`${styles.quadrantCell} ${selectedMood === "sad" ? styles.cellActive : ""}`}
              onClick={() => handleMood("sad")}
              title="Sad / Melancholic: Low Energy, Low Valence"
            >
              <span className={styles.quadrantEmoji}>😔</span>
              <span className={styles.quadrantTag}>Melancholy</span>
            </div>
            {/* Bottom-right: Calm */}
            <div
              className={`${styles.quadrantCell} ${selectedMood === "calm" ? styles.cellActive : ""}`}
              onClick={() => handleMood("calm")}
              title="Calm / Serene: Low Energy, High Valence"
            >
              <span className={styles.quadrantEmoji}>😌</span>
              <span className={styles.quadrantTag}>Calm</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hybrid Weight Sliders ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span>⚖️</span> Hybrid Formula Weights
          </h3>
        </div>
        <p className={styles.sectionHint}>Balance ML signals in real time</p>
        <div className={styles.sliders}>
          {WEIGHT_CONFIG.map(({ key, label, description, color }) => (
            <div key={key} className={styles.sliderRow}>
              <div className={styles.sliderMeta}>
                <span className={styles.sliderLabel} style={{ color }}>
                  {label}
                </span>
                <span className={styles.sliderValue}>{Math.round(weights[key] * 100)}%</span>
              </div>
              <p className={styles.sliderDesc}>{description}</p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
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
    </div>
  );
}
