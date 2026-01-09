# Claude Code Configuration — totalaud.io

**A thinking and finishing system for independent artists**

---

## 🚨 CRITICAL: VISION ALIGNMENT (READ FIRST)

**Before any work, understand the product direction:**

> totalaud.io is a calm, opinionated system that helps independent artists finish their music, understand what matters, and release with confidence.

**Canonical Source**: [`docs/VISION.md`](docs/VISION.md) — this supersedes all prior docs.

### Hard Rules (Non-Negotiable)

1. **Never introduce "AI agent" language** — Use "perspectives" instead
2. **Never resurrect OS metaphors** — ascii, xp, aqua, daw, analogue are archived
3. **Perspectives > Agents** — User-facing language is always human-framed
4. **Decision support > Automation** — We help artists think, not replace their thinking
5. **Finishing notes > Quality scores** — No judgement, only insight
6. **Claude is the reasoning layer, not the product** — Keep this invisible to users

### Product Pillars

| Pillar | Intent | Frame As |
|--------|--------|----------|
| **Finish** | Help artists finish with confidence | Finishing notes, perspectives, release readiness |
| **Release** | Multi-week narrative planning | Sequencing, momentum, fewer/better releases |
| **Leverage** | Relationships as creative capital | Memory, context, people (not lists or scraping) |
| **Pitch** | Single source of narrative truth | Editor, consistency checker, tone guardian |

### Claude's Role in Intel

Intel uses Claude's **Excel/spreadsheet skill** to:
- Clean, enrich, and reason over contact data
- Spot patterns in engagement over time
- Summarise relationship signals in plain English
- Help users understand who actually matters

**Frame as**: Intelligence and recall, NOT "AI automation".

### Brand Voice

✅ **Use**: "second opinion", "finishing notes", "what matters", "release with confidence", "stop guessing"  
❌ **Avoid**: "AI-powered", "revolutionary", "game-changing", "agents", corporate SaaS language

---

## ⚠️ MANDATORY: START EVERY SESSION HERE

**BEFORE doing ANYTHING else, Claude Code MUST:**

1. **Check git status:**
   ```bash
   git status
   ```

2. **If on main branch, check if behind remote:**
   ```bash
   git fetch origin
   git status
   ```

3. **If behind, ask user:** "You're behind main by X commits. Shall I pull the latest changes?"

4. **If user agrees, pull:**
   ```bash
   git pull origin main
   ```

5. **Check if on a feature branch. If not, ask:** "Shall I create a new branch for this work?"

6. **Then proceed with the user's request.**

**User should just say:** "I'm ready to work on [feature]" and Claude Code handles the git workflow automatically.

---

## 🇬🇧 BRITISH ENGLISH REQUIREMENT

**MANDATORY**: All code, documentation, UI copy, and comments MUST use British English spelling.

**Common Differences**:
- ✅ `colour` (not color)
- ✅ `behaviour` (not behavior)
- ✅ `centre` (not center)
- ✅ `optimise` (not optimize)
- ✅ `analyse` (not analyze)
- ✅ `organise` (not organize)
- ✅ `visualise` (not visualize)
- ✅ `recognise` (not recognize)
- ✅ `licence` (noun), `license` (verb)
- ✅ `practise` (verb), `practice` (noun)

**Code Variables**: Use British spelling where human-readable:
```typescript
// ✅ Correct
const backgroundColour = '#0F1113'
const userBehaviour = 'active'
const optimisePerformance = () => {}

// ❌ Incorrect
const backgroundColor = '#0F1113'
const userBehavior = 'active'
const optimizePerformance = () => {}
```

**Exception**: Keep framework/library conventions:
```typescript
// ✅ Keep React/CSS conventions
style={{ backgroundColor: 'red' }}  // React prop name
.text-center { }                    // Tailwind class
```

**Documentation**: ALL markdown files, comments, and UI strings use British English.

---

## 🎨 DESIGN SYSTEM & STYLE TOKENS

**Status**: Phase 4.5 - Scroll Flow Enhancements (Landing Page)

### Colour Palette
- **Accent**: Slate Cyan `#3AA9BE`
- **Background**: Matte Black `#0F1113`
- **Foreground**: Light Grey/White (theme-dependent)
- **Border**: Subtle grey variations

### Motion & Animation Tokens
All animations use Framer Motion (NOT CSS transitions):

```typescript
// Motion tokens (from /packages/ui/tokens/motion.ts)
const motionTokens = {
  fast: '120ms cubic-bezier(0.22, 1, 0.36, 1)',    // Micro feedback
  normal: '240ms cubic-bezier(0.22, 1, 0.36, 1)',  // Pane transitions
  slow: '400ms ease-in-out',                        // Calm fades
  glow: 'text-shadow: 0 0 40px rgba(58, 169, 190, 0.15)'
}
```

**Animation Guidelines**:
- Use `useScroll` + `useTransform` for cinematic scroll effects
- Maintain consistent easing curves (120/240/400ms)
- All scroll-based animations in landing page
- Micro-interactions use 120ms for instant feedback
- Modal/pane transitions use 240ms
- Ambient/atmospheric effects use 400ms

### Typography & Font System

totalaud.io uses **Geist** fonts loaded via Next.js `next/font/google`:

- **Primary**: Geist Sans → CSS variable `--font-geist-sans`
- **Monospace**: Geist Mono → CSS variable `--font-geist-mono`

