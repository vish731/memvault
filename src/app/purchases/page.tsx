"use client";

import { useEffect, useState } from "react";

interface Purchase {
  id: string;
  kind: string;
  tags: string[];
  summary: string;
  price_usd: number | string;
  purchased_at: string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-[var(--accent)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill={n <= value ? "currentColor" : "none"}>
            <path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState<Record<string, string>>({});
  const [reviewOpen, setReviewOpen] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/purchases", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) setPurchases(data.purchases);
        else setError(data.error);
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleView(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/purchases/${id}/recall`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUnlocked((prev) => ({ ...prev, [id]: data.content }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock memory");
    }
  }

  async function handleSubmitReview(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/purchases/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted((prev) => ({ ...prev, [id]: true }));
      setReviewOpen(null);
      setComment("");
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <span className="badge-pill mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><rect x="2" y="11" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="2" /></svg>
        Owned by you
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Your purchases</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-10 max-w-lg">
        Memories you&rsquo;ve bought from the marketplace. Unlocking here is free &mdash; you already paid once.
      </p>

      {error && (
        <div className="text-sm text-[var(--danger)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] rounded-xl p-4 mb-8 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-[var(--muted)] text-sm">Loading&hellip;</p>
      ) : purchases.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[var(--muted)] text-sm">
            No purchases yet. Browse the <a href="/market" className="text-[var(--primary)] font-medium">marketplace</a> to buy your first memory.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {purchases.map((p) => (
            <li key={p.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.9375rem] font-semibold">{p.summary}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{p.kind}</span>
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                    <span className="text-xs font-medium text-[var(--muted)]">
                      bought {new Date(p.purchased_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setReviewOpen(reviewOpen === p.id ? null : p.id)} className="btn-ghost">
                    {submitted[p.id] ? "Reviewed ✓" : "Rate it"}
                  </button>
                  <button onClick={() => handleView(p.id)} className="btn-ghost">Unlock</button>
                </div>
              </div>

              {reviewOpen === p.id && (
                <div className="mt-4 border-t border-[var(--border)] pt-4 flex flex-col gap-3">
                  <StarPicker value={rating} onChange={setRating} />
                  <textarea
                    placeholder="Optional comment about this memory..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="field text-sm min-h-[70px]"
                  />
                  <button onClick={() => handleSubmitReview(p.id)} className="btn-primary self-start text-sm">
                    Submit rating
                  </button>
                </div>
              )}

              {unlocked[p.id] && (
                <pre className="mt-4 text-xs font-data bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 whitespace-pre-wrap">{unlocked[p.id]}</pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
