import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import { TutorChat } from "@/components/features/TutorChat";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function NewTutorSessionPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!session?.user) {
    redirect("/login");
  }

  let materials: any[] = [];
  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      materials = await Material.find({ 
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      })
        .select("_id title")
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (e) {
    console.error("Error fetching materials for new session:", e);
  }
    
  const serializedMaterials = materials.map(m => ({
    _id: m._id.toString(),
    title: (m as any).title
  }));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <header style={{ marginBottom: "var(--space-6)" }}>
        <Link href="/tutor" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)", textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Sessions
        </Link>
        <h1 style={{ fontSize: "var(--text-2xl)" }}>New AI Tutor Session</h1>
      </header>

      <TutorChat materials={serializedMaterials} />
    </div>
  );
}
