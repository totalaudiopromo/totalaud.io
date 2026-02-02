# Codebase Audit — totalaud.io

**Date**: 2 February 2026
**Auditor**: Claude Opus 4.5 (automated deep audit)
**Scope**: Full codebase — architecture, types, security, quality, testing, data, UI/UX, CI/CD, docs

---

## Overall Score: 54/100

A solid architectural foundation with good intent, held back by disabled safety nets, thin test coverage, and accumulated configuration debt. The bones are good — the discipline needs tightening.

---

## Scoring Breakdown

| Category | Score | Max | Grade |
|---|---|---|---|
| Architecture & Structure | 10 | 15 | B- |
| TypeScript & Type Safety | 8 | 15 | D+ |
| Security | 9 | 15 | C |
| Code Quality & Patterns | 6 | 10 | C |
| Testing | 3 | 10 | F |
| Data Layer (Supabase) | 6 | 10 | C |
| UI/UX & Accessibility | 5 | 10 | D |
| Build & CI/CD | 4 | 10 | F |
| Documentation | 3 | 5 | C |
| **Total** | **54** | **100** | |

---

## 1. Architecture & Structure — 10/15

### Strengths

- Monorepo structure is fundamentally sound with no circular dependencies
- Package boundaries between `core-supabase`, `core-ai-provider`, `core-integrations`, `core-logger` are clean
- Next.js 15 App Router used correctly with proper route groups, layouts, error boundaries
- `_archive` directory properly isolated — no active imports from archived code
- `workspace:*` protocol correctly used for internal packages

### Issues

| Issue | Severity | Location |
|---|---|---|
| Ghost tsconfig paths pointing to non-existent packages | HIGH | `tsconfig.json:24-30` |
| Non-existent `@total-audio/core-skills-engine` in transpilePackages | HIGH | `apps/aud-web/next.config.js:9` |
| 3 inactive apps (`loopos`, `orchestrator`, `totalaud.io`) still in workspace | MEDIUM | `pnpm-workspace.yaml` |
| TypeScript version mismatch: root `^5.3.3` vs apps `5.6.3`-`5.7.2` | MEDIUM | All `package.json` files |
| React version mismatch: one app on React 19, others on 18 | MEDIUM | `apps/totalaud.io/package.json` |
| Supabase SDK version gap: `core-supabase` on `2.39.0`, `aud-web` on `2.88.0` | MEDIUM | Package files |

---

## 2. TypeScript & Type Safety — 8/15

### Strengths

- `strict: true` enabled in root tsconfig
- Zero instances of `React.FC` anti-pattern
- Zustand stores are well-typed with proper interfaces
- Zod validation established in ~65% of API routes (28/43)
- Discriminated union types used well (telemetry, scout, pitch)

### Issues

| Issue | Severity | Count | Key Files |
|---|---|---|---|
| `(supabase as any)` casts — types not regenerated | CRITICAL | 56 instances | 18 API routes |
| Unvalidated `await req.json()` — no runtime validation | CRITICAL | 6 routes | `epk/track`, `credits`, `agents`, `flow-hub`, `onboarding` |
| Missing API response type annotations | HIGH | 12 routes | Various |
| `Record<string, any>` metadata fields | HIGH | 4 files | `asset-telemetry.ts`, `useFlowStateTelemetry.ts` |
| `private auth: any` in Gmail integration | MEDIUM | 1 file | `packages/core/integrations/src/gmail-client.ts` |
| `item: any` in component props | MEDIUM | 1 file | `JourneyGallery.tsx:173` |
| `skipLibCheck: true` hides third-party type issues | LOW | 1 file | Root `tsconfig.json` |

**Root cause:** Supabase types not regenerated after adding new tables. This single action would eliminate ~40 of the 56 `any` instances.

---

## 3. Security — 9/15

### Strengths

- Security headers properly set (X-Frame-Options, X-Content-Type-Options, etc.)
- RLS policies comprehensive across 30 tables
- No `dangerouslySetInnerHTML`, no `eval()`, no hardcoded secrets
- CSRF handled by Supabase auth cookies
- Rate limiting implemented (in-memory, single instance)
- All SQL queries parameterised via Supabase ORM
- GDPR-compliant account deletion flow

### Issues

