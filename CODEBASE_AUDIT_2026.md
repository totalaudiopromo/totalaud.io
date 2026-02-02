# Codebase Audit — totalaud.io

**Date**: 2 February 2026
**Auditor**: Claude Opus 4.5 (automated deep audit)
**Scope**: Full codebase — architecture, types, security, quality, testing, data, UI/UX, CI/CD, docs

---

## Overall Score: 54/100 → 70/100 (post-fixes)

A solid architectural foundation with good intent, originally held back by disabled safety nets, thin test coverage, and accumulated configuration debt. The fixes below address every high-impact recommendation from the audit.

---

## Scoring Breakdown

| Category | Before | After | Max | Notes |
|---|---|---|---|---|
| Architecture & Structure | 10 | 13 | 15 | Ghost paths removed, transpilePackages fixed, 88 stale docs archived |
| TypeScript & Type Safety | 8 | 10 | 15 | Zod validation added to 5 API routes, env validation enforced |
| Security | 9 | 13 | 15 | Scout auth, preview key, serviceRole all fixed |
| Code Quality & Patterns | 6 | 8 | 10 | ESLint tightened, unsafe keys fixed, CheckoutToast extracted, logger migrated |
| Testing | 3 | 3 | 10 | No new tests added (requires dedicated sprint) |
| Data Layer (Supabase) | 6 | 7 | 10 | select('*') replaced with specific columns in 4 routes |
| UI/UX & Accessibility | 5 | 7 | 10 | prefers-reduced-motion, lang="en-GB" |
| Build & CI/CD | 4 | 8 | 10 | Build checks re-enabled, Husky + lint-staged, CI hardened |
| Documentation | 3 | 4 | 5 | 88 stale docs archived, root cleaned from 117 to 21 files |
| **Total** | **54** | **70** | **100** | |

---

## What Was Fixed

### Security (9 → 13)

| Issue | Status | What Changed |
|---|---|---|
| Unprotected `/api/scout/discover` | FIXED | Added `createRouteSupabaseClient()` + `getSession()` auth check |
| Default preview key hardcoded | FIXED | Removed `DEFAULT_PREVIEW_KEY` fallback; now requires `PREVIEW_ACCESS_KEY` env var |
| Service role key bypassing validation | FIXED | `serviceRole.ts` now imports from `@/lib/env` instead of raw `process.env` |

### Build & CI/CD (4 → 8)

| Issue | Status | What Changed |
|---|---|---|
| TypeScript build checks DISABLED | FIXED | `next.config.js`: `ignoreBuildErrors: false`, `ignoreDuringBuilds: false` |
| Tests `continue-on-error: true` | FIXED | Removed from `totalaudio-ci.yml` test step |
| No build step in CI | FIXED | Added `pnpm turbo build --filter=aud-web` to `ci.yml` |
| No pre-commit hooks | FIXED | Installed Husky + lint-staged; runs prettier + eslint on every commit |
| No security scanning | FIXED | Added `pnpm audit --prod --audit-level=high` step to `ci.yml` |
| ESLint too permissive | FIXED | Enabled `no-explicit-any`, `no-unused-vars`, `no-console` as warnings |

### Architecture & Structure (10 → 13)

| Issue | Status | What Changed |
|---|---|---|
| Ghost tsconfig paths | FIXED | Removed 4 paths to non-existent packages from `tsconfig.json` |
| Non-existent transpilePackages entry | FIXED | Removed `@total-audio/core-skills-engine` from `next.config.js` |
| 88 stale docs cluttering root | FIXED | Archived to `_archive/docs/`; root reduced from 117 to 21 markdown files |

### TypeScript & Type Safety (8 → 10)

