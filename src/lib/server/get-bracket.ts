import { fetchLiveTournamentData } from "@/lib/api/espn/client";
import { buildGroupsFromSeed } from "@/lib/data/seed-standings";
import { resolveBracket } from "@/lib/engine/bracket-resolver";
import type { BracketResponse } from "@/lib/hooks/use-tournament";

export async function getServerBracket(): Promise<BracketResponse> {
  try {
    const { groups, matches, source, updatedAt } =
      await fetchLiveTournamentData();
    return { ...resolveBracket(groups, matches), source, updatedAt };
  } catch {
    const groups = buildGroupsFromSeed();
    return {
      ...resolveBracket(groups, []),
      source: "seed",
      updatedAt: new Date().toISOString(),
    };
  }
}
