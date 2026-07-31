import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { id: visitorId } = getOrCreateVisitorId(req);
  const { listed, priceUsd } = (await req.json()) as { listed: boolean; priceUsd?: number };

  if (listed && (!priceUsd || priceUsd <= 0)) {
    return NextResponse.json({ error: "priceUsd must be > 0 to list a memory" }, { status: 400 });
  }

  const db = sql();
  const [record] = await db`
    select id from memories where id = ${id} and creator_visitor_id = ${visitorId}
  `;
  if (!record) {
    return NextResponse.json({ error: "Memory not found or not yours" }, { status: 404 });
  }

  const [updated] = await db`
    update memories
    set listed = ${listed}, price_usd = ${listed ? priceUsd : 0}
    where id = ${id}
    returning id, kind, tags, summary, listed, price_usd, created_at, expires_at
  `;

  return NextResponse.json({ memory: updated });
}