**Inline Styles (for components with style props):**

```typescript
// ✅ Correct - uses CSS variable with fallback
fontFamily: 'var(--font-geist-sans), system-ui, sans-serif'
fontFamily: 'var(--font-geist-mono), monospace'

// ❌ Wrong - undefined variable (was a bug we fixed)
fontFamily: 'var(--font-inter, ...)'

// ❌ Wrong - hardcoded font name (font may not be loaded)
fontFamily: 'JetBrains Mono'
fontFamily: 'Inter'
```

**Tailwind Classes (preferred where possible):**

```typescript
// ✅ Correct - uses design system
className="font-sans"  // Uses --font-geist-sans
className="font-mono"  // Uses --font-geist-mono
```

**Never Do:**

- ❌ Reference `--font-inter` (doesn't exist)
- ❌ Hardcode font names like `'Inter'` or `'JetBrains Mono'`
- ❌ Create new font CSS variables
- ❌ Import fonts from Google CDN directly (use next/font)

**Text Settings:**

- **Line Height**: 1.4–1.6
- **Max Width**: 70ch (optimal reading)

### Responsive Design
- **Mobile-first**: Always design for mobile first
- **Breakpoints**: Use Tailwind utilities (`sm:`, `md:`, `lg:`, `xl:`)
- **Never hardcode media queries** - use Tailwind responsive classes

---

## 🔧 GIT WORKFLOW & BRANCH NAMING

### Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/{scope}-{desc}` | `feature/landing-scrollflow` |
| Fix | `fix/{bug-summary}` | `fix/api-auth-headers` |
| Refactor | `refactor/{area}` | `refactor/presence-hook` |
| Style | `style/{ui-update}` | `style/landing-colours` |

**Rule**: Each branch represents one clear functional change

### Commit Message Convention

```
type(scope): short summary

Examples:
feature(landing): add scrollflow cinematic transitions
fix(api): resolve Supabase auth token issue
style(ui): update accent glow for Slate Cyan
refactor(hooks): extract presence logic to custom hook
```

**Rules**:
- ✅ British spelling
- ✅ Descriptive, not verbose
- ✅ Each commit = one logical change
- ❌ No emojis in commit messages

---

## 🎯 PROJECT OVERVIEW

**Project**: totalaud.io — Thinking & Finishing System for Independent Artists  
**Location**: `/Users/chrisschofield/workspace/active/totalaud.io`  
**Status**: Vision Reset — January 2026  
**Purpose**: A calm, opinionated system that helps independent artists finish their music, understand what matters, and release with confidence  
**Live URL**: <https://totalaud.io>  
**Vision**: See [`docs/VISION.md`](docs/VISION.md) for canonical product direction  
**PRD**: See [PRD.md](PRD.md) for product requirements (being updated to align with Vision)

### What totalaud.io IS

- A **second opinion** before release
- A **finishing mirror** for music and strategy
- A **decision-support system**, not an automation machine
- A **calm, respectful space** for artists to think clearly

### What totalaud.io is NOT

- ❌ Not an "AI music critic"
- ❌ Not an auto-producer or mastering replacement
- ❌ Not a generic all-in-one SaaS dashboard
- ❌ Not hype-driven or growth-hack oriented

### Four Product Pillars

1. **Finish** — Finishing notes from producer, mix, listener, industry perspectives
2. **Release** (Timeline) — Multi-week narrative planning, not just scheduling
3. **Leverage** (Intel) — Relationships as creative capital, memory not scraping
4. **Pitch** — Single source of narrative truth, consistency across all copy

**Tech Stack**:
- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.6.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **State**: Zustand 5.0.2
- **Database**: Supabase
- **Animation**: Framer Motion 11.11.17
- **Build**: Turborepo + pnpm workspace
- **Deployment**: Railway

---

## 🚀 DESSA + DICEE FRAMEWORKS

**Status**: Phase 1 Complete (January 2025)

totalaud.io uses two complementary frameworks for efficiency and experience:

### DESSA (Workflow Efficiency)

Elon Musk's efficiency algorithm applied to all workspace modes:

| Step | Action |
|------|--------|
| **D**elete | Remove unnecessary steps from processes |
| **E**dit | Streamline remaining components |
| **S**implify | Reduce choices and cognitive load |
| **S**peed | Pre-fetch, cache, optimistic updates |
| **A**utomate | AI-assisted workflows where possible |

### DICEE (Experience Polish)

UX framework ensuring remaining interactions are delightful:

| Principle | Implementation |
|-----------|----------------|
| **D**eep | Rich detail when drilling in |
| **I**ndulgent | Satisfying micro-interactions |
| **C**omplete | No empty states, everything filled |
| **E**legant | Minimal chrome, focused UI |
| **E**motive | Human, encouraging copy |

### Current Mode Configurations

**Ideas Mode** (3 tags):
```typescript
type IdeaTag = 'content' | 'brand' | 'promo'
```

**Scout Mode** (6 smart presets):
```typescript
const SMART_PRESETS = ['All', 'Radio', 'Playlists', 'Press', 'Blogs', 'Curators']
```

**Timeline Mode** (3 lanes):
```typescript
type LaneType = 'pre-release' | 'release' | 'post-release'
```

**Pitch Mode** (3 sections):
```typescript
const SECTIONS = ['The Hook', 'Your Story', 'The Ask']
```

### Step Reduction Achieved

| Mode | Before | After | Reduction |
|------|--------|-------|-----------|
| Ideas | 7 steps | 3 steps | 57% |
| Scout | 8 steps | 3 steps | 63% |
| Timeline | 9 steps | 2 steps | 78% |
| Pitch | 12 steps | 3 steps | 75% |
| **Total** | **36** | **11** | **69%** |

### Key Principle

> **DESSA decides what exists. DICEE decides how it feels.**

Delete ruthlessly, then make what remains exceptional.

---

## 🏗️ PROJECT STRUCTURE

```
totalaud.io/
├── apps/
│   └── aud-web/              # Main workspace app
│       ├── src/
│       │   ├── app/          # Next.js 15 app router
│       │   │   └── workspace/  # 4-mode workspace (Ideas, Scout, Timeline, Pitch)
│       │   ├── components/
│       │   │   ├── workspace/  # Mode-specific components
│       │   │   │   ├── ideas/    # Ideas Mode (canvas, list, toolbar)
│       │   │   │   ├── scout/    # Scout Mode (filters, grid, cards)
│       │   │   │   ├── timeline/ # Timeline Mode (blocks, widget)
│       │   │   │   └── pitch/    # Pitch Mode (editor, coach)
│       │   │   └── landing/    # Landing page components
│       │   ├── lib/          # Utilities and helpers
│       │   ├── hooks/        # Custom React hooks
│       │   └── stores/       # Zustand state (ideas, scout, timeline, pitch)
│       └── package.json
├── packages/
│   └── core/
│       ├── supabase/         # Supabase client & utilities (KEEP)
│       ├── schemas/          # Shared TypeScript types (KEEP)
│       ├── ai-provider/      # AI integration for Pitch Mode (KEEP)
│       └── integrations/     # External API integrations (KEEP)
├── _archive/
│   └── packages/             # Archived OS/agent packages
│       ├── operator-os/      # OS personality system (archived)
│       ├── operator-boot/    # Boot sequence system (archived)
│       ├── theme-engine/     # Theme switching (archived)
│       ├── skills-engine/    # Agent skills (archived)
│       └── agent-executor/   # Multi-agent workflows (archived)
└── package.json              # Monorepo root
```

---

## ✅ CODE QUALITY INFRASTRUCTURE (October 2025)

**Status**: ✅ **COMPLETE** - All critical audit recommendations implemented
**Test Results**: 15/15 passing tests
**Purpose**: Production-ready quality tooling for experimental project

### 🎯 What's Been Implemented

#### 1. ESLint & Prettier (Automated Code Quality)
- **ESLint**: TypeScript + React + Next.js + Web Audio API support
- **Prettier**: Consistent code formatting
- **Config Files**: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`

**Commands:**
```bash
pnpm lint              # Check for code quality issues
pnpm lint:fix          # Auto-fix linting issues
pnpm format            # Format all code with Prettier
pnpm format:check      # Check formatting without modifying
```

#### 2. Environment Variable Validation (Type-Safe Config)
- **File**: `apps/aud-web/src/lib/env.ts`
- **Purpose**: Validates all required environment variables on startup
- **Prevents**: Runtime crashes from missing env vars

**Usage Pattern:**
```typescript
// ❌ DON'T: Unsafe, could be undefined
const apiKey = process.env.ANTHROPIC_API_KEY;

// ✅ DO: Type-safe, validated at startup
import { env } from '@/lib/env';
const apiKey = env.ANTHROPIC_API_KEY;
```

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional (Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback
```

#### 3. Structured Logging (Production-Ready Debugging)
- **File**: `apps/aud-web/src/lib/logger.ts`
- **Purpose**: Replace console.log with structured, level-based logging
- **Tested**: 7 passing tests

**Usage Pattern:**
```typescript
// ❌ DON'T: Unstructured console logging
console.log('User logged in:', userId);
console.error('Error:', error);

// ✅ DO: Structured logging with context
import { logger } from '@/lib/logger';

logger.debug('Detailed debug info', { userId, sessionId });  // Dev only
logger.info('User logged in', { userId });                   // Dev only
logger.warn('Rate limit approaching', { requests: 95 });     // Always shown
logger.error('Authentication failed', error, { userId });    // Always shown

// Scoped logger for components/modules
const log = logger.scope('BrokerChat');
log.debug('Message sent', { messageId: '123' });
log.warn('Connection unstable');
```

**Log Levels:**
- `debug`: Development only, detailed debugging
- `info`: General information (development only)
- `warn`: Warnings (always shown)
- `error`: Errors (always shown)

#### 4. API Input Validation (Type-Safe APIs)
- **File**: `apps/aud-web/src/lib/api-validation.ts`
- **Purpose**: Validate API request bodies and params with Zod
- **Tested**: 8 passing tests

**Usage Pattern:**
```typescript
// ❌ DON'T: No validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body.name; // Could be anything!
}

// ✅ DO: Validated and type-safe
import { z } from 'zod';
import { validateRequestBody } from '@/lib/api-validation';
import { logger } from '@/lib/logger';

const log = logger.scope('MyAPI');

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await validateRequestBody(req, schema);
    log.info('Request validated', { name: body.name });
    // ... your logic
  } catch (error) {
    log.error('Validation failed', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// OR use the handler wrapper for cleaner code
import { createApiHandler } from '@/lib/api-validation';

export const POST = createApiHandler({
  bodySchema: schema,
  handler: async ({ body }) => {
    return { success: true, data: body };
  },
});
```

**Common Validation Schemas:**
```typescript
import { commonSchemas } from '@/lib/api-validation';

// Pagination
commonSchemas.pagination.parse({ page: '2', limit: '10' });

// UUID validation
commonSchemas.id.parse({ id: 'uuid-string' });

// Message validation
commonSchemas.message.parse({ content: 'Hello world' });

// Flow creation
commonSchemas.flowCreate.parse({
  goal: 'Release single',
  flowType: 'radio-promo'
});
```

**Example Migration**: See `apps/aud-web/src/app/api/flows/route.ts`

#### 5. Local Fonts (GDPR Compliant)
- **Changed**: Removed Google Fonts CDN
- **Using**: @fontsource packages (local fonts)
- **File**: `apps/aud-web/src/app/globals.css`
- **Fonts**: Inter (300, 400, 500, 600, 700), JetBrains Mono (400, 500, 600)

**Benefits:**
- ✅ GDPR compliant (no data sent to Google)
- ✅ Faster loading (no external requests)
- ✅ Works offline
- ✅ Better privacy

#### 6. Testing Infrastructure (Vitest + React Testing Library)
- **Config**: `apps/aud-web/vitest.config.ts`
- **Setup**: `apps/aud-web/src/test/setup.ts`
- **Test Files**: `apps/aud-web/src/lib/__tests__/`

**Commands (from apps/aud-web):**
```bash
pnpm test              # Run tests once
pnpm vitest            # Watch mode
pnpm test:ui           # Visual test UI
pnpm test:coverage     # Coverage report
```

**Writing Tests:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**Test Status**: 15/15 passing tests

---

## 📚 DOCUMENTATION

All detailed documentation is in the project root:

- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Step-by-step migration instructions
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation details
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command and pattern quick reference
- **[AUDIT_IMPLEMENTATION_COMPLETE.md](AUDIT_IMPLEMENTATION_COMPLETE.md)** - Final status report

---

## 🎯 DEVELOPMENT WORKFLOW

### For New Code (Mandatory Patterns)

1. **Use structured logging**:
   ```typescript
   import { logger } from '@/lib/logger';
   const log = logger.scope('ComponentName');
   ```

2. **Use validated environment variables**:
   ```typescript
   import { env } from '@/lib/env';
   const apiKey = env.ANTHROPIC_API_KEY;
   ```

3. **Validate API inputs**:
   ```typescript
   import { validateRequestBody } from '@/lib/api-validation';
   const body = await validateRequestBody(req, schema);
   ```

4. **Write tests for new features**:
   ```bash
   # Create __tests__ folder next to your component/utility
   ```

5. **Format before committing**:
   ```bash
   pnpm format && pnpm lint:fix
   ```

### For Existing Code (Gradual Migration)

Migrate as you touch files (no rush):

- Replace `console.log` with `logger` (110+ instances)
- Add Zod validation to API routes (12 routes remaining)
- Replace `any` types with proper TypeScript types (58 instances)
- Add tests for critical features

**Rule**: Improve code quality in files you're already modifying

---

## 🚨 PRE-COMMIT CHECKLIST

Before committing code changes:
```bash
pnpm format           # Format code
pnpm lint             # Check for issues
pnpm typecheck        # Verify TypeScript
cd apps/aud-web && pnpm test  # Run tests
```

---

## 📊 CODE QUALITY STATUS

| Item | Status | Progress |
|------|--------|----------|
| ESLint/Prettier | ✅ Configured | 100% |
| Env Validation | ✅ Complete | 100% |
| Logger Utility | ✅ Complete + Tested | 100% |
| API Validation | ✅ Utilities Ready | 8% (1/13 routes) |
| Local Fonts | ✅ GDPR Compliant | 100% |
| Test Infrastructure | ✅ 15 Tests Passing | Foundation |
| console.log migration | 🔄 Gradual | 0% (110+ instances) |
| any type fixes | 🔄 Gradual | 0% (58 instances) |

---

## 🎓 KEY PRINCIPLES

1. **Use new patterns in ALL new code** (mandatory)
2. **Migrate existing code gradually** (as you touch files)
3. **Run format + lint before committing** (prevents issues)
4. **Write tests for new features** (builds confidence)
5. **Document complex logic** (helps future you)
6. **Experiment freely** (this is a sandbox!)

---

## 🔧 INTERNAL: DEVELOPMENT SKILLS (Not Product-Facing)

**⚠️ Important**: This section describes Claude Code's internal development capabilities.
These are **NOT** product features and should **NEVER** be exposed to users.
User-facing language uses "perspectives", not "agents". See [docs/VISION.md](docs/VISION.md).

**Status**: Active - Development skills for Claude Code

### The Orchestrator

**Dan** coordinates all work across the Creative Crew. Describe what you need in plain English, Dan automatically delegates to the right specialist agents, runs them in parallel, and synthesises results.

**Invoke Dan when**:
- Task requires 2+ specialist agents
- Multiple independent subtasks can run parallel
- Deep specialised knowledge needed
- Task will take >15 minutes

### Core Mode Agents

| Agent | Mode | Specialty | Triggers |
|-------|------|-----------|----------|
| **Ideas Curator** | Ideas | Organisation, tagging, canvas layouts | "organise", "ideas", "canvas" |
| **Scout Navigator** | Scout | Opportunity discovery, filtering | "find", "opportunities", "playlists" |
| **Timeline Planner** | Timeline | Release planning, scheduling | "plan", "release", "schedule" |
| **Pitch Coach** | Pitch | Narrative crafting, bio writing | "bio", "pitch", "describe" |

### Technical Specialists

| Agent | Specialty | Triggers |
|-------|-----------|----------|
| **Quality Lead** | Testing, mobile UX, accessibility | "test", "mobile", "QA" |
| **State Architect** | Zustand stores, sync patterns | "store", "state", "zustand" |
| **Route Builder** | API routes, Zod validation | "api", "route", "endpoint" |
| **Motion Director** | Framer Motion, animation tokens | "animation", "motion" |
| **Discovery Specialist** | Contact classification, GDPR | "contacts", "enrich", "verify" |
| **Supabase Engineer** | RLS policies, migrations | "database", "supabase", "rls" |

### Global Skills (Available Across All Projects)

These skills work in any project directory:

- `systematic-debugging` - Bug investigation framework
- `brainstorming` - Idea refinement before implementation
- `test-runner` - Test suite execution
- `mobile-first-validator` - Mobile UX standards
- `accessibility-validator` - WCAG compliance
- `changelog-generator` - Release notes generation

### Skill Files Location

All Creative Crew skills are in `.claude/skills/`:

```text
.claude/skills/
├── dan/                    # Orchestrator
├── ideas-curator/          # Ideas Mode
├── scout-navigator/        # Scout Mode
├── timeline-planner/       # Timeline Mode
├── pitch-coach/            # Pitch Mode
├── quality-lead/           # Testing & QA
├── state-architect/        # Zustand stores
├── route-builder/          # API routes
├── motion-director/        # Animations
├── discovery-specialist/   # Contact enrichment
└── supabase-engineer/      # Database
```

### Example Usage

**Feature development**:
```
"Build the Scout Mode filter panel"
→ Dan activates: Scout Navigator, State Architect, Route Builder, Supabase Engineer
→ All run in parallel
→ Total time = slowest task (not sum of all)
```

**Pre-deployment**:
```
"Prepare for deployment"
→ Dan activates: Quality Lead, Motion Director, State Architect
→ Parallel QA checks
→ 3-4x faster than sequential
```

---

## 🤖 CLAUDE CODE BEHAVIOUR RULES

### For Every Development Session

Claude Code should **always**:

1. **Read CLAUDE.md and .cursorrules before editing** - Load project context first
2. **Verify Git status before every change** - Check for uncommitted work
3. **Use branch naming conventions** - Follow the format table above
4. **Follow design + motion tokens when styling** - Use the design system
5. **Maintain consistent easing curves** - 120ms/240ms/400ms only
6. **Format with Prettier + ESLint** - No `any` types allowed
7. **Use Framer Motion for animation** - NOT CSS transitions
8. **Test on mobile breakpoints before completion** - Mobile-first approach

### Component Development Workflow

When building UI components:

1. **Write component code** using design tokens
2. **Use Framer Motion** for all animations (`useScroll`, `useTransform`)
3. **Apply motion tokens** - 120ms (micro), 240ms (transition), 400ms (ambient)
4. **Follow mobile-first** - Start with mobile, enhance for desktop
5. **Use Tailwind responsive utilities** - Never hardcode media queries
6. **Test visual result** - Verify appearance and behaviour
7. **Check accessibility** - WCAG AA minimum contrast

### Animation-Specific Rules

- **Framer Motion required** for all interactive motion
- **useScroll + useTransform** for cinematic scroll effects (landing page)
- **Motion tokens only** - 120ms/240ms/400ms (no custom timings)
- **All animation tokens** live in `/packages/ui/tokens/motion.ts`
- **Consistent easing** - `cubic-bezier(0.22, 1, 0.36, 1)` for fast/normal

### Component Naming Conventions

When adding components to `/apps/aud-web/src/components/ui`:

- Prefix with **Studio** or **Flow** for naming consistency
- Examples: `StudioPanel`, `FlowCanvas`, `StudioHeader`
- Use PascalCase for component files
- Use kebab-case for utility/hook files

---

## 💬 QUICK START PROMPTS FOR USERS

### Starting a Development Session

| Goal | Example Prompt |
|------|----------------|
| Start dev session | "Ready to work on ScrollFlow improvements" |
| Add feature | "Add magnetic CTA button to landing page" |
| Fix issue | "Fix text blur timing in ScrollFlow animation" |
| Review code | "Audit all Framer Motion transitions for consistency" |
| Test | "Run UI lint and check for a11y compliance" |

### What Happens Automatically

**User says:** "Ready to work on [feature]"

**Claude Code does:**
1. Checks git status
2. Pulls latest if needed
3. Creates feature branch (if not on one)
4. Implements changes using design system
5. Commits following conventions
6. Formats everything with Prettier/ESLint
7. Pushes when ready

**No terminal needed** - Claude + Cursor handle everything

---

## 🧩 CURSOR-SPECIFIC INTEGRATION

### For Cursor IDE Users

- **Framer Motion** for all cinematic motion (not CSS transitions)
- **useScroll + useTransform** for scroll-based animations
- **Never hardcode media queries** - Tailwind responsive utilities only
- **Component prefix convention** - Studio/Flow for `/components/ui`
- **Motion tokens location** - `/packages/ui/tokens/motion.ts`

### Safety & Linting

Claude automatically:
- ✅ Checks git before editing
- ✅ Warns if behind remote
- ✅ Creates feature branches
- ✅ Runs Prettier + ESLint fix on save
- ✅ Removes console logs (unless in debug mode)
- ✅ Uses `logger.ts` from `/packages/utils` for debug output

---

## 🪄 MULTI-AGENT HANDOFF NOTES

If GPT-5, Claude, or another model edits this project:

- **Respect this CLAUDE.md** as canonical workflow
- **Preserve animation + colour tokens** - Do not modify design system
- **Never rewrite working Framer Motion logic** unless explicitly requested
- **Check active phase before refactoring** - Respect Phase 4.5 status
- **Use clear commit messages** with British spelling
- **Follow all style conventions** - This maintains consistency

---

## 🧪 IMPLEMENTED FEATURES (October 2025)

### Phase 4: Cinematic Onboarding System ✅
**Status**: Complete - 4-phase component-based onboarding
**Location**: [apps/aud-web/ONBOARDING.md](apps/aud-web/ONBOARDING.md)

**Components**:
- `OperatorTerminal` - Phase 1: Boot sequence and operator name input
- `OSSelector` - Phase 2: Theme selection with arrow key navigation
- `TransitionSequence` - Phase 3: Animated boot sequence
- `FlowStudio` - Phase 4: Main workspace with theme integration

**Hooks**:
- `useOnboardingPhase()` - State machine for phase transitions
- `useOperatorInput()` - Terminal boot sequence logic
- `useOSSelection()` - Arrow key theme selection

**Flow**:
```
operator (boot) → selection (theme) → transition (boot) → signal (workspace)
```

**Persistence**: localStorage tracks completion, can skip with `?skip_onboarding=true`

### Phase 5: Agent Spawning System ✅
**Status**: Complete - Modal-based agent spawning with database persistence
**Database**: `agent_manifests` table in Supabase

**Components**:
- `AgentSpawnModal` - Full-featured modal with name, role, personality, colour
- `GlobalCommandPalette` - Command palette integration (⌘K → spawn agent)

**Hook**:
- `useAgentSpawner()` - Supabase integration for spawn/list/remove operations

**Agent Roles**: scout, coach, tracker, insight, custom

**Spawning Flow**:
1. Open modal via ⌘K → "spawn agent scout/coach/tracker/insight/custom"
2. Configure name, role, personality, colour
3. Validate + spawn to Supabase
4. Modal closes with success sound

**Command Palette Integration**:
- 5 spawn commands (one per role)
- 1 list agents command
- Full keyboard navigation

**Database Schema**:
```sql
CREATE TABLE agent_manifests (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name text UNIQUE,
  role text,
  personality text,
  colour text,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Theme System ✅
**Status**: Complete - 5 themes with layout/narrative/ambient configs
**Themes**: ascii, xp, aqua, daw, analogue

**Architecture**:
- `ThemeResolver` - Manages theme selection and CSS variable injection
- `ThemeContext` - Provides currentTheme, themeConfig, setTheme
- `themes/` directory - Individual theme configs (ascii.theme.ts, xp.theme.ts, etc.)

**Theme Configs** (type `ThemeConfig`):
- `colors`: background, foreground, accent, border
- `typography`: fontFamily, fontSize, letterSpacing, textTransform
- `motion`: duration, easing, reducedMotion
- `sound`: oscillator, frequencies, durations
- `layout`: borderStyle, borderRadius, shadow, depth, glow, padding
- `narrative`: tagline, personality descriptors
- `ambient`: gridMotion, gridSpeed, hoverScale, hapticsEnabled

**Theme Personalities**:
- **ascii**: "type. test. repeat." - minimalist producer, green terminal
- **xp**: "click. bounce. smile." - nostalgic optimist, spring bounce
- **aqua**: "craft with clarity." - perfectionist designer, glassy blur
- **daw**: "sync. sequence. create." - experimental creator, 120 BPM tempo-synced
- **analogue**: "touch the signal." - human hands, warm lo-fi studio

**Integration**:
- `MissionPanel` - Uses theme layout for borders, shadows, glows
- `FlowCanvas` - Theme-aware grid background and motion
- `AmbientSoundLayer` - Per-theme sound banks (Web Audio API)
- `GlobalCommandPalette` - Theme switching commands

**UI Sounds** (per theme):
- ascii: square waves (880Hz/1760Hz/220Hz)
- xp: sine waves (nostalgic, soft)
- aqua: triangle waves (smooth, designer)
- daw: sawtooth waves (producer, experimental)
- analogue: gentle sine waves (280Hz/120Hz/260Hz, 0.4-0.6s durations)

### Multi-Agent System
- Agent executor with skill-based architecture
- Dynamic agent spawning and orchestration
- Real-time agent communication via Supabase

### Skills Engine
- Extensible skill registration system
- Skills can be invoked by agents dynamically
- Integration with external APIs

---

## 🔧 DEVELOPMENT COMMANDS

```bash
# Start development server (from root)
pnpm dev                    # Runs all apps in workspace

# Build for production
pnpm build                  # Build all apps
pnpm turbo build --filter=aud-web  # Build specific app

# Run tests
cd apps/aud-web && pnpm test
pnpm test:ui                # Visual test UI
pnpm test:coverage          # Coverage report

# Type checking
pnpm typecheck              # Check all packages
pnpm typecheck --filter=aud-web  # Check specific app

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check

# Railway deployment (from root)
railway up                  # Deploy to Railway
railway status              # Check deployment status
railway logs                # View deployment logs
railway domain              # Generate/view public domain
railway open                # Open project in Railway dashboard
```

### Railway Configuration
**Build Command**: `pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build`
**Start Command**: `cd apps/aud-web && pnpm start`
**Config File**: `railway.json` (in repository root)
**Project ID**: `43846fc7-5c12-4285-a5e0-14275f0e4857`
**Live URL**: https://totalaud.io
**Railway Domain**: https://aud-web-production.up.railway.app (redirects to above)

**Why Railway Over Vercel**:
- Vercel had persistent monorepo detection issues (70+ failed deployments)
- Railway's Nixpacks builder handles pnpm workspaces correctly
- First deployment succeeded without configuration tweaking
- Better support for Next.js 15 + Turborepo + pnpm workspace structure

**Environment Variables** (Production):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ANTHROPIC_API_KEY=<anthropic-key>
NEXT_PUBLIC_APP_URL=https://totalaud.io
NODE_ENV=production
```

---

## 🎯 PROJECT PHILOSOPHY

totalaud.io is a **thinking and finishing system** for independent artists.

### Core Problem We Solve

Indie artists don't lack tools. They lack clear, trusted feedback and prioritisation before release.

### Core Principles

- **Second opinion, not automation** — We help artists think, not replace their thinking
- **Finishing notes, not quality scores** — Insight without judgement
- **Perspectives, not agents** — Human-framed feedback from producer, mix, listener, industry angles
- **Relationships as capital** — Memory and context, not scraping and volume
- **Narrative truth** — Consistency across all artist communications

### What We DON'T Build

- ❌ "AI music critic" or quality scoring
- ❌ Auto-producer or mastering replacement
- ❌ Complex multi-agent OS workflows
- ❌ OS themes (XP/Aqua/ASCII/etc.) — archived
- ❌ Generic SaaS dashboards
- ❌ Hype-driven growth features

### UX Principles

- **Calm**: Everything reduces cognitive load
- **Soft motion**: Only subtle Framer Motion transitions
- **Direct**: No assistant bubbles or chat UI
- **Portable**: Export always available
- **Human language**: At every interface boundary

---

## 🤖 BROWSER AUTOMATION & VISUAL CONTEXT (October 2025)

**Status**: ✅ **DUAL MCP SETUP COMPLETE**

### Two MCP Servers for Different Purposes

#### 1. Chrome DevTools MCP - Visual Context ⭐
**Purpose**: Let Claude Code **SEE** what it's building in real-time

**When to use:**
- Building UI components (need visual feedback)
- Debugging CSS/layout issues (see the page)
- Performance analysis (profiling tools)
- Console debugging (JavaScript errors)
- Network inspection (API requests)

**Available tools:**
- `take_screenshot` - Screenshot of localhost during development
- `take_snapshot` - DOM structure with CSS
- `record_trace` - Performance profiling
- `get_console_logs` - JavaScript console output
- `get_network_activity` - Network requests inspection

**Example workflow:**
```
User: "Add a new ConsolePanel component to the app"
Claude: [Writes component code]
Claude: [Takes screenshot of localhost:3000]
Claude: "I can see the panel is rendering but the border is too thick, let me adjust..."
Claude: [Fixes styling]
Claude: [Takes screenshot to confirm]
Claude: "Perfect! The console panel now matches the theme."
```

**Configuration:**
```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["chrome-devtools-mcp@latest"]
  }
}
```

#### 2. Puppeteer MCP - Background Automation 🤖
**Purpose**: Automate tasks that don't need visual feedback

**When to use:**
- Web scraping (radio contacts, playlists)
- Form automation (login, submissions)
- Dialog auto-handling (alerts/confirms)
- Data extraction (emails, contact info)
- Background workflows (no visual needed)

**Available tools:**
- `puppeteer_navigate` - Navigate to URLs
- `puppeteer_screenshot` - Take screenshots
- `puppeteer_click` - Click elements
- `puppeteer_fill` - Fill form inputs
- `puppeteer_evaluate` - Execute JavaScript
- `puppeteer_select` - Select dropdown options
- `puppeteer_hover` - Hover elements

**Key feature:** Auto-dialog handling
```javascript
// Automatically injected to handle popups
window.alert = (msg) => console.log('[AUTO-HANDLED] Alert:', msg);
window.confirm = (msg) => { console.log('[AUTO-HANDLED] Confirm:', msg); return true; };
window.prompt = (msg, def) => { console.log('[AUTO-HANDLED] Prompt:', msg); return def || ''; };
```

**Example workflow:**
```
User: "Get all BBC Radio 1 DJ email addresses"
Claude: [Navigates to BBC Radio 1 contacts page]
Claude: [Auto-handles any dialog popups]
Claude: [Extracts all email addresses]
Claude: "Found 15 DJ contacts with emails"
```

**Configuration:**
```json
{
  "puppeteer": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-puppeteer"]
  }
}
```

### When to Use Which?

| Task | Use This | Why |
|------|----------|-----|
| Building UI components | **Chrome DevTools** | Need to see visual result |
| Debugging CSS/layout | **Chrome DevTools** | Visual feedback required |
| Performance profiling | **Chrome DevTools** | Built-in trace viewer |
| JavaScript debugging | **Chrome DevTools** | Console logs + snapshots |
| Scraping contact info | **Puppeteer** | Background task |
| Form automation | **Puppeteer** | No visual needed |
| Login workflows | **Puppeteer** | Dialog handling + automation |
| Data extraction | **Puppeteer** | Headless efficiency |

### Verify Setup

```bash
claude mcp list

# Should show:
# ✓ chrome-devtools: npx chrome-devtools-mcp@latest - Connected
# ✓ puppeteer: npx @modelcontextprotocol/server-puppeteer - Connected
```

### Auto-Approval Configuration

**Status**: ✅ Configured in `~/.claude/settings.json`

All Chrome DevTools MCP tools are pre-approved for automatic execution without confirmation prompts:
- `take_screenshot` - Capture visual state
- `take_snapshot` - DOM structure analysis
- `list_pages` - Browser tab management
- `navigate_page` - Page navigation
- `click`, `fill`, `hover` - UI interactions
- `list_console_messages`, `get_console_message` - Console debugging
- `list_network_requests`, `get_network_request` - Network inspection
- `performance_*` - Performance profiling

This enables **seamless visual context workflow** without interruptions during UI development.

### Documentation Files
- [VISUAL_CONTEXT_WORKFLOW.md](VISUAL_CONTEXT_WORKFLOW.md) - Complete Chrome DevTools workflow
- [BROWSER_AUTOMATION_GUIDE.md](BROWSER_AUTOMATION_GUIDE.md) - Puppeteer automation guide

### Default Behavior for Claude Code

**When building UI:**
1. Write component code
2. Take screenshot of localhost:3000 (Chrome DevTools MCP)
3. Visually verify the result
4. Make adjustments based on what you see
5. Take screenshot to confirm

**When automating tasks:**
1. Navigate to target URL (Puppeteer MCP)
2. Auto-inject dialog handler
3. Execute automation workflow
4. Return structured data

**Key advantage:** Claude Code can now SEE what it's building (visual context) AND automate background tasks (no manual clicking). Best of both worlds!

---

## 🚨 NOTES FOR CLAUDE CODE

### Deployment Platform: Railway (October 2025)
**Decision**: Switched from Vercel to Railway after 70+ failed Vercel deployments
**Root Cause**: Vercel's Build Output API v3 detection system doesn't properly register Next.js 15 + pnpm workspace + Turborepo builds
**Railway Status**: ✅ Working perfectly - first deployment succeeded

**Vercel Issues Summary** (documented in `VERCEL_DEPLOYMENT_COMPLETE_SUMMARY.md`):
- Build completed successfully (55s, all routes generated)
- But Vercel showed `[0ms]` build time in inspect
- All routes returned 404 NOT_FOUND
- Issue is with Vercel's infrastructure, not the code
- Comprehensive documentation provided for Vercel support ticket if needed

**Railway Advantages**:
- Nixpacks builder understands pnpm workspaces natively
- No special configuration needed for monorepo structure
- Handles `workspace:*` dependencies correctly
- Fast deployment times
- Easy domain generation via `railway domain` command

### Theme System Migration (Completed)
**Changed**: Renamed themes from 'ableton'/'punk' to 'daw'/'analogue'
**Files Updated**: 6 files (OnboardingOverlay, MissionDashboard, BrokerChat, OSTransition, OSCard, os-selector/page.tsx)
**Status**: ✅ Complete - All TypeScript errors resolved

### Agent Spawning System
**Database**: `agent_manifests` table requires RLS policies
**Migration**: `supabase/migrations/20251022000000_add_agent_manifests.sql`
**Status**: ✅ Complete - Modal + database integration working

---

## 📋 CURRENT BUILD PHASES (Post-Pivot November 2025)

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation cleanup, archive OS/agents | 🔄 In Progress |
| 2 | Ideas Mode finalisation | ⏳ Pending |
| 3 | Scout Mode MVP (Airtable + MCP discovery) | ⏳ Pending |
| 4 | Timeline Mode MVP | ⏳ Pending |
| 5 | Pitch Mode with AI coaching | ⏳ Pending |
| 6 | Auth + Landing Page (calm messaging) | ⏳ Pending |
| 7 | Polish + Beta Release | ⏳ Pending |

**Current Priority**: Phase 1 - Clean codebase, archive old OS/agent packages, enable Scout tab

---

## 📚 ADDITIONAL DOCUMENTATION

Project-specific documentation files:

- **[CURSOR_QUICK_START.md](CURSOR_QUICK_START.md)** - Cursor IDE quick reference guide
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Step-by-step migration instructions
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation details
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command and pattern quick reference
- **[AUDIT_IMPLEMENTATION_COMPLETE.md](AUDIT_IMPLEMENTATION_COMPLETE.md)** - Final status report
- **[VISUAL_CONTEXT_WORKFLOW.md](VISUAL_CONTEXT_WORKFLOW.md)** - Chrome DevTools workflow
- **[BROWSER_AUTOMATION_GUIDE.md](BROWSER_AUTOMATION_GUIDE.md)** - Puppeteer automation guide

---

**Last Updated**: January 2026  
**Status**: Vision Reset — Aligning all documentation  
**Vision**: See [`docs/VISION.md`](docs/VISION.md) for canonical product direction  
**Live URL**: <https://totalaud.io>  
**Focus**: Thinking and finishing system for independent artists  
**PRD**: See [PRD.md](PRD.md) — being updated to align with Vision
