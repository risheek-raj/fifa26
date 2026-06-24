import { espnCodeToTeamId } from "@/lib/api/espn/constants";
import type { LiveMatch } from "@/lib/api/espn/client";
import type { KnockoutMatchTemplate, Team } from "@/types/tournament";

export interface KnockoutLiveResult {
  status: "scheduled" | "live" | "finished";
  homeScore: number;
  awayScore: number;
  winner: Team | null;
  loser: Team | null;
}

function teamIdsFromLive(live: LiveMatch): [string, string] | null {
  const homeId = espnCodeToTeamId(live.homeTeam.code);
  const awayId = espnCodeToTeamId(live.awayTeam.code);
  if (!homeId || !awayId) return null;
  return [homeId, awayId];
}

function isSameTeamPair(
  live: LiveMatch,
  homeTeam: Team,
  awayTeam: Team,
): boolean {
  const ids = teamIdsFromLive(live);
  if (!ids) return false;
  const [liveHome, liveAway] = ids;
  return (
    (liveHome === homeTeam.id && liveAway === awayTeam.id) ||
    (liveHome === awayTeam.id && liveAway === homeTeam.id)
  );
}

function isNearDate(templateDate: string, liveDate: string): boolean {
  const diff = Math.abs(
    new Date(templateDate).getTime() - new Date(liveDate).getTime(),
  );
  return diff <= 36 * 60 * 60 * 1000;
}

export function findKnockoutLiveResult(
  template: KnockoutMatchTemplate,
  homeTeam: Team | null,
  awayTeam: Team | null,
  liveMatches: LiveMatch[],
): KnockoutLiveResult | null {
  if (!homeTeam || !awayTeam) return null;

  const live = liveMatches.find(
    (m) =>
      isSameTeamPair(m, homeTeam, awayTeam) &&
      isNearDate(template.datetime, m.date),
  );
  if (!live) return null;

  const ids = teamIdsFromLive(live)!;
  const [liveHomeId] = ids;
  const homeIsLiveHome = liveHomeId === homeTeam.id;
  const homeScore = homeIsLiveHome ? live.homeTeam.score : live.awayTeam.score;
  const awayScore = homeIsLiveHome ? live.awayTeam.score : live.homeTeam.score;

  if (live.status === "scheduled") {
    return { status: "scheduled", homeScore, awayScore, winner: null, loser: null };
  }

  if (live.status === "live") {
    return { status: "live", homeScore, awayScore, winner: null, loser: null };
  }

  let winner: Team | null = null;
  let loser: Team | null = null;
  if (homeScore > awayScore) {
    winner = homeTeam;
    loser = awayTeam;
  } else if (awayScore > homeScore) {
    winner = awayTeam;
    loser = homeTeam;
  }

  return { status: "finished", homeScore, awayScore, winner, loser };
}
