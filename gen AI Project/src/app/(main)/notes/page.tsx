import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import RevisionNotes from "@/models/RevisionNotes";
import Link from "next/link";
import { StickyNote, CalendarDays } from "lucide-react";
import { ShareButton } from "@/components/features/ShareButton";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  let notes: any[] = [];
  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);

      notes = await RevisionNotes.find({ 
        $or: [
          { userId: userObjectId },
          { sharedWith: userObjectId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (e) {
    console.error("Error fetching notes:", e);
  }

  const hasNotes = notes.length > 0;

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>Revision Notes</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          {hasNotes ? 'Select a set of notes below to review key concepts.' : 'Concise, AI-generated revision notes to help you prepare for exams.'}
        </p>
      </header>

      {!hasNotes ? (
        <section style={{
          backgroundColor: "var(--surface-raised)",
          padding: "var(--space-10)",
          borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--border-color)",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)", fontWeight: "var(--weight-semibold)" }}>
            No Revision Notes Yet
          </h2>
          <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto" }}>
            Upload study materials and generate revision notes from them. They'll appear here as concise, exam-ready bullet points.
          </p>
        </section>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--space-6)"
        }}>
          {notes.map((note: any) => (
            <Link 
              href={`/notes/${note._id}`} 
              key={note._id.toString()}
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
                <div style={{ padding: "var(--space-2)", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--primary-color)", borderRadius: "var(--radius-md)" }}>
                  <StickyNote size={24} />
                </div>
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {note.title}
                </h2>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <p className="text-muted" style={{ fontSize: "var(--text-sm)", margin: 0 }}>
                  {note.sections.length} Sections
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <p className="text-muted" style={{ fontSize: "var(--text-xs)", display: "flex", alignItems: "center", gap: "var(--space-1)", margin: 0 }}>
                    <CalendarDays size={12} />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  <ShareButton resourceId={note._id.toString()} resourceType="notes" variant="icon" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
