import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { decryptMemory, EncryptedPayload } from "@/lib/crypto";
import { getServiceSigner, getShelbyClient, readAllBytes } from "@/lib/shelby";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { id: visitorId } = getOrCreateVisitorId(req);
  const wallet = req.nextUrl.searchParams.get("wallet");

  const db = sql();
  const [record] = await db`
    select id, creator_visitor_id, creator_wallet_address, blob_name, enc_key
    from memories
    where id = ${id}
  `;

  if (!record) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  const ownsByWallet = wallet && record.creator_wallet_address && record.creator_wallet_address === wallet;
  const ownsByCookie = record.creator_visitor_id === visitorId;
  if (!ownsByWallet && !ownsByCookie) {
    return NextResponse.json({ error: "You don't own this memory" }, { status: 403 });
  }

  const client = getShelbyClient();
  const signer = getServiceSigner();

  const blob = await client.download({
    account: signer.accountAddress.toString(),
    blobName: record.blob_name,
  });
  const buffer = await readAllBytes(blob.readable);
  const payload: EncryptedPayload = JSON.parse(buffer.toString("utf8"));
  const content = decryptMemory(payload, record.enc_key);

  return NextResponse.json({ content });
}
