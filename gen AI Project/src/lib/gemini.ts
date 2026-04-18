import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Ordered by preference — will try each in sequence on failure
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.0-flash",
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls Gemini with automatic retry + model fallback on transient errors (503, 429, etc.)
 */
export async function generateWithRetry(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (const modelName of MODEL_CANDIDATES) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] Trying ${modelName} (attempt ${attempt}/${MAX_RETRIES})`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`[Gemini] Success with ${modelName}`);
        return text;
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.httpStatusCode || 0;
        const isRetryable = status === 503 || status === 429 || err.message?.includes("503") || err.message?.includes("429") || err.message?.includes("high demand");

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * attempt;
          console.log(`[Gemini] ${modelName} returned ${status || "transient error"}, retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        // If not retryable or exhausted retries for this model, move to next
        console.log(`[Gemini] ${modelName} failed after ${attempt} attempt(s): ${err.message?.substring(0, 120)}`);
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini model candidates failed.");
}

/**
 * Cleans markdown-wrapped JSON responses from the model.
 */
export function cleanJsonResponse(raw: string): string {
  let jsonString = raw.trim();
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.slice(7);
  }
  if (jsonString.startsWith("```")) {
    jsonString = jsonString.slice(3);
  }
  if (jsonString.endsWith("```")) {
    jsonString = jsonString.slice(0, -3);
  }
  return jsonString.trim();
}
