import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

// TEMPORARY — applies schema changes by visiting this URL in a browser, so no
// local `npm run db:setup` is needed. Safe to re-run (everything is
// IF NOT EXISTS / ADD COLUMN IF NOT EXISTS). Delete this file once confirmed.
export async function GET() {
  const db = sql();
  const statements = [
    `create table if not exists memories (
      id uuid primary key default gen_random_uuid(),
      creator_visitor_id text not null,
      creator_wallet_address text,
      blob_name text not null,
      kind text not null check (kind in ('conversation', 'fact', 'document', 'embedding')),
      tags text[] not null default '{}',
      summary text not null,
      enc_key text not null,
      listed boolean not null default false,
      price_usd numeric(10, 2) not null default 0,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null
    )`,
    `create index if not exists memories_listed_idx on memories (listed)`,
    `create index if not exists memories_creator_idx on memories (creator_visitor_id)`,
    `create table if not exists ledger (
      visitor_id text primary key,
      balance numeric(10, 2) not null default 100
    )`,
    `create table if not exists purchases (
      memory_id uuid not null references memories(id) on delete cascade,
      visitor_id text not null,
      buyer_wallet_address text,
      tx_hash text,
      purchased_at timestamptz not null default now(),
      primary key (memory_id, visitor_id)
    )`,
    `create table if not exists reviews (
      memory_id uuid not null references memories(id) on delete cascade,
      visitor_id text not null,
      rating smallint not null check (rating between 1 and 5),
      comment text,
      created_at timestamptz not null default now(),
      primary key (memory_id, visitor_id)
    )`,
    `create table if not exists favorites (
      visitor_id text not null,
      wallet_address text,
      memory_id uuid not null references memories(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (visitor_id, memory_id)
    )`,
    `create table if not exists shelby_accounts (
      wallet_address text primary key,
      account_address text not null,
      private_key text not null,
      created_at timestamptz not null default now()
    )`,
    `alter table memories add column if not exists creator_wallet_address text`,
    `alter table favorites add column if not exists wallet_address text`,
    `alter table purchases add column if not exists buyer_wallet_address text`,
    `alter table purchases add column if not exists tx_hash text`,
    `create unique index if not exists purchases_tx_hash_idx on purchases (tx_hash) where tx_hash is not null`,
    `alter table memories add column if not exists upload_account_address text`,
    `alter table memories add column if not exists listing_tx_hash text`,
  ];

  const results: string[] = [];
  try {
    for (const statement of statements) {
      await db.query(statement);
      results.push(`OK: ${statement.slice(0, 50).replace(/\s+/g, " ")}...`);
    }
    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error", results },
      { status: 500 }
    );
  }
}
