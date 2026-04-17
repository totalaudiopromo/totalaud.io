# Claude Code Configuration -- totalaud.io

**A thinking and finishing system for independent artists**

---

## VISION ALIGNMENT (READ FIRST)

> totalaud.io is a calm, opinionated system that helps independent artists finish their music, understand what matters, and release with confidence.

**Canonical Source**: [`docs/VISION.md`](docs/VISION.md) -- supersedes all prior docs.

### Hard Rules

1. **Never introduce "AI agent" language** -- Use "perspectives" instead
2. **Never resurrect OS metaphors** -- ascii, xp, aqua, daw, analogue are archived
3. **Decision support > Automation** -- Help artists think, not replace their thinking
4. **Finishing notes > Quality scores** -- No judgement, only insight
5. **Claude is the reasoning layer, not the product** -- Keep invisible to users

### Product Pillars

| Pillar | Intent |
|--------|--------|
| **Finish** | Finishing notes from producer, mix, listener, industry perspectives |
| **Release** (Timeline) | Multi-week narrative planning, sequencing, momentum |
| **Leverage** (Intel) | Relationships as creative capital -- memory, context, people |
| **Pitch** | Single source of narrative truth, consistency checker |

### Brand Voice

Use: "second opinion", "finishing notes", "what matters", "release with confidence"
Avoid: "AI-powered", "revolutionary", "game-changing", "agents", corporate SaaS language

---

## SESSION START

**Before any work, Claude Code must:**

1. Check `git status`
2. If on main: `git fetch origin && git status` -- offer to pull if behind
3. If not on a feature branch: offer to create one
4. Then proceed with request

---

## BRITISH ENGLISH

**Mandatory** for all code, docs, UI copy, and comments.

Key differences: colour, behaviour, centre, optimise, analyse, organise, visualise, recognise, licence (noun)/license (verb), practise (verb)/practice (noun).

Use British spelling in human-readable variable names. Exception: keep framework conventions (`backgroundColor` in React props, Tailwind classes).

---

## DESIGN SYSTEM

### Colours
- **Accent**: Slate Cyan `#3AA9BE`
- **Background**: Matte Black `#0F1113`
- **Glow**: `text-shadow: 0 0 40px rgba(58, 169, 190, 0.15)`

### Motion Tokens (Framer Motion only, NOT CSS transitions)
- **Fast** (micro feedback): `120ms cubic-bezier(0.22, 1, 0.36, 1)`
- **Normal** (pane transitions): `240ms cubic-bezier(0.22, 1, 0.36, 1)`
- **Slow** (calm fades): `400ms ease-in-out`

### Typography
- **Primary**: Geist Sans -- `var(--font-geist-sans)` / `className="font-sans"`
- **Monospace**: Geist Mono -- `var(--font-geist-mono)` / `className="font-mono"`
- Never reference `--font-inter`, never hardcode font names, never import from Google CDN

### Responsive
- Mobile-first always. Use Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- Never hardcode media queries

---

## GIT WORKFLOW

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/{scope}-{desc}` | `feature/landing-scrollflow` |
| Fix | `fix/{bug-summary}` | `fix/api-auth-headers` |
| Refactor | `refactor/{area}` | `refactor/presence-hook` |
| Style | `style/{ui-update}` | `style/landing-colours` |

### Commits
Format: `type(scope): short summary` -- British spelling, no emojis, one logical change per commit.

---

## PROJECT OVERVIEW

**Live URL**: https://totalaud.io
**Deployment**: Railway (not Vercel -- monorepo detection issues)
**Vision**: [`docs/VISION.md`](docs/VISION.md)

### Tech Stack
- Next.js 15.0.3 (App Router), React 18.3.1, TypeScript 5.6.3 (strict)
- Tailwind CSS 3.4.1, Framer Motion 11.11.17, Zustand 5.0.2
- Supabase (auth, DB, RLS), Stripe (billing)
- Turborepo + pnpm workspace

### Project Structure
```
apps/aud-web/src/
  app/              # Next.js app router (workspace/, landing, auth, api/)
  components/       # workspace/{ideas,scout,timeline,pitch,finish}/, landing/
  stores/           # Zustand stores (ideas, scout, timeline, pitch, user profile)
  hooks/            # Custom React hooks
  lib/              # Utilities (logger, env, api-validation, supabase)
packages/core/      # supabase/, schemas/, ai-provider/, integrations/
_archive/           # Archived packages, docs, specs
```

---

## DEVELOPMENT COMMANDS

```bash
pnpm dev                              # Dev server (all apps)
pnpm build                            # Production build
pnpm typecheck                        # TypeScript checking
pnpm lint && pnpm lint:fix            # ESLint
pnpm format && pnpm format:check      # Prettier
pnpm test                             # Vitest unit tests
pnpm test:e2e                         # Playwright e2e
```

### Pre-commit
```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm test
```

---

## RAILWAY CONFIGURATION

**Build**: `pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build`
**Start**: `cd apps/aud-web && pnpm start`
**Config**: `railway.json`
**Live URL**: https://totalaud.io
**Railway Domain**: https://aud-web-production.up.railway.app

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV`, `TAP_API_KEY`, `TAP_API_URL`.

---

## CODE PATTERNS (for new code)

### Structured Logging
```typescript
import { logger } from '@/lib/logger'
const log = logger.scope('ComponentName')
log.info('message', { context })
```

### Environment Variables
```typescript
import { env } from '@/lib/env'  // Type-safe, validated at startup
```

### API Validation
```typescript
import { validateRequestBody } from '@/lib/api-validation'
const body = await validateRequestBody(req, schema)
```

### Supabase Client in Route Handlers
```typescript
// In app/api/**/route.ts -- ALWAYS use Route client, NOT Server client
import { createRouteSupabaseClient } from '@/lib/supabase/server'
const supabase = await createRouteSupabaseClient()
```

### Gradual Migration
When touching existing files: replace `console.log` with `logger`, add Zod validation to API routes, replace `any` types.

---

## BROWSER AUTOMATION (MCP)

- **Chrome DevTools MCP**: Screenshots, DOM snapshots, console logs, network inspection
- **Claude-in-Chrome MCP**: Navigation, clicking, form filling, scraping

---

**Last Updated**: April 2026
