# FIFA 26 Knockout Predictor — Project Documentation

> Comprehensive reference for developers, stakeholders, and future contributors.  
> Covers tournament rules, system architecture, data flow, prediction math, and known gaps.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tournament Context](#2-tournament-context)
3. [System Architecture](#3-system-architecture)
4. [Data Layer](#4-data-layer)
5. [Bracket Engine](#5-bracket-engine)
6. [Prediction Model](#6-prediction-model)
7. [Live Data Integration](#7-live-data-integration)
8. [API Reference](#8-api-reference)
9. [Frontend & UX](#9-frontend--ux)
10. [Type System](#10-type-system)
11. [Build Phases & Roadmap](#11-build-phases--roadmap)
12. [Deployment & Operations](#12-deployment--operations)
13. [Known Limitations & Future Work](#13-known-limitations--future-work)
14. [External References](#14-external-references)

---

## 1. Project Overview

### Purpose

The FIFA 26 Knockout Predictor is an interactive web application that:

- Visualizes the **2026 FIFA World Cup knockout bracket** (matches 73–104)
- Resolves team slots dynamically from **live group standings**
- Implements FIFA **Annex C** for third-place team assignments
- Generates **Poisson-based match predictions** for every knockout fixture
- Merges **live ESPN scores** so finished knockout games override projections

### Target Users

- Football fans tracking the 2026 World Cup knockout stage
- Analysts exploring bracket scenarios as group standings change
- Developers extending the prediction model or adding new data sources

### Repository

| Item | Value |
|------|-------|
| GitHub | [github.com/risheekraj414/fifa26](https://github.com/risheekraj414/fifa26) |
| Primary branch | `develop` |
| Runtime | Node.js 20+, Next.js 14.2 |
| Language | TypeScript |

---

## 2. Tournament Context

### Format (2026 expansion)

The 2026 World Cup is the first **48-team** edition, hosted across **Canada, Mexico, and the United States**.

| Stage | Teams | Matches |
|-------|-------|---------|
| Group stage | 48 (12 groups × 4) | 72 |
| Round of 32 | 32 | 16 |
| Round of 16 | 16 | 8 |
| Quarter-finals | 8 | 4 |
| Semi-finals | 4 | 2 |
| 3rd place + Final | 2 + 2 | 2 |

**Advancement:** Top 2 from each group (24) + **8 best third-place teams** (8) = **32 knockout teams**.

### Tiebreak order (group stage)

1. Points
2. Goal difference
3. Goals scored
4. Fair play points
5. FIFA ranking

Implemented in `src/lib/engine/standings.ts` via `sortStandings()`.

### Knockout match numbering

Knockout fixtures are numbered **M73–M104** per FIFA convention:

| Round | Match IDs | Dates (2026) |
|-------|-----------|--------------|
| Round of 32 | 73–88 | Jun 28 – Jul 3 |
| Round of 16 | 89–96 | Jul 4 – Jul 7 |
| Quarter-finals | 97–100 | Jul 9 – Jul 11 |
| Semi-finals | 101–102 | Jul 14 – Jul 15 |
| 3rd place | 103 | Jul 18 |
| Final | 104 | Jul 19 |

Full slot definitions live in `src/lib/data/knockout-matches.ts`.

### Annex C — third-place assignments

Eight of the sixteen R32 matches involve a third-place team. Which third-place team fills each slot depends on **which 8 of 12 groups** produce qualifying third-place teams.

There are **C(12,8) = 495** possible combinations. FIFA publishes a lookup table (Annex C) mapping each combination to specific group assignments.

This app implements all **495 rows** in `src/lib/data/annex-c.ts`, sourced from [manganite/wm2026](https://github.com/manganite/wm2026).

**Lookup key format:** sorted 8 group letters, no separator (e.g. `ABCDEGIK`).

**Groups with third-place slots in winners' paths:** A, B, D, E, G, I, K, L.

---

## 3. System Architecture

### High-level diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                            │
│  BracketPageClient / GroupsPageClient                               │
│  React Query hooks — poll every 15s (live) or 30s (normal)          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ fetch /api/*
┌───────────────────────────────▼─────────────────────────────────────┐
│                    Next.js 14 App Router (Server)                   │
│  SSR: getServerBracket() / getServerStandings()                     │
│  API Routes: /api/bracket, /api/standings, /api/live                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                      Bracket & Prediction Engine                    │
│  resolveBracket() → standings → Annex C → slot resolution           │
│  predictMatch() → Poisson win probabilities                         │
│  findKnockoutLiveResult() → merge ESPN scores                       │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                    ESPN API + In-Memory Cache                       │
│  Standings (60s TTL) | Scoreboard (30s / 15s live TTL)              │
│  Fallback: seed-standings.ts                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Request lifecycle — bracket page

1. **SSR (first paint):** `page.tsx` calls `getServerBracket()` → fetches ESPN data server-side → `resolveBracket()` → passes `initialData` to React Query.
2. **Client hydration:** `useBracket(initialData)` renders immediately with SSR data.
3. **Polling:** `useLiveScores()` drives refetch interval; `useBracket()` refetches `/api/bracket` on the same cadence.
4. **User interaction:** Click match → `MatchDetailPanel` slides in with prediction breakdown.

### Design decisions

| Decision | Rationale |
|----------|-----------|
| ESPN over API-Football | Free, no API key, HTTPS, sufficient for standings + scores |
| Server-side ESPN fetch | Avoids CORS, hides implementation details, enables caching |
| SSR + React Query | Instant first paint even if client API fails |
| Deterministic bracket path | Single projected winner per match (not Monte Carlo tree) |
| In-memory cache | Simple; acceptable for single-instance dev/small deploy |

---

## 4. Data Layer

### Static data files

| File | Contents |
|------|----------|
| `src/lib/data/teams.ts` | 48 teams — id, name, code, iso2, group, FIFA rank, Elo rating |
| `src/lib/data/knockout-matches.ts` | 32 knockout templates (M73–M104) with slot refs, dates, venues |
| `src/lib/data/annex-c.ts` | 495-row Annex C lookup + `getAnnexCAssignment()` |
| `src/lib/data/seed-standings.ts` | Fallback standings snapshot (Jun 24, 2026 projection) |
| `src/lib/data/bracket-layout.ts` | Flowchart node positions, SVG connector coordinates |

### Team metadata example

Each team carries a static **Elo rating** used by the prediction model:

```typescript
team("arg", "Argentina", "ARG", "ar", "J", 1, 2012)
//                                      rank  elo
```

Elo values are pre-seeded constants — they do not update during the tournament.

### Seed fallback

When ESPN fetch fails (network error, unexpected response shape, missing teams):

- `fetchLiveTournamentData()` catches the error
- Returns `buildGroupsFromSeed()` groups + empty scoreboard
- UI shows **"Seed data"** badge instead of **"ESPN · time"**

---

## 5. Bracket Engine

**Location:** `src/lib/engine/bracket-resolver.ts`

### Slot reference types

```typescript
type SlotRef =
  | { type: "position"; group: GroupId; position: 1 | 2 | 3 }
  | { type: "winner"; matchId: number }
  | { type: "loser"; matchId: number }
  | { type: "annex_c_third"; groupWinner: GroupId };
```

| Slot type | Example label | Meaning |
|-----------|---------------|---------|
| `position` | `2A` | Runner-up Group A |
| `winner` | `W74` | Winner of Match 74 |
| `loser` | `L101` | Loser of Semi-final 101 |
| `annex_c_third` | `3rd→1E` | Third-place team assigned to winner-of-E slot |

### Resolution algorithm

```
FOR each round IN [R32, R16, QF, SF, THIRD, FINAL]:
  FOR each match template IN round:
    1. Resolve homeTeam and awayTeam from slots
    2. Compute Poisson prediction (if both teams known)
    3. Check ESPN for live/finished result
    4. Push ResolvedMatch to output array
    5. IF finished live result:
         Set winner + loser from actual score
       ELSE IF both teams known:
         Pick winner from prediction (Elo tiebreak at 50/50)
         Store winner in winners Map, loser in losers Map
```

### Winner/loser propagation

Two maps track knockout progression:

- `winners: Map<matchId, Team>` — feeds `W##` slots
- `losers: Map<matchId, Team>` — feeds `L##` slots (3rd place match M103)

**M103 (3rd place):** `L101 vs L102` — semi-final losers. Previously broken (losers always null); now resolved correctly.

### Provisional Annex C

While group stage games remain (`played < 3` for any team):

- `annexCProvisional: true` is set on `BracketState`
- UI shows **"Provisional"** badge on the third-place tracker

---

## 6. Prediction Model

**Location:** `src/lib/engine/predictions.ts`  
**Version:** `poisson-v1`

### Inputs

| Input | Source | Notes |
|-------|--------|-------|
| Home team Elo | `teams.ts` | Static rating |
| Away team Elo | `teams.ts` | Static rating |
| Venue country | `knockout-matches.ts` | Host boost for MEX/CAN/USA |

### Algorithm

**Step 1 — Expected goals (λ)**

```
λ_home = max(0.35, 1.35 × 10^((Elo_home - Elo_away + boost) / 400))
λ_away = max(0.35, 1.35 × 10^((Elo_away - Elo_home - boost) / 400))
```

Host boost: **+65 Elo** when home team is MEX, CAN, or USA.

**Step 2 — Regulation score matrix**

For h, a ∈ [0, 6]:

```
P(h, a) = Poisson(λ_home, h) × Poisson(λ_away, a)
```

Aggregate into home win, draw, away win probabilities.

**Step 3 — Knockout cascade**

Draws in regulation trigger extra time (λ scaled to 33% for 30 minutes), then penalties as 50/50 split of remaining draw probability.

**Step 4 — Output**

```typescript
{
  homeWinPct: number,      // 0–100, rounded
  awayWinPct: number,
  mostLikelyScore: string, // e.g. "2-1"
  expectedGoals: { home, away },
  modelVersion: "poisson-v1"
}
```

### Bracket simulation vs display

- **Display:** Win percentages shown on every match card
- **Simulation:** Higher win % team advances; Elo breaks exact 50/50 ties
- **Live override:** Finished ESPN results replace prediction-based advancement

### Example

MEX (home, Azteca) vs KOR:

```
homeWinPct: 97%, awayWinPct: 3%
mostLikelyScore: "3-0"
expectedGoals: { home: 3.3, away: 0.6 }
```

---

## 7. Live Data Integration

**Location:** `src/lib/api/espn/`

### ESPN endpoints

| Endpoint | URL | Cache TTL |
|----------|-----|-----------|
| Standings | `.../v2/sports/soccer/fifa.world/standings` | 60 seconds |
| Scoreboard | `.../site/v2/sports/soccer/fifa.world/scoreboard?limit=100` | 30s (15s when live) |

All requests include:

```
Accept: application/json
User-Agent: FIFA26-Knockout-Predictor/1.0
```

### Team code mapping

ESPN 3-letter codes map to internal team IDs via `espnCodeToTeamId()`. Aliases handle mismatches:

| ESPN | Internal |
|------|----------|
| BIH | bih |
| CPV | cpv |
| CIV | civ |
| COD | cod |
| CUW | cuw |
| KSA | ksa |

Unmapped codes are silently dropped from standings parsing.

### Knockout live matching

**Location:** `src/lib/api/espn/knockout-live.ts`

Matches ESPN events to knockout templates by:

1. **Team pair** — both home and away internal IDs match (either orientation)
2. **Date proximity** — event date within 36 hours of template datetime

Status mapping:

| ESPN state | App status |
|------------|------------|
| `pre` | `scheduled` |
| `in` | `live` |
| `post` | `finished` |

### Caching strategy

Two layers:

1. **In-memory Map** (`src/lib/api/cache.ts`) — per Node process
2. **Next.js fetch revalidate: 30** — ISR-style server cache

When live matches detected, scoreboard refetches with 15s TTL key.

---

## 8. API Reference

All routes are `force-dynamic` (no static generation).

### `GET /api/bracket`

Returns full bracket state.

```json
{
  "groups": [...],
  "matches": [
    {
      "id": 73,
      "round": "R32",
      "homeTeam": { "id": "kor", "code": "KOR", ... },
      "awayTeam": { "id": "can", "code": "CAN", ... },
      "status": "scheduled",
      "homeScore": null,
      "awayScore": null,
      "prediction": {
        "homeWinPct": 32,
        "awayWinPct": 68,
        "mostLikelyScore": "1-1",
        "expectedGoals": { "home": 1.1, "away": 1.6 },
        "modelVersion": "poisson-v1"
      }
    }
  ],
  "thirdPlaceQualifiers": [...],
  "annexCKey": "A,B,C,D,E,G,I,K",
  "annexCProvisional": true,
  "source": "espn",
  "updatedAt": "2026-06-24T22:00:00.000Z"
}
```

### `GET /api/standings`

Returns groups + all 12 third-place teams with qualification flags.

### `GET /api/live`

Returns ESPN scoreboard snapshot.

```json
{
  "matches": [
    {
      "id": "401547123",
      "name": "Brazil vs Morocco",
      "status": "live",
      "homeTeam": { "code": "BRA", "score": 1 },
      "awayTeam": { "code": "MAR", "score": 0 }
    }
  ],
  "source": "espn",
  "hasLiveMatches": true,
  "updatedAt": "..."
}
```

---

## 9. Frontend & UX

### Pages

| Page | Component | Features |
|------|-----------|----------|
| `/` | `BracketPageClient` | Flowchart / list toggle, live scores bar, match detail panel |
| `/groups` | `GroupsPageClient` | 12 group tables with qualification highlighting |

### Bracket flowchart

- **Layout:** Left R32 → center Final, mirrored on right
- **Connectors:** SVG elbow paths aligned to node centers via `buildAllNodeRects()`
- **Nodes:** 176×88px match cards with flag, win %, live score
- **Center column:** Champions box + Final + 3rd place playoff

### View modes

| Mode | Description |
|------|-------------|
| **Flowchart** | Symmetrical bracket (default) |
| **By Round** | Horizontal scroll of match cards per round |

### Design tokens

```css
--background: #0a1628
--surface:    #111d33
--accent:     #00d084
--gold:       #f5c842
--foreground: #f0f4f8
```

Fonts: **Syne** (display), **Instrument Sans** (body).

### React Query configuration

```typescript
staleTime: 0          // always refetch on mount
refetchInterval:      // 15_000 if live, else 30_000
retry: 2
```

Query keys: `["bracket"]`, `["standings"]`, `["live"]`.

---

## 10. Type System

**Location:** `src/types/tournament.ts`

Core interfaces:

```typescript
interface Team {
  id: string;
  name: string;
  code: string;       // FIFA 3-letter
  iso2: string;       // flag emoji/image key
  fifaRank: number;
  eloRating: number;
  groupId: GroupId;
}

interface ResolvedMatch {
  id: number;         // 73–104
  round: KnockoutRound;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeSlotLabel: string;
  awaySlotLabel: string;
  status: "scheduled" | "live" | "finished";
  homeScore?: number | null;
  awayScore?: number | null;
  prediction?: MatchPrediction;
}

interface BracketState {
  groups: Group[];
  matches: ResolvedMatch[];
  thirdPlaceQualifiers: { team: Team; groupId: GroupId; rank: number }[];
  annexCKey: string | null;
  annexCProvisional?: boolean;
}
```

---

## 11. Build Phases & Roadmap

### Completed

| Phase | Deliverables |
|-------|--------------|
| **Phase 1** | Next.js scaffold, 48 teams, M73–M104 templates, Annex C (495 rows), bracket UI |
| **Phase 2** | ESPN integration, `/api/*` routes, React Query polling, groups page, 3rd-place tracker |
| **Phase 3** | Poisson model, live knockout merge, loser tracking (M103), error boundaries |

### Planned (Phase 4)

- [ ] Monte Carlo tournament simulation (championship odds)
- [ ] WebSocket live score push
- [ ] `/match/[id]` dedicated match pages
- [ ] "Trace my team" path highlighter
- [ ] What-if simulator (change group results)
- [ ] Mobile pinch-zoom on flowchart
- [ ] Deploy to Vercel
- [ ] Unit tests (Annex C, standings tiebreaks, bracket resolver)
- [ ] Dynamic Elo updates from group-stage performance

---

## 12. Deployment & Operations

### Environment variables

None required. ESPN API is public and keyless.

Optional for future phases:

```
# Not currently used
API_FOOTBALL_KEY=
REDIS_URL=
```

### Production build

```bash
npm run build
npm run start
```

### Dev server notes

- Uses `WATCHPACK_POLLING=true` for file watcher stability on macOS
- Corrupted `.next` cache causes 500/unstyled pages — delete and restart
- Only one dev server on port 3000 at a time

### Recommended hosting

- **Vercel** — native Next.js support, serverless API routes
- Note: in-memory cache resets per lambda invocation on serverless

---

## 13. Known Limitations & Future Work

| Limitation | Impact | Mitigation path |
|------------|--------|-----------------|
| Fair play = 0 from ESPN | Wrong 3rd-place order in edge cases | Parse from FIFA or drop tiebreak |
| No head-to-head tiebreak | Group order may differ from FIFA | Need per-match results |
| Static Elo ratings | Predictions don't reflect form | Update Elo after each group game |
| Deterministic bracket | No probability tree / title odds | Monte Carlo simulation |
| ESPN unofficial | May break or rate-limit | API-Football fallback |
| In-memory cache | Inconsistent TTL on serverless | Redis or edge cache |
| No auth / user accounts | No saved scenarios | Optional Phase 5 |

---

## 14. External References

| Resource | URL |
|----------|-----|
| FIFA 2026 Regulations (Annex C) | [digitalhub.fifa.com](https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf) |
| Knockout stage (Wikipedia) | [en.wikipedia.org](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage) |
| World Cup XI bracket | [worldcupxi.com/bracket](https://worldcupxi.com/bracket) |
| Annex C data source | [github.com/manganite/wm2026](https://github.com/manganite/wm2026) |
| ESPN standings API | [site.api.espn.com](https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings) |
| Knockout schedule | [kickoffadventures.com](https://www.kickoffadventures.com/events/world-cup-26/schedule/knockout-stage) |

---

*Last updated: June 2026 — branch `develop`*
