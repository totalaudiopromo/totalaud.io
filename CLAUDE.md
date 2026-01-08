# Claude Code Configuration - totalaud.io

> Calm Creative Workspace for Independent Artists

---

## ⚠️ MANDATORY: SESSION START

**BEFORE doing anything else:**

1. `git status` - Check current state
2. `git fetch origin && git status` - Check if behind remote
3. If behind: Ask user "You're behind main by X commits. Shall I pull?"
4. If not on feature branch: Ask "Shall I create a new branch for this work?"
5. Then proceed with the user's request

---

## 🇬🇧 BRITISH ENGLISH

**MANDATORY** for all code, docs, UI copy, and comments.

| Use | Not |
|-----|-----|
| colour | color |
| behaviour | behavior |
| centre | center |
| optimise | optimize |
| organise | organize |

**Exception**: Keep framework conventions (`backgroundColor` in React, `text-center` in Tailwind).

---

## 🎨 DESIGN SYSTEM

### Colours
- **Accent**: Slate Cyan `#3AA9BE`
- **Background**: Matte Black `#0F1113`
- **Foreground**: Light Grey/White (theme-dependent)

### Motion Tokens (Framer Motion only)
```typescript
fast: '120ms cubic-bezier(0.22, 1, 0.36, 1)'    // Micro feedback
normal: '240ms cubic-bezier(0.22, 1, 0.36, 1)'  // Pane transitions
slow: '400ms ease-in-out'                        // Calm fades
```

### Typography (Geist fonts via next/font)
```typescript
// ✅ Correct
fontFamily: 'var(--font-geist-sans), system-ui, sans-serif'
fontFamily: 'var(--font-geist-mono), monospace'
className="font-sans"  // Tailwind

// ❌ Never use
fontFamily: 'var(--font-inter, ...)'  // Doesn't exist
fontFamily: 'Inter'                    // Not loaded
```

### Responsive
- Mobile-first always
- Use Tailwind utilities (`sm:`, `md:`, `lg:`, `xl:`)
- Never hardcode media queries

---

## 🔧 GIT CONVENTIONS

### Branch Naming
| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/{scope}-{desc}` | `feature/landing-scrollflow` |
| Fix | `fix/{bug-summary}` | `fix/api-auth-headers` |
| Refactor | `refactor/{area}` | `refactor/presence-hook` |
| Style | `style/{ui-update}` | `style/landing-colours` |

### Commit Messages
```
type(scope): short summary

Examples:
feature(landing): add scrollflow cinematic transitions
fix(api): resolve Supabase auth token issue
```

Rules: British spelling, descriptive, one logical change per commit, no emojis.

---

## 🎯 PROJECT OVERVIEW

**Purpose**: Calm, minimal workspace for independent artists
**Live URL**: https://totalaud.io
**Status**: Phase 7 Complete - Beta Release Ready

### Four Core Modes
1. **Ideas Mode** — capture & organise creative/marketing ideas
2. **Scout Mode** — discover opportunities (playlists, blogs, radio, press)
3. **Timeline Mode** — plan release actions visually
4. **Pitch Mode** — craft narratives and bios with AI coaching

### Tech Stack
- Next.js 15.0.3 (App Router) + React 18.3.1
- TypeScript 5.6.3 (strict mode)
- Tailwind CSS 3.4.1 + Framer Motion 11.11.17
- Zustand 5.0.2 + Supabase
- Turborepo + pnpm workspace
- Deployment: Railway

---

## 🏗️ PROJECT STRUCTURE

```
totalaud.io/
├── apps/aud-web/src/
│   ├── app/                  # Next.js 15 app router
│   │   └── workspace/        # 4-mode workspace
│   ├── components/
│   │   ├── workspace/        # Mode-specific (ideas/, scout/, timeline/, pitch/)
│   │   └── landing/          # Landing page
│   ├── lib/                  # Utilities (env.ts, logger.ts, api-validation.ts)
│   ├── hooks/                # Custom React hooks
│   └── stores/               # Zustand stores
├── packages/core/
│   ├── supabase/             # Supabase client
│   ├── schemas/              # Shared TypeScript types
│   └── ai-provider/          # AI integration
└── .claude/skills/           # Creative Crew agents
```

---

## 🚀 DESSA + DICEE FRAMEWORKS

### DESSA (Workflow Efficiency)
| Step | Action |
|------|--------|
| **D**elete | Remove unnecessary steps |
| **E**dit | Streamline components |
| **S**implify | Reduce choices |
| **S**peed | Pre-fetch, cache |
| **A**utomate | AI-assisted workflows |

### DICEE (Experience Polish)
| Principle | Implementation |
|-----------|----------------|
| **D**eep | Rich detail when drilling in |
| **I**ndulgent | Satisfying micro-interactions |
| **C**omplete | No empty states |
| **E**legant | Minimal chrome |
| **E**motive | Human, encouraging copy |

> **DESSA decides what exists. DICEE decides how it feels.**

---

## 🎯 DEVELOPMENT WORKFLOW

### Mandatory Patterns for New Code

```typescript
// 1. Structured logging
import { logger } from '@/lib/logger';
const log = logger.scope('ComponentName');

