import { fetchLiveTournamentData } from "@/lib/api/espn/client";
import { resolveBracket } from "@/lib/engine/bracket-resolver";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { groups, matches, source, updatedAt } = await fetchLiveTournamentData();
  const state = resolveBracket(groups, matches);

  return NextResponse.json({
    ...state,
    source,
    updatedAt,
  });
}
