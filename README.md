# Memvault (Web) — AI Memory + Data Marketplace on Shelby

A Next.js app, deployable on Vercel, that stores encrypted AI memories on
[Shelby Protocol](https://docs.shelby.xyz/protocol) and lets you list them
for sale on a simple pay-per-read marketplace.

## Stack
- **Next.js** (App Router) — frontend + API routes
- **Shelby Protocol** (`@shelby-protocol/sdk`) — decentralized, pay-per-read blob storage
- **Postgres via Neon** (`@neondatabase/serverless`) — metadata, listings, simulated ledger
- **AES-256-GCM** (Node `crypto`) — memories are encrypted before upload to Shelby

## Architecture

All memory content is encrypted with a per-memory AES key *before* it's uploaded to
Shelby. Shelby's blobs are addressed by `account + blobName`; anyone who knows both
can download the encrypted bytes, but only someone with the AES key can read the
plaintext. So the marketplace's real access control is **the key**, not the blob:

- `remember` -> encrypt -> upload to Shelby -> save `{blobName, encKey, summary, ...}` in Postgres
- `recall` -> download from Shelby -> decrypt with the key from Postgres (owner-only)
- `publish` -> mark a memory `listed = true` with a price (summary stays public, content stays encrypted)
- `buy` -> charge a simulated shelbyUSD ledger, record a `purchases` row, then decrypt and return content

This app uses **one shared "service account"** (`SHELBY_PRIVATE_KEY`) to talk to Shelby,
since Vercel functions have no durable local filesystem to hold a per-user keypair.
Per-visitor ownership/access is tracked with an anonymous cookie (`memvault_visitor`)
in Postgres, not with separate on-chain accounts.

**What's simulated vs. real:** blob upload/download really goes through Shelby +
Aptos testnet. The marketplace *payment* is a Postgres row (`ledger` table), not a
real shelbyUSD transfer. In production, replace the `ledger`/`purchases` writes in
`src/app/api/market/[id]/buy/route.ts` with an on-chain escrow (Aptos Move module)
that emits a purchase event once a real payment is confirmed.

