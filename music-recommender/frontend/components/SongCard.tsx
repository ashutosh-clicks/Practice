"use client";

import { Track, Badge } from "@/types";
import FeatureRadarChart from "./FeatureRadarChart";
import styles from "./SongCard.module.css";

interface Props {
  track: Track;
  variant?: "compact" | "full" | "seed";
  onClick?: () => void;
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

export default function SongCard({ track, variant = "full", onClick }: Props) {
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
      {/* Album art placeholder */}
      <div className={styles.artWrapper}>
        <div className={styles.art} aria-hidden="true">
          <span className={styles.artIcon}>🎵</span>
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
          <span className={styles.moodBadge} title={track.mood}>
            {track.mood_emoji}
          </span>
        </div>

        {/* Meta row */}
        <div className={styles.meta}>
          {track.genre && <span className={styles.pill}>{track.genre}</span>}
          <span className={styles.metaItem}>⭐ {track.popularity}</span>
          {track.duration_ms > 0 && (
            <span className={styles.metaItem}>⏱ {formatDuration(track.duration_ms)}</span>
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
                {badge.emoji} {badge.label}
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
      </div>
    </article>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={styles.scoreRow}>
      <span className={styles.scoreLabel}>{label}</span>
      <div className={styles.scoreTrack}>
        <div
          className={styles.scoreFill}
          style={{ width: `${Math.round(value * 100)}%`, background: color }}
        />
      </div>
      <span className={styles.scoreValue}>{(value * 100).toFixed(0)}%</span>
    </div>
  );
}
