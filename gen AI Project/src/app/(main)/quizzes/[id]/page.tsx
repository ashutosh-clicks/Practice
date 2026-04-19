import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import QuizViewer from "@/components/features/QuizViewer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShareButton } from "@/components/features/ShareButton";
import mongoose from "mongoose";

export default async function QuizDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!session?.user) {
    notFound();
  }

  let quiz: any = null;
  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);
      quiz = await Quiz.findOne({ 
        _id: resolvedParams.id,
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }]
      }).lean();
    }
  } catch (e) {
    console.error("Error fetching quiz detail:", e);
  }

  if (!quiz) {
    notFound();
  }

  // Serialize the nested MongoDB objects
  const serializedQuiz = JSON.parse(JSON.stringify(quiz));

  return (
    <div>
      <header style={{ marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Link href="/quizzes" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
            <ArrowLeft size={16} /> Back to Quizzes
          </Link>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-bold)", margin: 0 }}>{serializedQuiz.title}</h1>
        </div>
        <ShareButton resourceId={serializedQuiz._id} resourceType="quiz" />
      </header>
      
      <main>
        <QuizViewer questions={serializedQuiz.questions} />
      </main>
    </div>
  );
}
