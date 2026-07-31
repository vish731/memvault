"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is my memory content ever visible to Memvault or Shelby?",
    a: "No. Content is encrypted with AES-256-GCM before it leaves your device or this server. Only the public summary you write is stored in plaintext, since that's what's shown when browsing the marketplace.",
  },
  {
    q: "What is shelbyUSD and why does my balance show 100 by default?",
    a: "shelbyUSD is Shelby Protocol's unit for paying to read storage. In this demo, every new visitor starts with a simulated 100 shelbyUSD balance so you can test buying listings without needing real funds.",
  },
  {
    q: "Why did my \"Store memory\" or \"Buy\" action fail?",
    a: "The most common causes are: the Shelby testnet account behind this deployment isn't funded, the SHELBY_API_KEY or SHELBY_PRIVATE_KEY environment variables are missing, or the database connection timed out. Check the error message shown on the page for specifics.",
  },
  {
    q: "Can I get my memory back if I lose the decryption key?",
    a: "No. The key is what makes the content unrecoverable by anyone else, including us — so there's no recovery path if it's lost. Treat memory content the way you'd treat anything encrypted: back up what matters to you.",
  },
  {
    q: "How do I get testnet APT or shelbyUSD to fund a real account?",
    a: "Shelby provides testnet faucets for both — see the Docs page for links, or visit docs.shelby.xyz directly. This app's marketplace balance is separate and simulated, so it doesn't require real funding to try.",
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
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Frequently asked questions</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-10 max-w-lg">
        Common questions about encryption, the marketplace, and troubleshooting. Still stuck? See the <a href="/contact" className="text-[var(--primary)] font-medium">Contact</a> page.
      </p>

      <div className="flex flex-col gap-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
              >
                <span className="font-semibold text-[0.9375rem]">{item.q}</span>
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  className={`shrink-0 transition-transform ${isOpen ? "rotate-45" : ""}`}
                  style={{ color: "var(--muted)" }}
                >
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-[var(--muted)] text-sm leading-relaxed -mt-2">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