| Issue | Severity | Location |
|---|---|---|
| Unprotected `/api/scout/discover` — no auth, anyone can scrape URLs | CRITICAL | `api/scout/discover/route.ts:52` |
| Default preview key hardcoded — `totalaud-preview-2025` if env var unset | CRITICAL | `middleware.ts:26-36` |
| Potential filter injection in scout search — user input in filter syntax | HIGH | `api/scout/route.ts:169` |
| Service role key via raw `process.env` bypassing validation | MEDIUM | `lib/supabase/serviceRole.ts:11-12` |
| TAP client uses raw `process.env` — 6 env vars unvalidated | MEDIUM | `lib/tap-client.ts:459-465` |
| Stripe client `!` non-null assertion without checking key exists | LOW | `lib/stripe/client.ts:14` |
| No Content-Security-Policy header | LOW | `middleware.ts` |

---

## 4. Code Quality & Patterns — 6/10

### Strengths

- All imports use `@/` aliases — zero deep relative imports
- 16 barrel exports properly scoped to feature areas
- Dynamic imports for workspace modes (code splitting)
- No lodash, moment, or heavyweight libraries
- `date-fns` used leanly (only `format` function)
- 147 instances of proper memoisation (`useCallback`, `useMemo`)

### Issues

| Issue | Severity | Count | Key Files |
|---|---|---|---|
| Components >450 lines need splitting | HIGH | 7 files | `TimelineCanvas` (653), `workspace/page.tsx` (629), `CoachingSession` (442) |
| Unsafe list keys (index on dynamic lists) | HIGH | 5-10 components | `CoachingSession:314`, `TimelineCanvas:429` |
| `console.log`/`error` not migrated to structured logger | MEDIUM | 7 active files | `TimelineToolbar:157`, `TemplateSelector:97`, `WaitlistForm:46` |
| ESLint too permissive — `no-console`, `no-unused-vars`, `no-explicit-any` OFF | MEDIUM | `eslint.config.js` |
| Stores >650 lines could be split | LOW | 3 stores | `usePitchStore` (861), `useIdeasStore` (654), `useTimelineStore` (652) |

---

## 5. Testing — 3/10

### Strengths

- Vitest infrastructure configured with proper setup
- 6 test files, 15/15 tests passing
- Store tests cover CRUD, filtering, persistence
- Playwright configured for E2E

### Issues

| Issue | Severity | Detail |
|---|---|---|
| Zero component tests | CRITICAL | 300+ components, none tested |
| Zero integration tests | HIGH | Cross-store interactions untested |
| Zero E2E tests running | HIGH | Playwright configured but no specs |
| Tests pass silently in CI (`continue-on-error: true`) | CRITICAL | `totalaudio-ci.yml` |
| No test coverage reporting | MEDIUM | No visibility into coverage |
| Critical paths untested | HIGH | Auth flow, credit deduction, pitch coaching, onboarding |

**This is the single biggest risk area.** A broken auth flow or credit deduction bug would reach production undetected.

---

## 6. Data Layer (Supabase) — 6/10

### Strengths

- Client setup correct — browser, server, and service-role properly isolated
- RLS enabled on 30 tables with proper `auth.uid()` policies
- 76 foreign key constraints with proper CASCADE rules
- Real-time subscriptions well-implemented with deduplication and cleanup
- Consistent auth session checking across API routes

### Issues

| Issue | Severity | Location |
|---|---|---|
| Missing tables referenced in code (`flow_telemetry`, `flow_hub_summary_cache`) | CRITICAL | `api/telemetry/batch/route.ts:113`, `api/flow-hub/summary/route.ts:49` |
| 31+ instances of `.select('*')` instead of specific columns | MEDIUM | Various API routes and stores |
| `Set<string>` in Zustand store does not serialise for persist | LOW | `useScoutStore.ts:57` |
| Error handling inconsistent across routes | LOW | Various |

---

## 7. UI/UX & Accessibility — 5/10

### Strengths

- Empty states comprehensive with variants per mode
- Loading states with skeletons and typing indicators
- Error boundaries with dev-mode detail expansion
- SEO metadata thorough — OpenGraph, Twitter cards, JSON-LD
- Image alt text descriptive throughout

### Issues

