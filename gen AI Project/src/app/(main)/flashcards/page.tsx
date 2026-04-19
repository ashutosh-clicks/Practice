import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import FlashcardDeck from "@/models/FlashcardDeck";
import Link from "next/link";
import { Layers } from "lucide-react";
import { ShareButton } from "@/components/features/ShareButton";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  let decks: any[] = [];
  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);

      decks = await FlashcardDeck.find({ 
        $or: [
          { userId: userObjectId },
          { sharedWith: userObjectId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (e) {
    console.error("Error fetching decks:", e);
  }

  const hasDecks = decks.length > 0;

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>Flashcards</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          {hasDecks ? 'Select a flashcard deck below to begin studying.' : 'Review your AI-generated flashcards to master your study materials.'}
        </p>
      </header>

      {!hasDecks ? (
        <section style={{
          backgroundColor: "var(--surface-raised)",
          padding: "var(--space-10)",
          borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--border-color)",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)", fontWeight: "var(--weight-semibold)" }}>
            No Flashcards Yet
          </h2>
          <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto" }}>
            Once you upload your study materials, our AI will automatically extract key concepts and generate flashcard decks for you to review here.
          </p>
        </section>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--space-6)"
        }}>
          {decks.map(deck => (
              <Link 
              href={`/flashcards/${deck._id}`} 
              key={deck._id.toString()}
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
                  <Layers size={24} />
                </div>
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)" }}>
                  {deck.title}
                </h2>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: 0 }}>
                  {deck.cards.length} Cards
                </p>
                <ShareButton resourceId={deck._id.toString()} resourceType="flashcard" variant="icon" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
