import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { decryptMemory, EncryptedPayload } from "@/lib/crypto";
import { getServiceSigner, getShelbyClient, readAllBytes } from "@/lib/shelby";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { id: visitorId } = getOrCreateVisitorId(req);

  const db = sql();
  const [record] = await db`
    select id, creator_visitor_id, blob_name, enc_key
    from memories
    where id = ${id}
  `;

  if (!record) {
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }

  // Owner can always recall for free. Non-owners must have purchased it.
  if (record.creator_visitor_id !== visitorId) {
    const [purchase] = await db`
      select 1 from purchases where memory_id = ${id} and visitor_id = ${visitorId}
    `;
    if (!purchase) {
      return NextResponse.json(
        { error: "You don't have access to this memory. Buy it from the marketplace first." },
        { status: 403 }
      );
    }
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
