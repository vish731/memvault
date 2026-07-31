import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { encryptMemory, generateMemoryKey } from "@/lib/crypto";
import { getServiceSigner, getShelbyClient } from "@/lib/shelby";
import { getOrCreateVisitorId, VISITOR_COOKIE } from "@/lib/visitor";

export const runtime = "nodejs";

type MemoryKind = "conversation" | "fact" | "document" | "embedding";

export async function GET(req: NextRequest) {
  const { id: visitorId, isNew } = getOrCreateVisitorId(req);
  const db = sql();

  const rows = await db`
    select id, kind, tags, summary, listed, price_usd, created_at, expires_at
    from memories
    where creator_visitor_id = ${visitorId}
    order by created_at desc
  `;

  const res = NextResponse.json({ memories: rows });
  if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
  return res;
}

export async function POST(req: NextRequest) {
  const { id: visitorId, isNew } = getOrCreateVisitorId(req);

  const body = await req.json();
  const { content, summary, tags, kind, ttlDays } = body as {
    content?: string;
    summary?: string;
    tags?: string[];
    kind?: MemoryKind;
    ttlDays?: number;
  };

  if (!content || !summary) {
    return NextResponse.json({ error: "content and summary are required" }, { status: 400 });
  }

  const client = getShelbyClient();
  const signer = getServiceSigner();

  const key = generateMemoryKey();
  const payload = encryptMemory(content, key);
  const blobName = `memories/${crypto.randomUUID()}.enc.json`;
  const expirationMicros = (Date.now() + (ttlDays ?? 30) * 24 * 60 * 60 * 1000) * 1000;

  await client.upload({
    signer,
    blobData: Buffer.from(JSON.stringify(payload)),
    blobName,
    expirationMicros,
  });

  const db = sql();
  const [record] = await db`
    insert into memories (creator_visitor_id, blob_name, kind, tags, summary, enc_key, expires_at)
    values (
      ${visitorId},
      ${blobName},
      ${kind ?? "fact"},
      ${tags ?? []},
      ${summary},
      ${key},
      to_timestamp(${expirationMicros / 1_000_000})
    )
    returning id, kind, tags, summary, listed, price_usd, created_at, expires_at
  `;

  const res = NextResponse.json({ memory: record }, { status: 201 });
  if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
  return res;
}
