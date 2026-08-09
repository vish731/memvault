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
        select m.id, m.kind, m.tags, m.summary, m.price_usd, m.listed, m.creator_wallet_address,
          coalesce(r.avg_rating, null) as avg_rating,
          coalesce(r.review_count, 0) as review_count,
          exists(
            select 1 from purchases pu
            where pu.memory_id = m.id and (pu.buyer_wallet_address = ${wallet} or pu.visitor_id = ${visitorId})
          ) as already_purchased
        from favorites f
        join memories m on m.id = f.memory_id
        left join (
          select memory_id, avg(rating)::numeric(3,2) as avg_rating, count(*) as review_count
          from reviews group by memory_id
        ) r on r.memory_id = m.id
        where f.wallet_address = ${wallet} or f.visitor_id = ${visitorId}
        order by f.created_at desc
      `
    : await db`
        select m.id, m.kind, m.tags, m.summary, m.price_usd, m.listed, m.creator_wallet_address,
          coalesce(r.avg_rating, null) as avg_rating,
          coalesce(r.review_count, 0) as review_count,
          exists(select 1 from purchases pu where pu.memory_id = m.id and pu.visitor_id = ${visitorId}) as already_purchased
        from favorites f
        join memories m on m.id = f.memory_id
        left join (
          select memory_id, avg(rating)::numeric(3,2) as avg_rating, count(*) as review_count
          from reviews group by memory_id
        ) r on r.memory_id = m.id
        where f.visitor_id = ${visitorId}
        order by f.created_at desc
      `;

  const res = NextResponse.json({ favorites: rows });
  if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
  return res;
}
