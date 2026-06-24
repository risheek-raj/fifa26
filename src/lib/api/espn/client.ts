import { cachedFetch } from "@/lib/api/cache";
import {
  CACHE_TTL,
  ESPN_SCOREBOARD_URL,
  ESPN_STANDINGS_URL,
  espnCodeToTeamId,
  FETCH_HEADERS,
  parseGroupId,
} from "@/lib/api/espn/constants";
import { buildGroupsFromSeed } from "@/lib/data/seed-standings";
import { sortStandings } from "@/lib/engine/standings";
import type { Group, GroupStanding } from "@/types/tournament";

interface EspnStat {
  name: string;
  value: number;
}

interface EspnStandingEntry {
  team: { abbreviation: string; displayName: string };
  stats: EspnStat[];
  note?: { description?: string; rank?: number };
}

interface EspnGroup {
  name: string;
  standings: { entries: EspnStandingEntry[] };
}

interface EspnStandingsResponse {
  children?: EspnGroup[];
}

interface EspnCompetitor {
  team: { abbreviation: string; displayName: string };
  score: string;
  homeAway: string;
  winner?: boolean;
}

interface EspnScoreboardEvent {
  id: string;
  name: string;
  date: string;
  status: { type: { state: string; description: string; detail?: string } };
  competitions: {
    id: string;
    status: { type: { state: string; description: string; detail?: string } };
    venue?: { fullName?: string; address?: { city?: string } };
    competitors: EspnCompetitor[];
  }[];
}

interface EspnScoreboardResponse {
  events?: EspnScoreboardEvent[];
}

export interface LiveMatch {
  id: string;
  name: string;
  date: string;
  status: "scheduled" | "live" | "finished";
  statusDetail: string;
  homeTeam: { code: string; name: string; score: number };
  awayTeam: { code: string; name: string; score: number };
  venue?: string;
}

export interface LiveDataResult {
  groups: Group[];
  matches: LiveMatch[];
  source: "espn" | "seed";
  updatedAt: string;
  hasLiveMatches: boolean;
}

function statsMap(stats: EspnStat[]): Record<string, number> {
  return Object.fromEntries(stats.map((s) => [s.name, s.value ?? 0]));
}

function entryToStanding(entry: EspnStandingEntry): GroupStanding | null {
  const teamId = espnCodeToTeamId(entry.team.abbreviation);
  if (!teamId) return null;

  const s = statsMap(entry.stats);
  const gf = s.pointsFor ?? 0;
  const ga = s.pointsAgainst ?? 0;

  return {
    teamId,
    played: s.gamesPlayed ?? 0,
    won: s.wins ?? 0,
    drawn: s.ties ?? 0,
    lost: s.losses ?? 0,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDifference: s.pointDifferential ?? gf - ga,
    points: s.points ?? 0,
    fairPlayScore: 0,
    position: s.rank ?? 0,
  };
}

function parseMatchStatus(state: string): LiveMatch["status"] {
  if (state === "in") return "live";
  if (state === "post") return "finished";
  return "scheduled";
}

async function fetchEspnJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: FETCH_HEADERS,
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`ESPN ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

export async function fetchEspnStandings(): Promise<Group[]> {
  const data = await cachedFetch("espn:standings", CACHE_TTL.standings, () =>
    fetchEspnJson<EspnStandingsResponse>(ESPN_STANDINGS_URL),
  );

  const groups: Group[] = [];

  for (const child of data.children ?? []) {
    const groupId = parseGroupId(child.name);
    if (!groupId) continue;

    const standings = child.standings.entries
      .map(entryToStanding)
      .filter((s): s is GroupStanding => s !== null);

    const sorted = sortStandings(standings).map((s, i) => ({
      ...s,
      position: i + 1,
    }));

    groups.push({ id: groupId, standings: sorted });
  }

  if (groups.length !== 12) {
    throw new Error(`Expected 12 groups, got ${groups.length}`);
  }

  return groups.sort(
    (a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0),
  );
}

export async function fetchEspnScoreboard(
  preferLiveCache = false,
): Promise<LiveMatch[]> {
  const ttl = preferLiveCache ? CACHE_TTL.scoreboardLive : CACHE_TTL.scoreboard;
  const data = await cachedFetch(
    preferLiveCache ? "espn:scoreboard:live" : "espn:scoreboard",
    ttl,
    () =>
      fetchEspnJson<EspnScoreboardResponse>(
        `${ESPN_SCOREBOARD_URL}?limit=100`,
      ),
  );

  return (data.events ?? []).map((event) => {
    const comp = event.competitions[0];
    const home =
      comp.competitors.find((c) => c.homeAway === "home") ??
      comp.competitors[0];
    const away =
      comp.competitors.find((c) => c.homeAway === "away") ??
      comp.competitors[1];
    const state = comp.status?.type?.state ?? event.status?.type?.state ?? "pre";

    return {
      id: event.id,
      name: event.name,
      date: event.date,
      status: parseMatchStatus(state),
      statusDetail:
        comp.status?.type?.description ??
        event.status?.type?.description ??
        "",
      homeTeam: {
        code: home.team.abbreviation,
        name: home.team.displayName,
        score: parseInt(home.score, 10) || 0,
      },
      awayTeam: {
        code: away.team.abbreviation,
        name: away.team.displayName,
        score: parseInt(away.score, 10) || 0,
      },
      venue: comp.venue?.fullName,
    };
  });
}

export async function fetchLiveTournamentData(): Promise<LiveDataResult> {
  try {
    const groups = await fetchEspnStandings();
    let matches = await fetchEspnScoreboard(false);
    const hasLiveMatches = matches.some((m) => m.status === "live");

    if (hasLiveMatches) {
      matches = await fetchEspnScoreboard(true);
    }

    return {
      groups,
      matches,
      source: "espn",
      updatedAt: new Date().toISOString(),
      hasLiveMatches,
    };
  } catch (err) {
    console.error("[espn] fetch failed, using seed data:", err);
    return {
      groups: buildGroupsFromSeed(),
      matches: [],
      source: "seed",
      updatedAt: new Date().toISOString(),
      hasLiveMatches: false,
    };
  }
}

export async function fetchLiveGroups(): Promise<{
  groups: Group[];
  source: "espn" | "seed";
  updatedAt: string;
}> {
  const data = await fetchLiveTournamentData();
  return {
    groups: data.groups,
    source: data.source,
    updatedAt: data.updatedAt,
  };
}
