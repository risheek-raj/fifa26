"use client";

import { GroupsGrid } from "@/components/groups/GroupTable";
import { AppNav, LiveBadge } from "@/components/layout/AppNav";
import { flagUrl } from "@/lib/data/teams";
import { useLiveScores, useStandings } from "@/lib/hooks/use-tournament";
import type { StandingsResponse } from "@/lib/hooks/use-tournament";

interface GroupsPageClientProps {
  initialStandings: StandingsResponse;
}

export function GroupsPageClient({ initialStandings }: GroupsPageClientProps) {
  const standingsQuery = useStandings(initialStandings);
  const liveQuery = useLiveScores();

  const data = standingsQuery.data ?? initialStandings;
  const isLoading = standingsQuery.isLoading && !data;

  return (
    <div className="min-h-screen bracket-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-accent font-semibold uppercase tracking-widest">
                CAN · MEX · USA 2026
              </p>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl text-foreground">
                Group Standings
              </h1>
            </div>
            <LiveBadge
              source={data?.source}
              updatedAt={data?.updatedAt}
              hasLive={liveQuery.data?.hasLiveMatches}
            />
          </div>
          <AppNav />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {isLoading && (
          <p className="text-muted text-sm animate-pulse">
            Loading live standings from ESPN…
          </p>
        )}

        {standingsQuery.isError && (
          <p className="text-red-400 text-sm">
            Failed to load standings. Retrying…
          </p>
        )}

        {data && (
          <>
            <div className="rounded-xl border border-border bg-surface p-4">
              <h2 className="font-display font-bold text-sm mb-3">
                Best 3rd Place — Top 8 Qualify
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {data.thirdPlaceQualifiers.map((entry) => (
                  <div
                    key={entry.team.id}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border text-xs ${
                      entry.qualified
                        ? "border-accent/30 bg-accent/5"
                        : "border-border opacity-50"
                    }`}
                  >
                    <span className="text-muted w-4">{entry.rank}</span>
                    <img
                      src={flagUrl(entry.team.iso2)}
                      alt=""
                      className="h-4 w-4 rounded-full"
                      width={16}
                      height={16}
                    />
                    <span className="font-medium">{entry.team.code}</span>
                    <span className="text-muted ml-auto">{entry.points}pt</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted">
                Green rows = top 2 advance · Gold highlight = 3rd place race
              </p>
            </div>

            <GroupsGrid groups={data.groups} />
          </>
        )}
      </main>
    </div>
  );
}
