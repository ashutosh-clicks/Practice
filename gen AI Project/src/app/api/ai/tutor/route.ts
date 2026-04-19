import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import ChatSession from "@/models/ChatSession";
import { generateWithRetry } from "@/lib/gemini";
import mongoose from "mongoose";

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
    
    // Get context from materials
    const userId = (session.user as any).id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    let contextText = "";
    
    if (materialId === "all") {
      const materials = await Material.find({ 
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
        
      if (materials.length > 0) {
        contextText = materials.map((m: any) => `Document Title: ${m.title}\n\nContent:\n${m.content}`).join("\n\n---\n\n");
      }
    } else {
      const material = await Material.findOne({
        _id: materialId,
        $or: [{ userId: userObjectId }, { sharedWith: userObjectId }] 
      }).lean();
      
      if (material) {
        contextText = `Document Title: ${(material as any).title}\n\nContent:\n${(material as any).content}`;
      }
    }

    if (!contextText) {
      contextText = "No study materials available context. Inform the user to upload materials first.";
    }

    const truncatedContext = contextText.substring(0, 40000); 

    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `
      You are an expert, encouraging, and helpful AI study tutor. 
      Your task is to answer the student's questions EXACTLY based on the provided study materials.
      Do NOT invent information that is not in the text, though you can use your general knowledge to explain the text better.
      If the answer is not in the text, politely say so.
      
      Below are the ONLY study materials you should use for context:
      
      <STUDY_MATERIALS>
      ${truncatedContext}
      </STUDY_MATERIALS>
      
      Below is the conversation history so far:
      
      <CONVERSATION_HISTORY>
      ${conversationHistory}
      </CONVERSATION_HISTORY>
      
      Provide the next response as the "Tutor". Keep your answers clear, educational, and appropriately formatted with markdown if needed for lists, bolding, etc. Do not output the "Tutor:" prefix, just your response.
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
