"use client";

import { useState } from "react";
import ConnectWalletButton from "@/components/ConnectWalletButton";

const LINKS = [
  { href: "/", label: "My Memories" },
  { href: "/market", label: "Marketplace" },
  { href: "/purchases", label: "Purchases" },
  { href: "/favorites", label: "Favorites" },
  { href: "/docs", label: "Docs" },
  { href: "/start-here", label: "Start Here" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        className="icon-badge"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[65px] bottom-0 bg-[var(--surface)] z-30 overflow-y-auto">
          <nav className="flex flex-col p-6 gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-[var(--ink)] py-3 border-b border-[var(--border)]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-6">
              <ConnectWalletButton />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
