import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import FlashcardDeck from "@/models/FlashcardDeck";
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
      You are an expert educational AI. I will provide you with the extracted text from a study document.
      Your task is to generate a comprehensive deck of flashcards based on the most important concepts, definitions, and facts found in the text.
      
      Requirements:
      1. Generate between 5 to 15 flashcards depending on the length of the material.
      2. Keep the 'front' (question/concept) concise.
      3. Keep the 'back' (answer/definition) clear, accurate, and easy to memorize.
      4. You MUST return ONLY a valid JSON array of objects, with no markdown formatting around it. Do not include \`\`\`json or \`\`\`. Just raw JSON.
      
      Format Example:
      [
        { "front": "What is the mitochondria?", "back": "The powerhouse of the cell." },
        { "front": "Define Osmosis", "back": "The movement of water molecules across a semipermeable membrane from a region of higher to lower concentration." }
      ]
      
      STUDY MATERIAL CONTENT:
      """
      ${material.content.substring(0, 50000)}
      """
    `;

    const responseText = await generateWithRetry(prompt);
    const jsonString = cleanJsonResponse(responseText);
    const parsedCards = JSON.parse(jsonString);

    if (!Array.isArray(parsedCards) || parsedCards.length === 0) {
      throw new Error("AI did not return a valid list of flashcards.");
    }

    // Save to database
    const deck = await FlashcardDeck.create({
      materialId: material._id,
      userId: (session.user as any).id,
      title: `${material.title} Flashcards`,
      cards: parsedCards
    });

    return NextResponse.json({ message: "Flashcards generated", deckId: deck._id }, { status: 200 });

  } catch (error: any) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate flashcards" }, { status: 500 });
  }
}
