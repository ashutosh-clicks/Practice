"use client";

import { useState, useEffect } from "react";
import { AlbumArtStatus, ImportArtResponse } from "@/types";
import { getAlbumArtStatus, importLastFmArt } from "@/lib/api";
import { X, Download, Info, Check, AlertCircle } from "lucide-react";
import styles from "./LastFmImportModal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export default function LastFmImportModal({ isOpen, onClose, onImportComplete }: Props) {
  const [status, setStatus] = useState<AlbumArtStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [batchLimit, setBatchLimit] = useState(50);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportArtResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAlbumArtStatus().then(setStatus).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await importLastFmArt(apiKey.trim() || undefined, batchLimit);
      setResult(res);
      const updated = await getAlbumArtStatus();
      setStatus(updated);
      onImportComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import artwork");
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  const total = status?.total_tracks ?? 81344;
  const cached = status?.cached_count ?? 0;
  const pct = Math.min(100, Math.round((cached / Math.max(1, total)) * 100));

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Last.fm Album Art Importer">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.badge}>Last.fm Integration</div>
            <h2 className={styles.title}>Album Artwork Importer</h2>
            <p className={styles.subtitle}>
              Fetch high-resolution official album covers from Last.fm API with iTunes metadata fallback.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {/* Status Metric Grid */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Total Catalog</span>
              <span className={styles.metricVal}>{total.toLocaleString()}</span>
              <span className={styles.metricSub}>Indexed Tracks</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Art Cached</span>
              <span className={styles.metricVal}>{cached.toLocaleString()}</span>
              <span className={styles.metricSub}>{pct}% of Library</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Sources</span>
              <span className={styles.metricVal}>Last.fm</span>
              <span className={styles.metricSub}>+ iTunes 600px Fallback</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Catalog Artwork Coverage</span>
              <span className={styles.progressVal}>{cached} tracks ready</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.max(5, Math.min(100, (cached / 500) * 100))}%` }}
              />
            </div>
          </div>

          {/* API Key & Batch Settings */}
          <div className={styles.formSection}>
            <label className={styles.fieldLabel} htmlFor="lastfm-key-input">
              <span>Last.fm API Key (Optional)</span>
              <span className={styles.fieldHint}>Leave empty to use automatic high-res fallback</span>
            </label>
            <input
              id="lastfm-key-input"
              type="text"
              className={styles.keyInput}
              placeholder="e.g. 4a65b8c... (Optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isImporting}
            />

            <div className={styles.batchRow}>
              <span className={styles.fieldLabel}>Import Quantity:</span>
              <div className={styles.batchOptions}>
                {[25, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    className={`${styles.batchBtn} ${batchLimit === qty ? styles.batchBtnActive : ""}`}
                    onClick={() => setBatchLimit(qty)}
                    disabled={isImporting}
                  >
                    Top {qty} Tracks
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Import Result Feedback */}
          {result && (
            <div className={styles.successBanner} role="alert">
              <Check size={16} className={styles.bannerIcon} />
              <span>Successfully imported <strong>{result.newly_imported}</strong> new album covers! (Total cached: {result.total_cached})</span>
            </div>
          )}

          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={16} className={styles.bannerIcon} />
              <span>{error}</span>
            </div>
          )}

          {/* Educational Explainer */}
          <div className={styles.explainer}>
            <div className={styles.explainerIcon}>
              <Info size={18} />
            </div>
            <div className={styles.explainerText}>
              <h4 className={styles.explainerHeading}>How Last.fm Artwork Resolution Works</h4>
              <p className={styles.explainerParagraph}>
                find.fm calls Last.fm&apos;s <code>track.getInfo</code> and <code>album.getInfo</code> endpoints to parse extralarge image URIs. When a track is indie or unindexed on Last.fm, the system seamlessly queries the iTunes Search API to fetch 600×600 high-resolution album artwork, guaranteeing zero broken images.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.secondaryBtn} onClick={onClose} disabled={isImporting}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.importBtn}
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <span className={styles.spinner} />
                <span>Importing Artwork...</span>
              </>
            ) : (
              <>
                <Download size={14} className={styles.btnIcon} />
                <span>Import Top {batchLimit} Covers</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
