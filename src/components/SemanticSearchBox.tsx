"use client";

import { useState } from "react";

interface SemanticResult {
  id: string;
  kind: string;
  tags: string[];
  summary: string;
  price_usd: number | string;
  score: number;
}

export default function SemanticSearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SemanticResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/market/semantic-search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      const data = await res.json();
      if (data.semanticAvailable === false) {
        setUnavailable(true);
        setResults(null);
      } else {
        setResults(data.results);
      }
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="icon-badge accent !w-7 !h-7">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" /></svg>
        </span>
        <p className="font-semibold text-sm">Search by meaning, not just keywords</p>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. anything about pets"
          className="field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {unavailable && (
        <p className="text-xs text-[var(--muted)] mt-3">
          Semantic search isn&rsquo;t configured for this deployment yet. Try the regular search above instead.
        </p>
      )}
      {error && <p className="text-xs text-[var(--danger)] mt-3">{error}</p>}

      {results && (
        <div className="flex flex-col gap-2 mt-4">
          {results.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">No matches yet — try storing and listing a few memories first.</p>
          ) : (
            results.map((r) => (
              <a key={r.id} href="/market" className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                <div>
                  <p className="text-sm font-medium">{r.summary}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{r.kind} &middot; {r.price_usd} shelbyUSD</p>
                </div>
                <span className="text-xs font-data text-[var(--primary)] shrink-0">{(r.score * 100).toFixed(0)}% match</span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
