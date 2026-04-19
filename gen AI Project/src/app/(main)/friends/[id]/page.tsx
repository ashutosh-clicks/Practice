import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import Friendship from "@/models/Friendship";
import Material from "@/models/Material";
import FlashcardDeck from "@/models/FlashcardDeck";
import Quiz from "@/models/Quiz";
import RevisionNotes from "@/models/RevisionNotes";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Layers, CheckSquare, StickyNote, CalendarDays, User as UserIcon } from "lucide-react";
import mongoose from "mongoose";

export default async function FriendProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: friendId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const myId = (session.user as any).id;
  const friendObjectId = new mongoose.Types.ObjectId(friendId);
  const myObjectId = new mongoose.Types.ObjectId(myId);

  await connectMongo();

  // 1. Verify Friendship
  const friendship = await Friendship.findOne({
    status: "accepted",
    $or: [
      { requesterId: myObjectId, recipientId: friendObjectId },
      { requesterId: friendObjectId, recipientId: myObjectId }
    ]
  }).lean();

  if (!friendship) {
    // If not friends, we shouldn't show the profile in Option B
    return notFound();
  }

  // 2. Fetch Friend Info
  const friend = await User.findById(friendObjectId).select("name email").lean();
  if (!friend) return notFound();

  // 3. Fetch Shared Resources
  const sharedQuery = {
    userId: friendObjectId,
    sharedWith: myObjectId
  };

  const [materials, flashcards, quizzes, notes] = await Promise.all([
    Material.find(sharedQuery).sort({ createdAt: -1 }).lean(),
    FlashcardDeck.find(sharedQuery).sort({ createdAt: -1 }).lean(),
    Quiz.find(sharedQuery).sort({ createdAt: -1 }).lean(),
    RevisionNotes.find(sharedQuery).sort({ createdAt: -1 }).lean()
  ]);

  const hasAnyShared = materials.length > 0 || flashcards.length > 0 || quizzes.length > 0 || notes.length > 0;

  return (
    <div style={{ maxWidth: "var(--container-xl)", margin: "0 auto" }}>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <Link href="/friends" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)", textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Friends
        </Link>
        
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
          <div style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            backgroundColor: "var(--primary-color)", 
            color: "white", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "var(--text-3xl)",
            fontWeight: "var(--weight-bold)",
            boxShadow: "var(--shadow-md)"
          }}>
            {friend.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ marginBottom: "var(--space-1)" }}>{friend.name}</h1>
            <p className="text-muted" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              {friend.email}
            </p>
          </div>
        </div>
      </header>

      <section>
        <div style={{ borderBottom: "1px solid var(--border-color)", marginBottom: "var(--space-8)", paddingBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>Shared with You</h2>
          <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>Materials and activities that {friend.name} has explicitly shared for collaboration.</p>
        </div>

        {!hasAnyShared ? (
          <div style={{ 
            textAlign: "center", 
            padding: "var(--space-16)", 
            backgroundColor: "var(--surface-raised)", 
            borderRadius: "var(--radius-xl)",
            border: "1px dashed var(--border-color)"
          }}>
            <UserIcon size={48} style={{ color: "var(--text-disabled)", margin: "0 auto var(--space-4)" }} />
            <h3 style={{ marginBottom: "var(--space-2)" }}>Nothing shared yet</h3>
            <p className="text-muted">When {friend.name} shares a study resource with you, it will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
            
            {/* Materials */}
            {materials.length > 0 && (
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <FileText size={20} className="text-primary" /> Study Materials
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
                  {materials.map((m: any) => (
                    <Link href={`/study-materials/${m._id}`} key={m._id.toString()} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="hover-card" style={{ padding: "var(--space-4)", backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                        <h4 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</h4>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                           <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                             <CalendarDays size={12} /> {new Date(m.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Flashcards */}
            {flashcards.length > 0 && (
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Layers size={20} className="text-primary" /> Flashcard Decks
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
                  {flashcards.map((f: any) => (
                    <Link href={`/flashcards/${f._id}`} key={f._id.toString()} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="hover-card" style={{ padding: "var(--space-4)", backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                        <h4 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-2)" }}>{f.title}</h4>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>{f.cards.length} Cards</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quizzes */}
            {quizzes.length > 0 && (
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <CheckSquare size={20} className="text-primary" /> Practice Quizzes
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
                  {quizzes.map((q: any) => (
                    <Link href={`/quizzes/${q._id}`} key={q._id.toString()} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="hover-card" style={{ padding: "var(--space-4)", backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                        <h4 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-2)" }}>{q.title}</h4>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>{q.questions.length} Questions</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {notes.length > 0 && (
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <StickyNote size={20} className="text-primary" /> Revision Notes
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
                  {notes.map((n: any) => (
                    <Link href={`/notes/${n._id}`} key={n._id.toString()} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="hover-card" style={{ padding: "var(--space-4)", backgroundColor: "var(--surface-raised)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)" }}>
                        <h4 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", marginBottom: "var(--space-2)" }}>{n.title}</h4>
                        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>{n.sections.length} Sections</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>
    </div>
  );
}