// 2. Validated env vars
import { env } from '@/lib/env';
const apiKey = env.ANTHROPIC_API_KEY;

// 3. API validation
import { validateRequestBody } from '@/lib/api-validation';
const body = await validateRequestBody(req, schema);
```

### Pre-Commit
```bash
pnpm format && pnpm lint && pnpm typecheck
cd apps/aud-web && pnpm test
```

### Development Commands
```bash
pnpm dev                    # Start dev server
pnpm build                  # Build all
pnpm lint:fix               # Fix lint issues
pnpm format                 # Format code
cd apps/aud-web && pnpm test  # Run tests
```

### Railway Deployment
```bash
railway up                  # Deploy
railway logs                # View logs
railway domain              # View domain
```

---

## 🤖 CREATIVE CREW (Agent System)

**Dan** orchestrates 11 specialist agents in `.claude/skills/`:

| Agent | Specialty |
|-------|-----------|
| Ideas Curator | Organisation, tagging, canvas |
| Scout Navigator | Opportunity discovery |
| Timeline Planner | Release planning |
| Pitch Coach | Narrative crafting |
| Quality Lead | Testing, mobile UX, a11y |
| State Architect | Zustand stores |
| Route Builder | API routes, Zod |
| Motion Director | Framer Motion |
| Discovery Specialist | Contact enrichment |
| Supabase Engineer | RLS, migrations |

Invoke Dan for tasks requiring 2+ specialists.

---

## 🤖 CLAUDE CODE BEHAVIOUR

### Always
1. Read CLAUDE.md before editing
2. Verify git status before changes
3. Follow design + motion tokens
4. Use Framer Motion (NOT CSS transitions)
5. Test on mobile breakpoints
6. Format with Prettier + ESLint

### Animation Rules
- Framer Motion required for all motion
- Motion tokens only: 120ms/240ms/400ms
- `useScroll` + `useTransform` for scroll effects
- Consistent easing: `cubic-bezier(0.22, 1, 0.36, 1)`

### Component Naming
- Prefix with **Studio** or **Flow** for `/components/ui`
- PascalCase for components, kebab-case for utils/hooks

---

## 🎯 PROJECT PHILOSOPHY

**Core Principles**:
- Calm, not chaotic
- Minimal, not overwhelming
- Guided, not empty
- Artist-first
- Mobile-ready
- Beautifully crafted

**What We DON'T Build**:
- ❌ Complex multi-agent OS workflows
- ❌ OS themes (XP/Aqua/ASCII) — archived
- ❌ Elaborate dashboards
- ❌ Full CRM functionality

---

## 📚 DETAILED DOCUMENTATION

| Document | Contents |
|----------|----------|
| [PRD.md](PRD.md) | Full product requirements |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Commands and patterns |
| [BROWSER_AUTOMATION_GUIDE.md](BROWSER_AUTOMATION_GUIDE.md) | Puppeteer MCP |
| [VISUAL_CONTEXT_WORKFLOW.md](VISUAL_CONTEXT_WORKFLOW.md) | Chrome DevTools MCP |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Code quality details |
| [CLAUDE_ARCHIVE.md](CLAUDE_ARCHIVE.md) | Historical/archived content |

---

**Last Updated**: January 2026
**Status**: Phase 7 Complete - Beta Release Ready
**Live URL**: https://totalaud.io
