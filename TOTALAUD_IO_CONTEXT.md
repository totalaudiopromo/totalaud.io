# 🎨 TOTALAUD.IO - COMPLETE CONTEXT

_Experimental creative studio for AI-powered music marketing_

## 📊 KEY NUMBERS

- **Status**: Experimental Innovation Sandbox (Phase 15.5 Complete)
- **Live Site**: https://aud-web-production.up.railway.app
- **Purpose**: R&D playground for future of creative campaign design
- **Platform**: Railway (monorepo deployment)

## 🎯 PROJECT ROLE

**Experimental Creative Interface** - Testing ground for breakthrough features that feed back into Total Audio Promo suite

### Key Distinction from Total Audio Promo

- **Total Audio Promo** → Production SaaS for revenue validation (Audio Intel, Pitch Generator, Tracker)
- **TotalAud.io** → Experimental creative studio for innovation and learning
- **Relationship** → Breakthroughs here feed back into main suite after validation

## 🚀 WHAT'S PROVEN & WORKING

- ✅ **Cinematic Onboarding**: 4-phase boot sequence (operator → selection → transition → signal)
- ✅ **5 Theme System**: ascii, xp, aqua, daw, analogue (Framer Motion animations)
- ✅ **Agent Spawning**: Database-persisted multi-agent system
- ✅ **Campaign Analytics**: Real-time dashboard with Supabase Realtime
- ✅ **EPK Analytics**: Region/device-grouped analytics with live updates
- ✅ **Railway Deployment**: Production-ready on Railway after Vercel migration
- ✅ **Code Quality**: 15/15 tests passing, ESLint + Prettier configured
- ✅ **Browser Automation**: Dual MCP setup (Chrome DevTools + Puppeteer)

## 🎨 DESIGN PHILOSOPHY

### Core Principles

- **Marketing music should be as creative as making it**
- **Agents act like bandmates**, not black-box AIs
- **Transparency always on** - users can edit/disable any AI output
- **Augmentation, not automation** - "AI as your promo crew"

### Visual Language

- **Accent**: Slate Cyan `#3AA9BE`
- **Motion**: 120ms (micro) / 240ms (transition) / 400ms (ambient)
- **Animation**: Framer Motion exclusively (NO CSS transitions)
- **Typography**: Geist Sans, Geist Mono
- **Responsive**: Mobile-first, Tailwind utilities only

## 🏗️ TECHNICAL ARCHITECTURE

### Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.6.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **State**: Zustand 5.0.2
- **Database**: Supabase (shared with Total Audio Promo)
- **Animation**: Framer Motion 11.11.17
- **Flow Canvas**: React Flow 11.11.4
- **Build**: Turborepo + pnpm workspace
- **Deployment**: Railway
- **UI Sound**: Web Audio API

### Project Structure

```
totalaud.io/
├── apps/
│   └── aud-web/              # Main experimental app
│       ├── src/
│       │   ├── app/          # Next.js 15 app router
│       │   ├── components/   # React components
│       │   ├── lib/          # Utilities and helpers
│       │   ├── hooks/        # Custom React hooks
│       │   └── stores/       # Zustand state management
│       └── package.json
├── packages/
│   └── core/
│       ├── agent-executor/   # Multi-agent execution engine
│       ├── supabase/         # Supabase client & utilities
│       ├── schemas/          # Shared TypeScript types
│       ├── skills-engine/    # Skills-based agent system
│       └── theme-engine/     # Dynamic theming system
└── package.json              # Monorepo root
```

### Development Commands

```bash
# Development (from root)
pnpm dev                    # Start aud-web on port 3000

# Build & Deploy
pnpm build                  # Build all packages
railway up                  # Deploy to Railway
railway logs                # View deployment logs

# Quality Checks
pnpm lint                   # ESLint check
pnpm lint:fix               # Auto-fix linting issues
pnpm format                 # Format all code
pnpm typecheck              # TypeScript validation

# Testing (from apps/aud-web)
cd apps/aud-web
pnpm test                   # Run tests (15 passing)
pnpm test:ui                # Visual test UI
pnpm test:coverage          # Coverage report
```

## 🎯 IMPLEMENTED FEATURES (Phase 15.5)

### 1. Cinematic Onboarding System ✅

**Flow**: operator (boot) → selection (theme) → transition (boot) → signal (workspace)

**Components**:
- `OperatorTerminal` - Phase 1: Boot sequence and operator name input
- `OSSelector` - Phase 2: Theme selection with arrow key navigation
- `TransitionSequence` - Phase 3: Animated boot sequence
- `FlowStudio` - Phase 4: Main workspace with theme integration

