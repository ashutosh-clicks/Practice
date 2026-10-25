"use client";

import { Track } from "@/types";
import SongCard from "./SongCard";
import styles from "./RecommendationGrid.module.css";

interface Props {
  tracks: Track[];
  isLoading: boolean;
}

export default function RecommendationGrid({ tracks, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading recommendations">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={styles.skeleton} aria-hidden="true">
            <div className={styles.skeletonArt} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} style={{ width: "70%" }} />
              <div className={styles.skeletonLine} style={{ width: "45%" }} />
              <div className={styles.skeletonLine} style={{ width: "55%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <div className={styles.grid} role="list" aria-label="Recommended tracks">
      {tracks.map((track, i) => (
        <div key={track.track_id} className={styles.item} role="listitem" style={{ animationDelay: `${i * 50}ms` }}>
          <SongCard track={track} variant="full" />
        </div>
      ))}
    </div>
  );
}
