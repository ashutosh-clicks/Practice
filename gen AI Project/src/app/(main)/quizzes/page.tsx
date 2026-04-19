import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { ShareButton } from "@/components/features/ShareButton";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  let quizzes: any[] = [];
  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);

      quizzes = await Quiz.find({ 
        $or: [
          { userId: userObjectId },
          { sharedWith: userObjectId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (e) {
    console.error("Error fetching quizzes:", e);
  }

  const hasQuizzes = quizzes.length > 0;

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>Quizzes</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          {hasQuizzes ? 'Select a quiz below to test your knowledge.' : 'Test your knowledge with practice questions drawn directly from your notes.'}
        </p>
      </header>

      {!hasQuizzes ? (
        <section style={{
          backgroundColor: "var(--surface-raised)",
          padding: "var(--space-10)",
          borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--border-color)",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)", fontWeight: "var(--weight-semibold)" }}>
            No Pending Quizzes
          </h2>
          <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto" }}>
            You don't have any generated quizzes yet. Upload a document in the Study Materials section to let the AI create practice tests for you.
          </p>
        </section>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--space-6)"
        }}>
          {quizzes.map(quiz => (
            <Link 
              href={`/quizzes/${quiz._id}`} 
              key={quiz._id.toString()}
              className="hover-card"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "var(--space-6)",
                backgroundColor: "var(--surface-raised)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-sm)",
                gap: "var(--space-4)",
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ padding: "var(--space-2)", backgroundColor: "var(--primary-ghost)", color: "var(--primary-color)", borderRadius: "var(--radius-md)" }}>
                  <CheckSquare size={24} />
                </div>
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>
                  {quiz.title}
                </h2>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: 0 }}>
                  {quiz.questions.length} Questions
                </p>
                <ShareButton resourceId={quiz._id.toString()} resourceType="quiz" variant="icon" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
