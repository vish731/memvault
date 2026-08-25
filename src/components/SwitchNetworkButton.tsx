"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { useState } from "react";

export default function SwitchNetworkButton() {
  const { network, changeNetwork } = useWallet();
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Petra's changeNetwork only recognizes Mainnet/Testnet/Devnet, not a
  // custom "shelbynet" name, so we only flag Mainnet as the wrong network
  // and offer to switch to Testnet (Shelby's own guidance for wallet setup).
  if (!network || network.name.toLowerCase() !== "mainnet") return null;

  async function handleSwitch() {
    setSwitching(true);
    setMessage(null);
    try {
      const result = await changeNetwork(Network.TESTNET);
      if (!result.success) {
        setMessage(
          result.reason ??
            "Your wallet doesn't support switching networks from here. Open your wallet extension and switch to Testnet manually."
        );
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't switch automatically. Please switch manually in your wallet.");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="bg-[var(--danger-soft)] border-b border-[var(--danger)]/30 px-6 sm:px-10 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs sm:text-sm font-medium text-[var(--danger)]">
          ⚠ Your wallet is on Mainnet. Transactions will fail until you switch to Testnet.
        </p>
        <button onClick={handleSwitch} disabled={switching} className="btn-ghost !text-xs !py-1.5 shrink-0">
          {switching ? "Switching…" : "Switch to Testnet"}
        </button>
      </div>
      {message && (
        <p className="max-w-6xl mx-auto text-xs text-[var(--danger)] mt-1.5">{message}</p>
      )}
    </div>
  );
}
