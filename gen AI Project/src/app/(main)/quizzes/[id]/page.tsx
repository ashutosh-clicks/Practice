import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import QuizViewer from "@/components/features/QuizViewer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function QuizDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    notFound();
  }

  await connectMongo();
  const quiz = await Quiz.findOne({ 
    _id: resolvedParams.id,
    userId: (session.user as any).id
  }).lean();

  if (!quiz) {
    notFound();
  }

  // Serialize the nested MongoDB objects
  const serializedQuiz = JSON.parse(JSON.stringify(quiz));

  return (
    <div>
      <header style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/quizzes" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-bold)" }}>{serializedQuiz.title}</h1>
      </header>
      
      <main>
        <QuizViewer questions={serializedQuiz.questions} />
      </main>
    </div>
  );
}
