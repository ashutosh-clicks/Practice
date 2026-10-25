"use client";

import { useEffect, useRef } from "react";
import { ExplanationData } from "@/types";
import { X, ArrowRight, Lightbulb, Check } from "lucide-react";
import styles from "./ExplanationModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ExplanationData | null;
  isLoading: boolean;
}

export default function ExplanationModal({ isOpen, onClose, data, isLoading }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
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
              Recommendation Breakdown
            </h2>
            <p className={styles.subtitle}>
              Explainable AI insights from K-Means, Last.fm CF, and Context profiles
            </p>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !data ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner} />
            <span>Analyzing feature vectors and listening affinity...</span>
          </div>
        ) : (
          <div className={styles.body}>
            <div className={styles.tracksComparison}>
              <div className={styles.trackBox}>
                <span className={styles.trackLabel}>Seed Song</span>
                <p className={styles.trackName} title={data.seed_track.track_name}>
                  {data.seed_track.track_name}
                </p>
                <p className={styles.artistName}>{data.seed_track.artists}</p>
              </div>
              <span className={styles.arrow} aria-hidden="true">
                <ArrowRight size={18} />
              </span>
              <div className={styles.trackBox}>
                <span className={styles.trackLabel}>Recommended</span>
                <p className={styles.trackName} title={data.recommended_track.track_name}>
                  {data.recommended_track.track_name}
                </p>
                <p className={styles.artistName}>{data.recommended_track.artists}</p>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Key Algorithmic Signals</h3>
              <ul className={styles.reasonList}>
                {data.reasons.map((reason, i) => (
                  <li key={i} className={styles.reasonItem}>
                    <span className={styles.reasonIcon} aria-hidden="true">
                      <Lightbulb size={15} />
                    </span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Acoustic Profile Alignment</h3>
              <table className={styles.featureTable}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Seed</th>
                    <th>Rec</th>
                    <th>Alignment</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.feature_comparison).map(([feat, comp]) => (
                    <tr key={feat}>
                      <td className={styles.featureName}>{feat}</td>
                      <td>{feat === "tempo" ? comp.seed.toFixed(1) : (comp.seed * 100).toFixed(0) + "%"}</td>
                      <td>{feat === "tempo" ? comp.recommended.toFixed(1) : (comp.recommended * 100).toFixed(0) + "%"}</td>
                      <td>
                        {comp.similar ? (
                          <span className={styles.matchPill}>
                            <Check size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                            Strong Match
                          </span>
                        ) : (
                          <span className={styles.complementaryPill}>Complementary</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
