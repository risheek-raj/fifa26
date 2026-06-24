import type {
  GroupId,
  KnockoutMatchTemplate,
  SlotRef,
} from "@/types/tournament";

const pos = (group: GroupId, position: 1 | 2 | 3): SlotRef => ({
  type: "position",
  group,
  position,
});

const win = (matchId: number): SlotRef => ({ type: "winner", matchId });
const lose = (matchId: number): SlotRef => ({ type: "loser", matchId });
const third = (groupWinner: GroupId): SlotRef => ({
  type: "annex_c_third",
  groupWinner,
});

const venue = (name: string, city: string, country: string) => ({
  name,
  city,
  country,
});

export const KNOCKOUT_TEMPLATES: KnockoutMatchTemplate[] = [
  // Round of 32
  { id: 73, round: "R32", homeSlot: pos("A", 2), awaySlot: pos("B", 2), datetime: "2026-06-28T15:00:00-07:00", venue: venue("SoFi Stadium", "Inglewood", "USA") },
  { id: 74, round: "R32", homeSlot: pos("E", 1), awaySlot: third("E"), datetime: "2026-06-29T12:00:00-04:00", venue: venue("Gillette Stadium", "Foxborough", "USA") },
  { id: 75, round: "R32", homeSlot: pos("F", 1), awaySlot: pos("C", 2), datetime: "2026-06-29T15:00:00-06:00", venue: venue("Estadio BBVA", "Monterrey", "Mexico") },
  { id: 76, round: "R32", homeSlot: pos("C", 1), awaySlot: pos("F", 2), datetime: "2026-06-29T18:00:00-04:00", venue: venue("NRG Stadium", "Houston", "USA") },
  { id: 77, round: "R32", homeSlot: pos("I", 1), awaySlot: third("I"), datetime: "2026-06-30T12:00:00-04:00", venue: venue("MetLife Stadium", "East Rutherford", "USA") },
  { id: 78, round: "R32", homeSlot: pos("E", 2), awaySlot: pos("I", 2), datetime: "2026-06-30T15:00:00-05:00", venue: venue("AT&T Stadium", "Arlington", "USA") },
  { id: 79, round: "R32", homeSlot: pos("A", 1), awaySlot: third("A"), datetime: "2026-06-30T18:00:00-06:00", venue: venue("Estadio Azteca", "Mexico City", "Mexico") },
  { id: 80, round: "R32", homeSlot: pos("L", 1), awaySlot: third("L"), datetime: "2026-07-01T12:00:00-04:00", venue: venue("Mercedes-Benz Stadium", "Atlanta", "USA") },
  { id: 81, round: "R32", homeSlot: pos("D", 1), awaySlot: third("D"), datetime: "2026-07-01T15:00:00-07:00", venue: venue("Levi's Stadium", "Santa Clara", "USA") },
  { id: 82, round: "R32", homeSlot: pos("G", 1), awaySlot: third("G"), datetime: "2026-07-01T18:00:00-07:00", venue: venue("Lumen Field", "Seattle", "USA") },
  { id: 83, round: "R32", homeSlot: pos("K", 2), awaySlot: pos("L", 2), datetime: "2026-07-02T12:00:00-04:00", venue: venue("BMO Field", "Toronto", "Canada") },
  { id: 84, round: "R32", homeSlot: pos("H", 1), awaySlot: pos("J", 2), datetime: "2026-07-02T15:00:00-07:00", venue: venue("SoFi Stadium", "Inglewood", "USA") },
  { id: 85, round: "R32", homeSlot: pos("B", 1), awaySlot: third("B"), datetime: "2026-07-02T18:00:00-07:00", venue: venue("BC Place", "Vancouver", "Canada") },
  { id: 86, round: "R32", homeSlot: pos("J", 1), awaySlot: pos("H", 2), datetime: "2026-07-03T12:00:00-04:00", venue: venue("Hard Rock Stadium", "Miami Gardens", "USA") },
  { id: 87, round: "R32", homeSlot: pos("K", 1), awaySlot: third("K"), datetime: "2026-07-03T15:00:00-05:00", venue: venue("Arrowhead Stadium", "Kansas City", "USA") },
  { id: 88, round: "R32", homeSlot: pos("D", 2), awaySlot: pos("G", 2), datetime: "2026-07-03T18:00:00-05:00", venue: venue("AT&T Stadium", "Arlington", "USA") },
  // Round of 16
  { id: 89, round: "R16", homeSlot: win(74), awaySlot: win(77), datetime: "2026-07-04T17:00:00-04:00", venue: venue("Lincoln Financial Field", "Philadelphia", "USA") },
  { id: 90, round: "R16", homeSlot: win(73), awaySlot: win(75), datetime: "2026-07-04T12:00:00-05:00", venue: venue("NRG Stadium", "Houston", "USA") },
  { id: 91, round: "R16", homeSlot: win(76), awaySlot: win(78), datetime: "2026-07-05T16:00:00-04:00", venue: venue("MetLife Stadium", "East Rutherford", "USA") },
  { id: 92, round: "R16", homeSlot: win(79), awaySlot: win(80), datetime: "2026-07-05T18:00:00-06:00", venue: venue("Estadio Azteca", "Mexico City", "Mexico") },
  { id: 93, round: "R16", homeSlot: win(83), awaySlot: win(84), datetime: "2026-07-06T14:00:00-05:00", venue: venue("AT&T Stadium", "Arlington", "USA") },
  { id: 94, round: "R16", homeSlot: win(81), awaySlot: win(82), datetime: "2026-07-06T17:00:00-07:00", venue: venue("Lumen Field", "Seattle", "USA") },
  { id: 95, round: "R16", homeSlot: win(86), awaySlot: win(88), datetime: "2026-07-07T12:00:00-04:00", venue: venue("Mercedes-Benz Stadium", "Atlanta", "USA") },
  { id: 96, round: "R16", homeSlot: win(85), awaySlot: win(87), datetime: "2026-07-07T13:00:00-07:00", venue: venue("BC Place", "Vancouver", "Canada") },
  // Quarter-finals
  { id: 97, round: "QF", homeSlot: win(89), awaySlot: win(90), datetime: "2026-07-09T16:00:00-04:00", venue: venue("Gillette Stadium", "Foxborough", "USA") },
  { id: 98, round: "QF", homeSlot: win(93), awaySlot: win(94), datetime: "2026-07-10T12:00:00-07:00", venue: venue("SoFi Stadium", "Inglewood", "USA") },
  { id: 99, round: "QF", homeSlot: win(91), awaySlot: win(92), datetime: "2026-07-11T15:00:00-04:00", venue: venue("Hard Rock Stadium", "Miami Gardens", "USA") },
  { id: 100, round: "QF", homeSlot: win(95), awaySlot: win(96), datetime: "2026-07-11T18:00:00-05:00", venue: venue("Arrowhead Stadium", "Kansas City", "USA") },
  // Semi-finals
  { id: 101, round: "SF", homeSlot: win(97), awaySlot: win(98), datetime: "2026-07-14T15:00:00-05:00", venue: venue("AT&T Stadium", "Arlington", "USA") },
  { id: 102, round: "SF", homeSlot: win(99), awaySlot: win(100), datetime: "2026-07-15T15:00:00-04:00", venue: venue("Mercedes-Benz Stadium", "Atlanta", "USA") },
  // Third place & Final
  { id: 103, round: "THIRD", homeSlot: lose(101), awaySlot: lose(102), datetime: "2026-07-18T17:00:00-04:00", venue: venue("Hard Rock Stadium", "Miami Gardens", "USA") },
  { id: 104, round: "FINAL", homeSlot: win(101), awaySlot: win(102), datetime: "2026-07-19T15:00:00-04:00", venue: venue("MetLife Stadium", "East Rutherford", "USA") },
];

export const ROUND_LABELS: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  THIRD: "3rd Place",
  FINAL: "Final",
};
