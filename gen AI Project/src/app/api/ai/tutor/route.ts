import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import ChatSession from "@/models/ChatSession";
import DocumentChunk from "@/models/DocumentChunk";
import { generateWithRetry } from "@/lib/gemini";
import { embedQuery } from "@/lib/embeddings";
import mongoose from "mongoose";

/**
 * Retrieves relevant context using vector search on document chunks.
 * Falls back to loading full documents if vector search is unavailable.
 */
async function getRelevantContext(
  query: string,
  userObjectId: mongoose.Types.ObjectId,
  materialId: string
): Promise<string> {
  // --- Attempt 1: Vector Search (RAG) ---
  try {
    const queryEmbedding = await embedQuery(query);

    // Build a pre-filter to scope results to this user's accessible documents
    const vectorFilter: any = {
      $or: [{ userId: userObjectId }],
    };

    // If a specific material is selected, scope to that material only
    if (materialId && materialId !== "all") {
      vectorFilter.materialId = new mongoose.Types.ObjectId(materialId);
    }

    // Run MongoDB Atlas $vectorSearch aggregation
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 8,
          filter: vectorFilter,
        },
      },
      {
        $project: {
          content: 1,
          materialId: 1,
          chunkIndex: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const relevantChunks = await DocumentChunk.aggregate(pipeline);

    if (relevantChunks.length > 0) {
      console.log(
        `[RAG] Found ${relevantChunks.length} relevant chunks via vector search (scores: ${relevantChunks.map((c: any) => c.score?.toFixed(3)).join(", ")})`
      );

      const contextText = relevantChunks
        .map(
          (chunk: any, i: number) =>
            `[Passage ${i + 1} — Relevance: ${(chunk.score * 100).toFixed(0)}%]\n${chunk.content}`
        )
        .join("\n\n---\n\n");

      return contextText;
    }
  } catch (vectorError: any) {
    // Vector search may fail if the Atlas index isn't created yet — fall back gracefully
    console.warn(
      "[RAG] Vector search unavailable, falling back to full document loading:",
      vectorError.message?.substring(0, 120)
    );
  }

  // --- Fallback: Load full documents (pre-RAG behavior) ---
  console.log(`[RAG Fallback] Loading full documents for materialId: ${materialId}`);
  
  if (materialId === "all") {
    const materials = await Material.find({
      $or: [{ userId: userObjectId }, { sharedWith: userObjectId }],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    console.log(`[RAG Fallback] Found ${materials.length} materials for user ${userObjectId}`);

    if (materials.length > 0) {
      return materials
        .map(
          (m: any) =>
            `Document Title: ${m.title}\n\nContent:\n${m.content}`
        )
        .join("\n\n---\n\n");
    }
  } else {
    const material = await Material.findOne({
      _id: materialId,
      $or: [{ userId: userObjectId }, { sharedWith: userObjectId }],
    }).lean();

    if (material) {
      return `Document Title: ${(material as any).title}\n\nContent:\n${(material as any).content}`;
    }
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, materialId, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }
    await connectMongo();

    // Get context using vector search (RAG) with fallback
    const userId = (session.user as any).id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const latestUserMessage = messages[messages.length - 1]?.content || "";

    let contextText = await getRelevantContext(
      latestUserMessage,
      userObjectId,
      materialId || "all"
    );

    console.log(`[Tutor] Context retrieved: ${contextText ? contextText.length + " chars" : "EMPTY"} | materialId: ${materialId || "all"} | userId: ${userId}`);

    if (!contextText) {
      contextText = "No study materials available context. Inform the user to upload materials first.";
    }

    const truncatedContext = contextText.substring(0, 40000);

    const conversationHistory = messages.map(msg =>
      `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `
      You are an expert, encouraging, and helpful AI study tutor.
      Your task is to answer the student's questions exactly how you are asked an in under 250 words or less
      unless the student specifically asks for a longer explanation.
      Do NOT invent information that is not in the text, though you can use your general knowledge to explain the text better.
      If the answer is not in the text say I can't find that information in the given context.
      
      The following passages were retrieved from the student's study materials using semantic search.
      They are the most relevant sections to the student's current question:
      
      <STUDY_MATERIALS>
      ${truncatedContext}
      </STUDY_MATERIALS>
      
      Below is the conversation history so far:
      
      <CONVERSATION_HISTORY>
      ${conversationHistory}
      </CONVERSATION_HISTORY>
      
      Provide the next response as the "Tutor". Keep your answers clear, educational, and appropriately
      formatted with markdown if needed for lists, bolding, etc. Do not output the "Tutor:" prefix, just your response.
    `;

    const responseText = await generateWithRetry(prompt);
    const finalReply = responseText.trim();

    // Add the AI's reply to the message array we save to the DB
    const updatedMessages = [...messages, { role: "assistant", content: finalReply }];

    let activeSessionId = sessionId;

    if (sessionId) {
      // Update existing session
      await ChatSession.findOneAndUpdate(
        { _id: sessionId, userId: (session.user as any).id },
        { messages: updatedMessages, updatedAt: new Date() }
      );
    } else {
      // Create new session
      const firstMessage = messages[0].content;
      const displayTitle = firstMessage.length > 40 ? firstMessage.substring(0, 40) + "..." : firstMessage;

      const newSession = await ChatSession.create({
        userId: (session.user as any).id,
        materialId: materialId || "all",
        title: displayTitle,
        messages: updatedMessages
      });
      activeSessionId = newSession._id.toString();
    }

    return NextResponse.json({ reply: finalReply, sessionId: activeSessionId }, { status: 200 });

  } catch (error: any) {
    console.error("Tutor chat error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate tutor response" }, { status: 500 });
  }
}
