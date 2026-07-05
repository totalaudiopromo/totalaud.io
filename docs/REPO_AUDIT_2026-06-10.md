# Repository Audit & Improvement Plan — totalaud.io

**Date:** 10 June 2026
**Auditor:** Principal-level technical review (read-only; no code modified)
**Branch reviewed:** `feat/waitlist-landing`
**Scope:** `apps/aud-web/**`, `packages/**`, `supabase/**`, `.github/**`, root config

---

## 1. Executive Summary

**Overall health grade: C+ (a capable, well-structured product carrying real security debt and CI theatre).**

totalaud.io is a genuinely well-architected Next.js 16 monorepo with strong type discipline (zero `@ts-ignore`, only 9 `any` casts across ~83k lines), near-universal structured logging, a clean Supabase RLS posture (all 17 live tables have RLS enabled), and a correctly-implemented Stripe webhook. The bones are good. But the product is in a paused/waitlist state with a large surface of feature code still live, and three classes of problem undermine the otherwise solid engineering: (1) a **financial endpoint any logged-in user can exploit to grant themselves credits**, plus an unauthenticated AI endpoint that bills your Anthropic account; (2) **authentication across ~35 routes relies on `getSession()`, which trusts unverified JWT claims** rather than `getUser()`; and (3) **CI is largely ceremonial** — lint allows 9,999 warnings, E2E tests never run, and post-merge checks swallow failures with `|| true`. The codebase also carries ~1,600 lines of dead landing code and several unused heavy dependencies.

**Top 3 risks:** (1) `POST /api/credits` self-grant + unauthenticated `onboarding/chat` cost-abuse; (2) `getSession()`-based auth accepts forged JWTs on credit/billing/AI routes; (3) CI gates that don't gate — quality regressions merge freely.

**Top 3 opportunities:** (1) one shared `requireAuth()` helper fixes the auth class across all 44 routes at once; (2) deleting dead code + unused deps is pure-win bundle/clarity reduction with near-zero risk; (3) making CI actually enforce lint/test turns the existing (good) test suite into a real safety net.

---

## 2. Repo Map

**Purpose:** A calm, opinionated decision-support system for independent musicians — "a second opinion before release." Four pillars: **Finish** (multi-perspective finishing notes), **Release/Timeline** (multi-week release planning), **Leverage/Intel** (relationships as creative capital), **Pitch** (narrative consistency). Claude is the reasoning layer, kept invisible to users. Currently **paused and serving a waitlist landing page** (pivot ~21 May 2026).

**Maturity:** Production-intending solo/small-team product, mid-pivot. Real billing (Stripe), real auth (Supabase), real deployment (Railway) — not a prototype, but not yet hardened.

**Stack:** Next.js 16.2.6 (App Router, Turbopack) · React 18.3.1 · TypeScript 5.6.3 strict · Tailwind 3.4 · Zustand 4.5 · Framer Motion 11 · Supabase (Postgres/Auth/RLS) · Stripe · Anthropic SDK · Turborepo + pnpm 8.15 workspace · Sentry · Railway deploy.

**Key directories:**

| Path | Role |
|------|------|
| `apps/aud-web/src/app/` | Next.js App Router: pages, `(auth)/` group, 56 `api/**/route.ts` handlers |
| `apps/aud-web/src/components/` | Feature components: `workspace/{ideas,scout,timeline,pitch,finish}`, `console/`, `landing/`, `seo/` |
| `apps/aud-web/src/stores/` | 11 Zustand stores (ideas, timeline, pitch, identity, scout, signal-threads, …) |
| `apps/aud-web/src/lib/` | Utilities: `env.ts`, `logger.ts`, `api/middleware.ts`, `supabase/`, `stripe/`, `tap-client.ts`, `discovery/` |
| `packages/core/` | `ai-provider/`, `logger/`, `supabase/`, `integrations/` — each a real workspace package |
| `packages/schemas/database/` | Generated Supabase types (`@total-audio/schemas-database`) |
| `packages/ui/` | **Empty shell** — no `package.json`, no source |
| `supabase/migrations/` | 5 active migrations (consolidated `clean_schema` + 4 incremental) |
| `supabase/_old_migrations/` | 44 superseded migrations kept for history |
| `archive/`, `_archive/` | Archived apps/docs (loopos, orchestrator, experimental) — excluded from build |

