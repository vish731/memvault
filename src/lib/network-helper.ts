import { Network } from "@aptos-labs/ts-sdk";
import type { NetworkInfo } from "@aptos-labs/wallet-adapter-react";

/**
 * Ensures the connected wallet is on Shelbynet before a transaction is sent,
 * prompting the wallet's own network-switch flow if it isn't. Throws with a
 * clear message if the switch is rejected or unsupported by the wallet.
 */
export async function ensureShelbynet(
  network: NetworkInfo | null,
  changeNetwork: (network: Network) => Promise<{ success: boolean; reason?: string }>
): Promise<void> {
  if (network && network.name.toLowerCase() === "shelbynet") return;

  const result = await changeNetwork(Network.SHELBYNET);
  if (!result.success) {
    throw new Error(
      result.reason ??
        "Please switch your wallet to Shelbynet manually, this wallet doesn't support switching networks automatically."
    );
  }
}
