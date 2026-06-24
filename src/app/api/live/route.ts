import { fetchLiveTournamentData } from "@/lib/api/espn/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { matches, source, updatedAt, hasLiveMatches } =
    await fetchLiveTournamentData();

  return NextResponse.json({
    matches,
    source,
    updatedAt,
    hasLiveMatches,
  });
}
