import { NextRequest, NextResponse } from "next/server";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const runtime = "nodejs";

// The ShelbyUSD fungible asset metadata address on Shelbynet.
const SHELBY_USD_FA_ADDRESS = "0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1";

let aptosClient: Aptos | null = null;
function getAptos() {
  if (!aptosClient) {
    aptosClient = new Aptos(new AptosConfig({ network: Network.SHELBYNET }));
  }
  return aptosClient;
}

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

    // shelbyUSD uses 6 decimal places, same convention as USDC-style fungible assets.
    return NextResponse.json({ balance: amount / 1_000_000 });
  } catch {
    // Most commonly: the account has never held shelbyUSD yet (no FungibleStore created).
    return NextResponse.json({ balance: 0 });
  }
}
