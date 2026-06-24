"use client";

import { ROUND_LABELS } from "@/lib/data/knockout-matches";
import { formatMatchDate } from "@/lib/engine/bracket-resolver";
import type { ResolvedMatch } from "@/types/tournament";
import { TeamChipFull } from "./TeamChip";

interface MatchDetailPanelProps {
  match: ResolvedMatch | null;
  onClose: () => void;
}

export function MatchDetailPanel({ match, onClose }: MatchDetailPanelProps) {
  if (!match) return null;

  const pred = match.prediction;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-surface border-l border-border overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-surface border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-accent font-semibold uppercase tracking-wider">
              Match {match.id} · {ROUND_LABELS[match.round]}
            </p>
            <p className="font-display font-bold text-lg text-foreground mt-0.5">
              Knockout Preview
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-accent transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="rounded-xl border border-border bg-background/50 p-4 space-y-4">
            <TeamChipFull team={match.homeTeam} />
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted font-semibold">VS</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <TeamChipFull team={match.awayTeam} />
          </div>

          {match.status !== "scheduled" && match.homeScore != null && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                {match.status === "live" ? "Live Score" : "Final Score"}
              </p>
              <p className="font-display font-bold text-2xl text-foreground">
                {match.homeScore} – {match.awayScore}
              </p>
            </div>
          )}

          {pred && match.status === "scheduled" && (
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <h3 className="font-display font-bold text-sm text-foreground mb-3">
                Prediction
              </h3>
              <div className="space-y-3">
                <WinBar
                  label={match.homeTeam?.code ?? match.homeSlotLabel}
                  pct={pred.homeWinPct}
                  favored={pred.homeWinPct >= pred.awayWinPct}
                />
                <WinBar
                  label={match.awayTeam?.code ?? match.awaySlotLabel}
                  pct={pred.awayWinPct}
                  favored={pred.awayWinPct > pred.homeWinPct}
                />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted text-xs">Most likely score</dt>
                  <dd className="font-display font-bold text-accent">
                    {pred.mostLikelyScore}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Expected goals</dt>
                  <dd className="font-display font-bold">
                    {pred.expectedGoals.home} – {pred.expectedGoals.away}
                  </dd>
                </div>
                {pred.modelVersion && (
                  <div className="col-span-2">
                    <dt className="text-muted text-xs">Model</dt>
                    <dd className="font-mono text-xs text-muted">
                      {pred.modelVersion}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="rounded-xl border border-border bg-background/50 p-4">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">
              Match Info
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Date</dt>
                <dd>{formatMatchDate(match.datetime)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Venue</dt>
                <dd className="text-right">{match.venue.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">City</dt>
                <dd>
                  {match.venue.city}, {match.venue.country}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Home slot</dt>
                <dd className="font-mono text-xs">{match.homeSlotLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Away slot</dt>
                <dd className="font-mono text-xs">{match.awaySlotLabel}</dd>
              </div>
            </dl>
          </div>
        </div>
      </aside>
    </>
  );
}

function WinBar({
  label,
  pct,
  favored,
}: {
  label: string;
  pct: number;
  favored: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={favored ? "text-accent font-semibold" : "text-muted"}>
          {label}
        </span>
        <span className={favored ? "text-accent font-bold" : "text-muted"}>
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            favored ? "bg-accent" : "bg-muted/50"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
