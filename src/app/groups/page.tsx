import { GroupsPageClient } from "@/components/groups/GroupsPageClient";
import { fetchLiveGroups } from "@/lib/api/espn/client";
import { buildGroupsFromSeed } from "@/lib/data/seed-standings";
import { rankThirdPlaceTeams } from "@/lib/engine/standings";
import type { StandingsResponse } from "@/lib/hooks/use-tournament";

async function getServerStandings(): Promise<StandingsResponse> {
  try {
    const { groups, source, updatedAt } = await fetchLiveGroups();
    const thirdPlace = rankThirdPlaceTeams(groups);
    return {
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
    };
  } catch {
    const groups = buildGroupsFromSeed();
    const thirdPlace = rankThirdPlaceTeams(groups);
    return {
      groups,
      thirdPlaceQualifiers: thirdPlace.map((e, i) => ({
        team: e.team,
        groupId: e.groupId,
        rank: i + 1,
        qualified: i < 8,
        points: e.standing.points,
        goalDifference: e.standing.goalDifference,
      })),
      source: "seed",
      updatedAt: new Date().toISOString(),
    };
  }
}

export default async function GroupsPage() {
  const initialStandings = await getServerStandings();
  return <GroupsPageClient initialStandings={initialStandings} />;
}
