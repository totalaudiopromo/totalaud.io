# TotalAud.io Monorepo

AI-powered music marketing platform combining professional tools with experimental creative interface.

**🚀 Live Demo**: https://aud-web-production.up.railway.app

## 🎵 What is TotalAud.io?

**Total Audio Promo** → Professional toolkit for PRs, labels, and artists  
**TotalAud.io** → Experimental creative studio  
**Together** → One unified AI-powered ecosystem

> "Marketing your music should be as creative as making it."

## 📁 Project Structure

```
totalaud.io/
├── apps/
│   ├── aud-web/              # TotalAud.io creative interface
│   └── totalaudiopromo/      # Professional tools (to be migrated)
├── packages/
│   ├── core/                 # Shared business logic
│   │   ├── supabase/        # Database client
│   │   ├── ai-provider/     # AI abstraction layer
│   │   ├── skills-engine/   # Skill execution system
│   │   └── agent-executor/  # Agent orchestration
│   ├── ui/                   # Shared React components
│   └── schemas/              # TypeScript types
├── skills/                   # YAML skill definitions
│   ├── scout/               # Research skills
│   ├── coach/               # Generation skills
│   └── tracker/             # Analysis skills
└── supabase/                # Database migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase CLI
- Docker (for local Supabase)

### Installation

```bash
# Install dependencies
pnpm install

# Start Supabase locally
pnpm db:start

# Run migrations
pnpm db:migrate

# Generate TypeScript types
pnpm db:types

# Start development servers
pnpm dev
```

Visit:
- **aud-web**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323

### Environment Setup

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your keys:
# - Supabase URL and keys
# - OpenAI API key
# - Anthropic API key
```

## 🏗️ Architecture

### Agent System

Modular AI agents powered by reusable skills:

- **Scout Agent** → Research contacts, discover opportunities
- **Coach Agent** → Generate pitches, craft messages
- **Tracker Agent** → Monitor campaigns, analyze results
- **Insight Agent** → Pattern detection, recommendations

### Skills

YAML-defined capabilities that agents can use:

```yaml
name: research-contacts
category: research
provider: custom
input:
  query: string
  type: enum
  genres: string[]
output:
  contacts: Contact[]
```

### Dual Interface

**aud-web** (TotalAud.io)
- Command Palette (⌘K)
- Flow Canvas
- Agent Bubbles
- Creative, experimental

**totalaudiopromo**
- Traditional forms
- Campaign CRM
- Professional, stable

Both share the same backend and agent system.

## 📚 Documentation

- `ARCHITECTURE_MERGE_PLAN.md` — Complete migration strategy
- `TOTALAUD_TECH_AUDIT.md` — Technical audit
- `totalaudio-overview.md` — Product vision

## 🛠️ Development Commands

```bash
# Development
pnpm dev                # Start all apps
pnpm build              # Build all packages
pnpm typecheck          # Type check all packages
pnpm lint               # Lint all packages

# Database
pnpm db:start           # Start Supabase
pnpm db:stop            # Stop Supabase
pnpm db:migrate         # Run migrations
pnpm db:reset           # Reset database
pnpm db:types           # Generate TypeScript types

# Deployment (Railway)
railway up              # Deploy to Railway
railway status          # Check deployment status
railway logs            # View deployment logs
railway domain          # Generate/view public domain
railway open            # Open project in Railway dashboard

# Cleanup
pnpm clean              # Clean all build artifacts
```

## 🌐 Deployment

**Platform**: Railway
**Live URL**: https://aud-web-production.up.railway.app
**Config**: See `railway.json` in repository root

Railway was chosen over Vercel due to better support for Next.js 15 + pnpm workspace + Turborepo monorepo structures.

## 🗺️ Roadmap

- [x] Week 1: Foundation (monorepo, migrations)
- [ ] Week 2: Skills system
- [ ] Week 3: Agent orchestrator
- [ ] Week 4: UI foundation
- [ ] Week 5: Integration & testing
- [ ] Week 6: Beta launch

## 📦 Packages

### Core Packages

- `@total-audio/core-supabase` — Database client & auth
- `@total-audio/core-ai-provider` — OpenAI/Anthropic abstraction
- `@total-audio/core-skills-engine` — YAML skill loader & executor
- `@total-audio/core-agent-executor` — Agent orchestration
- `@total-audio/core-contacts` — Contact management

### UI Packages

- `@total-audio/ui` — Shared React components

### Schema Packages

- `@total-audio/schemas-database` — Supabase types
- `@total-audio/schemas-skills` — Skill type definitions

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @total-audio/core-skills-engine test
```

## 📝 License

Proprietary — © 2025 Total Audio

