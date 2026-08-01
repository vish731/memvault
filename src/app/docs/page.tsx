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
        A short technical walkthrough of the encryption, storage, and marketplace mechanics behind the app.
      </p>

      <Section n="01" title="Encryption">
        <p>
          Before anything leaves your browser or this server, memory content is encrypted with <strong className="text-[var(--ink)]">AES-256-GCM</strong> using
          a fresh, random key generated per memory. Only the encrypted bytes are ever uploaded. The plaintext content and the key never travel together.
        </p>
        <p>
          The public <strong className="text-[var(--ink)]">summary</strong> field is the one exception: it&rsquo;s stored in plaintext by design, since it&rsquo;s
          what potential buyers see when browsing the marketplace.
        </p>
      </Section>

      <Section n="02" title="Storage on Shelby">
        <p>
          Encrypted memory blobs are uploaded to <a href="https://docs.shelby.xyz/protocol" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">Shelby Protocol</a>,
          a decentralized, pay-per-read blob storage network coordinated on the Aptos blockchain. Shelby handles durability and bandwidth; this app handles
          who&rsquo;s allowed to decrypt what.
        </p>
        <p>
          This app currently uploads under a single service account (configured via <code className="font-data text-xs bg-[var(--bg)] border border-[var(--border)] rounded px-1.5 py-0.5">SHELBY_PRIVATE_KEY</code>),
          which keeps things simple for a demo deployment without requiring per-user wallets for the storage write itself.
        </p>
      </Section>

      <Section n="03" title="The marketplace">
        <p>
          Listing a memory doesn&rsquo;t change where it&rsquo;s stored. It just marks it visible in the marketplace with a price. Since Shelby blobs are
          addressable by account + blob name, the real access control has to be the decryption key, not the blob itself.
        </p>
        <p>
          When someone buys a listed memory, this demo debits a simulated shelbyUSD balance, credits the seller the same amount, and hands over the
          decryption key. Buyers can also rate and favorite listings.
        </p>
      </Section>

      <Section n="04" title="Wallet connection">
        <p>
          Memvault supports connecting an Aptos wallet (Petra) via the official <span className="font-data text-xs text-[var(--ink)]">@aptos-labs/wallet-adapter-react</span> package,
          following the AIP-62 Wallet Standard. Once connected, your real Aptos address is visible in the header.
        </p>
        <p>
          Note: the marketplace economy (balances, purchases, listings) still runs on the anonymous-cookie identity described above for this demo.
          Migrating that identity fully to your connected wallet address, and having your wallet sign the actual Shelby storage transactions, is the
          natural next step for a production version.
        </p>
      </Section>

      <div className="card p-6 flex items-start gap-4">
        <span className="icon-badge accent shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
        </span>
        <p className="text-sm text-[var(--muted)]">
          This is a demo built on Shelby&rsquo;s testnet. Balances, keys, and listings are for illustration and are not real financial instruments.
        </p>
      </div>
    </div>
  );
}
