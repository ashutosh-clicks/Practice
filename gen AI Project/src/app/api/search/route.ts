import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import FlashcardDeck from "@/models/FlashcardDeck";
import Quiz from "@/models/Quiz";
import RevisionNotes from "@/models/RevisionNotes";
import DocumentChunk from "@/models/DocumentChunk";
import { embedQuery } from "@/lib/embeddings";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const userId = (session.user as any).id;
    await connectMongo();

    const regex = new RegExp(query, "i");

    // --- Run keyword search and semantic search in parallel ---
    let semanticMaterialIds: string[] = [];

    // Attempt vector search for semantically relevant materials
    try {
      const queryEmbedding = await embedQuery(query);
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const vectorResults = await DocumentChunk.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 30,
            limit: 5,
            filter: { userId: userObjectId },
          },
        },
        {
          $group: {
            _id: "$materialId",
            maxScore: { $max: { $meta: "vectorSearchScore" } },
          },
        },
        { $sort: { maxScore: -1 } },
      ]);

      semanticMaterialIds = vectorResults.map((r: any) => r._id.toString());
    } catch (vectorError: any) {
      // Vector search may be unavailable — continue with keyword search only
      console.warn("[Search] Vector search unavailable:", vectorError.message?.substring(0, 80));
    }

    // Keyword search across all content types
    const [materials, flashcards, quizzes, notes] = await Promise.all([
      Material.find({ userId, title: regex }).select("title").limit(5).lean(),
      FlashcardDeck.find({ userId, title: regex }).select("title").limit(5).lean(),
      Quiz.find({ userId, title: regex }).select("title").limit(5).lean(),
      RevisionNotes.find({ userId, title: regex }).select("title").limit(5).lean(),
    ]);

    // Fetch semantic-matched materials that weren't caught by keyword search
    const keywordMaterialIds = new Set(materials.map((m: any) => m._id.toString()));
    const additionalSemanticIds = semanticMaterialIds.filter(
      (id) => !keywordMaterialIds.has(id)
    );

    let semanticMaterials: any[] = [];
    if (additionalSemanticIds.length > 0) {
      semanticMaterials = await Material.find({
        _id: { $in: additionalSemanticIds },
        userId,
      })
        .select("title")
        .lean();
    }

    const results = [
      // Semantic matches first (they're more relevant)
      ...semanticMaterials.map((m: any) => ({
        _id: m._id.toString(),
        title: m.title,
        type: "material",
        href: `/study-materials/${m._id}`,
        semantic: true,
      })),
      // Then keyword matches
      ...materials.map((m: any) => ({ _id: m._id.toString(), title: m.title, type: "material", href: `/study-materials/${m._id}` })),
      ...flashcards.map((f: any) => ({ _id: f._id.toString(), title: f.title, type: "flashcard", href: `/flashcards/${f._id}` })),
      ...quizzes.map((q: any) => ({ _id: q._id.toString(), title: q.title, type: "quiz", href: `/quizzes/${q._id}` })),
      ...notes.map((n: any) => ({ _id: n._id.toString(), title: n.title, type: "notes", href: `/notes/${n._id}` })),
    ];

    return NextResponse.json({ results });

  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
