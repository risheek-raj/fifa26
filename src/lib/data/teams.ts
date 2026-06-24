import type { GroupId, Team } from "@/types/tournament";

const team = (
  id: string,
  name: string,
  code: string,
  iso2: string,
  groupId: GroupId,
  fifaRank: number,
  eloRating: number,
): Team => ({
  id,
  name,
  code,
  iso2,
  groupId,
  fifaRank,
  eloRating,
});

export const TEAMS: Team[] = [
  team("mex", "Mexico", "MEX", "mx", "A", 14, 1834),
  team("rsa", "South Africa", "RSA", "za", "A", 59, 1532),
  team("kor", "South Korea", "KOR", "kr", "A", 23, 1745),
  team("cze", "Czechia", "CZE", "cz", "A", 39, 1621),
  team("can", "Canada", "CAN", "ca", "B", 27, 1712),
  team("bih", "Bosnia & Herzegovina", "BIH", "ba", "B", 75, 1489),
  team("qat", "Qatar", "QAT", "qa", "B", 35, 1643),
  team("sui", "Switzerland", "SUI", "ch", "B", 19, 1778),
  team("bra", "Brazil", "BRA", "br", "C", 5, 1996),
  team("mar", "Morocco", "MAR", "ma", "C", 13, 1845),
  team("hai", "Haiti", "HAI", "ht", "C", 87, 1412),
  team("sco", "Scotland", "SCO", "gb-sct", "C", 36, 1635),
  team("usa", "United States", "USA", "us", "D", 11, 1856),
  team("par", "Paraguay", "PAR", "py", "D", 52, 1567),
  team("aus", "Australia", "AUS", "au", "D", 24, 1738),
  team("tur", "Türkiye", "TUR", "tr", "D", 26, 1718),
  team("ger", "Germany", "GER", "de", "E", 8, 1892),
  team("civ", "Ivory Coast", "CIV", "ci", "E", 38, 1628),
  team("cuw", "Curaçao", "CUW", "cw", "E", 88, 1405),
  team("ecu", "Ecuador", "ECU", "ec", "E", 31, 1689),
  team("ned", "Netherlands", "NED", "nl", "F", 7, 1901),
  team("jpn", "Japan", "JPN", "jp", "F", 18, 1782),
  team("swe", "Sweden", "SWE", "se", "F", 25, 1725),
  team("tun", "Tunisia", "TUN", "tn", "F", 40, 1615),
  team("bel", "Belgium", "BEL", "be", "G", 4, 1923),
  team("egy", "Egypt", "EGY", "eg", "G", 33, 1662),
  team("irn", "Iran", "IRN", "ir", "G", 21, 1765),
  team("nzl", "New Zealand", "NZL", "nz", "G", 103, 1378),
  team("esp", "Spain", "ESP", "es", "H", 3, 1945),
  team("cpv", "Cape Verde", "CPV", "cv", "H", 65, 1512),
  team("ksa", "Saudi Arabia", "KSA", "sa", "H", 58, 1538),
  team("uru", "Uruguay", "URU", "uy", "H", 9, 1881),
  team("fra", "France", "FRA", "fr", "I", 2, 1968),
  team("sen", "Senegal", "SEN", "sn", "I", 17, 1789),
  team("irq", "Iraq", "IRQ", "iq", "I", 56, 1545),
  team("nor", "Norway", "NOR", "no", "I", 45, 1598),
  team("arg", "Argentina", "ARG", "ar", "J", 1, 2012),
  team("alg", "Algeria", "ALG", "dz", "J", 32, 1668),
  team("aut", "Austria", "AUT", "at", "J", 22, 1752),
  team("jor", "Jordan", "JOR", "jo", "J", 70, 1498),
  team("por", "Portugal", "POR", "pt", "K", 6, 1915),
  team("uzb", "Uzbekistan", "UZB", "uz", "K", 62, 1521),
  team("cod", "DR Congo", "COD", "cd", "K", 64, 1518),
  team("col", "Colombia", "COL", "co", "K", 12, 1848),
  team("eng", "England", "ENG", "gb-eng", "L", 10, 1872),
  team("cro", "Croatia", "CRO", "hr", "L", 16, 1795),
  team("gha", "Ghana", "GHA", "gh", "L", 68, 1505),
  team("pan", "Panama", "PAN", "pa", "L", 41, 1608),
];

export const TEAMS_BY_ID = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
) as Record<string, Team>;

export function flagUrl(iso2: string): string {
  if (iso2.startsWith("gb-")) {
    return `https://flagcdn.com/w40/${iso2}.png`;
  }
  return `https://flagcdn.com/w40/${iso2}.png`;
}
