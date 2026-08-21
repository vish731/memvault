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
          Each encrypted payload carries its own initialization vector and authentication tag, generated fresh per
          memory rather than reused across a session. This means a compromise of one memory's key reveals nothing
          about any other memory, even ones created moments apart by the same user.
        </p>
        <p>
          The one field that stays in plain text by design is the <strong className="text-[var(--ink)]">summary</strong>,
          since a buyer needs something to evaluate before paying to unlock a memory. Keep it under 150 characters
          and free of anything you wouldn't want publicly readable, since that's the only part of a listed memory
          visible before purchase.
        </p>
      </Section>

      <Section n="02" title="Storage on Shelby">
        <p>
          Encrypted blobs are written to <a href="https://docs.shelby.xyz/protocol" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-medium">Shelby Protocol</a>,
          a decentralized storage network coordinated on Aptos where both writes and reads are metered and paid
          for on-chain. A blob is addressed by an account and a blob name; downloading it requires knowing both,
          but downloading only ever returns ciphertext. The actual access control that matters is the decryption
          key, which Memvault holds server-side and releases only after ownership or payment is verified.
        </p>
        <p>
          Each wallet that connects gets a dedicated Shelby account generated automatically for uploads, rather than
          every user sharing a single account. This account is custodial: its private key is held server-side, not
          inside your wallet extension, because Shelby's upload authentication (a challenge-response scheme called
          BlobOwnerAuth) expects a raw signature over the challenge bytes. Browser wallets like Petra sign messages
          in a wrapped format instead, prefixed and structured for replay protection, which doesn't match what
          Shelby's default verification expects. We've opened an issue with the Shelby team asking whether the
          protocol's alternate "derivable" auth scheme is meant to cover this case for Aptos wallets specifically,
          and we'll move to wallet-signed uploads directly once that's resolved.
        </p>
        <p>
          Because this account is separate from your connected wallet, it needs its own funding: both APT for gas
          and ShelbyUSD for the storage payment itself. Attempting to store a memory without either fails with an
          explicit error rather than silently falling back to a shared account, and you can fund it directly from
          a faucet or in a single click by transferring from your connected wallet.
        </p>
      </Section>

      <Section n="03" title="Listing and buying">
        <p>
          Listing a memory for sale is a real, wallet-signed transaction rather than a bare database update. When
          you list something, your wallet is asked to sign a small on-chain transaction, and the server verifies
          that transaction succeeded and was signed by your address before the listing is saved, along with the
          transaction hash itself for later reference.
        </p>
        <p>
          Buying follows the same pattern at a larger scale: your wallet signs a genuine ShelbyUSD transfer,
          addressed directly to the seller, for the exact listed price. The server independently verifies that
          transaction on-chain, checking the sender, the recipient, the asset, and the amount, before decrypting
          the memory's content and returning it. No payment is ever trusted purely because the client claims it
          happened; every purchase is checked against the transaction itself.
        </p>
        <p>
          Listings created before this on-chain flow existed still work through an internal test-credit ledger,
          so nothing that was listed earlier stops functioning. New listings go through the wallet-signed path by
          default.
        </p>
      </Section>

      <Section n="04" title="Identity across devices">
        <p>
          Before a wallet is connected, Memvault tracks activity through an anonymous session cookie, which is
          enough to use the app but doesn't follow you anywhere. Once you connect a wallet, memories, purchases,
          and favorites are recorded against your wallet's address instead. Connect the same wallet from a
          different browser or device, and everything you've stored, bought, or saved reappears, since it was
          never tied to that original session in the first place.
        </p>
      </Section>

      <Section n="05" title="Images">
        <p>
          Memories aren't limited to text. You can attach an image up to 3MB, which is base64-encoded and put
          through the exact same AES-256-GCM encryption path as text content, alongside an optional note. Both
          are stored together as a single encrypted payload and reconstructed together when the memory is
          recalled or purchased, so an image and its caption never separate.
        </p>
      </Section>

      <Section n="06" title="Deleting a memory">
        <p>
          Deleting a memory removes its metadata record from Memvault's database, along with any purchases,
          favorites, or reviews that reference it, and is restricted to the wallet or session that created it.
          Shelby itself doesn't expose a way to delete an already-committed blob on demand, only to let it expire
          at the time originally set during upload. In practice this doesn't leave anything meaningfully
          recoverable: once the metadata record and its decryption key are gone, the remaining ciphertext on
          Shelby is just unreadable bytes until it naturally expires.
        </p>
      </Section>

      <div className="card p-6 flex items-start gap-4">
        <span className="icon-badge accent shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /></svg>
        </span>
        <p className="text-sm text-[var(--muted)]">
          This runs on Shelby's testnet. Transfers are real, verifiable transactions, but testnet ShelbyUSD and APT
          don't carry real-world value.
        </p>
      </div>
    </div>
  );
}
