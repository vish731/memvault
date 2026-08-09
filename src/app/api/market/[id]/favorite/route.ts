import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateVisitorId, VISITOR_COOKIE } from "@/lib/visitor";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { id: visitorId, isNew } = getOrCreateVisitorId(req);
  const { walletAddress } = (await req.json().catch(() => ({}))) as { walletAddress?: string };
  const db = sql();

  const [existing] = await db`select 1 from favorites where memory_id = ${id} and visitor_id = ${visitorId}`;

  let favorited: boolean;
  if (existing) {
    await db`delete from favorites where memory_id = ${id} and visitor_id = ${visitorId}`;
    favorited = false;
  } else {
    await db`
      insert into favorites (visitor_id, wallet_address, memory_id)
      values (${visitorId}, ${walletAddress ?? null}, ${id})
      on conflict do nothing
    `;
    favorited = true;
  }

  const res = NextResponse.json({ favorited });
  if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
  return res;
}
