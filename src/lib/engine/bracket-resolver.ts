import { findKnockoutLiveResult } from "@/lib/api/espn/knockout-live";
import type { LiveMatch } from "@/lib/api/espn/client";
import { getAnnexCAssignment } from "@/lib/data/annex-c";
import { KNOCKOUT_TEMPLATES } from "@/lib/data/knockout-matches";
import { buildGroupsFromSeed } from "@/lib/data/seed-standings";
import { TEAMS_BY_ID } from "@/lib/data/teams";
import { predictMatch } from "@/lib/engine/predictions";
import {
  getQualifyingThirdPlace,
  getTeamAtPosition,
  getThirdPlaceTeamByGroup,
} from "@/lib/engine/standings";
import type {
  BracketState,
  Group,
  GroupId,
  KnockoutRound,
  MatchPrediction,
  ResolvedMatch,
  SlotRef,
  Team,
} from "@/types/tournament";

function slotLabel(slot: SlotRef): string {
  switch (slot.type) {
    case "position":
      return `${slot.position}${slot.group}`;
    case "winner":
      return `W${slot.matchId}`;
    case "loser":
      return `L${slot.matchId}`;
    case "annex_c_third":
      return `3rd→1${slot.groupWinner}`;
  }
}

function resolveSlot(
  slot: SlotRef,
  groups: Group[],
  winners: Map<number, Team>,
  losers: Map<number, Team>,
  annexThirdGroups: GroupId[],
): Team | null {
  switch (slot.type) {
    case "position":
      return getTeamAtPosition(groups, slot.group, slot.position);
    case "winner":
      return winners.get(slot.matchId) ?? null;
    case "loser":
      return losers.get(slot.matchId) ?? null;
    case "annex_c_third": {
      const assignment = getAnnexCAssignment(annexThirdGroups);
      if (!assignment) return null;
      const sourceGroup = assignment[`1${slot.groupWinner}`];
      if (!sourceGroup) return null;
      return getThirdPlaceTeamByGroup(groups, sourceGroup);
    }
  }
}

function pickWinnerFromPrediction(
  home: Team,
  away: Team,
  prediction: MatchPrediction,
): Team {
  if (prediction.homeWinPct > prediction.awayWinPct) return home;
  if (prediction.awayWinPct > prediction.homeWinPct) return away;
  return home.eloRating >= away.eloRating ? home : away;
}

function getPrediction(
  home: Team | null,
  away: Team | null,
  venue: { country: string },
): MatchPrediction | undefined {
  if (!home || !away) return undefined;
  return predictMatch(home, away, venue);
}

function isGroupStageComplete(groups: Group[]): boolean {
  return groups.every((g) =>
    g.standings.every((s) => s.played >= 3),
  );
}

export function resolveBracket(
  groups?: Group[],
  liveMatches: LiveMatch[] = [],
): BracketState {
  const resolvedGroups = groups ?? buildGroupsFromSeed();
  const thirdPlace = getQualifyingThirdPlace(resolvedGroups);
  const annexThirdGroups = thirdPlace.map((e) => e.groupId);
  const groupStageComplete = isGroupStageComplete(resolvedGroups);
  const annexCKey =
    annexThirdGroups.length === 8
      ? [...annexThirdGroups].sort().join(",")
      : null;

  const winners = new Map<number, Team>();
  const losers = new Map<number, Team>();
  const matches: ResolvedMatch[] = [];

  const rounds: KnockoutRound[] = [
    "R32",
    "R16",
    "QF",
    "SF",
    "THIRD",
    "FINAL",
  ];

  for (const round of rounds) {
    const roundMatches = KNOCKOUT_TEMPLATES.filter((m) => m.round === round);

    for (const template of roundMatches) {
      const homeTeam = resolveSlot(
        template.homeSlot,
        resolvedGroups,
        winners,
        losers,
        annexThirdGroups,
      );
      const awayTeam = resolveSlot(
        template.awaySlot,
        resolvedGroups,
        winners,
        losers,
        annexThirdGroups,
      );

      const prediction = getPrediction(homeTeam, awayTeam, template.venue);
      const liveResult = findKnockoutLiveResult(
        template,
        homeTeam,
        awayTeam,
        liveMatches,
      );

      const status = liveResult?.status ?? "scheduled";
      const homeScore = liveResult?.homeScore ?? null;
      const awayScore = liveResult?.awayScore ?? null;

      matches.push({
        id: template.id,
        round: template.round,
        datetime: template.datetime,
        venue: template.venue,
        homeTeam,
        awayTeam,
        homeSlotLabel: slotLabel(template.homeSlot),
        awaySlotLabel: slotLabel(template.awaySlot),
        status,
        homeScore,
        awayScore,
        prediction,
      });

      if (round === "THIRD") continue;

      if (liveResult?.status === "finished" && liveResult.winner && liveResult.loser) {
        winners.set(template.id, liveResult.winner);
        losers.set(template.id, liveResult.loser);
        continue;
      }

      if (homeTeam && awayTeam && prediction) {
        const winner = pickWinnerFromPrediction(homeTeam, awayTeam, prediction);
        winners.set(template.id, winner);
        losers.set(template.id, winner.id === homeTeam.id ? awayTeam : homeTeam);
      }
    }
  }

  return {
    groups: resolvedGroups,
    matches,
    thirdPlaceQualifiers: thirdPlace.map((e, i) => ({
      team: e.team,
      groupId: e.groupId,
      rank: i + 1,
    })),
    annexCKey,
    annexCProvisional: !groupStageComplete,
  };
}

export function getMatchById(
  state: BracketState,
  id: number,
): ResolvedMatch | undefined {
  return state.matches.find((m) => m.id === id);
}

export function getMatchesByRound(
  state: BracketState,
  round: KnockoutRound,
): ResolvedMatch[] {
  return state.matches.filter((m) => m.round === round);
}

export function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export { TEAMS_BY_ID };
