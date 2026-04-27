/**
 * One-time migration script to generate embeddings for existing materials
 * that were uploaded before the vector search feature was added.
 *
 * Run with: node migrate-embeddings.js
 */

const mongoose = require("mongoose");
const dns = require("dns");
const { GoogleGenAI } = require("@google/genai");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Load .env.local
const fs = require("fs");
const path = require("path");
const envPath = path.join(__dirname, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) return;
  const key = trimmed.substring(0, eqIndex).trim();
  let value = trimmed.substring(eqIndex + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
});

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!MONGODB_URI || !GEMINI_API_KEY) {
  console.error("ERROR: MONGODB_URI or GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const EMBEDDING_MODEL = "gemini-embedding-001";
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

function chunkText(text) {
  if (!text || text.trim().length === 0) return [];
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= CHUNK_SIZE) return [cleaned];

  const chunks = [];
  let startIndex = 0;

  while (startIndex < cleaned.length) {
    let endIndex = Math.min(startIndex + CHUNK_SIZE, cleaned.length);

    if (endIndex < cleaned.length) {
      const segment = cleaned.substring(startIndex, endIndex);
      const lastSentenceEnd = Math.max(
        segment.lastIndexOf(". "),
        segment.lastIndexOf("? "),
        segment.lastIndexOf("! "),
        segment.lastIndexOf("\n")
      );
      if (lastSentenceEnd > CHUNK_SIZE * 0.4) {
        endIndex = startIndex + lastSentenceEnd + 1;
      }
    }

    const chunk = cleaned.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) chunks.push(chunk);

    const nextStart = endIndex - CHUNK_OVERLAP;
    startIndex = nextStart <= startIndex ? endIndex : nextStart;
  }

  return chunks;
}

async function embedText(text) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    },
  });
  return response.embeddings?.[0]?.values || [];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, family: 4 });
  console.log("Connected.\n");

  const db = mongoose.connection.db;
  const materialsCol = db.collection("materials");
  const chunksCol = db.collection("documentchunks");

  // Find all materials
  const materials = await materialsCol.find({}).toArray();
  console.log(`Found ${materials.length} materials total.\n`);

  let processed = 0;
  let skipped = 0;

  for (const material of materials) {
    // Check if chunks already exist for this material
    const existingChunks = await chunksCol.countDocuments({ materialId: material._id });

    if (existingChunks > 0) {
      console.log(`⏭  "${material.title}" — already has ${existingChunks} chunks, skipping.`);
      skipped++;
      continue;
    }

    console.log(`📄 Processing "${material.title}" (${material.content?.length || 0} chars)...`);

    const chunks = chunkText(material.content || "");
    if (chunks.length === 0) {
      console.log(`   ⚠  No content to chunk, skipping.`);
      skipped++;
      continue;
    }

    console.log(`   Chunked into ${chunks.length} pieces. Generating embeddings...`);

    const chunkDocs = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await embedText(chunks[i]);
        chunkDocs.push({
          materialId: material._id,
          userId: material.userId,
          chunkIndex: i,
          content: chunks[i],
          embedding,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Rate limit: small delay between embedding calls
        if (i < chunks.length - 1) {
          await sleep(200);
        }
      } catch (err) {
        console.error(`   ❌ Error embedding chunk ${i}: ${err.message}`);
      }
    }

    if (chunkDocs.length > 0) {
      await chunksCol.insertMany(chunkDocs);
      console.log(`   ✅ Stored ${chunkDocs.length} chunks with embeddings.`);
      processed++;
    }

    // Delay between materials to avoid rate limits
    await sleep(1000);
  }

  console.log(`\n========================================`);
  console.log(`Migration complete!`);
  console.log(`  Processed: ${processed} materials`);
  console.log(`  Skipped:   ${skipped} materials`);
  console.log(`  Total chunks created: check your Atlas dashboard`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