**Surprises:** (1) `next ^16.2.6` despite README/CLAUDE.md claiming Next 15; (2) **two** diverging generated DB type files (5,322 vs 3,600 lines); (3) a `vercel.json` co-existing with `railway.json` despite CLAUDE.md explicitly saying "Railway not Vercel"; (4) **two** near-duplicate CI workflows running every check twice per PR; (5) `lodash` override pinned to `^4.18.1`, a version that does not exist on npm; (6) `PHASE_25_LOOPOS_AI_PERSISTENCE.md` and other AI session notes committed into the app directory.

---

## 3. Audit Report

Findings are grouped by dimension, sorted by severity. **[FACT]** = verified by reading the cited line; **[JUDGEMENT]** = interpretation.

### 3.1 Security

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| S1 | **Critical** | **[FACT]** `POST /api/credits` lets any authenticated user self-grant arbitrary credits. The handler reads `session.user.id` and passes a caller-supplied `amountPence` straight into the `add_credits` RPC — no admin role, no service-role gate, no Stripe linkage. A user can POST `{amountPence: 999999, transactionType: "bonus"}` and credit themselves. | `apps/aud-web/src/app/api/credits/route.ts:131-167` |
| S2 | **Critical** | **[FACT]** `POST /api/onboarding/chat` has no auth check of any kind and calls Claude (`claude-sonnet-4-6`). Any anonymous caller can drive unbounded Anthropic spend; only the in-memory 60 req/min/IP limiter stands in the way. | `apps/aud-web/src/app/api/onboarding/chat/route.ts:96-235` (no `getUser`/`getSession`) |
| S3 | **High** | **[FACT]** Auth across ~35 routes uses `supabase.auth.getSession()`, which trusts JWT claims from the cookie without server verification. `getUser()` (server-verified) is the correct call. Affects credit/billing/AI routes (`credits`, `credits/deduct`, `enrich`, `agents/run`, `flow-hub/brief`, `pitch/coach`, …). The shared `withAuth` wrapper has the same flaw. | `apps/aud-web/src/lib/api/middleware.ts:54`; 53 direct `getSession()` calls across 44 files |
| S4 | **High** | **[FACT]** `NEXT_PUBLIC_CONVERTKIT_API_KEY` is baked into the client bundle and used to call `api.kit.com` directly from the browser, exposing the key to anyone viewing source. | `apps/aud-web/src/components/landing/WaitlistForm.tsx:31,56`; `apps/aud-web/src/lib/env.ts:115` |
| S5 | **High** | **[JUDGEMENT/FACT]** `POST /api/scout/discover` fetches user-supplied URLs with no SSRF protection — no blocking of `127.0.0.1`, `169.254.169.254` (cloud metadata), `10.*`, `192.168.*`. Spoofs a Chrome UA. | `apps/aud-web/src/app/api/scout/discover/route.ts:54-203` |
| S6 | **Medium** | **[FACT]** `.env.production` was committed historically (commits `bfdc7be`, `6007dff`; removed `1dd1fd5`). Values were placeholders, but the pattern is dangerous — verify no real secret ever landed; consider history scrub. | git history |
| S7 | **Medium** | **[FACT]** Rate limiting is in-memory; resets on deploy and is per-instance (comment admits it). Trivially bypassed across Railway instances on AI/billing routes. | `apps/aud-web/src/middleware.ts:30-33`; `lib/api/middleware.ts:89` |
| S8 | **Medium** | **[FACT]** Waitlist/lead-magnet capture have no CAPTCHA/honeypot; waitlist email check is only `!email.includes('@')`, and the `already: true` response is an email-enumeration oracle. | `apps/aud-web/src/app/api/waitlist/route.ts:37,52`; `lead-magnet/capture/route.ts:41-96` |
| S9 | **Medium** | **[FACT]** `epk/.../comments/[commentId]` PUT has no max-length on `body`, unlike the POST path which caps at 5000. | `.../comments/[commentId]/route.ts:13-15` vs `.../comments/route.ts:115` |
| S10 | **Low** | **[FACT]** `/api/keepalive` falls open if `CRON_SECRET` is unset (`if (expected && …)`). Fine if always set in prod. | `apps/aud-web/src/app/api/keepalive/route.ts:12-15` |

