"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type { MemoryRecord } from "@/lib/types";

function LockIcon({ open }: { open: boolean }) {
  return (
    <span className={`icon-badge ${open ? "" : "accent"}`}>
      {open ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 11V8a4 4 0 0 1 7.5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

function VaultIllustration() {
  return (
    <svg viewBox="0 0 400 340" className="w-full h-auto">
      <circle cx="120" cy="90" r="90" fill="var(--primary-soft)" opacity="0.7" />
      <circle cx="300" cy="250" r="70" fill="var(--accent-soft)" opacity="0.7" />
      {[[80, 60], [320, 70], [70, 260], [330, 230]].map(([x, y], i) => (
        <line key={i} x1="200" y1="170" x2={x} y2={y} stroke="var(--border)" strokeWidth="2" strokeDasharray="5 6" />
      ))}
      {[{ x: 80, y: 60 }, { x: 320, y: 70 }, { x: 70, y: 260 }, { x: 330, y: 230 }].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="26" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <rect x={n.x - 8} y={n.y - 9} width="16" height="18" rx="2" fill="none" stroke="var(--primary)" strokeWidth="1.6" />
          <line x1={n.x - 5} y1={n.y - 3} x2={n.x + 5} y2={n.y - 3} stroke="var(--primary)" strokeWidth="1.4" />
          <line x1={n.x - 5} y1={n.y + 2} x2={n.x + 5} y2={n.y + 2} stroke="var(--primary)" strokeWidth="1.4" />
        </g>
      ))}
      <circle cx="200" cy="170" r="62" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="178" y="160" width="44" height="34" rx="6" fill="var(--primary)" />
      <path d="M186 160v-12a14 14 0 0 1 28 0v12" fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="200" cy="176" r="4.5" fill="var(--surface)" />
      <rect x="197.5" y="178" width="5" height="8" rx="1.5" fill="var(--surface)" />
    </svg>
  );
}

function ChecklistItem({ done, children, href }: { done: boolean; children: React.ReactNode; href?: string }) {
  const content = (
    <div className="flex items-center gap-3 py-3">
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
          done ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)]"
        }`}
      >
        {done && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-sm font-medium ${done ? "text-[var(--muted)] line-through" : "text-[var(--ink)]"}`}>
        {children}
      </span>
    </div>
  );
  return href && !done ? <a href={href}>{content}</a> : content;
}

function OnboardingChecklist({ hasMemory, hasListing }: { hasMemory: boolean; hasListing: boolean }) {
  const { connected } = useWallet();
  const [hasPurchase, setHasPurchase] = useState(false);

  useEffect(() => {
    fetch("/api/purchases", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHasPurchase((d.purchases?.length ?? 0) > 0))
      .catch(() => {});
  }, []);

  const steps = [connected, hasMemory, hasListing, hasPurchase];
  const doneCount = steps.filter(Boolean).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="card p-6 mb-12">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-lg">Get started</h3>
        <span className="text-xs font-semibold text-[var(--muted)]">{doneCount}/4 complete</span>
      </div>
      <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[var(--primary)] transition-all"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <div className="divide-y divide-[var(--border)]">
        <ChecklistItem done={connected}>Connect your wallet</ChecklistItem>
        <ChecklistItem done={hasMemory} href="#store">Store your first memory</ChecklistItem>
        <ChecklistItem done={hasListing} href="#store">List a memory for sale</ChecklistItem>
        <ChecklistItem done={hasPurchase} href="/market">Buy something from the marketplace</ChecklistItem>
      </div>
      <a href="/guide" className="text-xs font-semibold text-[var(--primary)] mt-2 inline-block">
        New here? Read the full guide &rarr;
      </a>
    </div>
  );
}

