"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type { MarketListing } from "@/lib/types";
import { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/constants";

type SortMode = "newest" | "price-low" | "price-high" | "top-rated";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}>
      <path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function RatingBadge({ avg, count }: { avg: number | string | null; count: number | string }) {
  const n = Number(count);
  if (!avg || n === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
      <StarIcon filled />
      {Number(avg).toFixed(1)} <span className="text-[var(--muted)] font-medium">({n})</span>
    </span>
  );
}

function WalletBalanceCard() {
  const { connected, account } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !account) {
      setBalance(null);
      return;
    }
    setLoading(true);
    fetch(`/api/wallet-balance?address=${account.address.toString()}`)
      .then((r) => r.json())
      .then((data) => setBalance(data.balance ?? 0))
      .catch(() => setBalance(null))
      .finally(() => setLoading(false));
  }, [connected, account]);

  if (!connected) {
    return (
      <div className="card px-5 py-3.5 text-sm text-[var(--muted)] max-w-[220px]">
        Connect your wallet to see your real shelbyUSD balance.
      </div>
    );
  }

  return (
    <div className="card px-5 py-3.5 text-right">
      <p className="text-xs font-medium text-[var(--muted)]">Wallet balance (Shelbynet)</p>
      <p className="font-data text-xl font-semibold text-[var(--primary-dark)] mt-0.5">
        {loading ? "…" : (balance ?? 0).toFixed(2)} <span className="text-xs text-[var(--muted)] font-sans font-normal">shelbyUSD</span>
      </p>
    </div>
  );
}

export default function Market() {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Record<string, string>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/market", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setListings(data.listings);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Could not reach the marketplace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleBuy(listing: MarketListing) {
    const id = listing.id;
    setBuying(id);
    setError(null);
    try {
      let txHash: string | undefined;

      if (listing.creator_wallet_address && !listing.alreadyPurchased) {
        if (!connected || !account) {
          throw new Error("Connect your wallet first, this listing is paid for on-chain.");
        }
        const amount = Math.round(Number(listing.price_usd) * SHELBY_USD_DECIMALS);
        const result = await signAndSubmitTransaction({
          data: {
            function: "0x1::primary_fungible_store::transfer",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [SHELBY_USD_FA_ADDRESS, listing.creator_wallet_address, amount],
          },
        });
        txHash = result.hash;
      }

      const res = await fetch(`/api/market/${id}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUnlocked((prev) => ({ ...prev, [id]: data.content }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBuying(null);
    }
  }

  async function handleFavorite(id: string) {
    setListings((prev) => prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m)));
    try {
      await fetch(`/api/market/${id}/favorite`, { method: "POST" });
    } catch {
      await load();
    }
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = listings;
    if (q) {
      result = result.filter(
        (m) =>
          m.summary.toLowerCase().includes(q) ||
          m.kind.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    const sorted = [...result];
    if (sort === "price-low") sorted.sort((a, b) => Number(a.price_usd) - Number(b.price_usd));
    if (sort === "price-high") sorted.sort((a, b) => Number(b.price_usd) - Number(a.price_usd));
    if (sort === "top-rated") sorted.sort((a, b) => Number(b.avg_rating ?? 0) - Number(a.avg_rating ?? 0));
    return sorted;
  }, [listings, query, sort]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((m) => m.tags.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 8);
  }, [listings]);

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <div className="flex items-start justify-between gap-6 flex-wrap mb-2">
        <div>
          <span className="badge-pill mb-5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h7.2a2 2 0 0 0 2-1.6L20 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="20" r="1" fill="currentColor" /><circle cx="17" cy="20" r="1" fill="currentColor" /></svg>
            Pay-per-read, unlocked instantly
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Marketplace</h1>
          <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed max-w-lg">
            Entries listed for sale by other holders. Content stays encrypted until purchase releases the key.
          </p>
        </div>
        <WalletBalanceCard />
      </div>

      <div className="text-xs text-[var(--muted)] border border-[var(--border)] bg-[var(--bg)] rounded-lg px-4 py-2.5 mb-2">
        New listings are paid for with a real on-chain transfer from your connected wallet. Older listings, created before wallet payments existed, still use internal test credits. See <a href="/docs" className="text-[var(--primary)] font-medium">Docs</a> for details.
      </div>

      {error && (
        <div className="text-sm text-[var(--danger)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] rounded-xl p-4 mt-8 mb-2 font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-10 mb-4 flex-wrap">
        <div className="flex gap-3 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search by summary, tag, or kind"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field pl-9 w-full"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="field min-w-[160px]">
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="top-rated">Top rated</option>
          </select>
        </div>
        <a href="/favorites" className="btn-ghost flex items-center gap-1.5 shrink-0">
          <StarIcon filled={false} /> Favorites
        </a>
      </div>

      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setQuery(query === t ? "" : t)}
              className={`text-xs font-medium rounded-full px-2.5 py-1 border transition-colors ${
                query === t
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div>
        {loading ? (
          <p className="text-[var(--muted)] text-sm">Loading&hellip;</p>
        ) : visible.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[var(--muted)] text-sm">
              {listings.length === 0
                ? "No listings yet. List one of your memories for sale from the My Memories page."
                : "No listings match your search."}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {visible.map((m) => (
              <li key={m.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[0.9375rem] font-semibold">{m.summary}</p>
                      <RatingBadge avg={m.avg_rating} count={m.review_count} />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{m.kind}</span>
                      {m.tags.map((t) => (
                        <span key={t} className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleFavorite(m.id)}
                      aria-label="Save to favorites"
                      className={`icon-badge ${m.isFavorite ? "accent" : ""}`}
                    >
                      <StarIcon filled={m.isFavorite} />
                    </button>
                    <button onClick={() => handleBuy(m)} disabled={buying === m.id} className="btn-accent">
                      {m.alreadyPurchased ? "Unlock (owned)" : buying === m.id ? "Processing..." : `Buy · ${m.price_usd}`}
                    </button>
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
    </div>
  );
}
