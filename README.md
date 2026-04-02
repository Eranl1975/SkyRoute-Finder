# ✈ SkyRoute Finder

**Find the cheapest available flights from trusted airline sources, with a recommended hotel — across Hebrew, English, and Spanish.**

---

## What it does

- Searches trusted airline sources for the cheapest flights from origin to destination
- Returns up to 5 flights ranked cheapest → most expensive
- Recommends the highest-rated hotel in the tourist area at the destination
- Provides direct booking links to official airline and hotel sites
- Explains clearly when nothing is found (route, date, airline, baggage, stopover)
- Works in **mock mode** by default (no live scraping required to run)
- Full Hebrew / English / Spanish support with RTL layout for Hebrew

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Database / Auth | Supabase (Postgres + RLS) |
| i18n | Custom React context (RTL-aware) |
| Testing | Vitest + Testing Library |

---

## Project structure

```
src/
  app/              → Next.js pages (user/, admin/, api/)
  components/       → UI primitives, forms, result cards, layout
  features/         → Search container, admin panels
  skills/           → Core intelligence modules
    orchestrator/   → Skill 5: coordinates the full search flow
    sourceTrust/    → Skill 1: trust registry & filtering
    flightSearch/   → Skill 2: ranking, dedup, explanations
    hotelSearch/    → Skill 3: hotel scoring
    normalization/  → Skill 4: locale-aware formatters
    bookingScaffold/→ Skill 6: future booking (disabled by default)
  providers/        → Provider interfaces & adapters
    interfaces/     → IFlightProvider, IHotelProvider
    adapters/mock/  → MockFlightProvider, MockHotelProvider (default)
    adapters/airlines/ → ElAl, Ryanair (scaffolded — live TODO)
    adapters/hotels/   → Booking.com (scaffolded — live TODO)
  services/         → searchService, cacheService
  lib/              → env, utils, constants, supabase client
  types/            → Shared TypeScript types
  schemas/          → Zod validation schemas
  i18n/             → en, he, es translations + I18nProvider
  supabase/         → SQL schema + TypeScript types
  config/           → app, feature flags, trusted sources, providers
```

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Set up Supabase
#    Run src/supabase/schema.sql in your Supabase SQL editor

# 4. Start development server (mock mode by default)
npm run dev

# 5. Open the app
#    User: http://localhost:3000/user
#    Admin: http://localhost:3000/admin
```

---

## Provider modes

| Mode | Description |
|---|---|
| `mock` (default) | Uses MockFlightProvider + MockHotelProvider with realistic sample data |
| `live` | Uses real provider adapters (must be implemented — see TODOs in adapters/) |

Switch mode via `.env.local`:
```
NEXT_PUBLIC_PROVIDER_MODE=mock   # or: live
```

---

## Search flow

```
User Input
  → Zod validation (searchSchema)
  → Skill 1: Source Trust (filter approved providers)
  → Skill 2: Flight Search (parallel adapter queries → dedup → rank → top 5)
  → Skill 3: Hotel Search (parallel adapter queries → score → top 1)
  → Skill 4: Normalization (locale-aware formatting)
  → Skill 5: Orchestrator (coordinates all above)
  → API response → UI ResultsList
```

---

## Adding a new airline provider

1. Create `src/providers/adapters/airlines/AirlineNameAdapter.ts` implementing `IFlightProvider`
2. Add the airline to `src/config/trusted-sources.ts` with trust level
3. Register the adapter in `src/providers/registry.ts`
4. Set `isEnabled: true` on the adapter when live integration is ready

---

## Adding a future booking skill

The scaffold is in `src/skills/bookingScaffold/`. To activate:

1. Implement `bookingService.bookFlight()` in `bookingScaffold/index.ts`
2. Set `featureFlags.bookingEnabled = true` in `config/feature-flags.ts` (or Supabase `feature_flags` table)
3. Ensure compliance requirements are met (see TODO comments in `interfaces.ts`)

---

## Supabase setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `src/supabase/schema.sql` in the SQL editor
3. Enable Row Level Security (already in schema)
4. Set env vars in `.env.local`
5. Optional: Generate types with `npx supabase gen types typescript --project-id YOUR_ID > src/supabase/types.ts`

---

## Running tests

```bash
npm run test          # run all tests once
npm run test:watch    # watch mode
npm run test:ui       # Vitest UI
```

Test coverage:
- `schemas.test.ts` — Zod validation
- `flightRanking.test.ts` — ranking, dedup, top-5 selection
- `sourceTrust.test.ts` — trust registry, scoring, filtering
- `normalization.test.ts` — formatters, templates, hotel scoring
- `orchestrator.test.ts` — explanation builder, booking guard

---

## Deployment

### Vercel (recommended)

```bash
# Push to GitHub, then connect repo in Vercel dashboard
# Set env vars in Vercel project settings
vercel deploy
```

### Self-hosted

```bash
npm run build
npm start
```

---

## Recommended commit strategy

```
feat: add new airline provider adapter
fix: correct dedup key for same-day flights
chore: update trusted sources registry
test: add ranking edge cases
docs: update provider integration guide
```

---

## Future upgrades (suggested next)

See [Future-Ready Extension Points](#future-ready-extension-points) below.

---

## Future-ready extension points

Each item below maps to an architectural scaffold already in the codebase:

| Feature | Status | Location |
|---|---|---|
| Live El Al integration | TODO | `adapters/airlines/ElAlAdapter.ts` |
| Live Ryanair integration | TODO | `adapters/airlines/RyanairAdapter.ts` |
| Live Booking.com hotels | TODO | `adapters/hotels/BookingComAdapter.ts` |
| Automatic booking | Scaffolded (off) | `skills/bookingScaffold/` |
| Booking approval workflow | Scaffold ready | `bookingScaffold/interfaces.ts` |
| Email confirmation | Interface defined | `IBookingService.sendConfirmation` |
| Price alerts | Feature flagged | `featureFlags.priceAlertsEnabled` |
| Flexible date search | Feature flagged | `featureFlags.flexibleDatesEnabled` |
| Cheapest-month view | Feature flagged | `featureFlags.cheapestMonthViewEnabled` |
| Hotel by attraction distance | Feature flagged | `featureFlags.hotelByAttractionEnabled` |
| Supabase auth flow | Schema ready | `supabase/schema.sql` |
| Search analytics | Placeholder panel | `features/admin/AnalyticsPanel.tsx` |
| Official-sites-only mode | Config ready | `featureFlags.officialSitesOnlyMode` |

---

## License

MIT — see LICENSE file (not included in this scaffold).
