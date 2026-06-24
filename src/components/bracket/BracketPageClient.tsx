"use client";

import { useState } from "react";
import { BracketFlowchart } from "@/components/bracket/BracketFlowchart";
import { LiveScoresBar } from "@/components/bracket/LiveScoresBar";
import { ROUND_LABELS } from "@/lib/data/knockout-matches";
import { AppNav, LiveBadge } from "@/components/layout/AppNav";
import { useBracket, useLiveScores } from "@/lib/hooks/use-tournament";
import type { BracketResponse } from "@/lib/hooks/use-tournament";
import type { KnockoutRound, ResolvedMatch } from "@/types/tournament";
import { MatchCard } from "./MatchCard";
import { MatchDetailPanel } from "./MatchDetailPanel";
import { ThirdPlaceTracker } from "./ThirdPlaceTracker";

const DISPLAY_ROUNDS: KnockoutRound[] = [
  "R32",
  "R16",
  "QF",
  "SF",
  "FINAL",
];

type ViewMode = "flowchart" | "list";

interface BracketPageClientProps {
  initialBracket: BracketResponse;
}

export function BracketPageClient({ initialBracket }: BracketPageClientProps) {
  const bracketQuery = useBracket(initialBracket);
  const liveQuery = useLiveScores();
  const [selectedMatch, setSelectedMatch] = useState<ResolvedMatch | null>(
    null,
  );
  const [activeRound, setActiveRound] = useState<KnockoutRound>("R32");
  const [viewMode, setViewMode] = useState<ViewMode>("flowchart");

  const state = bracketQuery.data ?? initialBracket;
  const isLoading = bracketQuery.isLoading && !state;

  const roundMatches =
    state?.matches.filter((m) => m.round === activeRound) ?? [];
  const thirdPlaceMatch = state?.matches.find((m) => m.round === "THIRD");

  return (
    <div className="min-h-screen bracket-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-accent font-semibold uppercase tracking-widest">
                CAN · MEX · USA 2026
              </p>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl text-foreground">
                Knockout Predictor
              </h1>
            </div>
            <LiveBadge
              source={state?.source}
              updatedAt={state?.updatedAt}
              hasLive={liveQuery.data?.hasLiveMatches}
            />
          </div>
          <AppNav />

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("flowchart")}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === "flowchart"
                    ? "bg-accent text-background"
                    : "text-muted hover:text-foreground bg-surface"
                }`}
              >
                Flowchart
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-accent text-background"
                    : "text-muted hover:text-foreground bg-surface"
                }`}
              >
                By Round
              </button>
            </div>

            {viewMode === "list" && (
              <nav className="flex gap-1 overflow-x-auto pb-1">
                {DISPLAY_ROUNDS.map((round) => (
                  <button
                    key={round}
                    type="button"
                    onClick={() => setActiveRound(round)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeRound === round
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {ROUND_LABELS[round]}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {isLoading && (
          <p className="text-muted text-sm animate-pulse">
            Loading live bracket from ESPN…
          </p>
        )}

        {bracketQuery.isError && (
          <p className="text-red-400 text-sm">
            Failed to load bracket. Retrying…
          </p>
        )}

        {liveQuery.data && liveQuery.data.matches.length > 0 && (
          <LiveScoresBar matches={liveQuery.data.matches} />
        )}

        {state && (
          <>
            {viewMode === "flowchart" ? (
              <>
                <BracketFlowchart
                  matches={state.matches}
                  selectedId={selectedMatch?.id ?? null}
                  onSelect={setSelectedMatch}
                />
                <ThirdPlaceTracker state={state} />
              </>
            ) : (
              <>
                <section>
                  <h2 className="font-display font-bold text-lg mb-4 text-foreground">
                    {ROUND_LABELS[activeRound]}
                    <span className="text-muted font-normal text-sm ml-2">
                      {roundMatches.length} matches
                    </span>
                  </h2>

                  <div className="bracket-scroll overflow-x-auto pb-4">
                    <div className="flex gap-3 min-w-max">
                      {roundMatches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          selected={selectedMatch?.id === match.id}
                          onSelect={setSelectedMatch}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {activeRound === "FINAL" && thirdPlaceMatch && (
                  <section>
                    <h2 className="font-display font-bold text-lg mb-4 text-foreground">
                      {ROUND_LABELS.THIRD}
                    </h2>
                    <div className="flex gap-3">
                      <MatchCard
                        match={thirdPlaceMatch}
                        selected={selectedMatch?.id === thirdPlaceMatch.id}
                        onSelect={setSelectedMatch}
                      />
                    </div>
                  </section>
                )}

                <ThirdPlaceTracker state={state} />
              </>
            )}
          </>
        )}
      </main>

      <MatchDetailPanel
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
}
