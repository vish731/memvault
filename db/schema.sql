-- Run this once against your Postgres database (Vercel Postgres / Neon)
-- e.g. psql "$DATABASE_URL" -f db/schema.sql

create table if not exists memories (
  id                 uuid primary key default gen_random_uuid(),
  creator_visitor_id text not null,   -- anonymous cookie id of whoever created it
  blob_name          text not null,
  kind               text not null check (kind in ('conversation', 'fact', 'document', 'embedding')),
  tags               text[] not null default '{}',
  summary            text not null,   -- always public-safe, shown in marketplace browsing
  enc_key            text not null,   -- base64 AES key; server-only, never sent to the client directly
  listed             boolean not null default false,
  price_usd          numeric(10, 2) not null default 0,
  created_at         timestamptz not null default now(),
  expires_at         timestamptz not null
);

create index if not exists memories_listed_idx on memories (listed);
create index if not exists memories_creator_idx on memories (creator_visitor_id);

-- demo-only simulated shelbyUSD balances, keyed by an anonymous visitor id (cookie)
create table if not exists ledger (
  visitor_id  text primary key,
  balance     numeric(10, 2) not null default 100
);

-- records which visitors have purchased which memories (so they can re-read for free after buying)
create table if not exists purchases (
  memory_id   uuid not null references memories(id) on delete cascade,
  visitor_id  text not null,
  purchased_at timestamptz not null default now(),
  primary key (memory_id, visitor_id)
);

-- 1-5 star ratings + optional comment, one per (memory, visitor). Only purchasers may review.
create table if not exists reviews (
  memory_id  uuid not null references memories(id) on delete cascade,
  visitor_id text not null,
  rating     smallint not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  primary key (memory_id, visitor_id)
);

-- saved-for-later listings, independent of purchase
create table if not exists favorites (
  visitor_id text not null,
  memory_id  uuid not null references memories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (visitor_id, memory_id)
);
