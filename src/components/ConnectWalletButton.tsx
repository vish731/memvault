"use client";

import { useWallet, WalletReadyState } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";

function truncate(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const WALLET_INFO: Record<string, { color: string; initial: string; installUrl: string }> = {
  Petra: {
    color: "#6f4cff",
    initial: "P",
    installUrl: "https://chromewebstore.google.com/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci",
  },
  "OKX Wallet": {
    color: "#111111",
    initial: "OK",
    installUrl: "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
  },
};

interface ShelbyAccountStatus {
  address: string;
  apt: number;
  shelbyUsd: number;
  funded: boolean;
}

function ProfilePanel({ onClose }: { onClose: () => void }) {
  const { account, disconnect } = useWallet();
  const [status, setStatus] = useState<ShelbyAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    fetch(`/api/user-shelby-account?wallet=${account.address.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStatus(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [account]);

  if (!account) return null;
  const address = account.address.toString();

  function copyAddress() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="absolute right-0 top-full mt-2 card w-80 p-5 z-30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Your wallet</span>
        <button onClick={onClose} className="icon-badge !w-6 !h-6" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </div>
      <button onClick={copyAddress} className="font-data text-sm text-[var(--ink)] break-all text-left hover:text-[var(--primary)] transition-colors mb-4">
        {address} {copied && <span className="text-[var(--primary)]">✓ copied</span>}
      </button>

      <div className="border-t border-[var(--border)] pt-4 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">Personal Shelby account</p>
        {loading ? (
          <p className="text-xs text-[var(--muted)]">Loading&hellip;</p>
        ) : status ? (
          <>
            <p className="font-data text-xs text-[var(--muted)] break-all mb-2">{status.address}</p>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${status.funded ? "text-[var(--primary-dark)] bg-[var(--primary-soft)]" : "text-[var(--accent)] bg-[var(--accent-soft)]"}`}>
                {status.funded ? "Funded" : "Not funded"}
              </span>
              <span className="text-xs text-[var(--muted)] font-data">
                {status.apt.toFixed(3)} APT &middot; {status.shelbyUsd.toFixed(2)} shelbyUSD
              </span>
            </div>
            {!status.funded && (
              <div className="flex gap-2 flex-wrap">
                <a href={`https://docs.shelby.xyz/apis/faucet/aptos?address=${status.address}&network=shelbynet`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
                  Fund with APT
                </a>
                <a href={`https://docs.shelby.xyz/apis/faucet/shelbyusd?address=${status.address}&network=shelbynet`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
                  Fund with ShelbyUSD
                </a>
              </div>
            )}
            {status.funded && (
              <p className="text-xs text-[var(--muted)]">Your uploads use this account.</p>
            )}
          </>
        ) : (
          <p className="text-xs text-[var(--muted)]">Could not load account status.</p>
        )}
      </div>

      <button onClick={() => disconnect()} className="btn-ghost text-xs w-full">
        Disconnect
      </button>
    </div>
  );
}

export default function ConnectWalletButton() {
  const { connect, connected, account, wallets } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSelect(name: "Petra" | "OKX Wallet") {
    const wallet = wallets?.find((w) => w.name === name);
    const installed = wallet?.readyState === WalletReadyState.Installed;

    if (!installed) {
      setNotice(name);
      return;
    }

    setNotice(null);
    setConnecting(name);
    try {
      await connect(name);
      setModalOpen(false);
    } catch {
      setNotice(name);
    } finally {
      setConnecting(null);
    }
  }

  if (connected && account) {
    return (
      <div className="relative">
        <button onClick={() => setProfileOpen((v) => !v)} className="badge-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
          {truncate(account.address.toString())}
        </button>
        {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setModalOpen(true)} className="btn-ghost text-sm flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M16 12.5h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Connect Wallet
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div className="card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Connect a wallet</h3>
              <button onClick={() => setModalOpen(false)} className="icon-badge" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {(["Petra", "OKX Wallet"] as const).map((name) => {
                const info = WALLET_INFO[name];
                const wallet = wallets?.find((w) => w.name === name);
                const installed = wallet?.readyState === WalletReadyState.Installed;

                return (
                  <div key={name}>
                    <button
                      onClick={() => handleSelect(name)}
                      disabled={connecting === name}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors disabled:opacity-50"
                    >
                      {wallet?.icon ? (
                        <img src={wallet.icon} alt={`${name} icon`} className="w-8 h-8 rounded-lg shrink-0" />
                      ) : (
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: info.color }}
                        >
                          {info.initial}
                        </span>
                      )}
                      <span className="font-semibold text-sm flex-1 text-left">{name}</span>
                      {installed ? (
                        <span className="text-xs font-medium text-[var(--primary-dark)] bg-[var(--primary-soft)] rounded-full px-2 py-0.5">
                          Installed
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[var(--muted)]">Not installed</span>
                      )}
                    </button>
                    {notice === name && !installed && (
                      <div className="mt-1.5 ml-1 flex items-center justify-between text-xs">
                        <span className="text-[var(--danger)]">{name} isn&rsquo;t installed in this browser.</span>
                        <a
                          href={info.installUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--primary)] font-semibold whitespace-nowrap ml-2"
                        >
                          Install &rarr;
                        </a>
                      </div>
                    )}
                    {notice === name && installed && (
                      <p className="mt-1.5 ml-1 text-xs text-[var(--danger)]">Connection was cancelled or failed.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
