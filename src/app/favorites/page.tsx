"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/constants";

interface Favorite {
  id: string;
  kind: string;
  tags: string[];
  summary: string;
  price_usd: number | string;
  listed: boolean;
  avg_rating: number | string | null;
  review_count: number | string;
  already_purchased: boolean;
  creator_wallet_address: string | null;
}

export default function Favorites() {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [items, setItems] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const url = account ? `/api/favorites?wallet=${account.address.toString()}` : "/api/favorites";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setItems(data.favorites);
      else setError(data.error);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  async function handleBuy(item: Favorite) {
    setBuying(item.id);
    setError(null);
    try {
      let txHash: string | undefined;

      if (item.creator_wallet_address && !item.already_purchased) {
        if (!connected || !account) {
          throw new Error("Connect your wallet first, this listing is paid for on-chain.");
        }
        const amount = Math.round(Number(item.price_usd) * SHELBY_USD_DECIMALS);
        const result = await signAndSubmitTransaction({
          data: {
            function: "0x1::primary_fungible_store::transfer",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [SHELBY_USD_FA_ADDRESS, item.creator_wallet_address, amount],
          },
        });
        txHash = result.hash;
      }

      const res = await fetch(`/api/market/${item.id}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUnlocked((prev) => ({ ...prev, [item.id]: data.content }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBuying(null);
    }
  }

  async function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/market/${id}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: account?.address.toString() }),
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <span className="badge-pill mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        Saved for later
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Your favorites</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-10 max-w-lg">
        Listings you&rsquo;ve saved from the marketplace to decide on later.
      </p>

      {error && (
        <div className="text-sm text-[var(--danger)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] rounded-xl p-4 mb-8 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-[var(--muted)] text-sm">Loading&hellip;</p>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--muted)] text-sm">
            No favorites yet. Tap the star icon on any <a href="/market" className="text-[var(--primary)] font-medium">marketplace</a> listing to save it here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((m) => (
            <li key={m.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.9375rem] font-semibold">{m.summary}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{m.kind}</span>
                    {m.tags.map((t) => (
                      <span key={t} className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                    {!m.listed && <span className="text-xs font-medium text-[var(--danger)]">no longer listed</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleRemove(m.id)} className="btn-ghost">Remove</button>
                  {m.listed && (
                    <button onClick={() => handleBuy(m)} disabled={buying === m.id} className="btn-accent">
                      {m.already_purchased ? "Unlock (owned)" : buying === m.id ? "Processing..." : `Buy · ${m.price_usd}`}
                    </button>
                  )}
                </div>
              </div>
              {unlocked[m.id] && (
                <pre className="mt-4 text-xs font-data bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 whitespace-pre-wrap">{unlocked[m.id]}</pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
