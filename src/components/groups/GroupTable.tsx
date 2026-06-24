import { flagUrl, TEAMS_BY_ID } from "@/lib/data/teams";
import type { Group, GroupId } from "@/types/tournament";

interface GroupTableProps {
  group: Group;
  highlightThird?: boolean;
}

export function GroupTable({ group, highlightThird }: GroupTableProps) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-background/40">
        <h3 className="font-display font-bold text-sm">
          Group {group.id}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted border-b border-border/50">
              <th className="text-left py-2 px-3 font-medium">#</th>
              <th className="text-left py-2 px-2 font-medium">Team</th>
              <th className="text-center py-2 px-1.5 font-medium">P</th>
              <th className="text-center py-2 px-1.5 font-medium">W</th>
              <th className="text-center py-2 px-1.5 font-medium">D</th>
              <th className="text-center py-2 px-1.5 font-medium">L</th>
              <th className="text-center py-2 px-1.5 font-medium">GF</th>
              <th className="text-center py-2 px-1.5 font-medium">GA</th>
              <th className="text-center py-2 px-1.5 font-medium">GD</th>
              <th className="text-center py-2 px-3 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((row) => {
              const team = TEAMS_BY_ID[row.teamId];
              const qualifiesTop2 = row.position <= 2;
              const isThird = row.position === 3;

              return (
                <tr
                  key={row.teamId}
                  className={`border-b border-border/30 ${
                    qualifiesTop2
                      ? "bg-accent/5"
                      : highlightThird && isThird
                        ? "bg-gold/5"
                        : ""
                  }`}
                >
                  <td className="py-2 px-3 text-muted">{row.position}</td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      {team && (
                        <img
                          src={flagUrl(team.iso2)}
                          alt=""
                          className="h-4 w-4 rounded-full object-cover"
                          width={16}
                          height={16}
                        />
                      )}
                      <span
                        className={`font-medium ${
                          qualifiesTop2 ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {team?.code ?? row.teamId}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-2 px-1.5">{row.played}</td>
                  <td className="text-center py-2 px-1.5">{row.won}</td>
                  <td className="text-center py-2 px-1.5">{row.drawn}</td>
                  <td className="text-center py-2 px-1.5">{row.lost}</td>
                  <td className="text-center py-2 px-1.5">{row.goalsFor}</td>
                  <td className="text-center py-2 px-1.5">
                    {row.goalsAgainst}
                  </td>
                  <td
                    className={`text-center py-2 px-1.5 ${
                      row.goalDifference > 0
                        ? "text-accent"
                        : row.goalDifference < 0
                          ? "text-red-400"
                          : ""
                    }`}
                  >
                    {row.goalDifference > 0
                      ? `+${row.goalDifference}`
                      : row.goalDifference}
                  </td>
                  <td className="text-center py-2 px-3 font-bold">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GroupsGrid({ groups }: { groups: Group[] }) {
  const sorted = [...groups].sort(
    (a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0),
  ) as Group[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((group) => (
        <GroupTable key={group.id} group={group} highlightThird />
      ))}
    </div>
  );
}

export function groupIds(): GroupId[] {
  return "ABCDEFGHIJKL".split("") as GroupId[];
}