**Done well:** Stripe webhook uses `constructEvent()` signature verification + idempotency table with race handling (`stripe/webhook/route.ts:108,132`). Destructive routes (`account/delete`, `account/export`, `stripe/*`, `intelligence/*`) correctly use `getUser()`. `assets/update` double-checks `user_id` ownership. Comprehensive security headers (HSTS, X-Frame-Options DENY, nosniff). No hardcoded real secrets in source. All 17 live tables have RLS enabled.

### 3.2 Architecture & Design

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| A1 | **High** | **[FACT]** Two diverging generated DB type files (5,322 vs 3,600 lines) — unclear source of truth. Missing tables force `(supabase as any)` casts. | `apps/aud-web/src/lib/supabase/database.types.ts` vs `packages/schemas/database/types.ts` |
| A2 | **Medium** | **[JUDGEMENT]** Three large Zustand stores embed Supabase client creation + `auth.getUser()` + network I/O directly in actions, making them untestable in isolation and blurring state/data boundaries. | `stores/useIdeasStore.ts` (707 ln), `useTimelineStore.ts`, `useIdentityStore.ts:222-420` |
| A3 | **Medium** | **[FACT]** 4 routes instantiate `new Anthropic()` directly, bypassing the `core-ai-provider` abstraction (defeats centralised retries/observability/model-swap). | `intelligence/navigator/ask/route.ts:66`, `flow-hub/brief/route.ts:116`, `enrich/route.ts:117`, `onboarding/chat/route.ts:26` |
| A4 | **Medium** | **[FACT]** `packages/ui` is an empty shell (no `package.json`/source) yet referenced in `transpilePackages`. `packages/core/logger` is exported but unused — the app duplicates it at `lib/logger.ts`. | `packages/ui/`; `next.config.ts`; `apps/aud-web/src/lib/logger.ts` |
| A5 | **Low** | **[FACT]** Import-alias inconsistency: 25 files use `@aud-web/...`, the rest `@/...` for identical modules. | tsconfig paths; route imports |
| A6 | **Low** | **[FACT]** `settings/page.tsx` (1,036 ln) mixes five feature domains (profile, password, deletion, Stripe portal, email prefs) in one client component. | `apps/aud-web/src/app/settings/page.tsx:36` |

**Done well:** `createRouteSupabaseClient()` wrapper used in 44/48 routes; `core-ai-provider` is a clean abstraction (4 exceptions aside); data-driven SEO pages (`location/`, `genre/`, `compare/`, `for/`) are cleanly generated; Turbopack+webpack aliases correctly paired for Next 16.

### 3.3 Code Quality

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| Q1 | **Medium** | **[FACT]** ~1,615 lines of dead landing code: `LandingPage.tsx` (904) and `ComingSoonLanding.tsx` (711) are unreachable post-pivot, plus ~12 orphaned sub-components only imported by them. | `apps/aud-web/src/components/landing/` |
| Q2 | **Medium** | **[FACT]** 20+ swallowed `catch {}` blocks discard errors with no logging/user feedback (Stripe portal open, AI streaming, curated-contacts save, store sync). | `settings/page.tsx:762`; `contacts/curated/save/route.ts:43,80,116`; `pitch/coach/session/route.ts:372,400`; `useCuratedContactsStore.ts:163,182` |
| Q3 | **Medium** | **[FACT]** ~53 copy-pasted auth blocks across 44 routes — no shared `requireAuth()` helper (~200 lines of boilerplate). | all authenticated `api/**/route.ts` |
| Q4 | **Low** | **[FACT]** Inconsistent error response shapes: `{error}` (most routes) vs `{success, error}` (AI routes) with no shared type. | e.g. `epk/*` vs `pitch/*` |
| Q5 | **Low** | **[FACT]** `store/flowCanvasStore.ts` (singular `store/`, 38 ln) is in the wrong directory and imported nowhere. | `apps/aud-web/src/store/flowCanvasStore.ts` |

**Done well:** Only 9 `any` casts (all localised/documented), zero `@ts-ignore`, only 16 raw `console.*` calls in 83k lines. Strong overall discipline.

