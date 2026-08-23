const EMBEDDING_MODEL = "gemini-embedding-001";

/**
 * Generates an embedding vector for the given text via Google's Gemini API.
 * Returns null (rather than throwing) if no API key is configured, so
 * semantic search degrades gracefully to plain text search instead of
 * breaking memory creation or the marketplace.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text }] } }),
      }
    );
    if (!res.ok) {
      console.error("Embedding request failed:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.embedding?.values ?? null;
  } catch (err) {
    console.error("Embedding request error:", err);
    return null;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
