import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import ConnectWalletButton from "@/components/ConnectWalletButton";

export const metadata: Metadata = {
  title: "Memvault — encrypted AI memory & marketplace",
  description: "Decentralized AI memory storage and pay-per-read data marketplace, built on Shelby Protocol.",
};

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="icon-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="font-bold text-lg tracking-tight text-[var(--ink)]">Memvault</span>
    </span>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          <header className="bg-[var(--surface)] border-b border-[var(--border)] px-6 sm:px-10 py-4 sticky top-0 z-20">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
              <a href="/"><Logo /></a>
              <nav className="flex gap-6 items-center">
                <a href="/" className="nav-link">My Memories</a>
                <a href="/market" className="nav-link">Marketplace</a>
                <a href="/purchases" className="nav-link">Purchases</a>
                <a href="/favorites" className="nav-link">Favorites</a>
                <a href="/docs" className="nav-link">Docs</a>
                <a href="/guide" className="badge-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                  Guide
                </a>
              </nav>
              <ConnectWalletButton />
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-6 sm:px-10 py-12 mt-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                <div>
                  <Logo />
                  <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed max-w-[220px]">
                    A sealed record of machine memory, built on Shelby Protocol.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Product</p>
                  <ul className="flex flex-col gap-2 text-sm">
                    <li><a href="/" className="nav-link">My Memories</a></li>
                    <li><a href="/market" className="nav-link">Marketplace</a></li>
                    <li><a href="/purchases" className="nav-link">Purchases</a></li>
                    <li><a href="/favorites" className="nav-link">Favorites</a></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Resources</p>
                  <ul className="flex flex-col gap-2 text-sm">
                    <li><a href="/guide" className="nav-link">Getting Started Guide</a></li>
                    <li><a href="/docs" className="nav-link">Docs</a></li>
                    <li><a href="/support" className="nav-link">Support</a></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Company</p>
                  <ul className="flex flex-col gap-2 text-sm">
                    <li><a href="/contact" className="nav-link">Contact</a></li>
                    <li><a href="https://docs.shelby.xyz/protocol" className="nav-link" target="_blank" rel="noopener noreferrer">Shelby Protocol</a></li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-3 pt-6 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted)]">&copy; {new Date().getFullYear()} Memvault. Built as a demo on Shelby Protocol testnet.</p>
                <span className="badge-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                  AES-256 &middot; Shelby &middot; Aptos
                </span>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
