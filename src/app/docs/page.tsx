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
        A detailed look at the architecture: encryption, storage, identity, and the marketplace mechanics that tie them together.
      </p>

      <Section n="01" title="Encryption">
        <p>
          Every memory receives a unique <strong className="text-[var(--ink)]">AES-256-GCM</strong> key at the
          moment it's written. Content is encrypted client-side into an authenticated ciphertext before any network
          request is made, and only that ciphertext ever leaves the browser. Shelby never has access to the
          plaintext, and neither does any intermediate service.
        </p>
        <p>
          The one field that stays in plain text by design is the <strong className="text-[var(--ink)]">summary</strong>,
          capped at 150 characters, since a buyer needs something to evaluate before paying to unlock a memory.
          Summaries and tags can be edited after the fact without touching the encrypted content underneath, useful
          if you typo something or want to reword how a listing reads. The actual content itself is fixed once
          written; to change it, delete the memory and store a new one.
        </p>
      </Section>

      <Section n="02" title="Storage on Shelby">
        <p>
          Encrypted blobs are written to <a href="https://docs.shelby.xyz/protocol" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">Shelby Protocol</a>,
          a decentralized storage network coordinated on Aptos where both writes and reads are metered and paid
          for on-chain. A blob is addressed by an account and a blob name; downloading it only ever returns
          ciphertext. Access control that actually matters is the decryption key, held server-side and released
          only after ownership or payment is verified.
        </p>
        <p>
          Each wallet that connects gets a dedicated Shelby account generated automatically for uploads, rather
          than sharing a single account across every user. This account is custodial: its private key lives
          server-side, not inside your wallet extension, because Shelby's upload authentication (BlobOwnerAuth)
          expects a raw signature over the challenge bytes, while browser wallets like Petra sign a wrapped
          message format instead for replay protection. We've asked the Shelby team whether the protocol's
          "derivable" auth scheme is meant to cover this for Aptos wallets, and we'll move to direct wallet-signed
          uploads once that's resolved.
        </p>
        <p>
          Because this account is separate from your connected wallet, it needs its own funding: APT for gas and
          ShelbyUSD for the storage payment itself. Storing a memory fails with an explicit error if either is
          missing, rather than silently falling back to a shared account, and you can fund it directly from a
          faucet or in one click from your connected wallet.
        </p>
      </Section>

      <Section n="03" title="Listing and buying">
        <p>
          Listing a memory for sale is a real, wallet-signed on-chain commitment, not a bare database flag. Your
          wallet signs a small transaction, and the server verifies it succeeded and came from your address before
          the listing goes live, storing the transaction hash for reference.
        </p>
        <p>
          Buying works the same way at a larger scale: your wallet signs a genuine ShelbyUSD transfer directly to
          the seller. The server independently verifies that transaction, checking the sender, recipient, asset,
          and amount, before decrypting and returning the content. Already own it? Unlocking it again is free and
          skips payment entirely, it's checked against your purchase history first.
        </p>
        <p>
          One thing worth knowing: wallets default to whatever network they were last on, often Mainnet. Shelbynet
          transactions need your wallet on Testnet specifically, and most wallets don't support switching networks
          programmatically from a website, so you may need to switch manually inside your wallet extension the
          first time.
        </p>
      </Section>

      <Section n="04" title="Identity across devices">
        <p>
          Before a wallet is connected, Memvault tracks activity through an anonymous session cookie. Once
          connected, memories, purchases, and favorites are recorded against your wallet's address instead.
          Connect the same wallet from a different browser or device, and everything you've stored, bought, or
          saved reappears there too.
        </p>
      </Section>

      <Section n="05" title="Images">
        <p>
          Memories aren't limited to text. Attach an image up to 3MB, optionally with a short note, and both are
          encrypted together through the same AES-256-GCM path as text content, stored as one payload, and
          reconstructed together on recall.
        </p>
      </Section>

      <Section n="06" title="Semantic search">
        <p>
          Listings can be found by meaning, not just keyword matching. Each memory's summary gets converted to an
          embedding vector when it's stored, and searching the marketplace embeds your query the same way, ranking
          listings by similarity. A search for "anything about pets" can surface a memory about a dog even if the
          word "pets" never appears in it.
        </p>
      </Section>

      <Section n="07" title="Deleting a memory">
        <p>
          Deleting removes the metadata record permanently, along with any purchases, favorites, or reviews
          attached to it, and is restricted to the wallet or session that created it. Shelby doesn't expose a way
          to delete an already-committed blob on demand, only to let it expire at the time set during upload, but
          without the metadata record and its key, the remaining ciphertext is just unreadable bytes regardless.
        </p>
      </Section>

      <div className="card p-6 flex items-start gap-4">
        <span className="icon-badge accent shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
        </span>
        <p className="text-sm text-[var(--muted)]">
          This runs on Shelby's testnet. Transfers are real, verifiable transactions, but testnet ShelbyUSD and
          APT don't carry real-world value.
        </p>
      </div>
    </div>
  );
}
