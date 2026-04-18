"use client";

import { useState } from "react";
import FlashcardViewer from "@/components/features/FlashcardViewer";

export default function FlashcardLayout({ decks }: { decks: any[] }) {
  const [activeDeckId, setActiveDeckId] = useState(decks[0]?._id.toString());

  const activeDeck = decks.find(d => d._id.toString() === activeDeckId) || decks[0];

  return (
    <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "flex-start" }}>
      {/* Sidebar List */}
      <aside style={{
        width: "300px",
        flexShrink: 0,
        backgroundColor: "var(--surface-raised)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)"
      }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-2)" }}>My Decks</h2>
        {decks.map(deck => (
          <button
            key={deck._id.toString()}
            onClick={() => setActiveDeckId(deck._id.toString())}
            style={{
              padding: "var(--space-3)",
              textAlign: "left",
              backgroundColor: deck._id.toString() === activeDeckId ? "var(--primary-ghost)" : "transparent",
              color: deck._id.toString() === activeDeckId ? "var(--primary-color)" : "var(--text-secondary)",
              border: `1px solid ${deck._id.toString() === activeDeckId ? "var(--primary-color)" : "transparent"}`,
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: deck._id.toString() === activeDeckId ? "var(--weight-semibold)" : "var(--weight-regular)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ wordBreak: "break-word" }}>{deck.title}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
              {deck.cards.length} Cards • {new Date(deck.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </aside>

      {/* Main Viewer */}
      <main style={{ flexGrow: 1, minWidth: 0 }}>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-6)", color: "var(--text-primary)" }}>
          {activeDeck.title}
        </h2>
        <FlashcardViewer cards={activeDeck.cards} />
      </main>
    </div>
  );
}
