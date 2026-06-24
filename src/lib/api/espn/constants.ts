import { TEAMS_BY_ID } from "@/lib/data/teams";
import type { GroupId } from "@/types/tournament";

/** Map ESPN 3-letter codes to internal team IDs */
const ESPN_ALIASES: Record<string, string> = {
  BIH: "bih",
  CPV: "cpv",
  CIV: "civ",
  COD: "cod",
  CUW: "cuw",
  KSA: "ksa",
};

export function espnCodeToTeamId(abbreviation: string): string | null {
  const code = abbreviation.toUpperCase();
  const alias = ESPN_ALIASES[code];
  if (alias) return alias;
  const id = code.toLowerCase();
  return TEAMS_BY_ID[id] ? id : null;
}

export function parseGroupId(name: string): GroupId | null {
  const match = name.match(/Group\s+([A-L])/i);
  return match ? (match[1].toUpperCase() as GroupId) : null;
}

export const ESPN_BASE = "https://site.api.espn.com/apis";
export const ESPN_STANDINGS_URL = `${ESPN_BASE}/v2/sports/soccer/fifa.world/standings`;
export const ESPN_SCOREBOARD_URL = `${ESPN_BASE}/site/v2/sports/soccer/fifa.world/scoreboard`;

export const FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent": "FIFA26-Knockout-Predictor/1.0",
} as const;

export const CACHE_TTL = {
  standings: 60_000,
  scoreboard: 30_000,
  scoreboardLive: 15_000,
} as const;
