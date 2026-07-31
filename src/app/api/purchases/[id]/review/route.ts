import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { id: visitorId } = getOrCreateVisitorId(req);
  const { rating, comment } = (await req.json()) as { rating?: number; comment?: string };

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const db = sql();
  const [purchase] = await db`select 1 from purchases where memory_id = ${id} and visitor_id = ${visitorId}`;
  if (!purchase) {
    return NextResponse.json({ error: "You can only review memories you've purchased" }, { status: 403 });
  }

  await db`
    insert into reviews (memory_id, visitor_id, rating, comment)
    values (${id}, ${visitorId}, ${rating}, ${comment ?? null})
    on conflict (memory_id, visitor_id) do update set rating = ${rating}, comment = ${comment ?? null}
  `;

  return NextResponse.json({ ok: true });
}
