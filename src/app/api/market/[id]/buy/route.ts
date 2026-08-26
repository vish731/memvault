import { NextRequest, NextResponse } from "next/server";
import { isUserTransactionResponse } from "@aptos-labs/ts-sdk";
import { sql } from "@/lib/db";
import { decryptMemory, EncryptedPayload } from "@/lib/crypto";
import {
  getAptos,
  getServiceSigner,
  getShelbyClient,
  readAllBytes,
  SHELBY_USD_DECIMALS,
  SHELBY_USD_FA_ADDRESS,
} from "@/lib/shelby";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

async function verifyPayment(txHash: string, expectedRecipient: string, minAmount: number) {
  const aptos = getAptos();
  const txn = await aptos.waitForTransaction({ transactionHash: txHash });

  if (!isUserTransactionResponse(txn) || !txn.success) {
    throw new Error("That transaction did not succeed on-chain.");
  }

  const payload = txn.payload;
  if (!("function" in payload) || payload.function !== "0x1::primary_fungible_store::transfer") {
    throw new Error("That transaction wasn't a ShelbyUSD transfer.");
  }

  const [metadataArg, recipientArg, amountArg] = payload.arguments as [unknown, unknown, unknown];
  const metadataAddress =
    typeof metadataArg === "string" ? metadataArg : (metadataArg as { inner?: string })?.inner;

  if (!metadataAddress || !metadataAddress.toLowerCase().includes(SHELBY_USD_FA_ADDRESS.slice(2).toLowerCase())) {
    throw new Error("That transaction didn't transfer ShelbyUSD.");
  }
  if (String(recipientArg).toLowerCase() !== expectedRecipient.toLowerCase()) {
    throw new Error("That transaction paid the wrong recipient.");
  }
  if (Number(amountArg) < Math.round(minAmount * SHELBY_USD_DECIMALS)) {
    throw new Error("That transaction didn't pay enough.");
  }

  return txn.sender;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { id: visitorId } = getOrCreateVisitorId(req);
    const wallet = req.nextUrl.searchParams.get("wallet");
    const { txHash } = (await req.json().catch(() => ({}))) as { txHash?: string };

    const db = sql();
    const [record] = await db`
      select id, creator_visitor_id, creator_wallet_address, upload_account_address,
        blob_name, enc_key, listed, price_usd
      from memories where id = ${id}
    `;
    if (!record || !record.listed) {
      return NextResponse.json({ error: "That memory isn't listed for sale." }, { status: 404 });
    }

    const price = Number(record.price_usd);

    const [alreadyBought] = wallet
      ? await db`
          select 1 from purchases
          where memory_id = ${id} and (buyer_wallet_address = ${wallet} or visitor_id = ${visitorId})
        `
      : await db`select 1 from purchases where memory_id = ${id} and visitor_id = ${visitorId}`;

    if (!alreadyBought) {
      if (record.creator_wallet_address) {
        if (!txHash) {
          return NextResponse.json(
            { error: "This listing requires payment from your connected wallet.", requiresWalletPayment: true },
            { status: 402 }
          );
        }

        const [reused] = await db`select 1 from purchases where tx_hash = ${txHash}`;
        if (reused) {
          return NextResponse.json({ error: "That transaction has already been used for a purchase." }, { status: 400 });
        }

        let buyerAddress: string;
        try {
          buyerAddress = await verifyPayment(txHash, record.creator_wallet_address, price);
        } catch (err) {
          return NextResponse.json({ error: err instanceof Error ? err.message : "Payment verification failed." }, { status: 400 });
        }

        await db`
          insert into purchases (memory_id, visitor_id, buyer_wallet_address, tx_hash)
          values (${id}, ${visitorId}, ${buyerAddress}, ${txHash})
          on conflict do nothing
        `;
      } else {
        await db`
          insert into ledger (visitor_id, balance) values (${visitorId}, 100)
          on conflict (visitor_id) do nothing
        `;
        const [buyerLedger] = await db`select balance from ledger where visitor_id = ${visitorId}`;
        const balance = Number(buyerLedger.balance);
        if (balance < price) {
          return NextResponse.json(
            { error: `Insufficient balance (${balance.toFixed(2)} < ${price.toFixed(2)} shelbyUSD)` },
            { status: 400 }
          );
        }
        await db`update ledger set balance = balance - ${price} where visitor_id = ${visitorId}`;
        await db`insert into purchases (memory_id, visitor_id) values (${id}, ${visitorId}) on conflict do nothing`;
        await db`
          insert into ledger (visitor_id, balance) values (${record.creator_visitor_id}, 100 + ${price})
          on conflict (visitor_id) do update set balance = ledger.balance + ${price}
        `;
      }
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
  } catch (err) {
    console.error("Buy failed:", err);
    const message = err instanceof Error ? err.message : "Purchase failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
