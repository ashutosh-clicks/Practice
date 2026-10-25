"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserProfileData,
  TrendPeriod,
  ProfileArtist,
  ProfileTrack,
  ProfileAlbum,
  TrendPoint,
} from "@/types";
import { getUserProfile } from "@/lib/api";
import {
  User,
  Calendar,
  Clock,
  Music,
  Flame,
  Activity,
  Sparkles,
  Search,
  ExternalLink,
  Target,
  Key,
  Radio,
  Disc,
  Smile,
  Compass,
  TrendingUp,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import styles from "./ProfileView.module.css";

interface Props {
  onSelectSeed?: (query: string, searchBy: "track" | "artist" | "all") => void;
}

const SAMPLE_USERS = [
  { username: "RJ", label: "RJ (Last.fm Founder)" },
  { username: "musiclover", label: "musiclover" },
  { username: "scrobbler99", label: "scrobbler99" },
];

export default function ProfileView({ onSelectSeed }: Props) {
  const [usernameInput, setUsernameInput] = useState("RJ");
  const [activeUsername, setActiveUsername] = useState("RJ");
  const [period, setPeriod] = useState<TrendPeriod>("weekly");
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  // Fetch user profile on username or period change
  const fetchProfile = useCallback(
    async (userToFetch: string, periodToFetch: TrendPeriod) => {
      if (!userToFetch.trim()) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserProfile(
          userToFetch,
          periodToFetch,
          customKey.trim() || undefined
        );
        setProfileData(data);
        setActiveUsername(userToFetch);
      } catch (err: unknown) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "Failed to load Last.fm profile";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [customKey]
  );

  useEffect(() => {
    fetchProfile(activeUsername, period);
  }, [fetchProfile, activeUsername, period]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setActiveUsername(usernameInput.trim());
    }
  };

  const handlePeriodChange = (newPeriod: TrendPeriod) => {
    setPeriod(newPeriod);
  };

  const handleSeedTrack = (track: ProfileTrack) => {
    if (onSelectSeed) {
      onSelectSeed(track.name, "track");
    }
  };

  const handleSeedArtist = (artist: ProfileArtist) => {
    if (onSelectSeed) {
      onSelectSeed(artist.name, "artist");
    }
  };

  // SVG Chart Dimensions & Calculations
  const chartPoints = profileData?.trends.points || [];
  const maxScrobbles = useMemo(() => {
    if (chartPoints.length === 0) return 100;
    const maxVal = Math.max(...chartPoints.map((p) => p.scrobbles));
    return Math.max(10, Math.ceil(maxVal * 1.2));
  }, [chartPoints]);

  const svgWidth = 680;
  const svgHeight = 220;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const coords = useMemo(() => {
    if (chartPoints.length === 0) return [];
    return chartPoints.map((p, i) => {
      const x =
        padding.left +
        (chartPoints.length > 1
          ? (i / (chartPoints.length - 1)) * graphWidth
          : graphWidth / 2);
      const y =
        padding.top +
        graphHeight -
        (p.scrobbles / maxScrobbles) * graphHeight;
      return { x, y, point: p };
    });
  }, [chartPoints, maxScrobbles, graphWidth, graphHeight, padding.left, padding.top]);

  // SVG Path strings
  const linePath = useMemo(() => {
    if (coords.length < 2) return "";
    return coords.reduce((acc, c, idx) => {
      if (idx === 0) return `M ${c.x} ${c.y}`;
      // Smooth cubic bezier curves
      const prev = coords[idx - 1];
      const cx1 = prev.x + (c.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (c.x - prev.x) / 2;
      const cy2 = c.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${c.x} ${c.y}`;
    }, "");
  }, [coords]);

  const areaPath = useMemo(() => {
    if (coords.length < 2) return "";
    const first = coords[0];
    const last = coords[coords.length - 1];
    const baselineY = padding.top + graphHeight;
    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [coords, linePath, graphHeight, padding.top]);

  // Average line Y coordinate
  const avgY = useMemo(() => {
    if (!profileData?.trends.average) return null;
    return (
      padding.top +
      graphHeight -
      (profileData.trends.average / maxScrobbles) * graphHeight
    );
  }, [profileData?.trends.average, maxScrobbles, graphHeight, padding.top]);

  return (
    <div className={styles.container}>
      {/* ── Header: Search & Sample Users ── */}
      <div className={styles.topBar}>
        <div className={styles.headerInfo}>
          <div className={styles.badgeRow}>
            <span className={styles.badgeScrobbler}>
              <Radio size={12} className={styles.pulseIcon} />
              Last.fm Scrobbler Profile
            </span>
          </div>
          <h1 className={styles.mainTitle}>Scrobbler Intelligence & Listening Trends</h1>
          <p className={styles.mainSubtitle}>
            Analyze your weekly, monthly, and yearly listening habits with real-time Last.fm scrobble data and find.fm acoustic vectors.
          </p>
        </div>

        <form className={styles.searchForm} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <User size={16} className={styles.inputIcon} />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter Last.fm username..."
              className={styles.usernameInput}
              aria-label="Last.fm username"
            />
          </div>
          <button
            type="submit"
            className={styles.fetchBtn}
            disabled={isLoading || !usernameInput.trim()}
          >
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                <Search size={15} />
                <span>Fetch Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Preset sample users */}
        <div className={styles.sampleChips}>
          <span className={styles.sampleLabel}>Quick switch:</span>
          {SAMPLE_USERS.map((sample) => (
            <button
              key={sample.username}
              type="button"
              className={`${styles.sampleChip} ${
                activeUsername.toLowerCase() === sample.username.toLowerCase()
                  ? styles.sampleChipActive
                  : ""
              }`}
              onClick={() => {
                setUsernameInput(sample.username);
                setActiveUsername(sample.username);
              }}
            >
              <User size={11} />
              {sample.label}
            </button>
          ))}
          <button
            type="button"
            className={styles.keyToggle}
            onClick={() => setShowKeyInput(!showKeyInput)}
            title="Custom Last.fm API Key (Optional)"
          >
            <Key size={11} />
            {showKeyInput ? "Hide API Key" : "Custom Key"}
          </button>
        </div>

        {showKeyInput && (
          <div className={styles.apiKeyRow}>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Optional personal Last.fm API key (defaults to find.fm live key)..."
              className={styles.apiKeyInput}
            />
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── User Profile Identity Strip ── */}
      {profileData && (
        <div className={styles.identityStrip}>
          <div className={styles.userBio}>
            <div className={styles.avatarBox}>
              {profileData.user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileData.user.avatar}
                  alt={profileData.user.username}
                  className={styles.avatarImg}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  <User size={28} />
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userTitleRow}>
                <h2 className={styles.username}>{profileData.user.username}</h2>
                <a
                  href={`https://www.last.fm/user/${profileData.user.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.lastfmLink}
                  title="View on Last.fm"
                >
                  <ExternalLink size={13} />
                  last.fm
                </a>
              </div>
              <p className={styles.userSub}>
                Member since {profileData.user.registered} •{" "}
                <span className={styles.highlightText}>
                  {profileData.user.total_playcount.toLocaleString()}
                </span>{" "}
                all-time scrobbles
              </p>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className={styles.periodTabs} role="tablist" aria-label="Listening trend timeframe">
            <button
              type="button"
              role="tab"
              aria-selected={period === "weekly"}
              className={`${styles.periodTab} ${period === "weekly" ? styles.periodTabActive : ""}`}
              onClick={() => handlePeriodChange("weekly")}
            >
              <Calendar size={13} />
              Weekly (7 Days)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={period === "monthly"}
              className={`${styles.periodTab} ${period === "monthly" ? styles.periodTabActive : ""}`}
              onClick={() => handlePeriodChange("monthly")}
            >
              <Calendar size={13} />
              Monthly (30 Days)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={period === "yearly"}
              className={`${styles.periodTab} ${period === "yearly" ? styles.periodTabActive : ""}`}
              onClick={() => handlePeriodChange("yearly")}
            >
              <Calendar size={13} />
              Yearly (12 Months)
            </button>
          </div>
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      {profileData && (
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap}>
              <Flame size={18} className={styles.kpiIconRed} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Period Scrobbles</span>
              <span className={styles.kpiValue}>
                {profileData.summary.period_scrobbles.toLocaleString()}
              </span>
              <span className={styles.kpiSub}>{profileData.period_label}</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap}>
              <Activity size={18} className={styles.kpiIconRed} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Daily Average</span>
              <span className={styles.kpiValue}>
                {profileData.summary.daily_average}
              </span>
              <span className={styles.kpiSub}>Scrobbles / Day</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap}>
              <Clock size={18} className={styles.kpiIconRed} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Estimated Time</span>
              <span className={styles.kpiValue}>
                {profileData.summary.listening_hours} hrs
              </span>
              <span className={styles.kpiSub}>Active playback</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap}>
              <Music size={18} className={styles.kpiIconRed} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Dominant Genre</span>
              <span className={styles.kpiValueTruncated} title={profileData.summary.top_genre}>
                {profileData.summary.top_genre}
              </span>
              <span className={styles.kpiSub}>find.fm audio index</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap}>
              <Smile size={18} className={styles.kpiIconRed} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Mood Alignment</span>
              <span className={styles.kpiValueTruncated} title={profileData.summary.mood_alignment}>
                {profileData.summary.mood_alignment}
              </span>
              <span className={styles.kpiSub}>Russell Circumplex</span>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrap}>
              <Sparkles size={18} className={styles.kpiIconRed} />
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>Artist Diversity</span>
              <span className={styles.kpiValue}>
                {profileData.summary.diversity_score}%
              </span>
              <span className={styles.kpiSub}>Unique artist ratio</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Trends Section ── */}
      {profileData && (
        <div className={styles.trendsLayout}>
          {/* Left Column: Visual Chart & Top Artists */}
          <div className={styles.trendsColLeft}>
            {/* Trend Chart */}
            <div className={styles.chartPanel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleGroup}>
                  <BarChart2 size={16} className={styles.panelIcon} />
                  <h3 className={styles.panelTitle}>Listening Volume Trend</h3>
                  <span className={styles.panelBadge}>{profileData.period_label}</span>
                </div>
                {profileData.trends.peak && (
                  <div className={styles.peakBadge}>
                    <TrendingUp size={12} />
                    Peak: {profileData.trends.peak.label} ({profileData.trends.peak.scrobbles} scrobbles)
                  </div>
                )}
              </div>

              {/* SVG Area & Bar Visualizer */}
              <div className={styles.svgContainer}>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className={styles.svgChart}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="crimsonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D51007" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#D51007" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#D51007" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D51007" floodOpacity="0.5" />
                    </filter>
                  </defs>

                  {/* Horizontal Guide Lines */}
                  {[0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const y = padding.top + graphHeight - frac * graphHeight;
                    const val = Math.round(frac * maxScrobbles);
                    return (
                      <g key={frac}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={svgWidth - padding.right}
                          y2={y}
                          className={styles.gridLine}
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 4}
                          className={styles.axisText}
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Average Line */}
                  {avgY !== null && (
                    <g>
                      <line
                        x1={padding.left}
                        y1={avgY}
                        x2={svgWidth - padding.right}
                        y2={avgY}
                        className={styles.avgLine}
                      />
                      <text
                        x={svgWidth - padding.right}
                        y={avgY - 6}
                        className={styles.avgText}
                        textAnchor="end"
                      >
                        avg {profileData.trends.average}
                      </text>
                    </g>
                  )}

                  {/* Area fill */}
                  {areaPath && (
                    <path d={areaPath} fill="url(#crimsonGradient)" className={styles.areaFill} />
                  )}

                  {/* Line curve */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#D51007"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      filter="url(#crimsonGlow)"
                    />
                  )}

                  {/* Data Points & Bars */}
                  {coords.map((c, i) => {
                    const isHovered = hoveredPoint?.label === c.point.label;
                    const isPeak = profileData.trends.peak?.label === c.point.label;
                    const barWidth = Math.max(6, Math.min(24, (graphWidth / coords.length) * 0.45));

                    return (
                      <g key={i}>
                        {/* Semi-transparent vertical background bar */}
                        <rect
                          x={c.x - barWidth / 2}
                          y={c.y}
                          width={barWidth}
                          height={padding.top + graphHeight - c.y}
                          rx={3}
                          className={`${styles.trendBar} ${isPeak ? styles.trendBarPeak : ""}`}
                          onMouseEnter={() => setHoveredPoint(c.point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* Interactive Dot */}
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={isHovered ? 6 : isPeak ? 4.5 : 3.5}
                          className={`${styles.chartDot} ${isPeak ? styles.chartDotPeak : ""}`}
                          onMouseEnter={() => setHoveredPoint(c.point)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* X-axis Label */}
                        <text
                          x={c.x}
                          y={svgHeight - 12}
                          className={`${styles.xLabel} ${isPeak ? styles.xLabelPeak : ""}`}
                          textAnchor="middle"
                        >
                          {c.point.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating tooltip */}
                {hoveredPoint && (
                  <div className={styles.tooltip}>
                    <span className={styles.tooltipDate}>{hoveredPoint.date}</span>
                    <span className={styles.tooltipVal}>
                      <strong>{hoveredPoint.scrobbles}</strong> scrobbles
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Top Artists Horizontal Bar Distribution */}
            <div className={styles.chartPanel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleGroup}>
                  <User size={16} className={styles.panelIcon} />
                  <h3 className={styles.panelTitle}>Top Artists Distribution</h3>
                </div>
                <span className={styles.panelBadge}>Ranked by Plays</span>
              </div>

              <div className={styles.artistsList}>
                {profileData.top_artists.map((artist) => {
                  const maxPlays = profileData.top_artists[0]?.playcount || 1;
                  const pct = Math.round((artist.playcount / maxPlays) * 100);

                  return (
                    <div key={artist.name} className={styles.artistRow}>
                      <span className={styles.artistRank}>#{artist.rank}</span>
                      <div className={styles.artistInfo}>
                        <div className={styles.artistMetaRow}>
                          <span className={styles.artistName}>{artist.name}</span>
                          <span className={styles.artistPlays}>
                            {artist.playcount} scrobbles
                          </span>
                        </div>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.seedMiniBtn}
                        onClick={() => handleSeedArtist(artist)}
                        title={`Discover music like ${artist.name}`}
                      >
                        <Target size={12} />
                        <span>Seed</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Top Tracks & Acoustic Breakdown */}
          <div className={styles.trendsColRight}>
            {/* Top Tracks List */}
            <div className={styles.chartPanel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleGroup}>
                  <Music size={16} className={styles.panelIcon} />
                  <h3 className={styles.panelTitle}>Most Played Tracks</h3>
                </div>
                <span className={styles.panelBadge}>{profileData.period_label}</span>
              </div>

              <div className={styles.tracksList}>
                {profileData.top_tracks.map((track) => (
                  <div key={`${track.rank}-${track.name}`} className={styles.trackTile}>
                    <span className={styles.trackRank}>
                      {String(track.rank).padStart(2, "0")}
                    </span>

                    <div className={styles.trackArtBox}>
                      {track.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.image}
                          alt={track.name}
                          className={styles.trackArt}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.trackArtFallback}>
                          <Disc size={18} />
                        </div>
                      )}
                    </div>

                    <div className={styles.trackText}>
                      <span className={styles.trackTitle} title={track.name}>
                        {track.name}
                      </span>
                      <span className={styles.trackArtist}>{track.artist}</span>
                    </div>

                    <div className={styles.trackPlaysBadge}>
                      {track.playcount} plays
                    </div>

                    <button
                      type="button"
                      className={styles.seedMiniBtn}
                      onClick={() => handleSeedTrack(track)}
                      title={`Generate recommendations seeded by ${track.name}`}
                    >
                      <Target size={12} />
                      <span>Seed</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Acoustic Profile Radar/Breakdown */}
            <div className={styles.chartPanel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleGroup}>
                  <Compass size={16} className={styles.panelIcon} />
                  <h3 className={styles.panelTitle}>Acoustic & Mood Profile</h3>
                </div>
                <span className={styles.panelBadge}>Vector Mapping</span>
              </div>

              <div className={styles.acousticGrid}>
                <div className={styles.acousticMetric}>
                  <div className={styles.acousticHeader}>
                    <span>Energy</span>
                    <strong>{profileData.acoustic_profile.energy}%</strong>
                  </div>
                  <div className={styles.acousticBar}>
                    <div
                      className={styles.acousticFill}
                      style={{ width: `${profileData.acoustic_profile.energy}%` }}
                    />
                  </div>
                </div>

                <div className={styles.acousticMetric}>
                  <div className={styles.acousticHeader}>
                    <span>Valence (Positivity)</span>
                    <strong>{profileData.acoustic_profile.valence}%</strong>
                  </div>
                  <div className={styles.acousticBar}>
                    <div
                      className={styles.acousticFill}
                      style={{ width: `${profileData.acoustic_profile.valence}%` }}
                    />
                  </div>
                </div>

                <div className={styles.acousticMetric}>
                  <div className={styles.acousticHeader}>
                    <span>Danceability</span>
                    <strong>{profileData.acoustic_profile.danceability}%</strong>
                  </div>
                  <div className={styles.acousticBar}>
                    <div
                      className={styles.acousticFill}
                      style={{ width: `${profileData.acoustic_profile.danceability}%` }}
                    />
                  </div>
                </div>

                <div className={styles.acousticMetric}>
                  <div className={styles.acousticHeader}>
                    <span>Acousticness</span>
                    <strong>{profileData.acoustic_profile.acousticness}%</strong>
                  </div>
                  <div className={styles.acousticBar}>
                    <div
                      className={styles.acousticFill}
                      style={{ width: `${profileData.acoustic_profile.acousticness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Circumplex Mood Tag */}
              <div className={styles.moodPillBanner}>
                <Smile size={14} className={styles.kpiIconRed} />
                <span>
                  Primary Affective Tone:{" "}
                  <strong>{profileData.acoustic_profile.mood_label}</strong> (Avg Tempo ~
                  {profileData.acoustic_profile.tempo} BPM)
                </span>
              </div>
            </div>

            {/* Top Albums Showcase */}
            {profileData.top_albums && profileData.top_albums.length > 0 && (
              <div className={styles.chartPanel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleGroup}>
                    <Disc size={16} className={styles.panelIcon} />
                    <h3 className={styles.panelTitle}>Top Albums</h3>
                  </div>
                </div>
                <div className={styles.albumsGrid}>
                  {profileData.top_albums.slice(0, 4).map((alb) => (
                    <div key={`${alb.rank}-${alb.name}`} className={styles.albumCard}>
                      <div className={styles.albumArtWrap}>
                        {alb.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={alb.image} alt={alb.name} className={styles.albumArt} />
                        ) : (
                          <div className={styles.albumArtFallback}>
                            <Disc size={24} />
                          </div>
                        )}
                      </div>
                      <span className={styles.albumName} title={alb.name}>
                        {alb.name}
                      </span>
                      <span className={styles.albumArtist}>{alb.artist}</span>
                      <span className={styles.albumPlays}>{alb.playcount} scrobbles</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
