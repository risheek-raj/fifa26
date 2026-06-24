"use client";

import {
  BRACKET_EDGES,
  buildAllNodeRects,
  FINAL_ID,
  FLOWCHART,
  getCenterColumnX,
  getColumnLabelX,
  getFinalBlockTop,
  getNodeY,
  getTotalWidth,
  LEFT_COLUMNS,
  RIGHT_COLUMNS,
  THIRD_ID,
  totalBracketHeight,
  type ColumnDef,
  type NodeRect,
} from "@/lib/data/bracket-layout";
import type { ResolvedMatch } from "@/types/tournament";
import {
  ChampionsNode,
  FlowchartMatchNode,
} from "./FlowchartMatchNode";

interface BracketFlowchartProps {
  matches: ResolvedMatch[];
  selectedId: number | null;
  onSelect: (match: ResolvedMatch) => void;
}

export function BracketFlowchart({
  matches,
  selectedId,
  onSelect,
}: BracketFlowchartProps) {
  const byId = new Map(matches.map((m) => [m.id, m]));
  const finalMatch = byId.get(FINAL_ID);
  const thirdMatch = byId.get(THIRD_ID);

  const rects = buildAllNodeRects();
  const posMap = new Map(rects.map((r) => [r.id, r]));
  const totalW = getTotalWidth();
  const totalH = totalBracketHeight();

  return (
    <div className="rounded-xl border border-border bracket-flowchart-bg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-display font-bold text-sm text-foreground">
          Knockout Bracket
        </h2>
        <p className="text-[10px] text-muted">
          Click any match for predictions · scroll horizontally on mobile
        </p>
      </div>

      <div className="bracket-scroll overflow-x-auto overflow-y-hidden p-4 pt-6">
        <div
          className="relative mx-auto"
          style={{ width: totalW, height: totalH, minWidth: totalW }}
        >
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            width={totalW}
            height={totalH}
            aria-hidden
          >
            {BRACKET_EDGES.map(([from, to]) => {
              const a = posMap.get(from);
              const b = posMap.get(to);
              if (!a || !b) return null;
              return (
                <BracketConnector key={`${from}-${to}`} from={a} to={b} />
              );
            })}
          </svg>

          {/* Round labels */}
          {LEFT_COLUMNS.map((col, colIdx) => (
            <RoundLabel
              key={`lbl-l-${col.round}`}
              x={getColumnLabelX("left", colIdx)}
              label={col.round}
            />
          ))}
          {RIGHT_COLUMNS.map((col, colIdx) => (
            <RoundLabel
              key={`lbl-r-${col.round}`}
              x={getColumnLabelX("right", colIdx)}
              label={col.round}
            />
          ))}

          {/* Left columns */}
          {LEFT_COLUMNS.map((col, colIdx) =>
            renderColumn(
              col,
              getColumnLabelX("left", colIdx),
              byId,
              selectedId,
              onSelect,
              "left",
            ),
          )}

          {/* Center — Champions + Final + 3rd */}
          <div
            className="absolute flex flex-col items-center"
            style={{
              left: getCenterColumnX(),
              top: getFinalBlockTop(),
              width: FLOWCHART.NODE_WIDTH,
            }}
          >
            <ChampionsNode
              match={finalMatch}
              selected={selectedId === FINAL_ID}
              onSelect={onSelect}
            />
            {thirdMatch && (
              <div className="mt-6 w-full">
                <p className="text-[9px] uppercase tracking-wider text-muted text-center mb-1">
                  3rd Place
                </p>
                <FlowchartMatchNode
                  match={thirdMatch}
                  selected={selectedId === THIRD_ID}
                  onSelect={onSelect}
                  align="center"
                />
              </div>
            )}
          </div>

          {/* Right columns */}
          {RIGHT_COLUMNS.map((col, colIdx) =>
            renderColumn(
              col,
              getColumnLabelX("right", colIdx),
              byId,
              selectedId,
              onSelect,
              "right",
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function RoundLabel({ x, label }: { x: number; label: string }) {
  const labels: Record<string, string> = {
    R32: "Round of 32",
    R16: "Round of 16",
    QF: "Quarter-finals",
    SF: "Semi-finals",
  };
  return (
    <div
      className="absolute text-[9px] uppercase tracking-widest text-muted font-semibold text-center"
      style={{ left: x, top: 0, width: FLOWCHART.NODE_WIDTH }}
    >
      {labels[label] ?? label}
    </div>
  );
}

function renderColumn(
  col: ColumnDef,
  x: number,
  byId: Map<number, ResolvedMatch>,
  selectedId: number | null,
  onSelect: (m: ResolvedMatch) => void,
  side: "left" | "right",
) {
  return (
    <div key={`${side}-${col.round}`} className="absolute" style={{ left: x }}>
      {col.matchIds.map((id, matchIdx) => {
        const match = byId.get(id);
        if (!match) return null;
        const y = getNodeY(col.roundIndex, matchIdx);
        return (
          <div
            key={id}
            className="absolute"
            style={{
              top: y,
              width: FLOWCHART.NODE_WIDTH,
              height: FLOWCHART.NODE_HEIGHT,
            }}
          >
            <FlowchartMatchNode
              match={match}
              selected={selectedId === id}
              onSelect={onSelect}
              align={side === "right" ? "right" : "left"}
            />
          </div>
        );
      })}
    </div>
  );
}

function BracketConnector({ from, to }: { from: NodeRect; to: NodeRect }) {
  const fromCx = from.x + from.w / 2;
  const toCx = to.x + to.w / 2;
  const goingRight = fromCx <= toCx;

  const fromX = goingRight ? from.x + from.w : from.x;
  const toX = goingRight ? to.x : to.x + to.w;
  const fromY = from.y + from.h / 2;
  const toY = to.y + to.h / 2;
  const midX = (fromX + toX) / 2;

  return (
    <path
      d={`M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1.5}
      strokeOpacity={0.35}
    />
  );
}
