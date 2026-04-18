"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  _id: string;
}

export default function QuizViewer({ questions }: { questions: Question[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track answers per question: null = unanswered, number = selected option index
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isAnswered = currentAnswer !== null;

  const score = answers.reduce<number>((acc, ans, idx) => {
    if (ans !== null && ans === questions[idx].correctOptionIndex) return acc + 1;
    return acc;
  }, 0);

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-10)", borderRadius: "var(--radius-xl)", textAlign: "center", border: "1px solid var(--border-color)", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-4)" }}>Quiz Complete! 🎉</h2>
        <p style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-8)" }}>
          You scored <span style={{ fontWeight: "bold", color: "var(--primary-color)" }}>{score}</span> out of {questions.length}
        </p>
        <button 
          onClick={handleRetake}
          style={{ padding: "var(--space-3) var(--space-6)", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "var(--radius-md)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const allAnswered = answers.every(a => a !== null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
      
      {/* Progress bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      {/* Question dots */}
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center" }}>
        {questions.map((_, idx) => {
          const ans = answers[idx];
          let dotColor = "var(--border-color)";
          if (ans !== null) {
            dotColor = ans === questions[idx].correctOptionIndex ? "#16A34A" : "#DC2626";
          }
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? "28px" : "10px",
                height: "10px",
                borderRadius: "var(--radius-full)",
                backgroundColor: idx === currentIndex ? "var(--primary-color)" : dotColor,
                border: "none",
                cursor: "pointer",
                transition: "all var(--dur-normal) var(--ease-out)",
                opacity: idx === currentIndex ? 1 : 0.7,
              }}
            />
          );
        })}
      </div>

      {/* Question card */}
      <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-8)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-6)", lineHeight: "var(--leading-relaxed)" }}>
          {currentQuestion.question}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {currentQuestion.options.map((option, idx) => {
            let bgColor = "var(--surface)";
            let borderColor = "var(--border-subtle)";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctOptionIndex) {
                bgColor = "rgba(22, 163, 74, 0.1)";
                borderColor = "#16A34A";
              } else if (idx === currentAnswer) {
                bgColor = "rgba(220, 38, 38, 0.1)";
                borderColor = "#DC2626";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--space-4)",
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "var(--radius-md)",
                  textAlign: "left",
                  fontSize: "var(--text-base)",
                  cursor: isAnswered ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  color: "var(--text-primary)"
                }}
              >
                {option}
                {isAnswered && idx === currentQuestion.correctOptionIndex && <CheckCircle2 size={20} color="#16A34A" />}
                {isAnswered && idx === currentAnswer && idx !== currentQuestion.correctOptionIndex && <XCircle size={20} color="#DC2626" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation (shown after answering) */}
      {isAnswered && (
        <div style={{ padding: "var(--space-5)", backgroundColor: "rgba(14, 165, 233, 0.05)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--primary-color)" }}>
          <span style={{ fontWeight: "var(--weight-bold)", color: "var(--primary-color)" }}>Explanation: </span>
          <span style={{ color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)" }}>{currentQuestion.explanation}</span>
        </div>
      )}

      {/* Navigation arrows */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-5)",
            backgroundColor: currentIndex === 0 ? "var(--surface)" : "var(--surface-raised)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            color: currentIndex === 0 ? "var(--text-disabled)" : "var(--text-primary)",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            fontWeight: "var(--weight-medium)",
            fontSize: "var(--text-sm)",
            transition: "all var(--dur-normal) var(--ease-out)",
          }}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            disabled={!allAnswered}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-3) var(--space-5)",
              backgroundColor: allAnswered ? "var(--primary-color)" : "var(--surface)",
              border: allAnswered ? "none" : "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              color: allAnswered ? "white" : "var(--text-disabled)",
              cursor: allAnswered ? "pointer" : "not-allowed",
              fontWeight: "var(--weight-medium)",
              fontSize: "var(--text-sm)",
              transition: "all var(--dur-normal) var(--ease-out)",
            }}
          >
            Finish Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-3) var(--space-5)",
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontWeight: "var(--weight-medium)",
              fontSize: "var(--text-sm)",
              transition: "all var(--dur-normal) var(--ease-out)",
            }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        )}
      </div>

    </div>
  );
}