### 3.4 Testing

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| T1 | **High** | **[FACT]** All 56 API routes, all `lib/` utilities, and all components have zero unit coverage. The 6 unit tests cover middleware + 4 stores + one helper only. | `apps/aud-web/src/**/__tests__/` |
| T2 | **High** | **[FACT]** Playwright E2E (9 specs) never run in CI — no `test:e2e` step in any workflow. | `.github/workflows/*.yml` |
| T3 | **Medium** | **[FACT]** Root `tests/console/*.spec.ts` (4 files) are outside `playwright.config.ts`'s `testDir: './tests'` (app-relative) and run nowhere — dead specs. | `apps/aud-web/playwright.config.ts`; root `tests/console/` |
| T4 | **Medium** | **[JUDGEMENT]** Several E2E "performance" assertions are trivially-true (measure `performance.now()` since test start, not since action); `visual-audit` wires its console-error listener after `goto`, capturing nothing. | `tests/console/campaign.spec.ts:85`; `tests/visual-audit.spec.ts:44` |
| T5 | **Low** | **[FACT]** No coverage reporter/threshold configured in Vitest. | `apps/aud-web/vitest.config.ts` |

**Done well:** The 6 unit tests are genuine behaviour tests — `middleware.test.ts` asserts 401/429/500, dev/prod error exposure, and rate-window resets with fake timers. Store tests assert real state mutations.

### 3.5 Performance

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| P1 | **Medium** | **[FACT]** `recharts` (~500KB) imported at top level (no `dynamic()`) in two client components — lands in initial JS. | `console/intelligence/TrajectoryForecast.tsx:15`; `console/dashboard/TrajectoryChart.tsx:12` |
| P2 | **Medium** | **[FACT]** `/api/threads` lists all rows per user with no `.limit()`/`.range()`. | `apps/aud-web/src/app/api/threads/route.ts:77-91` |
| P3 | **Low** | **[FACT]** `/api/telemetry/summary` is date-bounded but uncapped, then iterates results in a loop. | `telemetry/summary/route.ts:126,161` |

**Done well:** No `.map(async)` N+1 patterns found at API level; `account/export` star-selects are user-scoped and intentional (GDPR).

### 3.6 Dependencies

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| D1 | **High** | **[FACT]** `@anthropic-ai/sdk@0.17.2` is ~35 minor releases behind (~0.52). Predates tool_use GA, prompt caching, modern streaming; pinned twice (app + `core/ai-provider`). | `apps/aud-web/package.json`; `packages/core/ai-provider/package.json` |
| D2 | **Medium** | **[FACT]** `@vercel/analytics` declared but never imported, and the app runs on Railway — dead. | `apps/aud-web/package.json` (no imports) |
| D3 | **Medium** | **[FACT]** `reactflow` (~500KB) installed only for a type-only import in the unused `flowCanvasStore`. | `store/flowCanvasStore.ts:2` |
| D4 | **Medium** | **[FACT]** Three different `@supabase/supabase-js` ranges (`^2.39.0` root, `^2.88.0` app, `^2.39.0` core) — dedup hygiene risk. | three `package.json` files |
| D5 | **Medium** | **[FACT]** Stripe `apiVersion` pinned to preview channel `'2026-02-25.clover'`; preview channels sunset faster than stable. | `apps/aud-web/src/lib/stripe/index.ts:20` |
| D6 | **Low** | **[FACT]** `@vercel/og` declared but all OG routes use built-in `next/og`. | `opengraph-image.tsx:1`; `api/og/epk/.../route.tsx:13` |
| D7 | **Low** | **[FACT]** `lodash` override pinned `^4.18.1` — no such version exists on npm (latest 4.17.21). Likely dead/incorrect override. | root `package.json` `pnpm.overrides` |
| D8 | **Low** | **[FACT]** `swr` and `@tanstack/react-query` coexist; `swr` used in one hook only. | `hooks/useIntelligence.ts:5` |

**Done well:** Single clean `pnpm-lock.yaml`, no stray lockfiles; Railway build uses `--frozen-lockfile`; all 17 tables RLS-enabled with sensible policies; no dangerous DDL in active migrations.

