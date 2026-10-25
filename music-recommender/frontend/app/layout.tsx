import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "find.fm — Hybrid Music Recommender & Scrobbler Discovery",
  description:
    "Discover music tailored to your mood, activity, and listening scrobbles. Powered by K-Means clustering, Last.fm collaborative filtering, and context-aware recommendations.",
  keywords: ["find.fm", "music recommendation", "last.fm", "scrobbler", "hybrid ml", "mood-based music"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
