# TotalAud.io

**Experimental creative OS for AI-powered music marketing**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://aud-web-production.up.railway.app)
[![Phase 15.5](https://img.shields.io/badge/phase-15.5-blue)](docs/TOTALAUD_IO_CONTEXT.md)

> "Marketing your music should be as creative as making it."

---

## 🎯 What is TotalAud.io?

TotalAud.io is an **experimental creative interface** for music marketing campaigns. It's a research and development playground where we test breakthrough features using:

- **Five OS themes** (ascii, xp, aqua, daw, analogue)
- **Multi-agent collaboration** (scout, coach, tracker, insight)
- **Visual flow orchestration** with React Flow
- **Cinematic animations** powered by Framer Motion
- **Real-time analytics** via Supabase Realtime
- **Skills-based AI** using YAML-defined capabilities

This is **not a production app**. It's an innovation sandbox where proven features eventually migrate to the production Total Audio Promo suite.

## 🚀 Quick Start

### For Cursor Users

Using Cursor IDE? [Start here →](CURSOR_QUICK_START.md)

Just say **"Ready to work"** and Claude Code handles all git operations automatically.

### Standard Setup

```bash
# Clone and install
git clone <repo-url>
cd totalaud.io
pnpm install

# Start local development
pnpm dev                    # Starts aud-web on localhost:3000

# Optional: Run local Supabase
pnpm db:start              # Requires Docker
pnpm db:migrate            # Run migrations
pnpm db:types              # Generate TypeScript types
```

**Live Demo**: https://aud-web-production.up.railway.app

## 📁 Project Structure

```
totalaud.io/
├── apps/
│   ├── aud-web/                 # Main experimental interface (Next.js 15)
│   └── aud-experimental/        # Prototype workspace
├── packages/
│   ├── core/
│   │   ├── agent-executor/     # Multi-agent execution engine
│   │   ├── skills-engine/      # YAML skill loader
│   │   ├── supabase/           # Database client
│   │   └── theme-engine/       # Dynamic theming system
│   └── schemas/
│       └── database/           # TypeScript types from Supabase
├── docs/                       # Full documentation
├── skills/                     # YAML skill definitions
└── supabase/                   # Database migrations
```

## 🎨 Key Features

### 1. Five OS Themes

Each theme has a distinct personality, motion system, and sound design:

- **ascii** — "type. test. repeat." — Minimalist terminal aesthetic
- **xp** — "click. bounce. smile." — Nostalgic Windows XP vibes
- **aqua** — "craft with clarity." — macOS Aqua glass and blur
- **daw** — "sync. sequence. create." — 120 BPM tempo-synced UI
- **analogue** — "touch the signal." — Lo-fi warmth and tactile feedback

### 2. Multi-Agent System

Spawn AI agents with distinct roles:

- **Scout** — Research contacts, discover opportunities
- **Coach** — Generate pitches, craft follow-ups
- **Tracker** — Monitor campaigns, analyse results
- **Insight** — Pattern detection, recommendations

Each agent is powered by **reusable skills** defined in YAML.

### 3. Cinematic Onboarding

Four-phase boot sequence:

1. **Operator** — Terminal boot + name input
2. **Selection** — Arrow-key theme picker
3. **Transition** — Animated boot sequence
4. **Signal** — Flow Studio workspace

Skip with `?skip_onboarding=true`

### 4. Real-time Analytics

- Campaign dashboard (7/30-day metrics)
- EPK analytics (region/device grouping)
- Supabase Realtime subscriptions
- SWR pattern for auto-revalidation

### 5. Flow Canvas (React Flow)

Visual orchestration of agent workflows:

- Node-based campaign design
- Agent spawning on canvas
- Real-time collaboration
- Autosave + hydration

## 🛠️ Development

### Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm dev:aud-web            # Start only aud-web

# Quality Checks
pnpm typecheck              # TypeScript validation
pnpm lint                   # ESLint check
pnpm lint:fix               # Auto-fix linting issues
pnpm format                 # Prettier formatting

# Database
pnpm db:start               # Start Supabase (requires Docker)
pnpm db:stop                # Stop Supabase
pnpm db:migrate             # Run migrations
pnpm db:reset               # Reset database
pnpm db:types               # Generate TypeScript types

# Testing
cd apps/aud-web
pnpm test                   # Run tests (15/15 passing)
pnpm test:ui                # Visual test UI
pnpm test:coverage          # Coverage report
```

### Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.6.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **Animation**: Framer Motion 11.11.17
- **State**: Zustand 5.0.2
- **Database**: Supabase (PostgreSQL)
- **Flow Canvas**: React Flow 11.11.4
- **Build System**: Turborepo + pnpm workspaces
- **Deployment**: Railway

## 📚 Documentation

**Start here**: [Complete Context →](docs/TOTALAUD_IO_CONTEXT.md)

**Documentation Index**: [docs/_index.md](docs/_index.md)

Key docs:

- [Agent System Overview](docs/AGENT_SYSTEM_OVERVIEW.md)
- [Flow Canvas Overview](docs/FLOW_CANVAS_OVERVIEW.md)
- [Theme Engine Overview](docs/THEME_ENGINE_OVERVIEW.md)
- [Visual Identity Layer](docs/VISUAL_IDENTITY_LAYER.md)
- [UX Flow Studio Guide](docs/UX_FLOW_STUDIO_GUIDE.md)

## 🚀 Deployment

**Platform**: Railway  
**Live URL**: https://aud-web-production.up.railway.app

Railway was chosen for its native support of Next.js 15 + pnpm workspaces + Turborepo monorepos.

```bash
railway up                  # Deploy to Railway
railway status              # Check deployment status
railway logs                # View deployment logs
railway open                # Open Railway dashboard
```

See [railway.json](railway.json) for configuration.

## 🎯 Development Philosophy

### Core Principles

1. **British English**: colour, behaviour, optimise, analyse (except framework conventions)
2. **Framer Motion Only**: No CSS transitions or animations
3. **Mobile-First**: Tailwind responsive utilities (`sm:`, `md:`, `lg:`)
4. **Type Safety**: Strict TypeScript, no `any` types
5. **Structured Logging**: Use `logger.ts`, not `console.log`
6. **Test Coverage**: Write tests for new features

### Motion Tokens

- **120ms** — Micro interactions (hover, focus)
- **240ms** — Transitions (theme switch, panel slide)
- **400ms** — Ambient effects (pulse, glow)

### Git Workflow

**Branch Naming**:
```
feat/{scope}-{description}   → feat/landing-scrollflow
fix/{bug-summary}            → fix/api-auth-headers
refactor/{area}              → refactor/presence-hook
```

**Commit Messages** (UK spelling, no emojis):
```
type(scope): short summary

Examples:
feat(landing): add scrollflow cinematic transitions
fix(api): resolve supabase auth token issue
refactor(hooks): extract presence logic to custom hook
```

See [COMMIT_CONVENTIONS.md](COMMIT_CONVENTIONS.md) for full guidelines.

## 🧪 Testing

```bash
cd apps/aud-web
pnpm test                   # 15/15 tests passing
```

Coverage:
- Environment validation (type-safe env vars)
- Structured logging (scoped loggers)
- API input validation (Zod schemas)

## 🌐 Browser Automation

Dual MCP setup for visual context and automation:

- **Chrome DevTools MCP** — Screenshots, DOM snapshots, console logs
- **Puppeteer MCP** — Navigation, clicks, form fills, JavaScript execution

See [docs/BROWSER_AUTOMATION.md](docs/BROWSER_AUTOMATION.md)

## 📈 Success Metrics

**Technical Quality**:
- ✅ 15/15 tests passing
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier configured
- ✅ WCAG AA accessibility
- ✅ Railway deployment successful

**Innovation Goals**:
- Validate agent collaboration patterns
- Test cinematic onboarding flows
- Experiment with theme-based UX
- Prove real-time analytics architecture

## 🗺️ Roadmap

- [x] Phase 1-14: Foundation (monorepo, agents, themes)
- [x] Phase 15.4: FlowCore design system
- [x] Phase 15.5: Real-time analytics
- [ ] Phase 16: Multi-agent workflows
- [ ] Phase 17: Skills registry UI
- [ ] Phase 18: Stabilisation + polish

See [docs/TOTALAUD_IO_CONTEXT.md](docs/TOTALAUD_IO_CONTEXT.md) for detailed phase history.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Key Rules**:
- British English in all user-facing text
- Framer Motion for all animations
- TypeScript strict mode, no `any` types
- Test new features
- Follow commit conventions

## 📝 License

Proprietary — © 2025 Total Audio

---

**TotalAud.io is where innovation happens. Proven features migrate to Total Audio Promo production suite.**
