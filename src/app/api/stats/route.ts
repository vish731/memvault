import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = sql();
    const [row] = await db`
      select
        count(*)::int as total_memories,
        count(*) filter (where listed = true)::int as total_listed
      from memories
    `;
    return NextResponse.json({
      totalMemories: row.total_memories,
      totalListed: row.total_listed,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load stats" },
      { status: 500 }
    );
  }
}
