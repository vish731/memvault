import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { decryptMemory, EncryptedPayload } from "@/lib/crypto";
import { getServiceSigner, getShelbyClient, readAllBytes } from "@/lib/shelby";
import { getOrCreateVisitorId, VISITOR_COOKIE } from "@/lib/visitor";

export const runtime = "nodejs";

/**
 * NOTE ON REALISM: payment here is a local Postgres row, simulating shelbyUSD.
 * A production version would replace this with an on-chain escrow (Aptos Move
 * module) that emits a purchase event once the buyer's real shelbyUSD payment
 * is confirmed, and only then grant the "purchases" row / release the key.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { id: visitorId, isNew } = getOrCreateVisitorId(req);

  const db = sql();
  const [record] = await db`
    select id, blob_name, enc_key, price_usd, listed, creator_visitor_id
    from memories
    where id = ${id}
  `;
  if (!record || !record.listed) {
    return NextResponse.json({ error: "Memory not listed for sale" }, { status: 404 });
  }

  // Owners don't need to buy their own memory.
  if (record.creator_visitor_id === visitorId) {
    return NextResponse.json({ error: "You already own this memory" }, { status: 400 });
  }

  const [alreadyPurchased] = await db`
    select 1 from purchases where memory_id = ${id} and visitor_id = ${visitorId}
  `;

  if (!alreadyPurchased) {
    // Ensure a ledger row exists (everyone starts with a 100 shelbyUSD demo balance).
    await db`
      insert into ledger (visitor_id, balance) values (${visitorId}, 100)
      on conflict (visitor_id) do nothing
    `;
    const [ledgerRow] = await db`select balance from ledger where visitor_id = ${visitorId}`;
    const balance = Number(ledgerRow.balance);
    const price = Number(record.price_usd);

    if (balance < price) {
      return NextResponse.json(
        { error: `Insufficient simulated balance (${balance} < ${price} shelbyUSD)` },
        { status: 402 }
      );
    }

    await db`update ledger set balance = balance - ${price} where visitor_id = ${visitorId}`;
    await db`
      insert into purchases (memory_id, visitor_id) values (${id}, ${visitorId})
      on conflict do nothing
    `;
    // Credit the seller. This is the other half of the marketplace loop: buyers
    // spend shelbyUSD, sellers earn it back when their listed memories sell.
    await db`
      insert into ledger (visitor_id, balance) values (${record.creator_visitor_id}, 100 + ${price})
      on conflict (visitor_id) do update set balance = ledger.balance + ${price}
    `;
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

  const [ledgerRow] = await db`select balance from ledger where visitor_id = ${visitorId}`;

  const res = NextResponse.json({ content, remainingBalance: Number(ledgerRow.balance) });
  if (isNew) res.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax" });
  return res;
}
