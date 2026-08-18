import { NextRequest, NextResponse } from "next/server";
import { getAptos, getOrCreateUserShelbyAccount, SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/shelby";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet query param is required" }, { status: 400 });
  }

  try {
    const account = await getOrCreateUserShelbyAccount(wallet);
    const address = account.accountAddress.toString();
    const aptos = getAptos();

    const [aptOctas, shelbyUsdRaw] = await Promise.all([
      aptos.getAccountAPTAmount({ accountAddress: address }).catch(() => 0),
      aptos
        .getAccountCoinAmount({ accountAddress: address, faMetadataAddress: SHELBY_USD_FA_ADDRESS })
        .catch(() => 0),
    ]);

    return NextResponse.json({
      address,
      apt: aptOctas / 100_000_000,
      shelbyUsd: shelbyUsdRaw / SHELBY_USD_DECIMALS,
      funded: aptOctas > 0 && shelbyUsdRaw > 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load account" },
      { status: 500 }
    );
  }
}
