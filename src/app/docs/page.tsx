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
        Here&rsquo;s what actually happens under the hood when you store a memory, list it, or buy one from someone else.
      </p>

      <Section n="01" title="Encryption">
        <p>
          Every memory gets its own random <strong className="text-[var(--ink)]">AES-256-GCM</strong> key the moment
          you write it. Only the encrypted bytes ever get uploaded anywhere, whether the memory is text or an image.
        </p>
        <p>
          The <strong className="text-[var(--ink)]">summary</strong> field stays in plain text on purpose, since
          that&rsquo;s what buyers see when browsing the marketplace. Keep it under 150 characters and don&rsquo;t
          put anything sensitive there.
        </p>
      </Section>

      <Section n="02" title="Where memories are stored">
        <p>
          Encrypted blobs go to <a href="https://docs.shelby.xyz/protocol" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">Shelby Protocol</a>,
          a decentralized storage network on Aptos where reads are metered and paid for. Shelby keeps the data around
          and serves it fast; Memvault decides who&rsquo;s allowed to decrypt it once they have it.
        </p>
        <p>
          Each connected wallet gets its own dedicated Shelby account for uploads, generated automatically the first
          time you connect. If that account isn&rsquo;t funded with APT and ShelbyUSD, storing a memory will fail
          with a clear message telling you to fund it, rather than quietly falling back to a shared account. You can
          fund it directly from a faucet, or with one click from your connected wallet, both from the account panel
          in the header.
        </p>
        <p>
          This account holds the private key server-side, not in your wallet extension, because Shelby&rsquo;s
          upload authentication expects a raw signature format that browser wallets don&rsquo;t produce today. We
          have an open question with the Shelby team on whether there&rsquo;s a supported path around this.
        </p>
      </Section>

      <Section n="03" title="Listing and buying">
        <p>
          Listing a memory for sale is a real, wallet-signed on-chain commitment, not just a database flag. When you
          list something, your wallet signs a small transaction, and the app verifies it succeeded and came from your
          address before saving the listing.
        </p>
        <p>
          Buying works the same way: your wallet signs a real ShelbyUSD transfer straight to the seller&rsquo;s
          address. The app checks that transaction on-chain, matching the amount, sender, and recipient, before
          decrypting and handing over the content.
        </p>
      </Section>

      <Section n="04" title="Identity">
        <p>
          Once you connect a wallet, your memories, purchases, and favorites are tracked by your wallet&rsquo;s
          address instead of a browser cookie. Connect the same wallet from a different device or browser and
          everything you&rsquo;ve stored, bought, or saved shows up the same way.
        </p>
      </Section>

      <Section n="05" title="Images">
        <p>
          You can attach an image instead of typing text, up to 3MB. It gets base64-encoded and encrypted the same
          way text does, so the same key-based access control applies. You can also add a short note alongside the
          image; both get stored together and shown together when you recall it.
        </p>
      </Section>

      <Section n="06" title="Deleting a memory">
        <p>
          Deleting removes the metadata record from Memvault permanently, along with any purchases, favorites, or
          reviews attached to it. Shelby doesn&rsquo;t support deleting an already-committed blob directly, only
          letting it expire, but once the record (and its decryption key) is gone, the blob is unreadable anyway.
        </p>
      </Section>

      <div className="card p-6 flex items-start gap-4">
        <span className="icon-badge accent shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
        </span>
        <p className="text-sm text-[var(--muted)]">
          This runs on Shelby&rsquo;s testnet. Transfers are real, verifiable transactions, but testnet ShelbyUSD and
          APT don&rsquo;t carry real-world value.
        </p>
      </div>
    </div>
  );
}
