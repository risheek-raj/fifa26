"use client";

import { flagUrl } from "@/lib/data/teams";
import { FLOWCHART } from "@/lib/data/bracket-layout";
import { formatMatchDate } from "@/lib/engine/bracket-resolver";
import type { ResolvedMatch } from "@/types/tournament";

interface FlowchartMatchNodeProps {
  match: ResolvedMatch;
  selected: boolean;
  onSelect: (match: ResolvedMatch) => void;
  align?: "left" | "right" | "center";
}

export function FlowchartMatchNode({
  match,
  selected,
  onSelect,
  align = "left",
}: FlowchartMatchNodeProps) {
  const pred = match.prediction;
  const homeFavored = pred && pred.homeWinPct >= pred.awayWinPct;
  const awayFavored = pred && pred.awayWinPct > pred.homeWinPct;

  const dateStr = formatMatchDate(match.datetime)
    .replace(/,\s*\d{4}/, "")
    .split(",")
    .slice(0, 2)
    .join(",");

  return (
    <button
      type="button"
      onClick={() => onSelect(match)}
      className={`w-full h-full text-left rounded-lg border transition-all duration-200 overflow-hidden flex flex-col ${
        selected
          ? "border-accent shadow-lg shadow-accent/20 ring-1 ring-accent/40 scale-[1.03] z-10"
          : "border-border bg-surface hover:border-accent/50 hover:bg-surface-hover"
      } ${align === "right" ? "text-right" : ""}`}
    >
      <div
        className={`flex items-center justify-between px-2 py-1 bg-background/60 border-b border-border/60 ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        <span className="text-[9px] font-bold text-accent uppercase tracking-wider">
          M{match.id}
          {match.status === "live" && (
            <span className="ml-1 text-red-400 animate-pulse">LIVE</span>
          )}
        </span>
        <span className="text-[9px] text-muted truncate max-w-[100px]">
          {match.status === "finished" && match.homeScore != null
            ? `FT ${match.homeScore}-${match.awayScore}`
            : match.status === "live" && match.homeScore != null
              ? `${match.homeScore}-${match.awayScore}`
              : dateStr}
        </span>
      </div>

      <div className="divide-y divide-border/40 flex-1 flex flex-col justify-center">
        <TeamRow
          team={match.homeTeam}
          placeholder={match.homeSlotLabel}
          winPct={match.status === "scheduled" ? pred?.homeWinPct : undefined}
          score={match.homeScore}
          favored={!!homeFavored && match.status === "scheduled"}
          align={align}
        />
        <TeamRow
          team={match.awayTeam}
          placeholder={match.awaySlotLabel}
          winPct={match.status === "scheduled" ? pred?.awayWinPct : undefined}
          score={match.awayScore}
          favored={!!awayFavored && match.status === "scheduled"}
          align={align}
        />
      </div>

      {pred && (
        <div className="px-2 py-0.5 bg-accent/5 border-t border-border/30">
          <p className="text-[8px] text-muted text-center truncate">
            {pred.mostLikelyScore} · {match.venue.city}
          </p>
        </div>
      )}
    </button>
  );
}

function TeamRow({
  team,
  placeholder,
  winPct,
  score,
  favored,
  align,
}: {
  team: ResolvedMatch["homeTeam"];
  placeholder: string;
  winPct?: number;
  score?: number | null;
  favored: boolean;
  align: "left" | "right" | "center";
}) {
  const reverse = align === "right";

  if (!team) {
    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-1 ${
          reverse ? "flex-row-reverse" : ""
        }`}
      >
        <div className="h-4 w-4 rounded-full bg-border/50 shrink-0" />
        <span className="text-[10px] text-muted font-mono">{placeholder}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 ${
        favored ? "bg-accent/8" : ""
      } ${reverse ? "flex-row-reverse" : ""}`}
    >
      <img
        src={flagUrl(team.iso2)}
        alt=""
        className="h-4 w-4 rounded-full object-cover ring-1 ring-border shrink-0"
        width={16}
        height={16}
      />
      <span
        className={`text-[11px] font-semibold ${
          favored ? "text-accent" : "text-foreground"
        }`}
      >
        {team.code}
      </span>
      {winPct !== undefined && (
        <span
          className={`text-[9px] tabular-nums ml-auto ${
            favored ? "text-accent font-bold" : "text-muted"
          } ${reverse ? "ml-0 mr-auto" : ""}`}
        >
          {winPct}%
        </span>
      )}
      {score != null && (
        <span
          className={`text-[10px] font-bold tabular-nums ml-auto text-foreground ${
            reverse ? "ml-0 mr-auto" : ""
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

interface ChampionsNodeProps {
  match: ResolvedMatch | undefined;
  selected: boolean;
  onSelect: (match: ResolvedMatch) => void;
}

export function ChampionsNode({
  match,
  selected,
  onSelect,
}: ChampionsNodeProps) {
  const winner =
    match?.prediction &&
    match.homeTeam &&
    match.awayTeam &&
    (match.prediction.homeWinPct >= match.prediction.awayWinPct
      ? match.homeTeam
      : match.awayTeam);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        className="rounded-lg border border-gold/40 bg-gold/10 px-4 text-center w-full flex flex-col items-center justify-center"
        style={{ height: FLOWCHART.CHAMPIONS_HEIGHT }}
      >
        <p className="text-[10px] uppercase tracking-widest text-gold font-bold">
          Champions
        </p>
        {winner ? (
          <div className="flex items-center justify-center gap-2 mt-1">
            <img
              src={flagUrl(winner.iso2)}
              alt=""
              className="h-6 w-6 rounded-full"
              width={24}
              height={24}
            />
            <span className="font-display font-bold text-gold">{winner.code}</span>
          </div>
        ) : (
          <p className="text-xs text-muted mt-1">TBD</p>
        )}
      </div>

      {match && (
        <div
          className="w-full"
          style={{ height: FLOWCHART.NODE_HEIGHT }}
        >
          <FlowchartMatchNode
            match={match}
            selected={selected}
            onSelect={onSelect}
            align="center"
          />
        </div>
      )}
    </div>
  );
}
