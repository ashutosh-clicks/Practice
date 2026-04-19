import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import FlashcardDeck from "@/models/FlashcardDeck";
import Quiz from "@/models/Quiz";
import RevisionNotes from "@/models/RevisionNotes";

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

    // Search across all content types in parallel
    const [materials, flashcards, quizzes, notes] = await Promise.all([
      Material.find({ userId, title: regex }).select("title").limit(5).lean(),
      FlashcardDeck.find({ userId, title: regex }).select("title").limit(5).lean(),
      Quiz.find({ userId, title: regex }).select("title").limit(5).lean(),
      RevisionNotes.find({ userId, title: regex }).select("title").limit(5).lean(),
    ]);

    const results = [
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
