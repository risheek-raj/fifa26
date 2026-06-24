import type { Group, GroupId } from "@/types/tournament";

/** Projected final group standings (Jun 24 snapshot → R32 projection) */
export const SEED_STANDINGS: Record<
  GroupId,
  { teamId: string; pts: number; gd: number; gf: number; fairPlay: number }[]
> = {
  A: [
    { teamId: "mex", pts: 9, gd: 4, gf: 4, fairPlay: 0 },
    { teamId: "kor", pts: 6, gd: 1, gf: 3, fairPlay: -1 },
    { teamId: "cze", pts: 1, gd: -1, gf: 2, fairPlay: -2 },
    { teamId: "rsa", pts: 1, gd: -4, gf: 1, fairPlay: -3 },
  ],
  B: [
    { teamId: "sui", pts: 7, gd: 2, gf: 6, fairPlay: 0 },
    { teamId: "can", pts: 4, gd: 4, gf: 8, fairPlay: -1 },
    { teamId: "bih", pts: 4, gd: -1, gf: 3, fairPlay: -2 },
    { teamId: "qat", pts: 1, gd: -5, gf: 1, fairPlay: -4 },
  ],
  C: [
    { teamId: "bra", pts: 7, gd: 3, gf: 5, fairPlay: 0 },
    { teamId: "mar", pts: 6, gd: 2, gf: 4, fairPlay: -1 },
    { teamId: "sco", pts: 3, gd: 0, gf: 2, fairPlay: -2 },
    { teamId: "hai", pts: 0, gd: -5, gf: 0, fairPlay: -5 },
  ],
  D: [
    { teamId: "usa", pts: 9, gd: 5, gf: 6, fairPlay: 0 },
    { teamId: "aus", pts: 6, gd: 0, gf: 3, fairPlay: -1 },
    { teamId: "par", pts: 3, gd: -2, gf: 2, fairPlay: -2 },
    { teamId: "tur", pts: 0, gd: -3, gf: 0, fairPlay: -4 },
  ],
  E: [
    { teamId: "ger", pts: 9, gd: 6, gf: 7, fairPlay: 0 },
    { teamId: "civ", pts: 4, gd: 0, gf: 3, fairPlay: -1 },
    { teamId: "ecu", pts: 1, gd: -1, gf: 1, fairPlay: -3 },
    { teamId: "cuw", pts: 1, gd: -5, gf: 1, fairPlay: -5 },
  ],
  F: [
    { teamId: "ned", pts: 7, gd: 3, gf: 5, fairPlay: 0 },
    { teamId: "jpn", pts: 6, gd: 2, gf: 4, fairPlay: -1 },
    { teamId: "swe", pts: 3, gd: 0, gf: 2, fairPlay: -2 },
    { teamId: "tun", pts: 1, gd: -5, gf: 1, fairPlay: -4 },
  ],
  G: [
    { teamId: "egy", pts: 7, gd: 2, gf: 5, fairPlay: 0 },
    { teamId: "bel", pts: 4, gd: 1, gf: 3, fairPlay: -1 },
    { teamId: "irn", pts: 2, gd: 0, gf: 2, fairPlay: -2 },
    { teamId: "nzl", pts: 0, gd: -3, gf: 1, fairPlay: -4 },
  ],
  H: [
    { teamId: "esp", pts: 7, gd: 4, gf: 5, fairPlay: 0 },
    { teamId: "cpv", pts: 4, gd: 0, gf: 2, fairPlay: -1 },
    { teamId: "uru", pts: 2, gd: 0, gf: 2, fairPlay: -2 },
    { teamId: "ksa", pts: 1, gd: -4, gf: 1, fairPlay: -5 },
  ],
  I: [
    { teamId: "fra", pts: 9, gd: 5, gf: 6, fairPlay: 0 },
    { teamId: "nor", pts: 6, gd: 2, gf: 4, fairPlay: -1 },
    { teamId: "sen", pts: 0, gd: -3, gf: 0, fairPlay: -4 },
    { teamId: "irq", pts: 0, gd: -4, gf: 1, fairPlay: -5 },
  ],
  J: [
    { teamId: "arg", pts: 9, gd: 6, gf: 7, fairPlay: 0 },
    { teamId: "aut", pts: 4, gd: 0, gf: 2, fairPlay: -1 },
    { teamId: "alg", pts: 3, gd: -2, gf: 2, fairPlay: -3 },
    { teamId: "jor", pts: 1, gd: -4, gf: 1, fairPlay: -5 },
  ],
  K: [
    { teamId: "col", pts: 6, gd: 2, gf: 3, fairPlay: 0 },
    { teamId: "por", pts: 4, gd: 1, gf: 3, fairPlay: -1 },
    { teamId: "cod", pts: 1, gd: -1, gf: 1, fairPlay: -3 },
    { teamId: "uzb", pts: 0, gd: -2, gf: 0, fairPlay: -4 },
  ],
  L: [
    { teamId: "eng", pts: 7, gd: 2, gf: 5, fairPlay: 0 },
    { teamId: "gha", pts: 4, gd: 0, gf: 3, fairPlay: -1 },
    { teamId: "cro", pts: 3, gd: -1, gf: 2, fairPlay: -2 },
    { teamId: "pan", pts: 0, gd: -1, gf: 0, fairPlay: -5 },
  ],
};

function ptsToRecord(pts: number): { won: number; drawn: number; lost: number } {
  const won = Math.floor(pts / 3);
  const drawn = pts % 3;
  return { won, drawn, lost: 3 - won - drawn };
}

export function buildGroupsFromSeed(): Group[] {
  const groupIds = Object.keys(SEED_STANDINGS) as GroupId[];
  return groupIds.map((id) => ({
    id,
    standings: SEED_STANDINGS[id].map((row, index) => {
      const { won, drawn, lost } = ptsToRecord(row.pts);
      return {
        teamId: row.teamId,
        played: 3,
        won,
        drawn,
        lost,
        goalsFor: row.gf,
        goalsAgainst: row.gf - row.gd,
        goalDifference: row.gd,
        points: row.pts,
        fairPlayScore: row.fairPlay,
        position: index + 1,
      };
    }),
  }));
}
