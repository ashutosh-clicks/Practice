import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import FlashcardDeck from "@/models/FlashcardDeck";
import FlashcardViewer from "@/components/features/FlashcardViewer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShareButton } from "@/components/features/ShareButton";

export default async function FlashcardDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    notFound();
  }

  await connectMongo();
  const deck = await FlashcardDeck.findOne({ 
    _id: resolvedParams.id,
    userId: (session.user as any).id
  }).lean();

  if (!deck) {
    notFound();
  }

  // Serialize exactly as before if needed via stringify/parse
  const serializedDeck = JSON.parse(JSON.stringify(deck));

  return (
    <div>
      <header style={{ marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Link href="/flashcards" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
            <ArrowLeft size={16} /> Back to Flashcards
          </Link>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-bold)", margin: 0 }}>{serializedDeck.title}</h1>
        </div>
        <ShareButton resourceId={serializedDeck._id} resourceType="flashcard" />
      </header>
      
      <main>
        <FlashcardViewer cards={serializedDeck.cards} />
      </main>
    </div>
  );
}
