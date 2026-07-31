import { neon } from "@neondatabase/serverless";

/**
 * Lazily creates the SQL tag function so the module can be imported
 * even before DATABASE_URL is set (e.g. during local dev without a DB yet).
 * Throws only when an actual query is attempted without a connection string.
 */
export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres database (Vercel Postgres / Neon) and set DATABASE_URL in your environment."
    );
  }
  return neon(url);
}
