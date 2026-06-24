/** Official FIFA 2026 bracket tree — left & right halves converging at center */

export const LEFT_R32 = [73, 75, 74, 77, 76, 78, 79, 80] as const;
export const LEFT_R16 = [90, 89, 91, 92] as const;
export const LEFT_QF = [97, 99] as const;
export const LEFT_SF = [101] as const;

export const RIGHT_R32 = [81, 82, 83, 84, 85, 87, 86, 88] as const;
export const RIGHT_R16 = [94, 93, 96, 95] as const;
export const RIGHT_QF = [98, 100] as const;
export const RIGHT_SF = [102] as const;

export const FINAL_ID = 104;
export const THIRD_ID = 103;

export const BRACKET_EDGES: [number, number][] = [
  [73, 90], [75, 90], [74, 89], [77, 89],
  [76, 91], [78, 91], [79, 92], [80, 92],
  [89, 97], [90, 97], [91, 99], [92, 99],
  [97, 101], [98, 101],
  [81, 94], [82, 94], [83, 93], [84, 93],
  [85, 96], [87, 96], [86, 95], [88, 95],
  [93, 98], [94, 98], [95, 100], [96, 100],
  [99, 102], [100, 102],
  [101, FINAL_ID], [102, FINAL_ID],
];

export const FLOWCHART = {
  NODE_WIDTH: 176,
  NODE_HEIGHT: 88,
  ROW_GAP: 18,
  COL_GAP: 48,
  CENTER_GAP: 64,
  TOP_PADDING: 28,
  R32_COUNT: 8,
  CHAMPIONS_HEIGHT: 56,
} as const;

export function rowHeight(): number {
  return FLOWCHART.NODE_HEIGHT + FLOWCHART.ROW_GAP;
}

export function slotCenterY(index: number): number {
  return (
    FLOWCHART.TOP_PADDING +
    index * rowHeight() +
    FLOWCHART.NODE_HEIGHT / 2
  );
}

export function getMatchCenterY(
  roundIndex: number,
  matchIndex: number,
): number {
  if (roundIndex === 0) return slotCenterY(matchIndex);
  const y1 = getMatchCenterY(roundIndex - 1, matchIndex * 2);
  const y2 = getMatchCenterY(roundIndex - 1, matchIndex * 2 + 1);
  return (y1 + y2) / 2;
}

export function getNodeY(roundIndex: number, matchIndex: number): number {
  return getMatchCenterY(roundIndex, matchIndex) - FLOWCHART.NODE_HEIGHT / 2;
}

export function totalBracketHeight(): number {
  return (
    FLOWCHART.TOP_PADDING +
    FLOWCHART.R32_COUNT * rowHeight() -
    FLOWCHART.ROW_GAP +
    16
  );
}

export type BracketSide = "left" | "right";

export interface ColumnDef {
  side: BracketSide;
  round: string;
  matchIds: readonly number[];
  roundIndex: number;
}

export const LEFT_COLUMNS: ColumnDef[] = [
  { side: "left", round: "R32", matchIds: LEFT_R32, roundIndex: 0 },
  { side: "left", round: "R16", matchIds: LEFT_R16, roundIndex: 1 },
  { side: "left", round: "QF", matchIds: LEFT_QF, roundIndex: 2 },
  { side: "left", round: "SF", matchIds: LEFT_SF, roundIndex: 3 },
];

export const RIGHT_COLUMNS: ColumnDef[] = [
  { side: "right", round: "SF", matchIds: RIGHT_SF, roundIndex: 3 },
  { side: "right", round: "QF", matchIds: RIGHT_QF, roundIndex: 2 },
  { side: "right", round: "R16", matchIds: RIGHT_R16, roundIndex: 1 },
  { side: "right", round: "R32", matchIds: RIGHT_R32, roundIndex: 0 },
];

export interface NodeRect {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

function leftColX(colIdx: number): number {
  return colIdx * (FLOWCHART.NODE_WIDTH + FLOWCHART.COL_GAP);
}

function rightColX(colIdx: number): number {
  const leftWidth =
    LEFT_COLUMNS.length * (FLOWCHART.NODE_WIDTH + FLOWCHART.COL_GAP);
  return (
    leftWidth +
    FLOWCHART.NODE_WIDTH +
    FLOWCHART.CENTER_GAP +
    colIdx * (FLOWCHART.NODE_WIDTH + FLOWCHART.COL_GAP)
  );
}

function centerX(): number {
  return LEFT_COLUMNS.length * (FLOWCHART.NODE_WIDTH + FLOWCHART.COL_GAP);
}

export function getTotalWidth(): number {
  const leftWidth =
    LEFT_COLUMNS.length * (FLOWCHART.NODE_WIDTH + FLOWCHART.COL_GAP);
  const rightWidth =
    RIGHT_COLUMNS.length * (FLOWCHART.NODE_WIDTH + FLOWCHART.COL_GAP);
  return leftWidth + FLOWCHART.NODE_WIDTH + FLOWCHART.CENTER_GAP + rightWidth;
}

export function buildAllNodeRects(): NodeRect[] {
  const rects: NodeRect[] = [];
  const { NODE_WIDTH, NODE_HEIGHT } = FLOWCHART;

  LEFT_COLUMNS.forEach((col, colIdx) => {
    col.matchIds.forEach((id, matchIdx) => {
      rects.push({
        id,
        x: leftColX(colIdx),
        y: getNodeY(col.roundIndex, matchIdx),
        w: NODE_WIDTH,
        h: NODE_HEIGHT,
      });
    });
  });

  RIGHT_COLUMNS.forEach((col, colIdx) => {
    col.matchIds.forEach((id, matchIdx) => {
      rects.push({
        id,
        x: rightColX(colIdx),
        y: getNodeY(col.roundIndex, matchIdx),
        w: NODE_WIDTH,
        h: NODE_HEIGHT,
      });
    });
  });

  const finalY = getNodeY(3, 0);
  rects.push({
    id: FINAL_ID,
    x: centerX(),
    y: finalY,
    w: NODE_WIDTH,
    h: NODE_HEIGHT,
  });

  return rects;
}

export function getColumnLabelX(
  side: BracketSide,
  colIdx: number,
): number {
  return side === "left" ? leftColX(colIdx) : rightColX(colIdx);
}

export function getCenterColumnX(): number {
  return centerX();
}

export function getFinalBlockTop(): number {
  return getNodeY(3, 0) - FLOWCHART.CHAMPIONS_HEIGHT - 8;
}
