import { NextRequest, NextResponse } from "next/server";
import { getAptos } from "@/lib/shelby";
import { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address query param is required" }, { status: 400 });
  }

  try {
    const aptos = getAptos();
    const amount = await aptos.getAccountCoinAmount({
      accountAddress: address,
      faMetadataAddress: SHELBY_USD_FA_ADDRESS,
    });

    return NextResponse.json({ balance: amount / SHELBY_USD_DECIMALS });
  } catch {
    // Most commonly: the account has never held shelbyUSD yet (no FungibleStore created).
    return NextResponse.json({ balance: 0 });
  }
}
