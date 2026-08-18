"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function PersonalAccountStatus() {
  const { account } = useWallet();
  const [status, setStatus] = useState<{ address: string; apt: number; shelbyUsd: number; funded: boolean } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!account) {
      setStatus(null);
      return;
    }
    fetch(`/api/user-shelby-account?wallet=${account.address.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStatus(data);
      })
      .catch(() => {});
  }, [account]);

  if (!status || status.funded || dismissed) return null;

  return (
    <div className="card p-5 mb-8 flex items-start gap-4">
      <span className="icon-badge accent shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold mb-1">Fund your personal Shelby account (optional)</p>
        <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">
          Memvault generated a dedicated Shelby account for your wallet, so your uploads don&rsquo;t share the app&rsquo;s account with everyone else. It&rsquo;s not funded yet, so uploads will use the shared account until you fund this one.
        </p>
        <p className="font-data text-xs bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1.5 mb-3 break-all">
          {status.address}
        </p>
        <div className="flex gap-2 flex-wrap">
          <a
            href={`https://docs.shelby.xyz/apis/faucet/aptos?address=${status.address}&network=shelbynet`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            Fund with APT
          </a>
          <a
            href={`https://docs.shelby.xyz/apis/faucet/shelbyusd?address=${status.address}&network=shelbynet`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            Fund with ShelbyUSD
          </a>
          <button onClick={() => setDismissed(true)} className="text-xs text-[var(--muted)] font-medium px-2">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
