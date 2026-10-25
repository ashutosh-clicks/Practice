"use client";

import { Track } from "@/types";
import SongTile from "./SongTile";
import styles from "./RecommendationGrid.module.css";

interface Props {
  tracks: Track[];
  isLoading: boolean;
  onExplain?: (track: Track) => void;
  onSelectAsSeed?: (track: Track) => void;
}

export default function RecommendationGrid({
  tracks,
  isLoading,
  onExplain,
  onSelectAsSeed,
}: Props) {
  if (isLoading) {
    return (
      <div className={styles.tilesContainer} aria-busy="true" aria-label="Loading recommendations">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonTile} aria-hidden="true">
            <div className={styles.skeletonRank} />
            <div className={styles.skeletonArt} />
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonLine} style={{ width: "40%" }} />
              <div className={styles.skeletonLine} style={{ width: "25%" }} />
            </div>
            <div className={styles.skeletonScore} />
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <div className={styles.tilesContainer} role="list" aria-label="Recommended tracks list">
      {tracks.map((track, i) => (
        <div
          key={track.track_id}
          className={styles.item}
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <SongTile
            track={track}
            rank={i + 1}
            onExplain={onExplain}
            onSelectAsSeed={onSelectAsSeed}
          />
        </div>
      ))}
    </div>
  );
}
