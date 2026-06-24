"use client";

import { ROUND_LABELS } from "@/lib/data/knockout-matches";
import type { ResolvedMatch } from "@/types/tournament";
import { TeamChip } from "./TeamChip";

interface MatchCardProps {
  match: ResolvedMatch;
  selected: boolean;
  onSelect: (match: ResolvedMatch) => void;
}

export function MatchCard({ match, selected, onSelect }: MatchCardProps) {
  const pred = match.prediction;
  const homeFavored =
    pred && pred.homeWinPct >= pred.awayWinPct && match.homeTeam;
  const awayFavored =
    pred && pred.awayWinPct > pred.homeWinPct && match.awayTeam;

  return (
    <button
      type="button"
      onClick={() => onSelect(match)}
      className={`w-[200px] shrink-0 rounded-lg border text-left transition-all duration-200 ${
        selected
          ? "border-accent bg-surface-hover shadow-lg shadow-accent/10 scale-[1.02]"
          : "border-border bg-surface hover:border-accent/40 hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border bg-background/40 rounded-t-lg">
        <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
          M{match.id}
        </span>
        <span className="text-[10px] text-muted">
          {ROUND_LABELS[match.round]}
        </span>
      </div>
      <div className="divide-y divide-border/50 p-1">
        <TeamChip
          team={match.homeTeam}
          winPct={pred?.homeWinPct}
          placeholder={match.homeSlotLabel}
          favored={!!homeFavored}
        />
        <TeamChip
          team={match.awayTeam}
          winPct={pred?.awayWinPct}
          placeholder={match.awaySlotLabel}
          favored={!!awayFavored}
        />
      </div>
      {pred && (
        <div className="px-2.5 py-1 border-t border-border/50">
          <p className="text-[10px] text-muted text-center">
            Likely: {pred.mostLikelyScore}
          </p>
        </div>
      )}
    </button>
  );
}
