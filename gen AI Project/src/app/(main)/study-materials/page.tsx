import UploadDocument from "@/components/features/UploadDocument";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import { FileText, CalendarDays } from "lucide-react";
import Link from "next/link";
import { ShareButton } from "@/components/features/ShareButton";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export default async function StudyMaterialsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  // Fetch materials for current user
  let materials: any[] = [];
  try {
    if (userId) {
      await connectMongo();
      const userObjectId = new mongoose.Types.ObjectId(userId);

      materials = await Material.find({ 
        $or: [
          { userId: userObjectId },
          { sharedWith: userObjectId }
        ]
      })
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (e) {
    console.error("Error fetching materials:", e);
  }

  return (
    <div>
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1>Study Materials</h1>
        <p className="text-muted" style={{ marginTop: "var(--space-2)" }}>
          Manage your uploaded documents, lecture notes, and textbook chapters.
        </p>
      </header>
      
      <section style={{ marginBottom: "var(--space-10)" }}>
        <UploadDocument />
      </section>
      
      <section>
         <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-4)", fontWeight: "var(--weight-semibold)" }}>
           Your Library
         </h2>
         
         {materials.length === 0 ? (
           <div style={{
             backgroundColor: "var(--surface-raised)",
             padding: "var(--space-8)",
             borderRadius: "var(--radius-lg)",
             border: "1px dashed var(--border-color)",
             textAlign: "center"
           }}>
             <FileText size={48} style={{ color: "var(--text-disabled)", margin: "0 auto var(--space-4)" }} />
             <p className="text-muted">No materials in your library yet. Upload a document above to get started.</p>
           </div>
         ) : (
           <div style={{
             display: "grid",
             gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
             gap: "var(--space-4)"
           }}>
             {materials.map((m: any) => (
               <Link 
                 href={`/study-materials/${m._id.toString()}`} 
                 key={m._id.toString()}
                 className="hover-card"
                 style={{
                   backgroundColor: "var(--surface-raised)",
                   padding: "var(--space-4)",
                   borderRadius: "var(--radius-lg)",
                   border: "1px solid var(--border-color)",
                   display: "flex",
                   flexDirection: "column",
                   gap: "var(--space-3)",
                   cursor: "pointer",
                   textDecoration: "none",
                   color: "inherit"
                 }}
               >
                 <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                   <div style={{
                     padding: "var(--space-2)",
                     backgroundColor: "rgba(14, 165, 233, 0.1)",
                     color: "var(--primary-color)",
                     borderRadius: "var(--radius-sm)"
                   }}>
                     <FileText size={20} />
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <h3 style={{ 
                       fontSize: "var(--text-base)", 
                       fontWeight: "var(--weight-medium)",
                       whiteSpace: "nowrap",
                       overflow: "hidden",
                       textOverflow: "ellipsis"
                     }}>
                       {m.title}
                     </h3>
                     <p className="text-muted" style={{ fontSize: "var(--text-xs)", display: "flex", alignItems: "center", gap: "var(--space-1)", marginTop: "4px" }}>
                       <CalendarDays size={12} />
                       {new Date(m.createdAt).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
                 
                 <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: "var(--text-xs)", color: "var(--primary-color)", fontWeight: "var(--weight-medium)" }}>
                     View Details
                   </span>
                   <ShareButton resourceId={m._id.toString()} resourceType="material" variant="icon" />
                 </div>
               </Link>
             ))}
           </div>
         )}
      </section>
    </div>
  );
}
