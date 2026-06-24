# FIFA 26 Knockout Predictor

Interactive web app for the **2026 FIFA World Cup** (Canada · Mexico · USA). Live group standings, a full knockout bracket with Annex C third-place resolution, Poisson match predictions, and ESPN-powered score updates.

**Repository:** [github.com/risheekraj414/fifa26](https://github.com/risheekraj414/fifa26)  
**Branch:** `develop`

---

## Features

| Feature | Description |
|---------|-------------|
| **Knockout Bracket** | Symmetrical flowchart (R32 → Final) with SVG connector lines |
| **Live Standings** | 12 groups (A–L), 48 teams, FIFA tiebreak order |
| **3rd-Place Tracker** | Top 8 best third-place teams + Annex C key (provisional until group stage ends) |
| **Poisson Predictions** | Win %, expected goals, most likely score per knockout match |
| **Live Scores** | ESPN scoreboard integration — live/finished knockout results override projections |
| **Dual Views** | Flowchart bracket or round-by-round list |
| **Match Detail Panel** | Click any match for prediction breakdown and venue info |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS — dark FIFA theme
- **Data fetching:** TanStack React Query (15s live / 30s normal polling)
- **Live data:** ESPN public API (server-side only, no API key)
- **Fonts:** Syne (headings), Instrument Sans (body)

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install & run

```bash
git clone https://github.com/risheekraj414/fifa26.git
cd fifa26
git checkout develop
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # ESLint
```

### Troubleshooting

If the page is unstyled or shows a blank error screen:

```bash
lsof -ti :3000 | xargs kill -9   # kill stale dev server
rm -rf .next                      # clear corrupted cache
npm run dev
```

Hard refresh: `Cmd + Shift + R` (macOS) or `Ctrl + Shift + R` (Windows/Linux).

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Knockout bracket — flowchart + 3rd-place tracker |
| `/groups` | Live group standings tables |
| `/api/bracket` | Full resolved bracket + predictions (JSON) |
| `/api/standings` | Groups + third-place rankings (JSON) |
| `/api/live` | ESPN scoreboard snapshot (JSON) |

---

## How It Works

### Bracket engine

1. Load group standings (ESPN live or seed fallback).
2. Rank all 12 third-place teams → pick top 8.
3. Look up **Annex C** (495 combinations) to assign third-place teams to R32 slots.
4. Walk knockout rounds in order, resolving slots (`1A`, `W74`, `L101`, etc.).
5. Apply Poisson predictions or live ESPN results to advance winners/losers.

### Prediction model (`poisson-v1`)

- **Inputs:** Team Elo ratings, venue country (host boost for MEX/CAN/USA)
- **Method:** Poisson score matrix (0–6 goals) + extra-time / penalty cascade for knockouts
- **Output:** Home/away win %, most likely score, expected goals

### Live data

- **Standings:** `site.api.espn.com/.../fifa.world/standings` (60s cache)
- **Scoreboard:** `site.api.espn.com/.../fifa.world/scoreboard` (30s / 15s when live)
- Knockout matches matched by team pair + date; finished games use actual results
- Falls back to seed data if ESPN is unavailable (badge shown in UI)

---

## Project Structure

```
fifa26/
├── README.md                      # This file
├── PROJECT_DOCUMENTATION.md       # Full in-depth project reference
├── APPLICATION_PLAN.md            # Original build plan & tournament analysis
├── src/
│   ├── app/
│   │   ├── page.tsx               # Bracket page (SSR)
│   │   ├── groups/page.tsx        # Standings page (SSR)
│   │   └── api/                   # bracket, standings, live
│   ├── components/
│   │   ├── bracket/               # Flowchart, match cards, detail panel
│   │   ├── groups/                # Group tables
│   │   └── layout/                # Nav, live badge
│   ├── lib/
│   │   ├── api/espn/              # ESPN client, cache, knockout matcher
│   │   ├── data/                  # Teams, Annex C, knockout templates
│   │   ├── engine/                # Bracket resolver, standings, Poisson model
│   │   ├── hooks/                 # React Query hooks
│   │   └── server/                # SSR data loaders
│   └── types/tournament.ts
└── package.json
```

---

## Build Status

| Phase | Status |
|-------|--------|
| Phase 1 — Foundation (teams, Annex C, bracket UI) | ✅ Complete |
| Phase 2 — Live data (ESPN, polling, standings) | ✅ Complete |
| Phase 3 — Poisson predictions, live knockout merge | ✅ Complete |
| Phase 4 — Monte Carlo, WebSocket, match pages, deploy | 🔲 Planned |

See [APPLICATION_PLAN.md](./APPLICATION_PLAN.md) for the full roadmap.

---

## Data Sources & References

- [ESPN FIFA World Cup API](https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings) (unofficial, public)
- [FIFA 2026 Regulations — Annex C](https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf)
- [2026 Knockout Stage — Wikipedia](https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage)
- Annex C lookup sourced from [manganite/wm2026](https://github.com/manganite/wm2026)

---

## Known Limitations

- Fair-play tiebreaker defaults to 0 (ESPN does not expose it)
- No head-to-head tiebreak within groups
- Elo ratings are static (not updated for in-tournament form)
- ESPN is unofficial — seed data used as fallback
- No Monte Carlo championship odds yet

---

## License

Private project. All FIFA trademarks belong to FIFA.

For full architecture, API schemas, and implementation details, see **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**.
