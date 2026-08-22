import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "@/lib/db";
import { encryptMemory, generateMemoryKey } from "@/lib/crypto";
import {
  getAptos,
  getOrCreateUserShelbyAccount,
  getShelbyClient,
  SHELBY_USD_FA_ADDRESS,
} from "@/lib/shelby";
import { getOrCreateVisitorId, VISITOR_COOKIE } from "@/lib/visitor";
import { generateEmbedding } from "@/lib/embeddings";

export const runtime = "nodejs";

type MemoryKind = "conversation" | "fact" | "document" | "embedding";

export async function GET(req: NextRequest) {
  const { id: visitorId, isNew } = getOrCreateVisitorId(req);
  const wallet = req.nextUrl.searchParams.get("wallet");
  const db = sql();

  const rows = wallet
    ? await db`
        select id, kind, tags, summary, listed, price_usd, created_at, expires_at
        from memories
        where creator_wallet_address = ${wallet} or creator_visitor_id = ${visitorId}
        order by created_at desc
      `
    : await db`
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
  const { content, summary, tags, kind, ttlDays, walletAddress } = body as {
    content?: string;
    summary?: string;
    tags?: string[];
    kind?: MemoryKind;
    ttlDays?: number;
    walletAddress?: string;
  };

  if (!content || !summary) {
    return NextResponse.json({ error: "content and summary are required" }, { status: 400 });
  }
  if (summary.length > 150) {
    return NextResponse.json({ error: "Summary must be under 150 characters." }, { status: 400 });
  }
  if (!walletAddress) {
    return NextResponse.json({ error: "Connect your wallet before storing a memory." }, { status: 400 });
  }

  try {
    const client = getShelbyClient();

    // Require the user's own funded Shelby account. No silent fallback to the
    // shared account, so a failed/underfunded personal account surfaces as a
    // clear error instead of quietly using shared funds.
    const userAccount = await getOrCreateUserShelbyAccount(walletAddress);
    const aptos = getAptos();
    const uploadAccountAddress = userAccount.accountAddress.toString();
    const [aptOctas, shelbyUsdRaw] = await Promise.all([
      aptos.getAccountAPTAmount({ accountAddress: uploadAccountAddress }).catch(() => 0),
      aptos.getAccountCoinAmount({ accountAddress: uploadAccountAddress, faMetadataAddress: SHELBY_USD_FA_ADDRESS }).catch(() => 0),
    ]);

    if (aptOctas <= 0 || shelbyUsdRaw <= 0) {
      return NextResponse.json(
        {
          error: "Your personal Shelby account isn't funded yet. Fund it from your wallet profile panel (APT + ShelbyUSD), then try again.",
          personalAccountAddress: uploadAccountAddress,
        },
        { status: 402 }
      );
    }

    const signer = userAccount;

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

    // Generated from the public summary (never the encrypted content), so
    // semantic search can work without ever touching plaintext memory data.
    const embedding = await generateEmbedding(summary);

    const db = sql();
    const [record] = await db`
      insert into memories (
        creator_visitor_id, creator_wallet_address, upload_account_address,
        blob_name, kind, tags, summary, enc_key, expires_at, summary_embedding
      )
      values (
        ${visitorId}, ${walletAddress}, ${uploadAccountAddress},
        ${blobName}, ${kind ?? "fact"}, ${tags ?? []}, ${summary}, ${key},
        to_timestamp(${expirationMicros / 1_000_000}), ${embedding ? JSON.stringify(embedding) : null}
      )
      returning id, kind, tags, summary, listed, price_usd, created_at, expires_at
    `;

    const res = NextResponse.json({ memory: record, uploadedVia: uploadAccountAddress ? "personal" : "shared" }, { status: 201 });
    if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
    return res;
  } catch (err) {
    console.error("Failed to store memory:", err);
    const message = err instanceof Error ? err.message : "Failed to store memory. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
