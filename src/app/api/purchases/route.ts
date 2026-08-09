import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateVisitorId, VISITOR_COOKIE } from "@/lib/visitor";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { id: visitorId, isNew } = getOrCreateVisitorId(req);
  const wallet = req.nextUrl.searchParams.get("wallet");

  const db = sql();
  const rows = wallet
    ? await db`
        select m.id, m.kind, m.tags, m.summary, m.price_usd, p.purchased_at
        from purchases p
        join memories m on m.id = p.memory_id
        where p.buyer_wallet_address = ${wallet} or p.visitor_id = ${visitorId}
        order by p.purchased_at desc
      `
    : await db`
        select m.id, m.kind, m.tags, m.summary, m.price_usd, p.purchased_at
        from purchases p
        join memories m on m.id = p.memory_id
        where p.visitor_id = ${visitorId}
        order by p.purchased_at desc
      `;

  const res = NextResponse.json({ purchases: rows });
  if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
  return res;
}