**Hooks**:
- `useOnboardingPhase()` - State machine for phase transitions
- `useOperatorInput()` - Terminal boot sequence logic
- `useOSSelection()` - Arrow key theme selection

**Persistence**: localStorage tracks completion, can skip with `?skip_onboarding=true`

### 2. Theme System ✅

**5 Themes with Distinct Personalities**:

- **ascii**: "type. test. repeat." - Minimalist producer, green terminal
- **xp**: "click. bounce. smile." - Nostalgic optimist, spring bounce
- **aqua**: "craft with clarity." - Perfectionist designer, glassy blur
- **daw**: "sync. sequence. create." - Experimental creator, 120 BPM tempo-synced
- **analogue**: "touch the signal." - Human hands, warm lo-fi studio

**Architecture**:
- `ThemeResolver` - Manages theme selection and CSS variable injection
- `ThemeContext` - Provides currentTheme, themeConfig, setTheme
- `themes/` directory - Individual theme configs (ascii.theme.ts, xp.theme.ts, etc.)

**Theme Config Properties**:
- `colors`: background, foreground, accent, border
- `typography`: fontFamily, fontSize, letterSpacing, textTransform
- `motion`: duration, easing, reducedMotion
- `sound`: oscillator, frequencies, durations (Web Audio API)
- `layout`: borderStyle, borderRadius, shadow, depth, glow, padding
- `narrative`: tagline, personality descriptors
- `ambient`: gridMotion, gridSpeed, hoverScale, hapticsEnabled

### 3. Agent Spawning System ✅

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

### 4. Campaign Analytics Dashboard ✅ (Phase 15.5)

**Real-time Metrics**:
- 7/30-day campaign performance tracking
- Auto-revalidation via SWR pattern
- Supabase Realtime subscriptions for instant updates

**Database Tables**:
- `campaign_dashboard_metrics` - Aggregate performance by time period
- `epk_analytics` - Detailed EPK asset tracking with region/device analytics

**APIs**:
- `/api/campaigns/[id]/summary` - Campaign summary endpoint
- `/api/campaigns/[id]/metrics` - Metrics aggregation endpoint
- `/api/analytics/track` - Event tracking endpoint

**Hooks**:
- `useCampaignDashboard()` - Dashboard metrics with SWR
- `useEPKAnalytics()` - EPK analytics with Realtime

**Components**:
- Dashboard panel (320px width)
- Analytics drawer (480px width)

### 5. Code Quality Infrastructure ✅

**Status**: 15/15 tests passing

**Implemented**:
- ✅ ESLint + Prettier (TypeScript + React + Next.js + Web Audio API)
- ✅ Environment variable validation (`lib/env.ts`)
- ✅ Structured logging (`lib/logger.ts`) - 7 passing tests
- ✅ API input validation (`lib/api-validation.ts`) - 8 passing tests
- ✅ Local fonts (GDPR compliant via @fontsource)
- ✅ Testing infrastructure (Vitest + React Testing Library)

**Usage Patterns**:
```typescript
// Environment variables (type-safe)
import { env } from '@/lib/env';
const apiKey = env.ANTHROPIC_API_KEY;

// Structured logging
import { logger } from '@/lib/logger';
const log = logger.scope('ComponentName');
log.info('User action', { userId });

// API validation
import { validateRequestBody } from '@/lib/api-validation';
const body = await validateRequestBody(req, schema);
```

### 6. Browser Automation (Dual MCP Setup) ✅

**Chrome DevTools MCP** - Visual Context:
- `take_screenshot` - Screenshot of localhost during development
- `take_snapshot` - DOM structure with CSS
- `record_trace` - Performance profiling
- `get_console_logs` - JavaScript console output
- `get_network_activity` - Network requests inspection

**Puppeteer MCP** - Background Automation:
- `puppeteer_navigate` - Navigate to URLs
- `puppeteer_screenshot` - Take screenshots
- `puppeteer_click` - Click elements
- `puppeteer_fill` - Fill form inputs
- `puppeteer_evaluate` - Execute JavaScript
- Auto-dialog handling (alerts/confirms/prompts)

## 🎯 DEVELOPMENT PHILOSOPHY

### Core Rules

1. **British English Required**:
   - `colour`, `behaviour`, `centre`, `optimise`, `analyse`
   - Exception: Framework conventions (React props, Tailwind classes)

2. **Motion System**:
   - Framer Motion exclusively (NO CSS transitions)
   - Motion tokens: 120ms / 240ms / 400ms
   - `useScroll` + `useTransform` for cinematic scroll effects

3. **Mobile-First**:
   - Always design for mobile first
   - Tailwind responsive utilities (`sm:`, `md:`, `lg:`, `xl:`)
   - Never hardcode media queries

