"use client";

import { useState } from "react";
import { Activity, MoodQuadrant, HybridWeights } from "@/types";
import {
  Compass,
  Smile,
  Wind,
  CloudRain,
  Flame,
  CircleDot,
  Zap,
  Sparkles,
  Activity as ActivityIcon,
  Layers,
  Briefcase,
  Moon,
  Target,
  BookOpen,
  Dumbbell,
  Volume2,
  Car,
  Heart,
  SlidersHorizontal,
  Music,
  Users,
  TrendingUp,
  Check,
} from "lucide-react";
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
  { key: "alpha" as const, label: "Content", icon: Music, description: "K-Means audio similarity",   color: "var(--badge-content-text)" },
  { key: "beta"  as const, label: "Collab",  icon: Users, description: "Last.fm listener affinity", color: "var(--badge-collab-text)" },
  { key: "gamma" as const, label: "Trending", icon: TrendingUp, description: "Global listening boost",    color: "var(--badge-trending-text)" },
  { key: "delta" as const, label: "Context",  icon: Target, description: "Mood & activity target",    color: "var(--badge-context-text)" },
];

interface ActivityMeta {
  category: "work" | "energy" | "chill";
  cue: string;
  metric: string;
  energyBars: number;
}

const ACTIVITY_META: Record<string, ActivityMeta> = {
  focus: {
    category: "work",
    cue: "Instrumental • Low Vocal Distraction",
    metric: "70% Acoustic • 115 BPM",
    energyBars: 2,
  },
  study: {
    category: "work",
    cue: "Acoustic • Low Distraction Level",
    metric: "80% Acoustic • 105 BPM",
    energyBars: 1,
  },
  creative: {
    category: "work",
    cue: "Dynamic Pulse • Expressive Harmony",
    metric: "55% Dynamic • 115 BPM",
    energyBars: 2,
  },
  workout: {
    category: "energy",
    cue: "High BPM • Heart-Rate Synchronization",
    metric: "90% Energy • 135 BPM",
    energyBars: 3,
  },
  party: {
    category: "energy",
    cue: "Peak Danceability • Euphoric Bass",
    metric: "90% Danceable • 128 BPM",
    energyBars: 3,
  },
  commute: {
    category: "energy",
    cue: "Driving Rhythm • Steady Cadence",
    metric: "65% Pulse • 120 BPM",
    energyBars: 2,
  },
  sleep: {
    category: "chill",
    cue: "Subtle Ambient Textures • Low BPM",
    metric: "90% Ambient • 75 BPM",
    energyBars: 1,
  },
  meditation: {
    category: "chill",
    cue: "Organic Harmony • Serene Timbre",
    metric: "95% Organic • 70 BPM",
    energyBars: 1,
  },
};

interface MoodMeta {
  coord: string;
  quadrant: string;
  subtitle: string;
  energyLevel: string;
  valenceLevel: string;
  styleClass: string;
  activeClass: string;
  planeX: number;
  planeY: number;
}

const MOOD_META: Record<string, MoodMeta> = {
  happy: {
    coord: "+V / +E",
    quadrant: "Q1",
    subtitle: "Upbeat & Joyful",
    energyLevel: "High (80%)",
    valenceLevel: "High (85%)",
    styleClass: styles.moodHappy,
    activeClass: styles.moodHappyActive,
    planeX: 75,
    planeY: 25,
  },
  calm: {
    coord: "+V / -E",
    quadrant: "Q4",
    subtitle: "Peaceful & Serene",
    energyLevel: "Low (25%)",
    valenceLevel: "High (75%)",
    styleClass: styles.moodCalm,
    activeClass: styles.moodCalmActive,
    planeX: 75,
    planeY: 75,
  },
  sad: {
    coord: "-V / -E",
    quadrant: "Q3",
    subtitle: "Melancholic & Reflective",
    energyLevel: "Low (20%)",
    valenceLevel: "Low (20%)",
    styleClass: styles.moodSad,
    activeClass: styles.moodSadActive,
    planeX: 25,
    planeY: 75,
  },
  intense: {
    coord: "-V / +E",
    quadrant: "Q2",
    subtitle: "Fiery & High-Adrenaline",
    energyLevel: "High (85%)",
    valenceLevel: "Low (30%)",
    styleClass: styles.moodIntense,
    activeClass: styles.moodIntenseActive,
    planeX: 25,
    planeY: 25,
  },
};

function renderMoodQuadrantIcon(moodKey: string) {
  switch (moodKey) {
    case "happy": return <Smile size={18} />;
    case "calm": return <Wind size={18} />;
    case "sad": return <CloudRain size={18} />;
    case "intense": return <Flame size={18} />;
    default: return <CircleDot size={18} />;
  }
}

