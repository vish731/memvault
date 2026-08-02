import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateVisitorId, VISITOR_COOKIE } from "@/lib/visitor";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { id: visitorId, isNew } = getOrCreateVisitorId(req);
  const tag = req.nextUrl.searchParams.get("tag");

  const db = sql();
  const rows = tag
    ? await db`
        select m.id, m.kind, m.tags, m.summary, m.price_usd, m.created_at, m.creator_wallet_address,
          coalesce(r.avg_rating, null) as avg_rating,
          coalesce(r.review_count, 0) as review_count
        from memories m
        left join (
          select memory_id, avg(rating)::numeric(3,2) as avg_rating, count(*) as review_count
          from reviews group by memory_id
        ) r on r.memory_id = m.id
        where m.listed = true and ${tag} = any(m.tags)
        order by m.created_at desc
      `
    : await db`
        select m.id, m.kind, m.tags, m.summary, m.price_usd, m.created_at, m.creator_wallet_address,
          coalesce(r.avg_rating, null) as avg_rating,
          coalesce(r.review_count, 0) as review_count
        from memories m
        left join (
          select memory_id, avg(rating)::numeric(3,2) as avg_rating, count(*) as review_count
          from reviews group by memory_id
        ) r on r.memory_id = m.id
        where m.listed = true
        order by m.created_at desc
      `;

  const purchased = await db`select memory_id from purchases where visitor_id = ${visitorId}`;
  const purchasedIds = new Set(purchased.map((p: Record<string, unknown>) => p.memory_id as string));

  const favorited = await db`select memory_id from favorites where visitor_id = ${visitorId}`;
  const favoritedIds = new Set(favorited.map((f: Record<string, unknown>) => f.memory_id as string));

  const listings = rows.map((r: Record<string, unknown>) => ({
    ...r,
    alreadyPurchased: purchasedIds.has(r.id as string),
    isFavorite: favoritedIds.has(r.id as string),
  }));

  await db`
    insert into ledger (visitor_id, balance) values (${visitorId}, 100)
    on conflict (visitor_id) do nothing
  `;
  const [ledgerRow] = await db`select balance from ledger where visitor_id = ${visitorId}`;
  const balance = ledgerRow ? Number(ledgerRow.balance) : 100;

  const res = NextResponse.json({ listings, balance });
  if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
  return res;
}
