export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export type KnockoutRound = "R32" | "R16" | "QF" | "SF" | "FINAL" | "THIRD";

export interface Team {
  id: string;
  name: string;
  code: string;
  iso2: string;
  fifaRank: number;
  eloRating: number;
  groupId: GroupId;
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  fairPlayScore: number;
  position: number;
}

export interface Group {
  id: GroupId;
  standings: GroupStanding[];
}

export type SlotRef =
  | { type: "position"; group: GroupId; position: 1 | 2 | 3 }
  | { type: "winner"; matchId: number }
  | { type: "loser"; matchId: number }
  | { type: "annex_c_third"; groupWinner: GroupId };

export interface KnockoutMatchTemplate {
  id: number;
  round: KnockoutRound;
  homeSlot: SlotRef;
  awaySlot: SlotRef;
  datetime: string;
  venue: { name: string; city: string; country: string };
}

export interface MatchPrediction {
  homeWinPct: number;
  awayWinPct: number;
  mostLikelyScore: string;
  expectedGoals: { home: number; away: number };
  modelVersion?: string;
}

export interface ResolvedMatch {
  id: number;
  round: KnockoutRound;
  datetime: string;
  venue: { name: string; city: string; country: string };
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeSlotLabel: string;
  awaySlotLabel: string;
  status: "scheduled" | "live" | "finished";
  homeScore?: number | null;
  awayScore?: number | null;
  prediction?: MatchPrediction;
}

export interface BracketState {
  groups: Group[];
  matches: ResolvedMatch[];
  thirdPlaceQualifiers: { team: Team; groupId: GroupId; rank: number }[];
  annexCKey: string | null;
  annexCProvisional?: boolean;
}
