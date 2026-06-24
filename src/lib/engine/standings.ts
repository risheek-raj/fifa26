import { TEAMS_BY_ID } from "@/lib/data/teams";
import type { Group, GroupId, GroupStanding, Team } from "@/types/tournament";

export function sortStandings(standings: GroupStanding[]): GroupStanding[] {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    if (a.fairPlayScore !== b.fairPlayScore)
      return a.fairPlayScore - b.fairPlayScore;
    const rankA = TEAMS_BY_ID[a.teamId]?.fifaRank ?? 999;
    const rankB = TEAMS_BY_ID[b.teamId]?.fifaRank ?? 999;
    return rankA - rankB;
  });
}

export function getTeamAtPosition(
  groups: Group[],
  groupId: GroupId,
  position: 1 | 2 | 3,
): Team | null {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;
  const sorted = sortStandings(group.standings);
  const standing = sorted[position - 1];
  if (!standing) return null;
  return TEAMS_BY_ID[standing.teamId] ?? null;
}

export interface ThirdPlaceEntry {
  team: Team;
  groupId: GroupId;
  standing: GroupStanding;
}

export function rankThirdPlaceTeams(groups: Group[]): ThirdPlaceEntry[] {
  const thirdPlace: ThirdPlaceEntry[] = [];

  for (const group of groups) {
    const sorted = sortStandings(group.standings);
    const third = sorted[2];
    if (!third) continue;
    const team = TEAMS_BY_ID[third.teamId];
    if (!team) continue;
    thirdPlace.push({ team, groupId: group.id, standing: third });
  }

  return thirdPlace.sort((a, b) => {
    if (b.standing.points !== a.standing.points)
      return b.standing.points - a.standing.points;
    if (b.standing.goalDifference !== a.standing.goalDifference)
      return b.standing.goalDifference - a.standing.goalDifference;
    if (b.standing.goalsFor !== a.standing.goalsFor)
      return b.standing.goalsFor - a.standing.goalsFor;
    if (a.standing.fairPlayScore !== b.standing.fairPlayScore)
      return a.standing.fairPlayScore - b.standing.fairPlayScore;
    return a.team.fifaRank - b.team.fifaRank;
  });
}

export function getQualifyingThirdPlace(
  groups: Group[],
): ThirdPlaceEntry[] {
  return rankThirdPlaceTeams(groups).slice(0, 8);
}

export function getThirdPlaceTeamByGroup(
  groups: Group[],
  sourceGroup: GroupId,
): Team | null {
  const qualified = getQualifyingThirdPlace(groups);
  const entry = qualified.find((e) => e.groupId === sourceGroup);
  return entry?.team ?? null;
}
