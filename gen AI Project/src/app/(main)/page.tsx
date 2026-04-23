import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import Quiz from "@/models/Quiz";
import ChatSession from "@/models/ChatSession";
import Link from "next/link";
import { FileText, ArrowRight, CheckSquare, MessageSquare, Bot } from "lucide-react";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  const userFirstName = session?.user?.name ? session.user.name.split(' ')[0] : "Student";
  
  let recentMaterials: any[] = [];
  let recentQuizzes: any[] = [];
  let recentChats: any[] = [];

  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Fetch Materials (User owned + Shared)
      recentMaterials = await Material.find({ 
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      // Fetch Quizzes (User owned + Shared)
      recentQuizzes = await Quiz.find({ 
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      // Fetch Chat Sessions (User owned + Shared)
      recentChats = await ChatSession.find({ 
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      })
        .sort({ updatedAt: -1 })
        .limit(3)
        .lean();
    }
  } catch (e) {
    console.error("Error fetching dashboard data:", e);
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
        {/* Recent Materials */}
        <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <FileText size={20} style={{ color: "var(--primary-color)" }} /> Recent Materials
          </h3>
          {recentMaterials.length > 0 ? (
             <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
               {recentMaterials.map((m: any) => (
                 <Link 
                   href={`/study-materials/${m._id.toString()}`}
                   key={m._id.toString()} 
                   style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border-color)", textDecoration: "none", color: "inherit" }}
                 >
                    <FileText size={16} className="text-muted" />
                    <span style={{ fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.title}
                    </span>
                 </Link>
               ))}
               <Link href="/study-materials" style={{ marginTop: "auto", paddingTop: "var(--space-2)", color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                 View all materials <ArrowRight size={14} />
               </Link>
             </div>
          ) : (
            <div style={{ flex: 1 }}>
              <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>No materials uploaded yet. Upload a PDF to generate smart notes and quizzes.</p>
              <Link href="/study-materials" style={{ display: "inline-block", marginTop: "var(--space-4)", color: "var(--primary-color)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                Upload Material &rarr;
              </Link>
            </div>
          )}
        </div>
        
        {/* Pending Quizzes */}
        <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <CheckSquare size={20} style={{ color: "#10B981" }} /> Recent Quizzes
          </h3>
          {recentQuizzes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
              {recentQuizzes.map((q: any) => (
                <Link 
                  href={`/quizzes/${q._id.toString()}`}
                  key={q._id.toString()} 
                  style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border-color)", textDecoration: "none", color: "inherit" }}
                >
                   <CheckSquare size={16} className="text-muted" />
                   <span style={{ fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                     {q.title}
                   </span>
                </Link>
              ))}
              <Link href="/quizzes" style={{ marginTop: "auto", paddingTop: "var(--space-2)", color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                View all quizzes <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>You haven't generated any quizzes yet. Review your materials to start.</p>
              <Link href="/quizzes" style={{ display: "inline-block", marginTop: "var(--space-4)", color: "var(--primary-color)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                Browse Quizzes &rarr;
              </Link>
            </div>
          )}
        </div>
        
        {/* AI Tutor */}
        <div style={{ backgroundColor: "var(--surface-raised)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Bot size={20} style={{ color: "var(--primary-color)" }} /> Tutor Sessions
          </h3>
          {recentChats.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
              {recentChats.map((c: any) => (
                <Link 
                  href={`/tutor/${c._id.toString()}`}
                  key={c._id.toString()} 
                  style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--border-color)", textDecoration: "none", color: "inherit" }}
                >
                   <MessageSquare size={16} className="text-muted" />
                   <span style={{ fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                     {c.title || "Tutor Session"}
                   </span>
                </Link>
              ))}
              <Link href="/tutor" style={{ marginTop: "auto", paddingTop: "var(--space-2)", color: "var(--primary-color)", display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                Go to AI Tutor <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>Start a conversational session with your AI tutor to clarify any topics.</p>
              <Link href="/tutor/new" style={{ display: "inline-block", marginTop: "var(--space-4)", color: "var(--primary-color)", fontWeight: "var(--weight-medium)", textDecoration: "none" }}>
                Chat with AI &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
