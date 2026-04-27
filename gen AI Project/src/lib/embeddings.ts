import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768; // Use MRL to reduce from default 3072 → 768
const DEFAULT_CHUNK_SIZE = 800; // characters per chunk
const DEFAULT_CHUNK_OVERLAP = 200; // overlap between consecutive chunks

/**
 * Splits a long text into overlapping chunks of approximately `chunkSize` characters.
 * Splits on sentence boundaries when possible to keep chunks coherent.
 */
export function chunkText(
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_CHUNK_OVERLAP
): string[] {
  if (!text || text.trim().length === 0) return [];

  const cleaned = text.replace(/\s+/g, " ").trim();

  // If the text fits in one chunk, return it as-is
  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleaned.length) {
    let endIndex = Math.min(startIndex + chunkSize, cleaned.length);

    // If we're not at the end, try to break on a sentence boundary
    if (endIndex < cleaned.length) {
      const segment = cleaned.substring(startIndex, endIndex);
      const lastSentenceEnd = Math.max(
        segment.lastIndexOf(". "),
        segment.lastIndexOf("? "),
        segment.lastIndexOf("! "),
        segment.lastIndexOf("\n")
      );

      // Only break at sentence boundary if it's in the latter half of the chunk
      if (lastSentenceEnd > chunkSize * 0.4) {
        endIndex = startIndex + lastSentenceEnd + 1; // +1 to include the period
      }
    }

    const chunk = cleaned.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start forward, accounting for overlap
    const nextStart = endIndex - overlap;

    // Prevent infinite loop: ensure we always advance
    if (nextStart <= startIndex) {
      startIndex = endIndex;
    } else {
      startIndex = nextStart;
    }
  }

  return chunks;
}

/**
 * Generates embeddings for an array of text strings using Gemini's embedding model.
 * Processes in batches to respect API rate limits.
 * Uses RETRIEVAL_DOCUMENT task type for optimal retrieval performance.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const BATCH_SIZE = 10; // Process 10 texts at a time
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const batchEmbeddings = await Promise.all(
      batch.map(async (text) => {
        const response = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: text,
          config: {
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: EMBEDDING_DIMENSIONS,
          },
        });
        return response.embeddings?.[0]?.values || [];
      })
    );

    allEmbeddings.push(...batchEmbeddings);

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return allEmbeddings;
}

/**
 * Generates an embedding for a single query string.
 * Uses RETRIEVAL_QUERY task type for optimal retrieval performance.
 */
export async function embedQuery(query: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: query,
    config: {
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });
  return response.embeddings?.[0]?.values || [];
}
