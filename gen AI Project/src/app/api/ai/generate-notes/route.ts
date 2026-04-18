import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import RevisionNotes from "@/models/RevisionNotes";
import { generateWithRetry, cleanJsonResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { materialId } = await req.json();

    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
    }

    await connectMongo();

    const material = await Material.findById(materialId);
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    const prompt = `
      You are an expert educational AI specializing in creating concise revision notes.
      I will provide you with the extracted text from a study document.
      Your task is to generate revision notes that are:
      - Extremely concise and to the point
      - Organized into logical sections with clear headings
      - Written as short bullet points, not paragraphs
      - Focused on key definitions, formulas, facts, and concepts
      - Perfect for quick last-minute revision before an exam
      
      Requirements:
      1. Create 3–8 sections depending on the document length.
      2. Each section should have a clear heading and 3–7 bullet points.
      3. Each bullet point should be one concise sentence or phrase — no fluff.
      4. You MUST return ONLY a valid JSON array of objects, with no markdown formatting around it.
      
      Format Example:
      [
        {
          "heading": "Introduction to Neural Networks",
          "bullets": [
            "Neural networks are computational models inspired by the human brain",
            "Consist of layers: input, hidden, and output",
            "Each neuron applies an activation function to its weighted inputs"
          ]
        }
      ]
      
      STUDY MATERIAL CONTENT:
      """
      ${material.content.substring(0, 50000)}
      """
    `;

    const responseText = await generateWithRetry(prompt);
    const jsonString = cleanJsonResponse(responseText);
    const parsedSections = JSON.parse(jsonString);

    if (!Array.isArray(parsedSections) || parsedSections.length === 0) {
      throw new Error("AI did not return valid revision notes.");
    }

    const notes = await RevisionNotes.create({
      materialId: material._id,
      userId: (session.user as any).id,
      title: `${material.title} — Revision Notes`,
      sections: parsedSections,
    });

    return NextResponse.json({ message: "Revision notes generated", notesId: notes._id }, { status: 200 });

  } catch (error: any) {
    console.error("Revision notes generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate revision notes" }, { status: 500 });
  }
}
