import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MusicMind — Hybrid Music Recommendations",
  description:
    "Discover music tailored to your mood, activity, and listening history. Powered by K-Means clustering, collaborative filtering (Last.fm), and context-aware recommendations.",
  keywords: ["music recommendation", "spotify", "collaborative filtering", "mood-based music"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
