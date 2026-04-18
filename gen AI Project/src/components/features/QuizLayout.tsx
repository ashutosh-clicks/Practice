"use client";

import { useState } from "react";
import QuizViewer from "@/components/features/QuizViewer";

export default function QuizLayout({ quizzes }: { quizzes: any[] }) {
  const [activeQuizId, setActiveQuizId] = useState(quizzes[0]?._id.toString());

  const activeQuiz = quizzes.find(q => q._id.toString() === activeQuizId) || quizzes[0];

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
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-2)" }}>My Quizzes</h2>
        {quizzes.map(quiz => (
          <button
            key={quiz._id.toString()}
            onClick={() => setActiveQuizId(quiz._id.toString())}
            style={{
              padding: "var(--space-3)",
              textAlign: "left",
              backgroundColor: quiz._id.toString() === activeQuizId ? "var(--primary-ghost)" : "transparent",
              color: quiz._id.toString() === activeQuizId ? "var(--primary-color)" : "var(--text-secondary)",
              border: `1px solid ${quiz._id.toString() === activeQuizId ? "var(--primary-color)" : "transparent"}`,
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: quiz._id.toString() === activeQuizId ? "var(--weight-semibold)" : "var(--weight-regular)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ wordBreak: "break-word" }}>{quiz.title}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
              {quiz.questions.length} Questions • {new Date(quiz.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </aside>

      {/* Main Viewer */}
      <main style={{ flexGrow: 1, minWidth: 0 }}>
        <QuizViewer questions={activeQuiz.questions} />
      </main>
    </div>
  );
}
