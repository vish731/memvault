import { Network } from "@aptos-labs/ts-sdk";
import type { NetworkInfo } from "@aptos-labs/wallet-adapter-react";

/**
 * Best-effort attempt to switch the connected wallet off Mainnet before a
 * transaction. Petra's changeNetwork only recognizes its own standard
 * network names (Mainnet/Testnet/Devnet) — it doesn't know "shelbynet" as a
 * switchable target, so we ask for Testnet instead, per Shelby's own guidance
 * for wallet setup. Never throws: if the wallet doesn't support switching,
 * or the switch fails or is rejected, this silently gives up so the actual
 * transaction attempt still proceeds (and can surface its own real error,
 * e.g. insufficient balance) instead of the whole action getting stuck.
 */
export async function ensureShelbynet(
  network: NetworkInfo | null,
  changeNetwork: (network: Network) => Promise<{ success: boolean; reason?: string }>
): Promise<void> {
  if (network && network.name.toLowerCase() !== "mainnet") return;

  try {
    await changeNetwork(Network.TESTNET);
  } catch (err) {
    console.warn("Could not switch network automatically:", err);
  }
}
