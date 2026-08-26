"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { motion, AnimatePresence } from "motion/react";
import type { MarketListing } from "@/lib/types";
import { SHELBY_USD_FA_ADDRESS, SHELBY_USD_DECIMALS } from "@/lib/constants";
import SemanticSearchBox from "@/components/SemanticSearchBox";
import { ensureShelbynet } from "@/lib/network-helper";

type SortMode = "newest" | "price-low" | "price-high" | "top-rated";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}>
      <path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function RatingBadge({ avg, count }: { avg: number | string | null; count: number | string }) {
  const n = Number(count);
  if (!avg || n === 0) {
    return <span className="text-xs text-[var(--muted)]">No reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 3z" /></svg>
      {Number(avg).toFixed(1)} <span className="text-[var(--muted)] font-medium">({n})</span>
    </span>
  );
}

function UnlockedContent({ kind, summary, raw }: { kind: string; summary: string; raw: string }) {
  if (kind !== "image") {
    return (
      <pre className="mt-4 text-xs font-data bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 whitespace-pre-wrap">{raw}</pre>
    );
  }

  let img = raw;
  let notes: string | null = null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.image) {
      img = parsed.image;
      notes = parsed.notes ?? null;
    }
  } catch {
    // Legacy raw image string with no notes to parse out; use as-is.
  }

  return (
    <div className="mt-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={summary} className="rounded-lg border border-[var(--border)] max-h-80 w-auto object-contain" />
      {notes && <p className="text-xs text-[var(--muted)] mt-2">{notes}</p>}
    </div>
  );
}

