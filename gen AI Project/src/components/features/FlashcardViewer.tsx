"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

interface Card {
  front: string;
  back: string;
  _id: string;
}

export default function FlashcardViewer({ cards }: { cards: Card[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-6)", width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span>Click card to flip</span>
      </div>

      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          width: "100%",
          height: "300px",
          perspective: "1000px",
          cursor: "pointer",
        }}
      >
        <div style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transition: "transform 0.6s",
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
          {/* Front */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8)",
            textAlign: "center",
          }}>
            <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-medium)" }}>
              {currentCard.front}
            </h3>
          </div>
          
          {/* Back */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            backgroundColor: "var(--primary-color)",
            color: "white",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-8)",
            textAlign: "center",
            transform: "rotateY(180deg)",
          }}>
            <RotateCw size={24} style={{ position: "absolute", top: "16px", right: "16px", opacity: 0.5 }} />
            <p style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-relaxed)" }}>
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
        <button 
          onClick={handlePrev}
          style={{
            padding: "var(--space-3)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--surface-raised)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={handleNext}
          style={{
            padding: "var(--space-3)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--surface-raised)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
}
