"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { AudioFeatures } from "@/types";

interface Props { features: AudioFeatures; }

const FEATURE_LABELS: { key: keyof AudioFeatures; label: string; max: number }[] = [
  { key: "danceability",    label: "Dance",        max: 1 },
  { key: "energy",          label: "Energy",       max: 1 },
  { key: "valence",         label: "Valence",      max: 1 },
  { key: "acousticness",    label: "Acoustic",     max: 1 },
  { key: "instrumentalness",label: "Instrumental", max: 1 },
  { key: "speechiness",     label: "Speech",       max: 1 },
];

export default function FeatureRadarChart({ features }: Props) {
  const data = FEATURE_LABELS.map(({ key, label, max }) => ({
    subject: label,
    value: Math.round((features[key] / max) * 100),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
        <PolarGrid stroke="var(--border)" strokeWidth={1} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "Inter, sans-serif" }}
        />
        <Radar
          dataKey="value"
          stroke="#0EA5E9"
          fill="#0EA5E9"
          fillOpacity={0.18}
          strokeWidth={1.5}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-raised)", border: "1px solid var(--border)",
            borderRadius: "8px", fontSize: "12px", color: "var(--text-primary)",
          }}
          formatter={(v) => [`${v}%`, ""]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
