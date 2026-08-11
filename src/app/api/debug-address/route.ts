import { NextResponse } from "next/server";
import { getServiceSigner } from "@/lib/shelby";

export const runtime = "nodejs";

// TEMPORARY debug route — safe to expose (only reveals a PUBLIC address, never the
// private key itself). Delete this file once you've confirmed the address.
export async function GET() {
  try {
    const signer = getServiceSigner();
    return NextResponse.json({ address: signer.accountAddress.toString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load service signer" },
      { status: 500 }
    );
  }
}
