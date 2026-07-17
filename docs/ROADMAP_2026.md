# totalaud.io — Roadmap 2026

**Status**: Active. Companion to [`STRATEGY_2026.md`](STRATEGY_2026.md).
**Rule**: every phase leaves `main` shippable. Sizes: S / M / L.

Ordering logic: clear the decks first (cheap, unblocks everything), then the flagship
differentiator, then the moat, then the loop, then analytics and polish.

---

## Phase 1 — Recommit, park, clean (M) — IN PROGRESS

The product says "artists" everywhere again; Label OS is dormant but revivable; dead code
stops misleading future work.

| Item | Where | Size |
|---|---|---|
| Park Label OS behind `NEXT_PUBLIC_ENABLE_LABEL_OS` (default off); pre-park state at commit `68c2cf4` | `lib/env.ts`, `app/label/layout.tsx`, `app/api/label/*` | S |
| Homepage back to artist-first; signed-in users land on `/workspace` | `app/page.tsx`, `components/landing/*` | M |
| Pricing back to artist tiers wired to live Stripe checkout | `app/pricing/*` | M |
| Label copy sweep (SEO pages, metadata) | `/compare`, `/for/*`, `/genre/*`, `/location/*` | S |
| Remove dead code: `api/tap/*` 410 stubs, Pitch TAP UI, timeline TAP sync, placeholder `api/agents/*` | as named | M |
| AI provider hygiene: configurable model id, current pricing | `packages/core/ai-provider/src/anthropic.ts` | S |

## Phase 2 — Finish revival: client-side analysis + perspectives (L) — flagship

- Browser analysis module producing the existing `AnalysisResult` shape (LUFS, true peak,
  dynamics, stereo, spectral) — *audio never leaves the device*.
- `api/finish/perspectives`: metrics + artist context → producer / mix-translation /
  listener / industry finishing notes. Prompt builders pure and unit-tested
  (banned-vocabulary tests: no scores, no judgement, no first person).
- `finish_notes` table (RLS by user). PerspectivesPanel UI. Mastering UI parked gracefully.
- Founder tone review across 3–4 genres before launch.

## Phase 3 — Intel: TAP-powered relationship memory (L) — the moat

- Full TAP live integration via `lib/tap/client.ts`: enrichment (credits), outcome logging
  from Pitch/Scout actions, action-queue panel ("worth a follow-up" — quiet, in-workspace,
  nothing auto-sends).
- Claude "who matters" summary over contacts + outcomes — plain English, no ranking.
- Data foundations: commit the missing `aud_curated_contacts` migration (introspect live
  DB), seed `opportunities` across ICP genres, regenerate Supabase types, burn down `as any`.

## Phase 4 — The release loop (M)

- Post-release phases in timeline auto-sequencing (week +1: thank curators, log outcomes;
  week +2: review what worked); completing a follow-up offers to log a TAP outcome.
- Timeline events linkable to contacts (`contact_id`).
- Pitch consistency checker against the stored identity narrative.
- Finish → Timeline hand-off ("plan this release", reuse `CrossModePrompt`).

## Phase 5 — Analytics: "What worked" (M)

- Own-data analytics from TAP outcomes + timeline: reply/placement rates per release,
  placement lifespan, which relationships produced results, momentum across releases.
  Plain-English summaries first, small charts second.
- Streaming stats via aggregator API (Songstats/Soundcharts — pricing check first) or
  Spotify for Artists CSV import. **Not** the Spotify Web API (see STRATEGY_2026 §5).

## Phase 6 — Agent-native surface + polish (M)

- totalaud.io MCP server exposing the public routes as consent-scoped tools
  ("bring your own assistant") — read-mostly at first.
- Command palette (⌘K), keyboard-first pass.
- Console surface (`app/console/*`) archived or flag-gated; workspace is home.
- Landing/Lighthouse/mobile pass; perspectives tier-gating wired into Stripe
  (included-with-limits, not per-use credits).
- Gmail send-from-your-own-inbox for pitches (OAuth clients already exist in
  `packages/core/integrations`).

---

## Quick wins shipped alongside (Phase 1–2 window)

- **ICS calendar feed** for Timeline (subscribe in Google/Apple Calendar)
- **Odesli smart links** per release (every-platform links, free API)

## Standing verification (every phase)

`pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm build`, plus:
manual walk of `/`, `/pricing`, `/workspace`, `/label` (expect redirect while parked);
Playwright e2e for upload → notes and the release loop as they land; RLS tests on new
tables; Stripe test-mode checkout after pricing changes.

**Last updated**: July 2026
