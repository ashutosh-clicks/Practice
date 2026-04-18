import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import RevisionNotes from "@/models/RevisionNotes";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NotesDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    notFound();
  }

  await connectMongo();
  const notes = await RevisionNotes.findOne({ 
    _id: resolvedParams.id,
    userId: (session.user as any).id
  }).lean();

  if (!notes) {
    notFound();
  }

  const serializedNotes = JSON.parse(JSON.stringify(notes));

  return (
    <div>
      <header style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/notes" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
          <ArrowLeft size={16} /> Back to Notes
        </Link>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-bold)" }}>{serializedNotes.title}</h1>
      </header>
      
      <main style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "var(--container-lg)", margin: "0 auto" }}>
        {serializedNotes.sections.map((section: any, idx: number) => (
          <section 
            key={idx}
            style={{
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
            }}
          >
            <div style={{
              padding: "var(--space-4) var(--space-6)",
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: "rgba(14, 165, 233, 0.04)",
            }}>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", margin: 0, color: "var(--primary-color)" }}>
                {section.heading}
              </h2>
            </div>
            <ul style={{
              padding: "var(--space-5) var(--space-6)",
              margin: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}>
              {section.bullets.map((bullet: string, bIdx: number) => (
                <li 
                  key={bIdx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-3)",
                    fontSize: "var(--text-base)",
                    lineHeight: "var(--leading-relaxed)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span style={{
                    display: "inline-block",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-color)",
                    marginTop: "10px",
                    flexShrink: 0,
                  }} />
                  {bullet}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
