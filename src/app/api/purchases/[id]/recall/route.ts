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
  const [purchase] = wallet
    ? await db`
        select 1 from purchases
        where memory_id = ${id} and (buyer_wallet_address = ${wallet} or visitor_id = ${visitorId})
      `
    : await db`select 1 from purchases where memory_id = ${id} and visitor_id = ${visitorId}`;

  if (!purchase) {
    return NextResponse.json({ error: "You haven't purchased this memory" }, { status: 403 });
  }

  const [record] = await db`select blob_name, enc_key, upload_account_address from memories where id = ${id}`;
  if (!record) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  const client = getShelbyClient();
  const downloadAccount = record.upload_account_address ?? getServiceSigner().accountAddress.toString();
  const blob = await client.download({
    account: downloadAccount,
    blobName: record.blob_name,
  });
  const buffer = await readAllBytes(blob.readable);
  const payload: EncryptedPayload = JSON.parse(buffer.toString("utf8"));
  const content = decryptMemory(payload, record.enc_key);

  return NextResponse.json({ content });
}
