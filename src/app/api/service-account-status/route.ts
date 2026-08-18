import { NextResponse } from "next/server";
import { getAptos, getServiceSigner, SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/shelby";

export const runtime = "nodejs";

// Thresholds below which the service account is considered "low" and uploads
// risk failing with INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE or
// E_INSUFFICIENT_FUNDS. Tune these based on observed per-upload cost.
const LOW_APT_OCTAS = 5_000_000; // 0.05 APT
const LOW_SHELBY_USD = 1; // 1.00 shelbyUSD

export async function GET() {
  try {
    const aptos = getAptos();
    const signer = getServiceSigner();
    const address = signer.accountAddress.toString();

    const [aptOctas, shelbyUsdRaw] = await Promise.all([
      aptos.getAccountAPTAmount({ accountAddress: address }).catch(() => 0),
      aptos
        .getAccountCoinAmount({ accountAddress: address, faMetadataAddress: SHELBY_USD_FA_ADDRESS })
        .catch(() => 0),
    ]);

    const apt = aptOctas / 100_000_000;
    const shelbyUsd = shelbyUsdRaw / SHELBY_USD_DECIMALS;

    return NextResponse.json({
      address,
      apt,
      shelbyUsd,
      lowApt: aptOctas < LOW_APT_OCTAS,
      lowShelbyUsd: shelbyUsdRaw < LOW_SHELBY_USD * SHELBY_USD_DECIMALS,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check service account status" },
      { status: 500 }
    );
  }
}
