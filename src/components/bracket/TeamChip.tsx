import { flagUrl } from "@/lib/data/teams";
import type { Team } from "@/types/tournament";

interface TeamChipProps {
  team: Team | null;
  winPct?: number;
  placeholder?: string;
  favored?: boolean;
}

export function TeamChip({
  team,
  winPct,
  placeholder,
  favored,
}: TeamChipProps) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 text-muted">
        <div className="h-5 w-5 rounded-full bg-border/60" />
        <span className="text-xs font-medium">{placeholder ?? "TBD"}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
        favored ? "bg-accent/10" : ""
      }`}
    >
      <img
        src={flagUrl(team.iso2)}
        alt={team.name}
        className="h-5 w-5 rounded-full object-cover ring-1 ring-border"
        width={20}
        height={20}
      />
      <span
        className={`text-xs font-medium truncate max-w-[120px] ${
          favored ? "text-accent" : "text-foreground"
        }`}
      >
        {team.code}
      </span>
      {winPct !== undefined && (
        <span
          className={`ml-auto text-xs tabular-nums ${
            favored ? "text-accent font-semibold" : "text-muted"
          }`}
        >
          {winPct}%
        </span>
      )}
    </div>
  );
}

export function TeamChipFull({ team }: { team: Team | null }) {
  if (!team) return null;
  return (
    <div className="flex items-center gap-3">
      <img
        src={flagUrl(team.iso2)}
        alt={team.name}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
        width={32}
        height={32}
      />
      <div>
        <p className="font-display font-bold text-foreground">{team.name}</p>
        <p className="text-xs text-muted">
          FIFA #{team.fifaRank} · Elo {team.eloRating}
        </p>
      </div>
    </div>
  );
}