4. **Code Quality**:
   - TypeScript strict mode (no `any` types)
   - Structured logging (not console.log)
   - Validated environment variables
   - API input validation with Zod
   - Tests for new features

### Git Workflow

**Branch Naming**:
```
feature/{scope}-{desc}  → feature/landing-scrollflow
fix/{bug-summary}       → fix/api-auth-headers
refactor/{area}         → refactor/presence-hook
style/{ui-update}       → style/landing-colours
```

**Commit Messages**:
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

## 🚨 DEPLOYMENT (Railway)

**Platform**: Railway (switched from Vercel after 70+ failed deployments)

**Why Railway**:
- Nixpacks builder understands pnpm workspaces natively
- No special configuration needed for monorepo structure
- Handles `workspace:*` dependencies correctly
- First deployment succeeded without configuration tweaking

**Live URL**: https://aud-web-production.up.railway.app

**Build Command**: `pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build`
**Start Command**: `cd apps/aud-web && pnpm start`
**Config File**: `railway.json` (in repository root)

**Environment Variables (Production)**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ANTHROPIC_API_KEY=<anthropic-key>
NEXT_PUBLIC_APP_URL=https://aud-web-production.up.railway.app
NODE_ENV=production
```

## 🎯 CURRENT PHASE (Phase 15.5)

**Status**: ✅ Foundation layer complete

**Implemented**:
- Connected Campaign Dashboard (7/30-day metrics)
- EPK Analytics (region/device grouping)
- Real-time Supabase subscriptions
- FlowCore design system (240ms animations, British English, WCAG AA)

**Database**:
- 2 new tables (`campaign_dashboard_metrics`, `epk_analytics`)
- 2 helper functions
- Comprehensive RLS policies

**APIs**:
- 3 RESTful endpoints (summary, metrics, tracking)

**Hooks**:
- 2 custom hooks with SWR pattern and Realtime subscriptions

**Components**:
- Dashboard panel (320px)
- Analytics drawer (480px)

## 💡 INTEGRATION WITH TOTAL AUDIO PROMO

**Relationship**: Experimental → Production Pipeline

**Flow**:
1. Innovation happens in **TotalAud.io** (creative studio interface)
2. Proven features migrate to **Total Audio Promo** (production SaaS)
3. Both share same database and agent system (Supabase)
4. TotalAud.io = R&D playground, Total Audio Promo = revenue generation

**Shared Infrastructure**:
- Supabase authentication
- Agent execution system
- Skills registry
- Database schema

**Value Proposition**: "Make marketing music as creative as making it"

## 🎯 COMPETITIVE ADVANTAGE

### Against Traditional Music Marketing Tools

- **Creative First**: Campaign design is visual and collaborative, not form-based
- **AI Augmentation**: Agents act like bandmates, not black boxes
- **Transparency**: Users can edit/disable any AI output
- **Cinematic UX**: Framer Motion animations, theme personalities, Web Audio UI sounds
- **Experimental Freedom**: Innovation sandbox without customer pressure

### Design Inspiration

- **Superhuman**: Command palette (⌘K) and keyboard shortcuts
- **Linear**: Flow-state task management
- **Figure**: Real-time collaborative creativity
- **Ableton Live**: Professional creative tools with progressive disclosure

## 📈 SUCCESS METRICS

**Technical Quality**:
- 15/15 tests passing
- TypeScript strict mode (no `any` types allowed)
- ESLint + Prettier configured
- WCAG AA accessibility compliance
- Railway deployment successful

**Innovation Goals**:
- Validate agent collaboration patterns
- Test cinematic onboarding flows
- Experiment with theme-based UX
- Prove real-time analytics architecture

**Migration to Total Audio Promo**:
- Identify features ready for production
- Document successful patterns
- Measure user engagement with experimental features

## 🔧 NEXT PHASE PRIORITIES

### Immediate Focus (Post-Phase 15.5)

- **Launch Readiness**: Final polish on analytics dashboard
- **Performance**: Optimise Framer Motion animations
- **Testing**: Expand test coverage beyond 15 tests
- **Documentation**: Update guides with Phase 15.5 features

### Strategic Development

- **Multi-Agent Workflows**: Agent collaboration patterns
- **Skills System**: Extensible skill registration
- **Flow Canvas**: Visual agent orchestration
- **Command Palette**: Advanced keyboard shortcuts

### Long-term Vision

- **TotalAud.io** → Creative studio for campaign orchestration
- **Total Audio Promo** → Production SaaS for revenue
- **Unified Platform** → Share technology layer across both domains

---

**The TotalAud.io experimental interface is where innovation happens. Proven features migrate to Total Audio Promo production suite.**
