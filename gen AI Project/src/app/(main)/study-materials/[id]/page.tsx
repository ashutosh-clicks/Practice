import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CalendarDays } from "lucide-react";
import MaterialActions from "@/components/features/MaterialActions";
import { ShareButton } from "@/components/features/ShareButton";

export default async function MaterialDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  let material: any = null;
  const { id } = await params;

  try {
    await connectMongo();
    material = await Material.findById(id).lean();
  } catch (error) {
    console.error("Error fetching material:", error);
  }

  if (!material) {
    return notFound();
  }

  return (
    <div>
      <header style={{ marginBottom: "var(--space-6)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Link href="/study-materials" style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)", textDecoration: "none", width: "fit-content" }}>
          <ArrowLeft size={16} /> Back to Library
        </Link>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <FileText size={32} style={{ color: "var(--primary-color)" }} /> 
            {material.title}
          </h1>
          <p className="text-muted" style={{ marginTop: "var(--space-2)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <CalendarDays size={16} /> Uploaded on {new Date(material.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <ShareButton resourceId={material._id.toString()} resourceType="material" />
    </header>

      <section style={{
        backgroundColor: "var(--surface-raised)",
        padding: "var(--space-6)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-color)",
        marginBottom: "var(--space-8)"
      }}>
        <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)", fontWeight: "var(--weight-semibold)" }}>
          Extracted Content
        </h2>
        <div style={{
          backgroundColor: "var(--surface)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-md)",
          maxHeight: "400px",
          overflowY: "auto",
          fontSize: "var(--text-sm)",
          fontFamily: "var(--font-mono)",
          whiteSpace: "pre-wrap",
          border: "1px solid var(--border-subtle)"
        }}>
          {material.content}
        </div>
      </section>
      
      <section style={{
        backgroundColor: "var(--surface-raised)",
        padding: "var(--space-8)",
        borderRadius: "var(--radius-xl)",
        border: "1px dashed var(--border-color)",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)", fontWeight: "var(--weight-semibold)" }}>
          Smart AI Features
        </h2>
        <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto", marginBottom: "var(--space-6)" }}>
          Click below to instantly convert this document into Smart Notes, Flashcards, or Quizzes using Google Gemini.
        </p>
        <MaterialActions materialId={material._id.toString()} />
      </section>
    </div>
  );
}
