import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Material from "@/models/Material";
import DocumentChunk from "@/models/DocumentChunk";
import { chunkText, generateEmbeddings } from "@/lib/embeddings";
import { promises as fs } from "fs";
import path from "path";

// robust server-side parsing not dependent on DOM/Canvas polyfills
import pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are currently supported" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Local dev: Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeFilename);

    await fs.writeFile(filePath, fileBuffer);

    // Extract text using pdf-parse
    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json({ error: "Could not extract any readable text from this PDF." }, { status: 400 });
    }

    await connectMongo();

    const title = formData.get("title") as string || file.name.replace(/\.[^/.]+$/, ""); // Strip extension
    const userId = (session.user as any).id;

    const newMaterial = await Material.create({
      title,
      originalFileName: file.name,
      content: extractedText.trim(),
      fileUrl: `/uploads/${safeFilename}`,
      userId,
      fileType: file.type,
    });

    // --- Vector Embedding Pipeline ---
    // Chunk the extracted text and generate embeddings for vector search
    try {
      const chunks = chunkText(extractedText.trim());

      if (chunks.length > 0) {
        console.log(`[Embeddings] Generating embeddings for ${chunks.length} chunks...`);
        const embeddings = await generateEmbeddings(chunks);

        // Build chunk documents for bulk insert
        const chunkDocs = chunks.map((content, index) => ({
          materialId: newMaterial._id,
          userId,
          chunkIndex: index,
          content,
          embedding: embeddings[index],
        }));

        await DocumentChunk.insertMany(chunkDocs);
        console.log(`[Embeddings] Stored ${chunkDocs.length} chunks with embeddings for material "${title}"`);
      }
    } catch (embeddingError: any) {
      // Log but don't fail the upload — material is still usable without embeddings
      console.error("[Embeddings] Failed to generate embeddings:", embeddingError.message);
    }

    return NextResponse.json({ message: "File uploaded and processed successfully", materialId: newMaterial._id }, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "An error occurred during file processing" }, { status: 500 });
  }
}
