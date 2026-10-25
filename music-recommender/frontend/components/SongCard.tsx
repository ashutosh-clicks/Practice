"use client";

import { Track, Badge } from "@/types";
import {
  Star,
  Clock,
  Disc,
  Smile,
  Wind,
  CloudRain,
  Flame,
  CircleDot,
  Music,
  Users,
  Zap,
  TrendingUp,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import FeatureRadarChart from "./FeatureRadarChart";
import styles from "./SongCard.module.css";

interface Props {
  track: Track;
  variant?: "compact" | "full" | "seed";
  onClick?: () => void;
  onExplain?: () => void;
}

const BADGE_STYLES: Record<string, string> = {
  content:       styles.badgeContent,
  collaborative: styles.badgeCollab,
  context:       styles.badgeContext,
  trending:      styles.badgeTrending,
};

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function renderMoodIcon(moodKey?: string) {
  switch (moodKey) {
    case "happy":
      return <Smile size={14} className={styles.moodIcon} />;
    case "calm":
      return <Wind size={14} className={styles.moodIcon} />;
    case "sad":
      return <CloudRain size={14} className={styles.moodIcon} />;
    case "intense":
    case "angry":
      return <Flame size={14} className={styles.moodIcon} />;
    default:
      return <CircleDot size={14} className={styles.moodIcon} />;
  }
}

function renderBadgeIcon(type: string) {
  switch (type) {
    case "content":
      return <Music size={11} className={styles.badgeIcon} />;
    case "collaborative":
      return <Users size={11} className={styles.badgeIcon} />;
    case "context":
      return <Zap size={11} className={styles.badgeIcon} />;
    case "trending":
      return <TrendingUp size={11} className={styles.badgeIcon} />;
    default:
      return <Sparkles size={11} className={styles.badgeIcon} />;
  }
}

export default function SongCard({ track, variant = "full", onClick, onExplain }: Props) {
  const isClickable = !!onClick;
  const isSeed = variant === "seed";
  const isCompact = variant === "compact";

  return (
    <article
      className={`${styles.card} ${isSeed ? styles.cardSeed : ""} ${isCompact ? styles.cardCompact : ""} ${isClickable ? styles.cardClickable : ""}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === "Enter" && onClick?.() : undefined}
      aria-label={isClickable ? `Select ${track.track_name} by ${track.artists}` : undefined}
    >
      {/* Album art */}
      <div className={styles.artWrapper}>
        <div className={styles.art} aria-hidden="true">
          {track.image_url ? (
            <img src={track.image_url} alt="" className={styles.albumImg} loading="lazy" />
          ) : (
            <Disc size={28} className={styles.discFallback} />
          )}
        </div>
        {isSeed && <div className={styles.seedPulse} aria-hidden="true" />}
      </div>

      <div className={styles.info}>
        {/* Title row */}
        <div className={styles.titleRow}>
          <div>
            <h3 className={styles.trackName}>{track.track_name}</h3>
            <p className={styles.artists}>{track.artists}</p>
          </div>
          <span className={styles.moodBadge} title={`Mood: ${track.mood}`}>
            {renderMoodIcon(track.mood_key)}
          </span>
        </div>

        {/* Meta row */}
        <div className={styles.meta}>
          {track.genre && <span className={styles.pill}>{track.genre}</span>}
          <span className={styles.metaItem}>
            <Star size={11} className={styles.metaIcon} />
            <span>{track.popularity}</span>
          </span>
          {track.duration_ms > 0 && (
            <span className={styles.metaItem}>
              <Clock size={11} className={styles.metaIcon} />
              <span>{formatDuration(track.duration_ms)}</span>
            </span>
          )}
          {track.explicit && <span className={styles.explicitPill}>E</span>}
        </div>

        {/* Recommendation badges */}
        {track.badges && track.badges.length > 0 && (
          <div className={styles.badges} role="list" aria-label="Recommendation reasons">
            {track.badges.map((badge: Badge, i: number) => (
              <span
                key={i}
                className={`${styles.badge} ${BADGE_STYLES[badge.type] ?? ""}`}
                role="listitem"
                title={badge.label}
              >
                {renderBadgeIcon(badge.type)}
                <span>{badge.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Radar chart on full / seed cards */}
        {!isCompact && (
          <div className={styles.radarWrapper}>
            <FeatureRadarChart features={track.features} />
          </div>
        )}

        {/* Score breakdown (seed shows nothing, recs show scores) */}
        {track.scores && !isSeed && (
          <div className={styles.scores}>
            <ScoreBar label="Content" value={track.scores.content} color="var(--badge-content-text)" />
            <ScoreBar label="Collab" value={track.scores.collaborative} color="var(--badge-collab-text)" />
            <ScoreBar label="Context" value={track.scores.context} color="var(--badge-context-text)" />
          </div>
        )}

        {/* Explain match button */}
        {onExplain && !isSeed && (
          <button
            type="button"
            className={styles.explainButton}
            onClick={(e) => {
              e.stopPropagation();
              onExplain();
            }}
            aria-label={`Explain why ${track.track_name} was recommended`}
          >
            <HelpCircle size={13} className={styles.explainIcon} />
            <span>Why recommended?</span>
          </button>
        )}
      </div>
    </article>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const clampedPct = Math.min(100, Math.max(0, Math.round(value * 100)));
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <div className={styles.scoreTrack}>
        <div
          className={styles.scoreFill}
          style={{ width: `${clampedPct}%`, background: color }}
        />
      </div>
      <span className={styles.scoreValue}>{clampedPct}%</span>
    </div>
  );
}
