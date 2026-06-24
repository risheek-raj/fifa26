import { flagUrl } from "@/lib/data/teams";
import type { BracketState } from "@/types/tournament";

export function ThirdPlaceTracker({ state }: { state: BracketState }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-display font-bold text-sm text-foreground mb-3">
        Best 3rd Place — Top 8 Qualify
        {state.annexCProvisional && (
          <span className="ml-2 text-[10px] font-normal text-gold uppercase tracking-wide">
            Provisional
          </span>
        )}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {state.thirdPlaceQualifiers.map((entry) => (
          <div
            key={entry.team.id}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border ${
              entry.rank <= 8
                ? "border-accent/30 bg-accent/5"
                : "border-border bg-background/30 opacity-50"
            }`}
          >
            <span className="text-xs text-muted w-4">{entry.rank}</span>
            <img
              src={flagUrl(entry.team.iso2)}
              alt={entry.team.name}
              className="h-4 w-4 rounded-full object-cover"
              width={16}
              height={16}
            />
            <span className="text-xs font-medium truncate">
              {entry.team.code}
            </span>
            <span className="text-[10px] text-muted ml-auto">
              Grp {entry.groupId}
            </span>
          </div>
        ))}
      </div>
      {state.annexCKey && (
        <p className="mt-3 text-[10px] text-muted font-mono">
          Annex C key: {state.annexCKey}
        </p>
      )}
    </div>
  );
}
