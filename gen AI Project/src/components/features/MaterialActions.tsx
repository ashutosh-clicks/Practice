"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, BookOpenCheck, StickyNote, Loader2 } from "lucide-react";

export default function MaterialActions({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isGeneratingFlashcards || isGeneratingQuiz || isGeneratingNotes;

  const generateFlashcards = async () => {
    setIsGeneratingFlashcards(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate flashcards");
      
      router.push(`/flashcards`);
    } catch (err: any) {
      setError(err.message);
      setIsGeneratingFlashcards(false);
    }
  };

  const generateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      
      router.push(`/quizzes`);
    } catch (err: any) {
      setError(err.message);
      setIsGeneratingQuiz(false);
    }
  };

  const generateNotes = async () => {
    setIsGeneratingNotes(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate revision notes");
      
      router.push(`/notes`);
    } catch (err: any) {
      setError(err.message);
      setIsGeneratingNotes(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
      {error && (
        <div style={{ padding: "var(--space-3)", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--error-color)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", width: "100%", maxWidth: "500px", textAlign: "center" }}>
          {error}
        </div>
      )}
      
      <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", justifyContent: "center" }}>
        <button 
          onClick={generateFlashcards}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-6)",
            backgroundColor: "var(--primary-color)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-medium)",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            transition: "all 0.2s ease"
          }}
        >
          {isGeneratingFlashcards ? <Loader2 className="animate-spin" size={20} /> : <BookOpenCheck size={20} />}
          {isGeneratingFlashcards ? "Generating..." : "Generate Flashcards"}
        </button>

        <button 
          onClick={generateQuiz}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-6)",
            backgroundColor: "transparent",
            color: "var(--primary-color)",
            border: "2px solid var(--primary-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-medium)",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            transition: "all 0.2s ease"
          }}
        >
          {isGeneratingQuiz ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
          {isGeneratingQuiz ? "Generating..." : "Generate Practice Quiz"}
        </button>

        <button 
          onClick={generateNotes}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-6)",
            backgroundColor: "transparent",
            color: "var(--primary-color)",
            border: "2px solid var(--primary-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-medium)",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            transition: "all 0.2s ease"
          }}
        >
          {isGeneratingNotes ? <Loader2 className="animate-spin" size={20} /> : <StickyNote size={20} />}
          {isGeneratingNotes ? "Generating..." : "Generate Revision Notes"}
        </button>
      </div>
    </div>
  );
}
