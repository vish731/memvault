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

## Setup

### 1. Get a Shelby API key
https://geomi.dev -> create an API key -> **Network: Testnet**, **Client usage: OFF**
(this app calls Shelby from server-side API routes, never from the browser).

### 2. Create + fund a service account
Generate a testnet Aptos account (e.g. via the Shelby CLI: `npm i -g @shelby-protocol/cli && shelby init`),
then fund its address at:
- APT (gas): https://docs.shelby.xyz/apis/faucet/aptos
- ShelbyUSD (storage payment): https://docs.shelby.xyz/apis/faucet/shelbyusd

### 3. Create a Postgres database
Easiest via Vercel: add the **Neon** integration from your Vercel project's Storage tab,
or create a free database directly at https://neon.tech. Copy the connection string.

### 4. Configure environment variables
```bash
cp .env.example .env.local
# fill in SHELBY_API_KEY, SHELBY_PRIVATE_KEY, DATABASE_URL
```

### 5. Run the schema once
```bash
psql "$DATABASE_URL" -f db/schema.sql
```

### 6. Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 — store a memory, list it, then open `/market` to browse and buy it.

## Deploying to Vercel
1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the same three environment variables (`SHELBY_API_KEY`, `SHELBY_PRIVATE_KEY`,
   `DATABASE_URL`) in the Vercel project's Settings -> Environment Variables.
4. Deploy. Run `db/schema.sql` against your production database once, the same way
   as step 5 above (point `DATABASE_URL` at the prod connection string).

## Where to take this next
- Replace the simulated ledger with a real Aptos Move escrow contract.
- Add per-user wallets (e.g. Petra) instead of one shared service account, so buyers
  and sellers are cryptographically distinct instead of just cookie-distinct.
- Add semantic recall: store an embedding alongside `summary` for similarity search
  across an agent's memory instead of exact-ID lookup.
