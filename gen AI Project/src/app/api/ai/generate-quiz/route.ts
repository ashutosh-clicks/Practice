import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import Quiz from "@/models/Quiz";
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
      Your task is to generate a rigorous multiple-choice quiz based on the core concepts, facts, and themes in the text.
      
      Requirements:
      1. Generate exactly 5 multiple choice questions.
      2. Each question MUST have exactly 4 options.
      3. Provide the index of the correct option (0-3).
      4. Provide a brief explanation of why the answer is correct.
      5. You MUST return ONLY a valid JSON array of objects, with no markdown formatting around it!! No formatting at all.
      
      Format Example:
      [
        {
          "question": "What is the primary function of ribosomes?",
          "options": ["Energy production", "Protein synthesis", "DNA storage", "Waste removal"],
          "correctOptionIndex": 1,
          "explanation": "Ribosomes are responsible for translating mRNA into proteins."
        }
      ]
      
      STUDY MATERIAL CONTENT:
      """
      ${material.content.substring(0, 50000)}
      """
    `;

    const responseText = await generateWithRetry(prompt);
    const jsonString = cleanJsonResponse(responseText);
    const parsedQuiz = JSON.parse(jsonString);

    if (!Array.isArray(parsedQuiz) || parsedQuiz.length === 0) {
      throw new Error("AI did not return a valid quiz.");
    }

    // Save to database
    const quiz = await Quiz.create({
      materialId: material._id,
      userId: (session.user as any).id,
      title: `${material.title} Assessment`,
      questions: parsedQuiz
    });

    return NextResponse.json({ message: "Quiz generated", quizId: quiz._id }, { status: 200 });

  } catch (error: any) {
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 });
  }
}
