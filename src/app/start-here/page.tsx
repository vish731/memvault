function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-bold text-sm flex items-center justify-center shrink-0">
          {n}
        </span>
        <span className="w-px flex-1 bg-[var(--border)] mt-2" />
      </div>
      <div className="pb-10">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
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
        New here? Start here
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Start here</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-12 max-w-lg">
        Everything you need to go from zero to storing and trading encrypted memories, even if you&rsquo;ve never
        touched a crypto wallet before.
      </p>

      <div>
        <Step n={1} title="Install a wallet">
          <p>
            You&rsquo;ll need a browser wallet to connect to Memvault. We support two:
          </p>
          <ul className="list-disc list-inside">
            <li><a href="https://chromewebstore.google.com/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">Petra Wallet</a> (recommended, most common on Aptos)</li>
            <li><a href="https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">OKX Wallet</a></li>
          </ul>
          <p>Install the extension, then create a new wallet (or import one if you already have it). Save your recovery phrase somewhere safe. Nobody can recover it for you if it&rsquo;s lost.</p>
        </Step>

        <Step n={2} title="Switch your wallet to the right network">
          <p>Open your wallet extension, find the network selector (usually says &ldquo;Mainnet&rdquo;), and switch it to <strong className="text-[var(--ink)]">Testnet</strong> or <strong className="text-[var(--ink)]">Shelbynet</strong> if that option is available.</p>
          <p>Memvault runs on Shelby&rsquo;s testnet, so a wallet set to Mainnet won&rsquo;t be able to interact with it correctly.</p>
        </Step>

        <Step n={3} title="Connect your wallet to Memvault">
          <p>Click <strong className="text-[var(--ink)]">&ldquo;Connect Wallet&rdquo;</strong> in the top-right corner of any page, choose your wallet from the list, and approve the connection request that pops up.</p>
          <p>Once connected, your address appears in the header, and the <a href="/market" className="text-[var(--primary)] font-medium">Marketplace</a> page will show your real on-chain shelbyUSD balance.</p>
        </Step>

        <Step n={4} title="Store your first memory">
          <p>Go to the <a href="/" className="text-[var(--primary)] font-medium">My Memories</a> page and fill in the &ldquo;Store a new memory&rdquo; form:</p>
          <ul className="list-disc list-inside">
            <li><strong className="text-[var(--ink)]">Memory content</strong>: the actual text, which gets encrypted before it ever leaves your device</li>
            <li><strong className="text-[var(--ink)]">Public summary</strong>: a short, non-sensitive description shown if you list it for sale later</li>
            <li><strong className="text-[var(--ink)]">Tags &amp; kind</strong>: help others find it in the marketplace</li>
          </ul>
          <p>Click <strong className="text-[var(--ink)]">&ldquo;Store memory&rdquo;</strong>, it&rsquo;s encrypted and uploaded to Shelby&rsquo;s decentralized storage network.</p>
        </Step>

        <Step n={5} title="List it in the marketplace (optional)">
          <p>On any memory you own, click <strong className="text-[var(--ink)]">&ldquo;List for sale&rdquo;</strong> and set a price in shelbyUSD. It&rsquo;ll now appear on the <a href="/market" className="text-[var(--primary)] font-medium">Marketplace</a> page for others to discover and buy.</p>
        </Step>

        <Step n={6} title="Browse, buy, favorite, and rate">
          <p>On the Marketplace page you can search by tag or kind, sort by price or rating, save listings to your <a href="/favorites" className="text-[var(--primary)] font-medium">Favorites</a>, and buy anything that looks useful.</p>
          <p>After buying, head to <a href="/purchases" className="text-[var(--primary)] font-medium">Purchases</a> to unlock the content for free anytime and leave a star rating.</p>
        </Step>
      </div>

      <div className="card p-6 flex items-start gap-4 mt-4">
        <span className="icon-badge accent shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.8-2 3.5M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </span>
        <div>
          <p className="font-semibold text-sm mb-1">Stuck somewhere?</p>
          <p className="text-sm text-[var(--muted)]">
            Check the <a href="/support" className="text-[var(--primary)] font-medium">Support FAQ</a> or read <a href="/docs" className="text-[var(--primary)] font-medium">Docs</a> for the technical details behind encryption, storage, and the marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}