function renderActivityIcon(actKey: string) {
  switch (actKey) {
    case "focus": return <Target size={16} />;
    case "study": return <BookOpen size={16} />;
    case "creative": return <Sparkles size={16} />;
    case "workout": return <Dumbbell size={16} />;
    case "party": return <Volume2 size={16} />;
    case "commute": return <Car size={16} />;
    case "sleep": return <Moon size={16} />;
    case "meditation": return <Heart size={16} />;
    default: return <ActivityIcon size={16} />;
  }
}

export default function ContextPanel({
  activities,
  moods,
  selectedActivity,
  selectedMood,
  weights,
  onContextChange,
  onWeightsChange,
}: Props) {
  const [activityFilter, setActivityFilter] = useState<"all" | "work" | "energy" | "chill">("all");
  const [cursorCoord, setCursorCoord] = useState<{ x: number; y: number } | null>(null);

  const handleActivity = (key: string) => {
    const next = selectedActivity === key ? undefined : key;
    onContextChange(selectedMood, next);
  };

  const handleMood = (key: string) => {
    const next = selectedMood === key ? undefined : key;
    onContextChange(next, selectedActivity);
    if (next && MOOD_META[next]) {
      setCursorCoord({ x: MOOD_META[next].planeX, y: MOOD_META[next].planeY });
    } else {
      setCursorCoord(null);
    }
  };

  const handlePlaneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorCoord({ x: xPct, y: yPct });

    let targetMood = "happy";
    if (xPct >= 50 && yPct < 50) targetMood = "happy";
    else if (xPct < 50 && yPct < 50) targetMood = "intense";
    else if (xPct < 50 && yPct >= 50) targetMood = "sad";
    else targetMood = "calm";

    onContextChange(targetMood, selectedActivity);
  };

  const handleWeight = (key: keyof HybridWeights, rawValue: number) => {
    onWeightsChange({ ...weights, [key]: rawValue / 100 });
  };

  const clearAllContext = () => {
    onContextChange(undefined, undefined);
    setCursorCoord(null);
  };

  const filteredActivities = activities.filter((act) => {
    if (activityFilter === "all") return true;
    return ACTIVITY_META[act.key]?.category === activityFilter;
  });

  return (
    <div className={styles.panel}>
      {/* ── Active Context Summary ── */}
      {(selectedActivity || selectedMood) && (
        <div className={styles.activeSummary}>
          <div className={styles.summaryTop}>
            <span className={styles.summaryLabel}>Active Context Target</span>
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={clearAllContext}
              aria-label="Clear active context filters"
            >
              Clear filters
            </button>
          </div>
          <div className={styles.summaryTags}>
            {selectedActivity && (
              <span className={styles.summaryTag}>
                {renderActivityIcon(selectedActivity)}
                <span>{activities.find((a) => a.key === selectedActivity)?.name}</span>
              </span>
            )}
            {selectedMood && (
              <span className={styles.summaryTagMood}>
                {renderMoodQuadrantIcon(selectedMood)}
                <span>{moods.find((m) => m.key === selectedMood)?.name.split("/")[0].trim()}</span>
                <span className={styles.coordSub}>{MOOD_META[selectedMood]?.coord}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Mood Selector (Russell Circumplex) ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Compass size={16} className={styles.titleIcon} />
            <span>Mood Quadrants</span>
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

        {/* 4 Quadrants Grid */}
        <div className={styles.moodGrid}>
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.key;
            const meta = MOOD_META[mood.key] ?? {
              coord: "2D",
              quadrant: "Q",
              subtitle: mood.description,
              energyLevel: "Adaptive",
              valenceLevel: "Adaptive",
              styleClass: "",
              activeClass: "",
              planeX: 50,
              planeY: 50,
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
                  <div className={styles.moodEmojiBox}>{renderMoodQuadrantIcon(mood.key)}</div>
                  <span className={styles.moodCoord}>{meta.coord}</span>
                </div>
                <div className={styles.moodTitleRow}>
                  <span className={styles.moodName}>{mood.name.split("/")[0].trim()}</span>
                  <span className={styles.quadrantPill}>{meta.quadrant}</span>
                </div>
                <span className={styles.moodDesc}>{meta.subtitle}</span>

                {/* Energy & Valence Micro-indicators */}
                <div className={styles.moodMetrics}>
                  <span className={styles.microMeter}>
                    <Zap size={10} className={styles.microIcon} />
                    <span>{meta.energyLevel}</span>
                  </span>
                  <span className={styles.microMeter}>
                    <Sparkles size={10} className={styles.microIcon} />
                    <span>{meta.valenceLevel}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 2D Circumplex Interactive Plane */}
        <div className={styles.mapWrapper}>
          <div className={styles.mapTitle}>
            <span>2D Affective Plane</span>
            <span className={styles.mapHintText}>Click to target coordinate</span>
          </div>
          <div
            className={styles.quadrantMap}
            onClick={handlePlaneClick}
            role="region"
            aria-label="Interactive 2D Russell Circumplex Plane"
          >
            {/* Crosshair Axes */}
            <div className={styles.axisX} />
            <div className={styles.axisY} />

            {/* Axis Labels */}
            <span className={styles.axisLabelTop}>High Energy (+E)</span>
            <span className={styles.axisLabelBottom}>Low Energy (-E)</span>
            <span className={styles.axisLabelLeft}>- Valence</span>
            <span className={styles.axisLabelRight}>+ Valence</span>

            {/* 4 Quadrant zones */}
            <div className={`${styles.zone} ${styles.zoneIntense} ${selectedMood === "intense" ? styles.zoneActive : ""}`}>
              <span className={styles.zoneTag}>
                <Flame size={11} /> Intense
              </span>
            </div>
            <div className={`${styles.zone} ${styles.zoneHappy} ${selectedMood === "happy" ? styles.zoneActive : ""}`}>
              <span className={styles.zoneTag}>
                <Smile size={11} /> Happy
              </span>
            </div>
            <div className={`${styles.zone} ${styles.zoneSad} ${selectedMood === "sad" ? styles.zoneActive : ""}`}>
              <span className={styles.zoneTag}>
                <CloudRain size={11} /> Melancholy
              </span>
            </div>
            <div className={`${styles.zone} ${styles.zoneCalm} ${selectedMood === "calm" ? styles.zoneActive : ""}`}>
              <span className={styles.zoneTag}>
                <Wind size={11} /> Calm
              </span>
            </div>

            {/* Glowing Coordinate Puck */}
            {(cursorCoord || selectedMood) && (
              <div
                className={styles.targetPuck}
                style={{
                  left: `${cursorCoord ? cursorCoord.x : (MOOD_META[selectedMood!]?.planeX ?? 50)}%`,
                  top: `${cursorCoord ? cursorCoord.y : (MOOD_META[selectedMood!]?.planeY ?? 50)}%`,
                }}
              >
                <span className={styles.puckDot} />
                <span className={styles.puckRing} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Activity Selector ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <ActivityIcon size={16} className={styles.titleIcon} />
            <span>Activity Alignment</span>
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

        {/* Category Filter Pills */}
        <div className={styles.categoryFilters} role="tablist" aria-label="Activity Categories">
          <button
            type="button"
            className={`${styles.filterPill} ${activityFilter === "all" ? styles.filterPillActive : ""}`}
            onClick={() => setActivityFilter("all")}
          >
            <Layers size={11} />
            <span>All (8)</span>
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${activityFilter === "work" ? styles.filterPillActive : ""}`}
            onClick={() => setActivityFilter("work")}
          >
            <Briefcase size={11} />
            <span>Work</span>
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${activityFilter === "energy" ? styles.filterPillActive : ""}`}
            onClick={() => setActivityFilter("energy")}
          >
            <Zap size={11} />
            <span>Energy</span>
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${activityFilter === "chill" ? styles.filterPillActive : ""}`}
            onClick={() => setActivityFilter("chill")}
          >
            <Moon size={11} />
            <span>Chill</span>
          </button>
        </div>

        {/* Activity Grid */}
        <div className={styles.activityGrid}>
          {filteredActivities.map((act) => {
            const isSelected = selectedActivity === act.key;
            const meta = ACTIVITY_META[act.key] ?? {
              category: "work",
              cue: "Adaptive profile",
              metric: "Dynamic Acoustic",
              energyBars: 2,
            };
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
                  <div className={styles.activityIconBox}>{renderActivityIcon(act.key)}</div>
                  <div className={styles.energyIndicator} title={`Energy Intensity: ${meta.energyBars}/3`}>
                    {[1, 2, 3].map((b) => (
                      <span
                        key={b}
                        className={`${styles.energyDot} ${b <= meta.energyBars ? styles.energyDotFilled : ""}`}
                      />
                    ))}
                  </div>
                  {isSelected && (
                    <span className={styles.activeDot}>
                      <Check size={10} />
                    </span>
                  )}
                </div>

                <div className={styles.activityInfo}>
                  <span className={styles.activityLabel}>{act.name}</span>
                  <span className={styles.activityCue}>{meta.cue}</span>
                  <span className={styles.activityMetric}>{meta.metric}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Hybrid Weight Sliders ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <SlidersHorizontal size={16} className={styles.titleIcon} />
            <span>Hybrid Formula Weights</span>
          </h3>
        </div>
        <p className={styles.sectionHint}>Balance ML signals in real time</p>
        <div className={styles.sliders}>
          {WEIGHT_CONFIG.map(({ key, label, icon: IconComponent, description, color }) => (
            <div key={key} className={styles.sliderRow}>
              <div className={styles.sliderMeta}>
                <span className={styles.sliderLabel} style={{ color }}>
                  <IconComponent size={12} className={styles.sliderIcon} />
                  <span>{label}</span>
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

