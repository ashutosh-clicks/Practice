import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import Link from "next/link";
import { Bot, Plus, ArrowRight, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function TutorDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!session?.user) {
    redirect("/login");
  }

  let pastSessions: any[] = [];
  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);

      pastSessions = await ChatSession.find({ 
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      })
        .sort({ updatedAt: -1 })
        .lean();
    }
  } catch (e) {
    console.error("Error fetching tutor sessions:", e);
  }

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>AI Tutor Sessions</h1>
          <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
            Resume a past conversation or start a new one based on your materials.
          </p>
        </div>
        
        <Link 
          href="/tutor/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-5)",
            backgroundColor: "var(--primary-color)",
            color: "white",
            textDecoration: "none",
            borderRadius: "var(--radius-md)",
            fontWeight: "var(--weight-medium)",
            transition: "opacity 0.2s",
          }}
        >
          <Plus size={18} />
          New Session
        </Link>
      </header>

      {pastSessions.length === 0 ? (
        <section style={{
          backgroundColor: "var(--surface-raised)",
          padding: "var(--space-10)",
          borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--border-color)",
          textAlign: "center"
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-4)" }}>
            <div style={{ padding: "var(--space-4)", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--primary-color)", borderRadius: "var(--radius-full)" }}>
              <Bot size={40} />
            </div>
          </div>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)", fontWeight: "var(--weight-semibold)" }}>
            No Sessions Yet
          </h2>
          <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto", marginBottom: "var(--space-6)" }}>
            Start a new session to chat with the AI tutor about your study materials.
          </p>
          <Link 
            href="/tutor/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-3) var(--space-6)",
              backgroundColor: "var(--primary-color)",
              color: "white",
              textDecoration: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: "var(--weight-medium)",
            }}
          >
            Start Chatting
          </Link>
        </section>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(600px, 1fr))",
          gap: "var(--space-4)"
        }}>
          {pastSessions.map((chat: any) => (
            <Link 
              href={`/tutor/${chat._id}`} 
              key={chat._id.toString()}
              className="hover-card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-5)",
                backgroundColor: "var(--surface-raised)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-sm)",
                textDecoration: "none",
                color: "inherit"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <div style={{ padding: "var(--space-3)", backgroundColor: "var(--surface)", color: "var(--text-muted)", borderRadius: "var(--radius-md)" }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)", margin: 0, marginBottom: "var(--space-1)" }}>
                    "{chat.title}"
                  </h3>
                  <div style={{ display: "flex", gap: "var(--space-4)", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Bot size={12} /> {(chat.messages?.length || 0) - 1} Replies
                    </span>
                    <span>
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight size={20} className="text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
