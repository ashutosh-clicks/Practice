/**
 * One-time script to create the Atlas Vector Search index
 * on the documentchunks collection.
 *
 * Run with: node create-vector-index.js
 */

const mongoose = require("mongoose");
const dns = require("dns");

// Use Google DNS (same as the app)
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
  // Strip surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function main() {
  console.log("Connecting to MongoDB Atlas...");

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });

  console.log("Connected successfully.");

  const db = mongoose.connection.db;
  const collection = db.collection("documentchunks");

  // Check if the collection exists (may be empty if no documents uploaded yet)
  const collections = await db.listCollections({ name: "documentchunks" }).toArray();
  if (collections.length === 0) {
    console.log("Collection 'documentchunks' does not exist yet.");
    console.log("Creating it with a placeholder document...");
    
    // Insert and immediately delete a placeholder to create the collection
    await collection.insertOne({ _placeholder: true });
    await collection.deleteOne({ _placeholder: true });
    console.log("Collection created.");
  }

  // Define the vector search index
  const indexDefinition = {
    name: "vector_index",
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          path: "embedding",
          numDimensions: 768,
          similarity: "cosine",
        },
        {
          type: "filter",
          path: "userId",
        },
        {
          type: "filter",
          path: "materialId",
        },
      ],
    },
  };

  try {
    // Check if index already exists
    const existingIndexes = await collection.listSearchIndexes().toArray();
    const existing = existingIndexes.find((idx) => idx.name === "vector_index");

    if (existing) {
      console.log("Vector search index 'vector_index' already exists!");
      console.log("Status:", existing.status || "unknown");
    } else {
      console.log("Creating Atlas Vector Search index 'vector_index'...");
      await collection.createSearchIndex(indexDefinition);
      console.log("\n✅ Vector Search index created successfully!");
      console.log("It may take 1-2 minutes to become READY.");
      console.log("You can check the status in the Atlas UI under 'Atlas Search'.");
    }
  } catch (error) {
    if (error.message?.includes("already exists")) {
      console.log("Vector search index already exists.");
    } else if (error.message?.includes("not allowed") || error.codeName === "CommandNotSupportedOnView") {
      console.error("\n❌ ERROR: Your MongoDB Atlas cluster may not support Atlas Search.");
      console.error("Atlas Search requires M0 (free tier) or higher on Atlas.");
      console.error("If you're running MongoDB locally, Atlas Vector Search is not available.");
      console.error("\nFull error:", error.message);
    } else {
      console.error("\n❌ ERROR creating vector search index:", error.message);
      console.error("You may need to create it manually in the Atlas UI.");
      console.error("\nManual steps:");
      console.error("1. Go to https://cloud.mongodb.com → your cluster");
      console.error("2. Click 'Atlas Search' tab");
      console.error("3. Click 'Create Search Index' → 'JSON Editor'");
      console.error("4. Select collection: documentchunks");
      console.error("5. Index name: vector_index");
      console.error('6. Paste: {"fields":[{"type":"vector","path":"embedding","numDimensions":768,"similarity":"cosine"},{"type":"filter","path":"userId"},{"type":"filter","path":"materialId"}]}');
    }
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
