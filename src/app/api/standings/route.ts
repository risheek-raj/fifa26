import { fetchLiveGroups } from "@/lib/api/espn/client";
import { rankThirdPlaceTeams } from "@/lib/engine/standings";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { groups, source, updatedAt } = await fetchLiveGroups();
  const thirdPlace = rankThirdPlaceTeams(groups);

  return NextResponse.json({
    groups,
    thirdPlaceQualifiers: thirdPlace.map((e, i) => ({
      team: e.team,
      groupId: e.groupId,
      rank: i + 1,
      qualified: i < 8,
      points: e.standing.points,
      goalDifference: e.standing.goalDifference,
    })),
    source,
    updatedAt,
  });
}