### 3.7 DevEx & Operations

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| O1 | **High** | **[FACT]** ESLint runs `--max-warnings=9999`, so CI's lint step passes with thousands of warnings — effectively non-gating. | `apps/aud-web/package.json:9`; `ci.yml` |
| O2 | **High** | **[FACT]** `post-merge-auto-check.yml` runs lint and typecheck with `|| true` — failures are silenced post-merge. | `.github/workflows/post-merge-auto-check.yml:17-18` |
| O3 | **Medium** | **[FACT]** Duplicate CI: `ci.yml` and `totalaudio-ci.yml` share triggers and run lint/typecheck/test/build twice per PR (wasted minutes, confusion). | both workflow files |
| O4 | **Medium** | **[FACT]** `/api/health` returns `{status:'ok'}` unconditionally — no Supabase/dependency check, so a broken-DB deploy still passes Railway's healthcheck. | `apps/aud-web/src/app/api/health/route.ts` |
| O5 | **Medium** | **[FACT]** 9 routes/libs read secrets via raw `process.env`, bypassing `env.ts`; `FINISHER_API_KEY` and `SUPPRESSION_ENCRYPTION_KEY` aren't in the schema at all (no startup validation). | `intelligence/navigator/ask/route.ts:59`; `enrich/route.ts:117`; `finisher-client.ts:79-80`; `suppressionService.ts:77` |
| O6 | **Medium** | **[FACT]** `vercel.json` co-exists with `railway.json` despite "Railway not Vercel" — risk of a shadow Vercel deploy on push. | `apps/aud-web/vercel.json` |
| O7 | **Low** | **[FACT]** Pre-commit runs prettier + `eslint --fix` only — no `--max-warnings=0`, no typecheck, no tests. | `.husky/pre-commit` |
| O8 | **Low** | **[FACT]** `claude-code-review-fix.yml` auto-pushes Claude commits on a very broad CodeRabbit keyword trigger without a human gate. | `.github/workflows/claude-code-review-fix.yml` |
| O9 | **Low** | **[FACT]** Railway healthcheck timeout is 100 ms — tight for a Next cold start. | `railway.json:14` |
| O10 | **Low** | **[FACT]** Two committed `tsconfig.tsbuildinfo` artifacts; `_archive/` (130+ files) and `PHASE_*.md` notes (one referencing a different product, "Loopos") tracked in the app dir. | `packages/core/*/tsconfig.tsbuildinfo`; `_archive/`; `apps/aud-web/PHASE_*.md` |

**Done well:** `next.config.js` keeps `ignoreBuildErrors:false` and `ignoreDuringBuilds:false` (real type/lint gate at build); strict TS; Sentry properly wired via `instrumentation.ts` with `onRequestError`; logger silences debug/info in prod and routes errors to Sentry.

### 3.8 Documentation

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| C1 | **Low** | **[FACT]** README/CLAUDE.md say Next.js 15; actual is 16.2.6. | `README.md`; `package.json` |
| C2 | **Low** | **[FACT]** README roadmap lists Pitch/Timeline as incomplete, but the stores/components ship. `CONTRIBUTING.md` references a `./start-work.sh` that doesn't exist. | `README.md:107-113`; `CONTRIBUTING.md:28` |

---

## 4. Improvement Strategy

Five themes explain almost every finding.

**Theme 1 — Authentication is structurally weak, not just buggy.** The `getSession()` pattern, the self-grant credits route, and the unauthenticated AI endpoint are one root cause: there is no single enforced auth choke-point. *Target state:* one `requireAuth(request)` helper using `getUser()`, applied to every non-public route; financial/credit mutations restricted to server-only callers (webhook/service-role). *Principle:* authenticate once, server-verified, in one place.

**Theme 2 — CI looks like a gate but isn't.** `--max-warnings=9999`, `|| true`, no E2E, duplicate workflows. *Target state:* one workflow that fails on lint warnings (after a baseline cleanup), runs the unit suite, and runs a smoke E2E; post-merge checks that actually report. *Principle:* a green check must mean something.

**Theme 3 — Single source of truth keeps forking.** Two DB type files, two loggers, two deploy configs, `NEXT_PUBLIC_` secrets, raw `process.env` bypassing `env.ts`. *Target state:* one generated types file, one logger, one deploy target, all env through `env.ts`. *Principle:* one canonical source per concern.

**Theme 4 — Dead weight from the pivot.** ~1,600 lines dead landing code, unused `reactflow`/`@vercel/*`, empty `packages/ui`, orphaned store, committed archives/phase-notes. *Target state:* delete what the waitlist pivot orphaned. *Principle:* the repo should reflect what ships today.

**Theme 5 — The core logic is untested.** Good tests exist but cover ~5% of surface; routes and lib utilities have none. *Target state:* unit coverage on auth helper, billing/credits, and the AI route guards first. *Principle:* test the code that handles money and identity before anything else.

