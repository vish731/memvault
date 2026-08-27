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

  await db`delete from memories where id = ${id}`;

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { id: visitorId } = getOrCreateVisitorId(req);
    const { summary, tags, walletAddress } = (await req.json()) as {
      summary?: string;
      tags?: string[];
      walletAddress?: string;
    };

    if (!summary || summary.trim().length === 0) {
      return NextResponse.json({ error: "Summary can't be empty." }, { status: 400 });
    }
    if (summary.length > 150) {
      return NextResponse.json({ error: "Summary must be under 150 characters." }, { status: 400 });
    }

    const db = sql();
    const [record] = await db`select creator_visitor_id, creator_wallet_address from memories where id = ${id}`;
    if (!record) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    const ownsByWallet = walletAddress && record.creator_wallet_address && record.creator_wallet_address === walletAddress;
    const ownsByCookie = record.creator_visitor_id === visitorId;
    if (!ownsByWallet && !ownsByCookie) {
      return NextResponse.json({ error: "You don't own this memory" }, { status: 403 });
    }

    await db`
      update memories
      set summary = ${summary}, tags = ${tags ?? []}
      where id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to edit memory:", err);
    const message = err instanceof Error ? err.message : "Failed to update memory. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
