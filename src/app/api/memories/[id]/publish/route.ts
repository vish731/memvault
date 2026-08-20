import { NextRequest, NextResponse } from "next/server";
import { isUserTransactionResponse } from "@aptos-labs/ts-sdk";
import { sql } from "@/lib/db";
import { getAptos } from "@/lib/shelby";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

async function verifyListingTx(txHash: string, expectedSender: string) {
  const aptos = getAptos();
  const txn = await aptos.waitForTransaction({ transactionHash: txHash });

  if (!isUserTransactionResponse(txn) || !txn.success) {
    throw new Error("That listing transaction did not succeed on-chain.");
  }
  if (txn.sender.toLowerCase() !== expectedSender.toLowerCase()) {
    throw new Error("That transaction wasn't signed by your wallet.");
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { id: visitorId } = getOrCreateVisitorId(req);
  const { listed, priceUsd, walletAddress, txHash } = (await req.json()) as {
    listed: boolean;
    priceUsd?: number;
    walletAddress?: string;
    txHash?: string;
  };

  const db = sql();
  const [record] = await db`select creator_visitor_id, creator_wallet_address from memories where id = ${id}`;
  if (!record) return NextResponse.json({ error: "Memory not found" }, { status: 404 });

  const ownsByWallet = walletAddress && record.creator_wallet_address && record.creator_wallet_address === walletAddress;
  const ownsByCookie = record.creator_visitor_id === visitorId;
  if (!ownsByWallet && !ownsByCookie) {
    return NextResponse.json({ error: "You don't own this memory" }, { status: 403 });
  }

  if (listed) {
    if (!priceUsd || priceUsd <= 0) {
      return NextResponse.json({ error: "priceUsd must be greater than 0 to list" }, { status: 400 });
    }
    if (!walletAddress) {
      return NextResponse.json({ error: "Connect a wallet before listing, so buyers can pay you directly" }, { status: 400 });
    }
    if (!txHash) {
      return NextResponse.json(
        { error: "Listing requires an on-chain commitment from your wallet.", requiresWalletSignature: true },
        { status: 402 }
      );
    }

    try {
      await verifyListingTx(txHash, walletAddress);
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Listing verification failed." }, { status: 400 });
    }

    await db`
      update memories
      set listed = true, price_usd = ${priceUsd}, creator_wallet_address = ${walletAddress}, listing_tx_hash = ${txHash}
      where id = ${id}
    `;
  } else {
    await db`update memories set listed = false, price_usd = 0 where id = ${id}`;
  }

  return NextResponse.json({ ok: true });
}