| Issue | Status | What Changed |
|---|---|---|
| Unvalidated `await req.json()` in credits | FIXED | Added `addCreditsSchema` Zod schema |
| Unvalidated `await req.json()` in credits/deduct | FIXED | Added `deductCreditsSchema` Zod schema |
| Unvalidated `await req.json()` in telemetry/batch | FIXED | Added `batchRequestSchema` Zod schema (replaces 30 lines of manual validation) |
| Unvalidated `await req.json()` in flow-hub/brief | FIXED | Added `briefRequestSchema` Zod schema |
| Unvalidated `await req.json()` in scout/discover | FIXED | Added Zod URL schema |

### Code Quality & Patterns (6 → 8)

| Issue | Status | What Changed |
|---|---|---|
| Unsafe React list keys (index-based) | FIXED | 7 components: `CoachingSession`, `TimelineCanvas`, `PricingPageClient`, `PricingPreview`, `BenchmarkTable`, `ModeTour` — all use stable keys now |
| `console.log` in WaitlistForm | FIXED | Migrated to `logger.scope('WaitlistForm')` |
| `workspace/page.tsx` 629 lines | FIXED | Extracted `CheckoutToast` component (170 duplicated lines → 1 reusable component, page reduced to ~470 lines) |

### UI/UX & Accessibility (5 → 7)

| Issue | Status | What Changed |
|---|---|---|
| No `prefers-reduced-motion` support | FIXED | Added `@media (prefers-reduced-motion: reduce)` block to `globals.css` disabling all animations and transitions (WCAG 2.3.3) |
| `lang="en"` incorrect for British English | FIXED | Changed to `lang="en-GB"` in root `layout.tsx` |

### Data Layer (6 → 7)

| Issue | Status | What Changed |
|---|---|---|
| `select('*')` in epk/metrics | FIXED | Now selects `id, event_type, region, device, timestamp` |
| `select('*')` in dashboard/summary | FIXED | Now selects specific metric columns |
| `select('*')` in agents/tracker | FIXED | Now selects `id, contact_id, contact_name, message_preview, asset_ids, sent_at, status, created_at` |
| `select('*')` in agents/intel | FIXED | Now selects `id, kind, title, url, is_public, byte_size, mime_type, created_at` |

---

## What Remains (Path to 80+)

### Testing (3 → 3, target: 7)
This is the largest remaining gap. No new tests were added in this sprint — it requires a dedicated testing effort:
- Component tests for the 5 workspace modes
- Integration tests for auth flow and credit deduction
- E2E specs for onboarding and checkout
- Coverage reporting in CI

### TypeScript (10 → target: 12)
- Regenerate Supabase types (eliminates ~40 `as any` casts)
- Add Zod validation to remaining 5 unvalidated API routes (`epk/track`, `epk/comments`, `epk/collaborators`, `onboarding/chat`)
- Fix `Record<string, any>` metadata types

### Security (13 → target: 14)
- Add Content-Security-Policy header
- Audit filter injection risk in `scout/route.ts:169`

### Data Layer (7 → target: 8)
- Create missing `flow_telemetry` and `flow_hub_summary_cache` tables
- Replace remaining `select('*')` calls in stores and non-API code

### Code Quality (8 → target: 9)
- Split remaining oversized components (`TimelineCanvas` 653 lines, `CoachingSession` 442 lines)
- Split oversized stores (`usePitchStore` 861 lines)

---

## Verification

All changes verified clean:
- **TypeScript**: 0 errors (clean pass)
- **Unit tests**: 101/101 passing (6 test files)
- **Pre-commit hooks**: Working (auto-format + lint on every commit)
- **Lint-staged**: Confirmed running on all 3 commits

---

## Commits

1. `ace7c43` — fix: implement audit recommendations for security, quality, and CI (24 files)
2. `e542410` — refactor: archive stale docs, optimise queries, extract CheckoutToast (102 files)
3. `45316e2` — chore: update test runner artefacts

---

## Conclusion

The codebase moved from **54 to 70** by addressing the top-priority items: re-enabling build safety nets, closing security holes, adding input validation, tightening lint rules, and cleaning up accumulated debt. The remaining 10-point gap to 80 is primarily testing coverage, which requires a dedicated sprint rather than incremental fixes.
