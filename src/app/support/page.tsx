"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Why do I need to fund two different accounts?",
    a: "Your wallet pays for listing and buying, both real on-chain transactions your wallet signs directly. Your personal Shelby account pays for storing memories, since Shelby's upload authentication doesn't work with a browser wallet's signature format yet. You can move funds from your wallet into your personal Shelby account with one click from the account panel, so you only ever need to visit a faucet for your main wallet.",
  },
  {
    q: "Storing a memory failed with a funding error. What do I do?",
    a: "Open the account panel (click your address in the header) and check your personal Shelby account's balance. It needs both APT and ShelbyUSD. Use Fund from my wallet if your main wallet already has funds, or the faucet links if not.",
  },
  {
    q: "Does connecting a wallet give Memvault access to my funds?",
    a: "No. Connecting only shares your public address. Every payment (listing, buying) requires you to approve a specific transaction in your wallet extension; nothing moves without your explicit signature.",
  },
  {
    q: "What happens to a memory's encrypted data if I delete it?",
    a: "Deleting removes the memory's record and its decryption key from Memvault. Shelby doesn't support deleting an already-uploaded blob directly, only letting it expire naturally, but without the key it stays unreadable regardless.",
  },
  {
    q: "Can I edit a memory after storing it?",
    a: "Not yet. If something's wrong with a memory (a bad summary, wrong tags), delete it and store it again.",
  },
  {
    q: "What's the size limit for images?",
    a: "3MB. Larger files cost more to encrypt, upload, and store, so we cap it there for now.",
  },
];

export default function Support() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <span className="badge-pill mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.8-2 3.5M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        Support
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Common questions</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-10 max-w-lg">
        Answers to the things people run into most. For a full walkthrough, see{" "}
        <a href="/start-here" className="text-[var(--primary)] font-medium">Start Here</a>.
      </p>

      <div className="flex flex-col gap-3">
        {FAQS.map((f, i) => (
          <div key={i} className="card card-hover overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left p-5 flex items-center justify-between gap-4"
            >
              <span className="font-semibold text-[0.9375rem]">{f.q}</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                className={`shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open === i && (
              <p className="px-5 pb-5 text-[var(--muted)] text-sm leading-relaxed">{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