export default function Home() {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recalled, setRecalled] = useState<Record<string, string>>({});
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [kind, setKind] = useState<MemoryRecord["kind"]>("fact");


  async function loadMemories() {
    setLoading(true);
    try {
      const res = await fetch("/api/memories", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setMemories(data.memories);
      else setError(data.error);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          summary,
          kind,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to store memory");
      setContent("");
      setSummary("");
      setTags("");
      await loadMemories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecall(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/memories/${id}/recall`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecalled((prev) => ({ ...prev, [id]: data.content }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to recall memory");
    }
  }

  async function handlePublish(id: string, listed: boolean) {
    setError(null);
    let priceUsd: number | undefined;
    if (listed) {
      const input = window.prompt("List price in shelbyUSD:", "2.5");
      if (!input) return;
      priceUsd = Number(input);
    }
    try {
      const res = await fetch(`/api/memories/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listed, priceUsd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadMemories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
    }
  }

  const listedCount = memories.filter((m) => m.listed).length;

  return (
    <>
      <section className="px-6 sm:px-10 pt-14 pb-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge-pill mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
              Trusted by builders on Shelby Protocol
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-5 leading-[1.05]">
              Seal Your<br /><span className="text-[var(--primary)]">Machine Memory</span>
            </h1>
            <p className="text-[var(--muted)] text-base leading-relaxed mb-8 max-w-md">
              Every memory is encrypted with AES-256 before it ever leaves your device, then distributed across Shelby&rsquo;s decentralized storage network. Only you hold the key &mdash; until you choose to sell it.
            </p>
            <div className="flex gap-3 mb-8 flex-wrap">
              <a href="#store" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Store a memory
              </a>
              <a href="/market" className="btn-ghost flex items-center">Browse marketplace</a>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="stat-chip">
                <span className="icon-badge"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg></span>
                <div><p className="font-bold text-sm leading-none">AES-256</p><p className="text-xs text-[var(--muted)] mt-1">Encrypted at rest</p></div>
              </div>
              <div className="stat-chip">
                <span className="icon-badge accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="7" r="2.5" stroke="currentColor" strokeWidth="2" /><circle cx="18" cy="7" r="2.5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="18" r="2.5" stroke="currentColor" strokeWidth="2" /><path d="M8 8.5L11 16M16 8.5L13 16" stroke="currentColor" strokeWidth="2" /></svg></span>
                <div><p className="font-bold text-sm leading-none">Decentralized</p><p className="text-xs text-[var(--muted)] mt-1">Shelby storage network</p></div>
              </div>
            </div>
          </div>

          <div className="relative mx-2 sm:mx-0">
            <div className="card p-5 sm:p-8">
              <VaultIllustration />
            </div>
            <div className="floating-badge !px-2.5 !py-2 sm:!px-4 sm:!py-2.5 -top-3 -left-2 sm:-top-5 sm:-left-5">
              <span className="icon-badge !w-7 !h-7 sm:!w-9 sm:!h-9"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span>
              <div><p className="font-bold text-xs sm:text-sm leading-none">{memories.length}</p><p className="text-[10px] sm:text-xs text-[var(--muted)] mt-1 whitespace-nowrap">Memories sealed</p></div>
            </div>
            <div className="floating-badge !px-2.5 !py-2 sm:!px-4 sm:!py-2.5 -bottom-3 -right-2 sm:-bottom-5 sm:-right-5">
              <span className="icon-badge accent !w-7 !h-7 sm:!w-9 sm:!h-9"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h7.2a2 2 0 0 0 2-1.6L20 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              <div><p className="font-bold text-xs sm:text-sm leading-none">{listedCount}</p><p className="text-[10px] sm:text-xs text-[var(--muted)] mt-1 whitespace-nowrap">Listed for sale</p></div>
            </div>
          </div>
        </div>
      </section>

      <div id="store" className="max-w-3xl mx-auto px-6 sm:px-10 pt-16 pb-14 flex flex-col gap-12">
        <OnboardingChecklist hasMemory={memories.length > 0} hasListing={listedCount > 0} />

        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-5">Store a new memory</h2>
          <form onSubmit={handleCreate} className="card flex flex-col gap-5 p-7 sm:p-8">
            <label className="flex flex-col gap-2">
              <span className="field-label">Memory content</span>
              <textarea required placeholder="e.g. User prefers dark mode, works in IST, building a Shelby marketplace demo." value={content} onChange={(e) => setContent(e.target.value)} className="field min-h-[120px] resize-y" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="field-label">Public summary</span>
              <input required placeholder="Shown in the marketplace if you list this for sale" value={summary} onChange={(e) => setSummary(e.target.value)} className="field" />
            </label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex-1 min-w-[200px] flex flex-col gap-2">
                <span className="field-label">Tags</span>
                <input placeholder="preferences, project" value={tags} onChange={(e) => setTags(e.target.value)} className="field" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label">Kind</span>
                <select value={kind} onChange={(e) => setKind(e.target.value as MemoryRecord["kind"])} className="field min-w-[160px]">
                  <option value="fact">fact</option>
                  <option value="conversation">conversation</option>
                  <option value="document">document</option>
                  <option value="embedding">embedding</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary self-start">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {submitting ? "Encrypting & uploading..." : "Store memory"}
            </button>
          </form>
        </section>

        {error && (
          <div className="text-sm text-[var(--danger)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] rounded-xl p-4 -mt-8 font-medium">
            {error}
          </div>
        )}

        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-5">Your memories</h2>
          {loading ? (
            <p className="text-[var(--muted)] text-sm">Loading&hellip;</p>
          ) : memories.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[var(--muted)] text-sm">No memories yet. Store your first one above.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {memories.map((m) => (
                <li key={m.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <LockIcon open={!!recalled[m.id]} />
                      <div>
                        <p className="text-[0.9375rem] font-semibold">{m.summary}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{m.kind}</span>
                          {m.tags.map((t) => (
                            <span key={t} className="text-xs font-medium text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-full px-2.5 py-0.5">{t}</span>
                          ))}
                          {m.listed && (
                            <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] rounded-full px-2.5 py-0.5">
                              listed &middot; {m.price_usd} shelbyUSD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleRecall(m.id)} className="btn-ghost">Recall</button>
                      <button onClick={() => handlePublish(m.id, !m.listed)} className="btn-ghost">{m.listed ? "Unlist" : "List for sale"}</button>
                    </div>
                  </div>
                  {recalled[m.id] && (
                    <pre className="mt-4 ml-11 text-xs font-data bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 whitespace-pre-wrap">{recalled[m.id]}</pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
