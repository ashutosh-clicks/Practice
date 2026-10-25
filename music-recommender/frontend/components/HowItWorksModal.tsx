"use client";

import { useEffect, useRef } from "react";
import { X, Music, Users, Compass } from "lucide-react";
import styles from "./HowItWorksModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowItWorksModal({ isOpen, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      modalRef.current?.focus();
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div>
            <h2 id="modal-title" className={styles.title}>
              How find.fm Works
            </h2>
            <p className={styles.subtitle}>
              Full-Stack Hybrid Machine Learning Recommendation Architecture
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Hybrid Formula Box */}
          <div className={styles.formulaBox}>
            <div className={styles.formulaTitle}>Multi-Signal Hybrid Score Formula</div>
            <div className={styles.formulaCode}>
              Score = 100 × (α·Content + β·Collab + γ·Popularity + δ·Context)
            </div>
            <p className={styles.formulaNotes}>
              Weights α, β, γ, δ are dynamically tunable via the left sidebar sliders or header presets.
            </p>
          </div>

          {/* Signal 1: Content K-Means */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Music size={18} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>1. Content-Based Audio Clustering (Spotify)</h3>
              <p className={styles.cardDesc}>
                Each track is represented as a 9-dimensional acoustic feature vector (danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence, tempo). An unsupervised <strong>K-Means model</strong> partitions songs into cohesive sonic clusters, and candidate similarity is computed via cosine similarity.
              </p>
            </div>
          </div>

          {/* Signal 2: Collaborative Filtering */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Users size={18} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>2. Item-Based Collaborative Filtering (Last.fm)</h3>
              <p className={styles.cardDesc}>
                Using real user-artist scrobble histories from the Last.fm HetRec dataset, a log-normalized sparse matrix maps listening patterns. When a track is selected, the engine queries its artist affinity vector against thousands of other artists on-demand to recommend songs loved by listeners with similar musical taste.
              </p>
            </div>
          </div>

          {/* Signal 3: Russell's Circumplex Mood Model */}
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <Compass size={18} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>3. Russell&apos;s Circumplex Mood & Activity Engine</h3>
              <p className={styles.cardDesc}>
                Based on psychological research in affective computing, songs are mapped onto a 2D Valence (pleasantness) × Energy (arousal) plane into 4 mood quadrants (Happy, Calm, Melancholic, Intense) alongside 8 specialized target activity profiles (Deep Focus, Workout, Sleep, Party, etc.).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

