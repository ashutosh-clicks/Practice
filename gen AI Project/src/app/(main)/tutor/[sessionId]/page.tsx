import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import ChatSession from "@/models/ChatSession";
import { TutorChat } from "@/components/features/TutorChat";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function ResumeTutorSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!session?.user) {
    redirect("/login");
  }

  let chatDoc: any = null;
  let materials: any[] = [];

  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      chatDoc = await ChatSession.findOne({ 
        _id: resolvedParams.sessionId,
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      }).lean();

      if (chatDoc) {
        materials = await Material.find({ 
          $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
        })
          .select("_id title")
          .sort({ createdAt: -1 })
          .lean();
      }
    }
  } catch (e) {
    console.error("Error fetching tutor session data:", e);
  }

  if (!chatDoc) {
    notFound();
  }
    
  const serializedMaterials = materials.map(m => ({
    _id: m._id.toString(),
    title: (m as any).title
  }));

  const serializedMessages = chatDoc.messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content
  }));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <header style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/tutor" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)", textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Sessions
        </Link>
        <h1 style={{ fontSize: "var(--text-2xl)" }}>{chatDoc.title}</h1>
      </header>

      <TutorChat 
        materials={serializedMaterials} 
        initialSessionId={chatDoc._id.toString()}
        initialMaterialId={chatDoc.materialId}
        initialMessages={serializedMessages}
      />
    </div>
  );
}
