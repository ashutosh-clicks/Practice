"use client";

import { Track, Badge } from "@/types";
import styles from "./SongTile.module.css";

interface Props {
  track: Track;
  rank: number;
  onSelectAsSeed?: (track: Track) => void;
  onExplain?: (track: Track) => void;
}

const BADGE_STYLES: Record<string, string> = {
  content: styles.badgeContent,
  collaborative: styles.badgeCollab,
  context: styles.badgeContext,
  trending: styles.badgeTrending,
};

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function SongTile({ track, rank, onSelectAsSeed, onExplain }: Props) {
  // Compute overall score out of 100
  const scoreRaw = track.scores?.total ?? (track.popularity / 100);
  const score100 = Math.round(scoreRaw * 100);

  const scoreColorClass =
    score100 >= 80 ? styles.scoreHigh : score100 >= 65 ? styles.scoreMedium : styles.scoreLow;

  return (
    <div className={styles.tile} role="listitem">
      {/* Rank number */}
      <span className={styles.rank}>#{String(rank).padStart(2, "0")}</span>

      {/* Art + Title + Artists + Metadata */}
      <div className={styles.leftSection}>
        <div className={styles.art} aria-hidden="true">
          🎵
        </div>
        <div className={styles.trackDetails}>
          <div className={styles.titleRow}>
            <h3 className={styles.trackName} title={track.track_name}>
              {track.track_name}
            </h3>
            <span title={track.mood}>{track.mood_emoji}</span>
          </div>
          <div className={styles.artistRow}>
            <span className={styles.artists} title={track.artists}>
              {track.artists}
            </span>
            {track.genre && (
              <>
                <span className={styles.bullet}>•</span>
                <span className={styles.genrePill}>{track.genre}</span>
              </>
            )}
            {track.duration_ms > 0 && (
              <>
                <span className={styles.bullet}>•</span>
                <span>{formatDuration(track.duration_ms)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      {track.badges && track.badges.length > 0 && (
        <div className={styles.middleSection} aria-label="Recommendation signals">
          {track.badges.map((badge: Badge, i: number) => (
            <span
              key={i}
              className={`${styles.badge} ${BADGE_STYLES[badge.type] ?? ""}`}
              title={badge.label}
            >
              <span>{badge.emoji}</span>
              <span>{badge.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Score / 100 + Action buttons */}
      <div className={styles.rightSection}>
        <div className={styles.scoreGauge} title={`Hybrid Match Score: ${score100}/100`}>
          <span className={`${styles.scoreValue} ${scoreColorClass}`}>{score100}</span>
          <span className={styles.scoreMax}>/ 100</span>
        </div>

        <div className={styles.actions}>
          {onExplain && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => onExplain(track)}
              aria-label={`Explain why ${track.track_name} was recommended`}
              title="Inspect ML signals and audio feature match"
            >
              💡 Why?
            </button>
          )}

          {onSelectAsSeed && (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.seedBtn}`}
              onClick={() => onSelectAsSeed(track)}
              aria-label={`Use ${track.track_name} as new seed`}
              title="Set as seed track for new recommendations"
            >
              🎯 Seed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
