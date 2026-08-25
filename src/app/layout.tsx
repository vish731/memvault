import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";
import ServiceAccountAlert from "@/components/ServiceAccountAlert";
import SwitchNetworkButton from "@/components/SwitchNetworkButton";

export const metadata: Metadata = {
  title: "Memvault: encrypted AI memory & marketplace",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('memvault-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <WalletProvider>
          <header className="bg-[var(--surface)] border-b border-[var(--border)] px-6 sm:px-10 py-4 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <a href="/" className="shrink-0"><Logo /></a>
              <nav className="hidden lg:flex gap-5 items-center">
                <a href="/" className="nav-link whitespace-nowrap">My Memories</a>
                <a href="/market" className="nav-link whitespace-nowrap">Marketplace</a>
                <a href="/purchases" className="nav-link whitespace-nowrap">Purchases</a>
                <a href="/favorites" className="nav-link whitespace-nowrap">Favorites</a>
                <a href="/docs" className="nav-link whitespace-nowrap">Docs</a>
                <a href="/start-here" className="badge-pill whitespace-nowrap">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                  Start Here
                </a>
              </nav>
              <div className="flex items-center gap-3 shrink-0">
                <ThemeToggle />
                <div className="hidden lg:block">
                  <ConnectWalletButton />
                </div>
              </div>
              <MobileNav />
            </div>
          </header>

          <ServiceAccountAlert />
          <SwitchNetworkButton />

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
                    <li><a href="/start-here" className="nav-link">Start Here</a></li>
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
                <p className="text-xs text-[var(--muted)]">&copy; {new Date().getFullYear()} Memvault. Built on Shelby Protocol testnet.</p>
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
