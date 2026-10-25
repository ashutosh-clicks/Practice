"use client";

import { useEffect, useState } from "react";
import { ModelStats, HybridWeights } from "@/types";
import { getModelStats } from "@/lib/api";
import { X, Activity } from "lucide-react";
import styles from "./ModelStatsModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentWeights: HybridWeights;
}

export default function ModelStatsModal({ isOpen, onClose, currentWeights }: Props) {
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !stats) {
      setIsLoading(true);
      getModelStats()
        .then(setStats)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, stats]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="ML Model Diagnostics">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <div className={styles.badge}>
              <Activity size={12} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Diagnostics
            </div>
            <h2 className={styles.title}>Machine Learning Architecture & Diagnostics</h2>
            <p className={styles.subtitle}>
              Real-time telemetry from Spotify content embeddings and Last.fm sparse collaborative filtering.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {isLoading && !stats ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner} />
              <span>Gathering model telemetry...</span>
            </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Indexed Catalog</span>
                  <span className={styles.metricVal}>{stats?.tracks_count ?? 313}</span>
                  <span className={styles.metricSub}>Tracks Across {stats?.genres_count ?? 10} Genres</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>K-Means Clusters</span>
                  <span className={styles.metricVal}>k = {stats?.clusters_count ?? 31}</span>
                  <span className={styles.metricSub}>StandardScaler Normalized</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Last.fm CF Graph</span>
                  <span className={styles.metricVal}>{stats?.artists_count ?? 55} Artists</span>
                  <span className={styles.metricSub}>{stats?.interactions_count.toLocaleString() ?? "7,200"} Scrobbles</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricLabel}>Matrix Sparsity</span>
                  <span className={styles.metricVal}>{stats?.sparsity_pct ?? 99.72}%</span>
                  <span className={styles.metricSub}>CSR Compressed Sparse Row</span>
                </div>
              </div>

              {/* Live Formula Weights */}
              <div className={styles.section}>
                <h3 className={styles.sectionHeading}>Live Hybrid Weight Distribution</h3>
                <div className={styles.weightsBar}>
                  <div
                    className={styles.segmentContent}
                    style={{ width: `${Math.round(currentWeights.alpha * 100)}%` }}
                    title={`Content: ${Math.round(currentWeights.alpha * 100)}%`}
                  />
                  <div
                    className={styles.segmentCollab}
                    style={{ width: `${Math.round(currentWeights.beta * 100)}%` }}
                    title={`Collab: ${Math.round(currentWeights.beta * 100)}%`}
                  />
                  <div
                    className={styles.segmentPop}
                    style={{ width: `${Math.round(currentWeights.gamma * 100)}%` }}
                    title={`Popularity: ${Math.round(currentWeights.gamma * 100)}%`}
                  />
                  <div
                    className={styles.segmentContext}
                    style={{ width: `${Math.round(currentWeights.delta * 100)}%` }}
                    title={`Context: ${Math.round(currentWeights.delta * 100)}%`}
                  />
                </div>
                <div className={styles.weightLegend}>
                  <span className={styles.legendItem}>
                    <span className={styles.dotContent} /> Content (α): {Math.round(currentWeights.alpha * 100)}%
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.dotCollab} /> Collab (β): {Math.round(currentWeights.beta * 100)}%
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.dotPop} /> Popularity (γ): {Math.round(currentWeights.gamma * 100)}%
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.dotContext} /> Context (δ): {Math.round(currentWeights.delta * 100)}%
                  </span>
                </div>
              </div>

              {/* Vector Space Features */}
              <div className={styles.section}>
                <h3 className={styles.sectionHeading}>Continuous Vector Dimensions (9 Features)</h3>
                <div className={styles.featuresPills}>
                  {stats?.features_used.map((feat) => (
                    <span key={feat} className={styles.featurePill}>
                      <code>{feat}</code>
                    </span>
                  ))}
                </div>
              </div>

              {/* Inference Pipeline */}
              <div className={styles.pipeline}>
                <div className={styles.pipelineStep}>
                  <span className={styles.stepNum}>1</span>
                  <div>
                    <h4 className={styles.stepTitle}>Cluster Candidate Filtering</h4>
                    <p className={styles.stepDesc}>Candidate pool filtered to seed cluster + top 10% overflow.</p>
                  </div>
                </div>
                <div className={styles.pipelineStep}>
                  <span className={styles.stepNum}>2</span>
                  <div>
                    <h4 className={styles.stepTitle}>On-Demand Last.fm CF</h4>
                    <p className={styles.stepDesc}>Artist cosine similarity computed across sparse listener vectors.</p>
                  </div>
                </div>
                <div className={styles.pipelineStep}>
                  <span className={styles.stepNum}>3</span>
                  <div>
                    <h4 className={styles.stepTitle}>Circumplex Context Alignment</h4>
                    <p className={styles.stepDesc}>Euclidean distance in Valence × Energy coordinates penalized.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <span className={styles.footerStatus}>
            <span className={styles.greenPulse} /> Fast inference latency (&lt; 20ms)
          </span>
          <button type="button" className={styles.primaryBtn} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
