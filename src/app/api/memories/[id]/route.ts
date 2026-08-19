import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { id: visitorId } = getOrCreateVisitorId(req);
  const wallet = req.nextUrl.searchParams.get("wallet");

  const db = sql();
  const [record] = await db`
    select creator_visitor_id, creator_wallet_address from memories where id = ${id}
  `;
  if (!record) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  const ownsByWallet = wallet && record.creator_wallet_address && record.creator_wallet_address === wallet;
  const ownsByCookie = record.creator_visitor_id === visitorId;
  if (!ownsByWallet && !ownsByCookie) {
    return NextResponse.json({ error: "You don't own this memory" }, { status: 403 });
  }

  // This removes the metadata row (and, via foreign keys, any purchases,
  // favorites, and reviews pointing at it). The encrypted blob itself stays
  // on Shelby until it naturally expires — Shelby doesn't offer instant
  // deletion of already-committed blobs, only expiration.
  await db`delete from memories where id = ${id}`;

  return NextResponse.json({ ok: true });
}