**Explicitly NOT recommending now (effort vs. payoff while paused):** splitting `settings/page.tsx`; migrating stores out of direct Supabase I/O (large refactor, works today); replacing in-memory rate limiting with Redis (do it before unpause, not now); React 19 upgrade (works on 18.3.1); collapsing `swr`→react-query. These are real but low-urgency given the product is on a waitlist.

**Definition of done:** zero Critical/High security findings; CI fails on lint warnings and a failing unit test; one DB type file, one logger, one deploy config; all secrets via `env.ts` with no `NEXT_PUBLIC_` API keys; dead landing code and unused deps removed; `requireAuth()` used by every authenticated route.

---

## 5. Task Plan

### Quick wins (high impact, S effort — do immediately)

| ID | Task | Files | Effort |
|----|------|-------|--------|
| QW1 | Add `getUser()` auth check to `onboarding/chat` (or move behind `withAuth`) | `api/onboarding/chat/route.ts` | S |
| QW2 | Lock down `POST /api/credits` — require service-role header or remove from public API | `api/credits/route.ts` | S |
| QW3 | Delete unused deps: `@vercel/analytics`, `@vercel/og`, `reactflow` (+ orphan `flowCanvasStore`) | `package.json`, `store/` | S |
| QW4 | Delete dead landing code (`LandingPage`, `ComingSoonLanding` + orphan sub-components) | `components/landing/` | S |
| QW5 | Fix `lodash` override to `^4.17.21`; remove duplicate `vercel.json` | `package.json`, `vercel.json` | S |
| QW6 | Update README/CLAUDE.md Next version 15→16; remove stale `start-work.sh` ref | docs | S |

### Milestone 0 — Safety net (before refactoring)

| ID | Task | Description | Affected | Acceptance | Effort | Risk | Deps |
|----|------|-------------|----------|------------|--------|------|------|
| M0.1 | Unit-test `requireAuth` + credits | Add tests around the new auth helper and credit add/deduct logic before changing them | `lib/api/`, `api/credits/` | Tests assert 401 on no/forged session, reject non-service-role credit adds | M | Low | — |
| M0.2 | Make CI a real gate | Single workflow: `typecheck` + `lint` (warnings fail after baseline) + `vitest` + `build`; add smoke E2E | `.github/workflows/` | PR with a lint warning or failing test goes red | M | Low | — |
| M0.3 | Baseline lint cleanup | Fix/triage existing warnings so `--max-warnings=0` is achievable | repo-wide | `eslint .` passes with 0 warnings | L | Low | M0.2 |

### Milestone 1 — Critical security/correctness

| ID | Task | Affected | Acceptance | Effort | Risk | Deps |
|----|------|----------|------------|--------|------|------|
| M1.1 | Introduce `requireAuth(request)` using `getUser()`; migrate all `getSession()` routes | `lib/api/middleware.ts` + 44 routes | No route uses `getSession()` for authz; tests green | L | Med | M0.1 |
| M1.2 | Restrict credits mutation to server-only | `api/credits/route.ts` | External POST returns 403; webhook path still works | S | Med | M0.1 |
| M1.3 | Auth + rate-limit `onboarding/chat` | `api/onboarding/chat/route.ts` | Anonymous POST returns 401 | S | Low | M1.1 |
| M1.4 | Proxy ConvertKit via server route; drop `NEXT_PUBLIC_` key | `WaitlistForm.tsx`, new `api/waitlist/subscribe`, `env.ts` | Key absent from client bundle | M | Low | — |
| M1.5 | Add SSRF guard (private-IP blocklist) to `scout/discover` | `api/scout/discover/route.ts` | Requests to `127.0.0.1`/`169.254.*`/RFC1918 rejected | M | Low | — |
| M1.6 | Add max-length to comment PUT | `epk/.../comments/[commentId]/route.ts` | `>5000` chars rejected | S | Low | — |

### Milestone 2 — High-leverage improvements

