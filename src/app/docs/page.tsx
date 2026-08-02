function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="icon-badge font-data text-xs font-semibold not-italic">{n}</span>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="text-[var(--muted)] text-[0.9375rem] leading-relaxed flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function Docs() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14">
      <span className="badge-pill mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
        Documentation
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">How Memvault works</h1>
      <p className="text-[var(--muted)] text-[0.9375rem] leading-relaxed mb-12 max-w-lg">
        Here&rsquo;s what actually happens under the hood when you store a memory or buy one from someone else.
      </p>

      <Section n="01" title="Encryption">
        <p>
          Your memory content never leaves your browser (or this server) in plain form. Each memory gets its own
          random <strong className="text-[var(--ink)]">AES-256-GCM</strong> key the moment you write it, and only the
          encrypted bytes get uploaded anywhere. The key and the content never travel together.
        </p>
        <p>
          The <strong className="text-[var(--ink)]">summary</strong> field works differently on purpose: it stays
          in plain text, because that&rsquo;s the part buyers actually see when they&rsquo;re browsing the marketplace.
        </p>
      </Section>

      <Section n="02" title="Where it's actually stored">
        <p>
          Encrypted blobs go to <a href="https://docs.shelby.xyz/protocol" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">Shelby Protocol</a>,
          a decentralized storage network coordinated on Aptos where reads are metered and paid for. Shelby&rsquo;s job is keeping
          the data around and serving it fast; Memvault&rsquo;s job is deciding who&rsquo;s allowed to decrypt it once they have it.
        </p>
        <p>
          Right now every upload goes through one shared account (set via <code className="font-data text-xs bg-[var(--bg)] border border-[var(--border)] rounded px-1.5 py-0.5">SHELBY_PRIVATE_KEY</code>).
          That&rsquo;s a simplification: it means storing a memory doesn&rsquo;t require signing a wallet transaction for the
          upload itself, only for buying and selling.
        </p>
      </Section>

      <Section n="03" title="Buying and selling">
        <p>
          Listing something for sale doesn&rsquo;t move it or copy it anywhere; it just flips a flag and attaches a price.
          Since Shelby blobs can be located by account and blob name alone, the thing actually protecting your content
          is the decryption key, not the storage itself.
        </p>
        <p>
          When you list a memory with a wallet connected, buyers pay you directly: their wallet signs a real ShelbyUSD
          transfer to your address, and the app checks that transaction on-chain before handing over the key. Listings
          created earlier, before that existed, still fall back to an internal test balance so they keep working.
        </p>
      </Section>

      <Section n="04" title="Wallet connection">
        <p>
          Connecting a wallet (Petra or OKX) uses the standard Aptos wallet adapter, following the AIP-62 spec that
          most Aptos wallets implement. Nothing about your private key ever touches this app; your wallet signs
          transactions and only ever shares your public address.
        </p>
        <p>
          One thing still catching up: your identity for things like favorites and recall history is tracked by an
          anonymous session, not your wallet address. Tying that fully to your wallet is the next piece of this.
        </p>
      </Section>

      <div className="card p-6 flex items-start gap-4">
        <span className="icon-badge accent shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
        </span>
        <p className="text-sm text-[var(--muted)]">
          This runs on Shelby&rsquo;s testnet. Transfers are real, verifiable transactions, but testnet ShelbyUSD and APT
          don&rsquo;t carry real-world value.
        </p>
      </div>
    </div>
  );
}
