import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

// TEMPORARY — delete this file right after confirming { "success": true }.
export async function GET() {
  const db = sql();
  try {
    await db.query(`alter table memories add column if not exists summary_embedding jsonb`);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