| ID | Task | Affected | Acceptance | Effort | Risk | Deps |
|----|------|----------|------------|--------|------|------|
| M2.1 | Reconcile to ONE DB types file; regenerate; remove `as any` table casts | `lib/supabase/database.types.ts`, `packages/schemas/` | Single source; `pnpm typecheck` clean without casts | M | Med | — |
| M2.2 | Route 4 `new Anthropic()` calls through `core-ai-provider`; bump SDK | 4 routes, `core/ai-provider` | All AI calls use the provider; SDK current | M | Med | M0.2 |
| M2.3 | Move all secret reads to `env.ts`; add `FINISHER_API_KEY`, `SUPPRESSION_ENCRYPTION_KEY` to schema | 9 files, `env.ts` | No raw `process.env` for secrets; startup validates all | M | Low | — |
| M2.4 | Real `/api/health` (ping Supabase) + relax Railway timeout | `api/health/route.ts`, `railway.json` | Healthcheck fails when DB unreachable | S | Low | — |
| M2.5 | Consolidate to one logger (`core/logger`); standardise API error shape | `lib/logger.ts`, routes | Single logger; shared `ApiError` type | M | Low | — |

### Milestone 3 — Quality & polish

| ID | Task | Affected | Effort | Risk |
|----|------|----------|--------|------|
| M3.1 | Dynamic-import `recharts`; add `.limit()` to `/api/threads` + telemetry | chart components, 2 routes | S | Low |
| M3.2 | Replace swallowed `catch {}` with logged errors / user feedback | 20+ sites | M | Low |
| M3.3 | Distributed rate limiting (Upstash) + waitlist CAPTCHA — **before unpause** | middleware, waitlist | M | Med |
| M3.4 | Remove `packages/ui` shell, committed `tsbuildinfo`, `_archive/`/`PHASE_*.md` from git; collapse duplicate CI | repo hygiene | S | Low |
| M3.5 | Standardise import alias (`@/` everywhere) | 25 files | S | Low |

### Top-3 implementation sketches

**QW1/M1.3 — Auth the onboarding chat.** Approach: reuse the existing `createRouteSupabaseClient()` + `getUser()` pattern from `account/delete`. Steps: at the top of `POST`, fetch user; return 401 if absent; key the rate limiter on `user.id` not IP. Gotcha: confirm onboarding genuinely requires login in the product flow — if it must serve pre-signup users, gate instead with a short-lived signed token issued at page load plus a strict per-IP cap, not open access.

**M1.1 — `requireAuth` rollout.** Approach: add `export async function requireAuth(req): Promise<{user} | NextResponse>` that creates the route client, calls `getUser()` (network-verified), returns a 401 `NextResponse` on failure else `{user}`. Migrate routes mechanically: replace the `getSession()` block with `const auth = await requireAuth(req); if (auth instanceof NextResponse) return auth; const userId = auth.user.id`. Gotcha: `getUser()` adds a network round-trip per call — acceptable for these routes, but don't call it twice; thread the user through. Do M0.1 (tests) first so regressions surface.

**M2.1 — One DB types file.** Approach: pick `lib/supabase/database.types.ts` (newer, has the v13 marker) as canonical, point `@total-audio/schemas-database` at it (or regenerate both from `supabase gen types` after running the 2 missing migrations locally). Steps: regenerate, delete the stale copy, update the 2 importers, remove `(supabase as any)` casts now that `flow_hub_summary_cache`/`aud_saved_contacts`/`contact_suppressions` are typed. Gotcha: requires local Supabase running; verify the live schema matches migrations before trusting generated output.

---

## 6. Open Questions

1. **Credits endpoint intent** — is `POST /api/credits` meant to be admin-only/internal, or is there a legitimate client caller? This determines whether to remove it from the public API or add role-gating.
2. **Onboarding chat audience** — must it serve pre-signup (anonymous) users, or can it require login? Changes the fix from "add auth" to "add signed-token + hard rate cap."
3. **Deploy target** — is Vercel actually connected? If not, `vercel.json` should be deleted; if it's an intentional preview env, document it.
4. **Stripe `.clover` preview channel** — intentional dependency on preview features, or an accidental pin? Affects whether to move to a stable `apiVersion`.
5. **Product timeline** — when does the waitlist lift? This sets urgency on M3.3 (distributed rate limiting / CAPTCHA), which should land before real traffic.
6. **`_old_migrations` + archives** — safe to remove from git history, or keep as compliance/record?

---

*Areas given lighter review:* individual React component internals (252+ files — sampled, not exhaustive), the `console/` intelligence feature suite, and Playwright spec bodies beyond the 5 read. Depth was concentrated on the API/auth/billing core, dependency graph, CI, and data layer — the ~20% handling money, identity, and shipping.
