import { NextResponse } from "next/server";
import { getAptos } from "@/lib/shelby";

export const runtime = "nodejs";

// TEMPORARY debug route — queries the Shelby contract for valid, registered
// location names. Delete this file once you've confirmed a working value.
export async function GET() {
  try {
    const aptos = getAptos();
    const deployer = "0x85fdb9a176ab8ef1d9d9c1b60d60b3924f0800ac1de1cc2085fb0b8bb4988e6a";
    const names = await aptos.view({
      payload: {
        function: `${deployer}::location::activated_location_names`,
        functionArguments: [],
      },
    });
    return NextResponse.json({ locationNames: names[0] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to query location names" },
      { status: 500 }
    );
  }
}