function WalletBalanceCard() {
  const { connected, account } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [apt, setApt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !account) {
      setBalance(null);
      setApt(null);
      return;
    }
    setLoading(true);
    fetch(`/api/wallet-balance?address=${account.address.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setBalance(data.balance);
          setApt(data.apt ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, account?.address.toString()]);

  if (!connected) return null;

  return (
    <div className="card p-5 mb-6 max-w-xs">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2">Wallet balance (Shelbynet)</p>
      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading&hellip;</p>
      ) : (
        <p className="font-data text-2xl font-bold">
          {(balance ?? 0).toFixed(2)} <span className="text-sm font-medium text-[var(--muted)]">shelbyUSD</span>
        </p>
      )}
      {apt !== null && !loading && (
        <p className="font-data text-xs text-[var(--muted)] mt-1">{apt.toFixed(3)} APT</p>
      )}
    </div>
  );
}

export default function Market() {
  const { connected, account, signAndSubmitTransaction, network, changeNetwork } = useWallet();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Record<string, string>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pendingBuy, setPendingBuy] = useState<MarketListing | null>(null);

  async function load() {
    setLoading(true);
    try {
      const url = account ? `/api/market?wallet=${account.address.toString()}` : "/api/market";
      const res = await fetch(url, { cache: "no-store" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  function handleBuyClick(listing: MarketListing) {
    if (listing.alreadyPurchased || !listing.creator_wallet_address) {
      executeBuy(listing);
    } else {
      setPendingBuy(listing);
    }
  }

  async function executeBuy(listing: MarketListing) {
    const id = listing.id;
    setPendingBuy(null);
    setBuying(id);
    setError(null);
    try {
      let txHash: string | undefined;

      if (listing.creator_wallet_address && !listing.alreadyPurchased) {
        if (!connected || !account) {
          throw new Error("Connect your wallet first, this listing is paid for on-chain.");
        }
        await ensureShelbynet(network, changeNetwork);

        const price = Number(listing.price_usd);
        const amount = Math.round(price * SHELBY_USD_DECIMALS);

        const result = await signAndSubmitTransaction({
          data: {
            function: "0x1::primary_fungible_store::transfer",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [SHELBY_USD_FA_ADDRESS, listing.creator_wallet_address, amount],
          },
        });
        txHash = result.hash;
      }

      const url = account ? `/api/market/${id}/buy?wallet=${account.address.toString()}` : `/api/market/${id}/buy`;
      const res = await fetch(url, {
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
      await fetch(`/api/market/${id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: account?.address.toString() }),
      });
    } catch {
      await load();
    }
  }

  const visible = useMemo(() => {
    let items = [...listings];
    if (favoritesOnly) items = items.filter((m) => m.isFavorite);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (m) =>
          m.summary.toLowerCase().includes(q) ||
          m.kind.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "price-low":
        items.sort((a, b) => Number(a.price_usd) - Number(b.price_usd));
        break;
      case "price-high":
        items.sort((a, b) => Number(b.price_usd) - Number(a.price_usd));
        break;
      case "top-rated":
        items.sort((a, b) => Number(b.avg_rating ?? 0) - Number(a.avg_rating ?? 0));
        break;
      default:
        break;
    }
    return items;
  }, [listings, query, sort, favoritesOnly]);

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <motion.span
        className="badge-pill mb-5"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h7.2a2 2 0 0 0 2-1.6L20 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Pay-per-read, unlocked instantly
      </motion.span>
      <motion.h1
        className="text-4xl font-extrabold tracking-tight mb-3"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        Marketplace
      </motion.h1>
      <motion.p
        className="text-[var(--muted)] text-[0.9375rem] leading-relaxed max-w-lg mb-8"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        Entries listed for sale by other holders. Content stays encrypted until purchase releases the key.
      </motion.p>

      <WalletBalanceCard />

      <div className="text-xs text-[var(--muted)] border border-[var(--border)] rounded-xl p-4 mb-6">
        Listings are priced and paid for in APT, a real on-chain transfer straight from your connected wallet to the seller. See <a href="/docs" className="text-[var(--primary)] font-medium">Docs</a> for details.
      </div>

      <SemanticSearchBox />

      {error && (
        <div className="text-sm text-[var(--danger)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] rounded-xl p-4 mb-6 font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-wrap mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by summary, tag, or kind"
          className="field flex-1 min-w-[200px]"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="field min-w-[160px]">
          <option value="newest">Newest first</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="top-rated">Top rated</option>
        </select>
        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          className={`btn-ghost flex items-center gap-2 ${favoritesOnly ? "!border-[var(--accent)] !text-[var(--accent)]" : ""}`}
        >
          <StarIcon filled={favoritesOnly} />
          Favorites
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--muted)] text-sm">Loading&hellip;</p>
      ) : visible.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--muted)] text-sm">No listings match right now. Check back soon.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence>
            {visible.map((m, i) => (
              <motion.li
                key={m.id}
                className="card card-hover p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                layout
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[0.9375rem] font-semibold break-all line-clamp-2">{m.summary}</p>
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
                    <motion.button
                      onClick={() => handleFavorite(m.id)}
                      aria-label="Save to favorites"
                      className={`icon-badge ${m.isFavorite ? "accent" : ""}`}
                      whileTap={{ scale: 1.3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <StarIcon filled={m.isFavorite} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleBuyClick(m)}
                      disabled={buying === m.id}
                      className="btn-accent"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {m.alreadyPurchased ? "Unlock (owned)" : buying === m.id ? "Processing..." : `Buy · ${m.price_usd} shelbyUSD`}
                    </motion.button>
                  </div>
                </div>
                {unlocked[m.id] && <UnlockedContent kind={m.kind} summary={m.summary} raw={unlocked[m.id]} />}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {pendingBuy && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPendingBuy(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="card w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="icon-badge accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h7.2a2 2 0 0 0 2-1.6L20 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <h3 className="font-bold text-lg">Confirm purchase</h3>
            </div>

            <p className="text-sm text-[var(--muted)] mb-1">{pendingBuy.summary}</p>

            <div className="flex items-center justify-between py-3 border-t border-b border-[var(--border)] my-3">
              <span className="text-sm text-[var(--muted)]">You pay</span>
              <span className="font-data text-lg font-bold">{Number(pendingBuy.price_usd).toFixed(2)} shelbyUSD</span>
            </div>

            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-[var(--muted)]">To</span>
              <span className="font-data text-xs">{pendingBuy.creator_wallet_address?.slice(0, 10)}&hellip;{pendingBuy.creator_wallet_address?.slice(-4)}</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setPendingBuy(null)} className="btn-ghost flex-1">
                Cancel
              </button>
              <button onClick={() => executeBuy(pendingBuy)} className="btn-accent flex-1">
                Confirm & Pay
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
