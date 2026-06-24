"use client";

import type { LiveMatch } from "@/lib/api/espn/client";

export function LiveScoresBar({ matches }: { matches: LiveMatch[] }) {
  const relevant = matches.filter(
    (m) => m.status === "live" || m.status === "finished",
  );

  if (relevant.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-background/40 flex items-center justify-between">
        <h2 className="font-display font-bold text-sm">Live Scores</h2>
        <span className="text-[10px] text-muted uppercase tracking-wider">
          via ESPN
        </span>
      </div>
      <div className="bracket-scroll overflow-x-auto">
        <div className="flex gap-2 p-3 min-w-max">
          {relevant.map((match) => (
            <LiveMatchChip key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveMatchChip({ match }: { match: LiveMatch }) {
  const isLive = match.status === "live";

  return (
    <div
      className={`shrink-0 rounded-lg border px-3 py-2 min-w-[180px] ${
        isLive
          ? "border-red-500/40 bg-red-500/5"
          : "border-border bg-background/30"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`text-[10px] font-semibold uppercase ${
            isLive ? "text-red-400" : "text-muted"
          }`}
        >
          {isLive ? "● Live" : match.statusDetail}
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <ScoreRow
          code={match.homeTeam.code}
          score={match.homeTeam.score}
          leading={match.homeTeam.score > match.awayTeam.score}
        />
        <ScoreRow
          code={match.awayTeam.code}
          score={match.awayTeam.score}
          leading={match.awayTeam.score > match.homeTeam.score}
        />
      </div>
    </div>
  );
}

function ScoreRow({
  code,
  score,
  leading,
}: {
  code: string;
  score: number;
  leading: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={leading ? "font-bold text-foreground" : "text-muted"}>
        {code}
      </span>
      <span className={leading ? "font-bold text-accent" : "text-muted"}>
        {score}
      </span>
    </div>
  );
}
