import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { id: visitorId } = getOrCreateVisitorId(req);
  const { listed, priceUsd, walletAddress } = (await req.json()) as {
    listed: boolean;
    priceUsd?: number;
    walletAddress?: string;
  };

  const db = sql();
  const [record] = await db`select creator_visitor_id from memories where id = ${id}`;
  if (!record) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  if (record.creator_visitor_id !== visitorId) {
    return NextResponse.json({ error: "You don't own this memory" }, { status: 403 });
  }

  if (listed && (!priceUsd || priceUsd <= 0)) {
    return NextResponse.json({ error: "priceUsd must be greater than 0 to list" }, { status: 400 });
  }
  if (listed && !walletAddress) {
    return NextResponse.json({ error: "Connect a wallet before listing, so buyers can pay you directly" }, { status: 400 });
  }

  await db`
    update memories
    set listed = ${listed},
        price_usd = ${listed ? priceUsd : 0},
        creator_wallet_address = ${listed ? walletAddress : null}
    where id = ${id}
  `;

  return NextResponse.json({ ok: true });
}
