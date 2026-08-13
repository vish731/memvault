import { NextRequest } from "next/server";
import crypto from "node:crypto";

export const VISITOR_COOKIE = "memvault";

/** Reads the visitor id cookie if present, otherwise generates a fresh one. */
export function getOrCreateVisitorId(req: NextRequest): { id: string; isNew: boolean } {
  const existing = req.cookies.get(VISITOR_COOKIE)?.value;
  if (existing) return { id: existing, isNew: false };
  return { id: crypto.randomUUID(), isNew: true };
}