| Issue | Severity | Detail |
|---|---|---|
| No `prefers-reduced-motion` support anywhere | CRITICAL | Violates WCAG 2.3.3 |
| Colour contrast failures — footer text at 40% opacity | HIGH | `LandingFooter.tsx:33` |
| CSS transitions mixed with Framer Motion | MEDIUM | 10+ landing page instances |
| Inline styles dominate landing page instead of Tailwind | MEDIUM | `LandingPage.tsx`, `Hero.tsx`, `FeatureCard.tsx` |
| Hardcoded pixels not responsive | MEDIUM | Multiple landing components |
| Missing ARIA labels on interactive elements | MEDIUM | Sidebar, buttons |
| `lang="en"` should be `lang="en-GB"` | LOW | `layout.tsx` |

---

## 8. Build & CI/CD — 4/10

### Strengths

- Turborepo cache configuration correct
- Railway deployment solid with Nixpacks, frozen lockfile, health checks
- CodeRabbit auto-fix workflow well-implemented
- CODEOWNERS and PR template configured
- `.gitignore` comprehensive with secret-pattern matching

### Issues

| Issue | Severity | Location |
|---|---|---|
| TypeScript and ESLint build checks DISABLED | CRITICAL | `next.config.js` — `ignoreBuildErrors: true` |
| Tests `continue-on-error: true` in CI | CRITICAL | `totalaudio-ci.yml` |
| No build step in PR checks | HIGH | `ci.yml` — no `pnpm build` |
| No pre-commit hooks (Husky/lint-staged) | HIGH | Missing entirely |
| No security scanning (npm audit, Dependabot, Snyk) | HIGH | No workflow |
| No bundle size monitoring | MEDIUM | No analysis or limits |
| Lint `--max-warnings=9999` effectively disabled | MEDIUM | Root and aud-web `package.json` |

---

## 9. Documentation — 3/5

### Strengths

- CLAUDE.md is comprehensive and covers conventions, tokens, patterns
- PR template and CODEOWNERS configured
- `.env.example` thorough

### Issues

| Issue | Severity | Detail |
|---|---|---|
| 50+ outdated phase documentation files in project root | HIGH | `LANDING_PAGE_PHASE_5_COMPLETE.md`, etc. |
| CLAUDE.md references non-existent files | MEDIUM | `packages/ui/tokens/motion.ts` |
| Phase status outdated ("Phase 4.5") | MEDIUM | Codebase is past this |

---

## Top 10 Actions — Ranked by Impact

| # | Action | Category | Effort | Impact |
|---|---|---|---|---|
| 1 | Re-enable TypeScript and ESLint build checks in `next.config.js` | Build | Low | Prevents broken code reaching production |
| 2 | Add auth check to `/api/scout/discover` | Security | Low | Closes open scraping endpoint |
| 3 | Remove `continue-on-error: true` from CI test step | Build | Low | Makes test failures visible |
| 4 | Regenerate Supabase types | TypeScript | Low | Eliminates ~40 `any` casts in one go |
| 5 | Create missing database tables (`flow_telemetry`, `flow_hub_summary_cache`) | Data | Low | Fixes runtime errors on 3 endpoints |
| 6 | Add `prefers-reduced-motion` support | Accessibility | Medium | WCAG compliance |
| 7 | Add build verification step to CI (`pnpm build --filter=aud-web`) | Build | Low | Catches build failures before merge |
| 8 | Make preview key required in production (remove default) | Security | Low | Closes auth bypass |
| 9 | Add component tests for top 5 workspace components | Testing | Medium | Covers critical UI paths |
| 10 | Install Husky + lint-staged pre-commit hooks | Build | Low | Prevents lint/format issues at commit time |

Items 1-5 and 7-8 are low-effort, high-impact changes that could move the score from **54 to ~68-72** in a single focused sprint.

---

## Path to 80+

After the quick wins above:

- **Testing (3 to 7):** Component tests for workspace modes, integration tests for auth + credits, E2E specs for onboarding
- **Type Safety (8 to 12):** Zod on remaining 15 API routes, explicit response types, fix metadata typing
- **Accessibility (5 to 8):** prefers-reduced-motion, contrast fixes, ARIA labels, keyboard navigation
- **Code Quality (6 to 8):** Split 7 oversized components, migrate console.log, tighten ESLint
- **Build (4 to 8):** Pre-commit hooks, security scanning, bundle analysis, `--max-warnings=0`

---

## Conclusion

The codebase has good architectural bones and clear product intent. The main gap is operational discipline — the safety nets that catch problems before they reach production. Tightening those nets is where the biggest return on effort lives.
