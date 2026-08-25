import { Network } from "@aptos-labs/ts-sdk";
import type { NetworkInfo } from "@aptos-labs/wallet-adapter-react";

/**
 * Best-effort attempt to switch the connected wallet to Shelbynet before a
 * transaction. Never throws: if the wallet doesn't support switching, or the
 * switch fails or is rejected, this silently gives up so the actual
 * transaction attempt still proceeds (and can surface its own real error,
 * e.g. insufficient balance) instead of the whole action getting stuck.
 */
export async function ensureShelbynet(
  network: NetworkInfo | null,
  changeNetwork: (network: Network) => Promise<{ success: boolean; reason?: string }>
): Promise<void> {
  if (network && network.name.toLowerCase() === "shelbynet") return;

  try {
    await changeNetwork(Network.SHELBYNET);
  } catch (err) {
    console.warn("Could not switch network automatically:", err);
  }
}
