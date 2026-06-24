import type { MatchPrediction, Team } from "@/types/tournament";

export const MODEL_VERSION = "poisson-v1";

const HOST_TEAM_IDS = new Set(["mex", "can", "usa"]);
const HOME_ADVANTAGE_ELO = 65;
const BASE_XG = 1.35;
const MAX_GOALS = 6;

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function poisson(lambda: number, k: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

function hostBoost(home: Team, venueCountry: string): number {
  if (HOST_TEAM_IDS.has(home.id)) return HOME_ADVANTAGE_ELO;
  const country = venueCountry.toUpperCase();
  if (country === "USA" && home.id === "usa") return HOME_ADVANTAGE_ELO;
  if (country === "CANADA" && home.id === "can") return HOME_ADVANTAGE_ELO;
  if (country === "MEXICO" && home.id === "mex") return HOME_ADVANTAGE_ELO;
  return 0;
}

function expectedGoals(attackerElo: number, defenderElo: number, boost: number): number {
  const diff = attackerElo - defenderElo + boost;
  return Math.max(0.35, BASE_XG * Math.pow(10, diff / 400));
}

/** Extra-time lambda scale (30 min vs 90 min) */
function extraTimeWinProb(homeLambda: number, awayLambda: number): number {
  const hEt = homeLambda * 0.33;
  const aEt = awayLambda * 0.33;
  let homeWin = 0;
  let awayWin = 0;
  let draw = 0;

  for (let h = 0; h <= 4; h++) {
    for (let a = 0; a <= 4; a++) {
      const p = poisson(hEt, h) * poisson(aEt, a);
      if (h > a) homeWin += p;
      else if (a > h) awayWin += p;
      else draw += p;
    }
  }

  const decided = homeWin + awayWin;
  if (decided === 0) return 0.5;
  return homeWin / decided + draw * 0.5 * (homeWin / decided);
}

export function predictMatch(
  home: Team,
  away: Team,
  venue?: { country: string },
): MatchPrediction {
  const boost = hostBoost(home, venue?.country ?? "");
  const homeLambda = expectedGoals(home.eloRating, away.eloRating, boost);
  const awayLambda = expectedGoals(away.eloRating, home.eloRating, -boost);

  let homeRegWin = 0;
  let awayRegWin = 0;
  let draw = 0;
  let maxProb = 0;
  let mostLikelyScore = "0-0";

  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = poisson(homeLambda, h) * poisson(awayLambda, a);
      if (p > maxProb) {
        maxProb = p;
        mostLikelyScore = `${h}-${a}`;
      }
      if (h > a) homeRegWin += p;
      else if (a > h) awayRegWin += p;
      else draw += p;
    }
  }

  const homeEtShare = extraTimeWinProb(homeLambda, awayLambda);
  const homeKnockout = homeRegWin + draw * homeEtShare;
  const awayKnockout = awayRegWin + draw * (1 - homeEtShare);
  const total = homeKnockout + awayKnockout;

  return {
    homeWinPct: Math.round((homeKnockout / total) * 100),
    awayWinPct: Math.round((awayKnockout / total) * 100),
    mostLikelyScore,
    expectedGoals: {
      home: +homeLambda.toFixed(1),
      away: +awayLambda.toFixed(1),
    },
    modelVersion: MODEL_VERSION,
  };
}
