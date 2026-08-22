import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cosineSimilarity, generateEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "q query param is required" }, { status: 400 });
  }

  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) {
    return NextResponse.json(
      { error: "Semantic search isn't configured.", results: [], semanticAvailable: false },
      { status: 200 }
    );
  }

  const db = sql();
  const rows = await db`
    select id, kind, tags, summary, price_usd, summary_embedding
    from memories
    where listed = true and summary_embedding is not null
  `;

  const scored = rows
    .map((r: Record<string, unknown>) => ({
      id: r.id as string,
      kind: r.kind as string,
      tags: r.tags as string[],
      summary: r.summary as string,
      price_usd: r.price_usd,
      score: cosineSimilarity(queryEmbedding, r.summary_embedding as number[]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return NextResponse.json({ results: scored, semanticAvailable: true });
}
