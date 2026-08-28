function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="icon-badge shrink-0 font-data text-sm font-semibold not-italic">{n}</span>
        <div className="w-px flex-1 bg-[var(--border)] my-1" />
      </div>
      <div className="pb-8">
        <h3 className="font-bold text-lg mb-1.5">{title}</h3>
        <div className="text-[var(--muted)] text-[0.9375rem] leading-relaxed flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}

export default function StartHere() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <span className="badge-pill mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
        New here
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Start here</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-12 max-w-lg">
        Give it ten minutes and you'll go from nothing to having actually stored, listed, and bought a memory with real testnet funds.
      </p>

      <Step n={1} title="Get a wallet">
        <p>
          Petra or OKX, whichever you already have or don't mind installing. Either works fine here, it's just a browser extension.
        </p>
      </Step>

      <Step n={2} title="Connect it, then switch to Testnet">
        <p>
          Hit Connect Wallet up top and approve it. If your wallet defaults to Mainnet, open the extension itself and switch the network to Testnet, most wallets don't let a website switch this for you automatically, so it's usually a one-time manual step.
        </p>
      </Step>

      <Step n={3} title="Get some testnet funds in place">
        <p>
          Two places need funds. Your actual wallet needs APT and ShelbyUSD for listing and buying. Your personal Shelby account, shown when you click your address, needs its own APT and ShelbyUSD separately, for uploading memories.
        </p>
        <p>
          Don't want to hunt down two faucets? Once your main wallet has something in it, hit "Fund from my wallet" in the account panel to move funds over in one click.
        </p>
      </Step>

      <Step n={4} title="Store something">
        <p>
          Type whatever you want remembered, or drop in an image instead (3MB cap) with a quick note if you like. Add a one-line summary, hit Store. It's encrypted before any of it leaves your device.
        </p>
      </Step>

      <Step n={5} title="Put a price on it">
        <p>
          Hit "List for sale," name your price in shelbyUSD. Your wallet will pop up asking you to sign, a real transaction confirming the listing is actually yours. Made a typo in the summary? Hit Edit any time, no need to redo the whole thing.
        </p>
      </Step>

      <Step n={6} title="Go buy something">
        <p>
          Head to the Marketplace, find anything listed, hit Buy. Your wallet signs a real ShelbyUSD transfer straight to whoever's selling it, and the content unlocks the moment that clears on-chain.
        </p>
      </Step>

      <div className="card p-6 mt-4">
        <p className="text-sm text-[var(--muted)]">
          Something not working the way you expect? Check <a href="/support" className="text-[var(--primary)] font-medium">Support</a> first, most snags are covered there. For the actual mechanics behind encryption and payments, there's <a href="/docs" className="text-[var(--primary)] font-medium">Docs</a>.
        </p>
      </div>
    </div>
  );
}
