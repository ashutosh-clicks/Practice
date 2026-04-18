import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  const userFirstName = session?.user?.name ? session.user.name.split(' ')[0] : "Student";
  
  let recentMaterials: any[] = [];
  try {
    if (session?.user && (session.user as any).id) {
      await connectMongo();
      recentMaterials = await Material.find({ userId: (session.user as any).id })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
    }
  } catch (e) {
    console.error("Error fetching materials for dashboard:", e);
  }

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>Welcome back, {userFirstName}!</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          Pick up where you left off or upload new study materials to begin.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Recent Materials</h3>
          {recentMaterials.length > 0 ? (
             <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
               {recentMaterials.map((m: any) => (
                 <div key={m._id.toString()} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border-color)" }}>
                    <FileText size={18} style={{ color: "var(--primary-color)" }} />
                    <span style={{ fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.title}
                    </span>
                 </div>
               ))}
               <Link href="/study-materials" style={{ marginTop: "auto", paddingTop: "var(--space-2)", color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                 View all materials <ArrowRight size={14} />
               </Link>
             </div>
          ) : (
            <div style={{ flex: 1 }}>
              <p className="text-muted">No materials uploaded yet. Upload a PDF to generate smart notes and quizzes.</p>
              <Link href="/study-materials" style={{ display: "inline-block", marginTop: "var(--space-4)", color: "var(--primary-color)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                Upload Material &rarr;
              </Link>
            </div>
          )}
        </div>
        
        <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "var(--space-4)" }}>Pending Quizzes</h3>
          <p className="text-muted">You're all caught up! Review your recent materials to test your knowledge.</p>
        </div>
        
        <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "var(--space-4)" }}>AI Tutor Chat</h3>
          <p className="text-muted">Start a conversational session with your AI tutor to clarify any topics or request further explanations.</p>
        </div>
      </section>
    </div>
  );
}
