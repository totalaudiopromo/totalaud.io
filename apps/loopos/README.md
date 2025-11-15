# LoopOS — Creative Campaign Operating System

**Status**: Phase 7 Implementation (In Progress)
**Version**: 1.0.0-alpha
**Port**: 3001 (separate from aud-web on 3000)

LoopOS is a standalone creative campaign companion for music promotion, powered by AI. It provides a comprehensive workspace for planning, executing, and exporting music promotion campaigns.

---

## 🎯 Project Overview

LoopOS is a self-contained Next.js 15 application within the totalaud.io monorepo that provides:

- **Multi-workspace collaboration** with role-based access (owner, editor, viewer)
- **Timeline canvas** for visual campaign planning
- **AI-powered tools** (Coach, Designer Mode)
- **Creative Packs** library with templates and frameworks
- **Playbook** for strategic guidance
- **Journal** for reflections and voice memos
- **Export Centre** for generating campaign materials
- **TAP Integration** with Total Audio Promo platform

---

## 🏗️ Architecture

### Location in Monorepo

```
totalaud.io/
├── apps/
│   └── loopos/                 # LoopOS app (Next.js 15)
├── packages/
│   └── loopos-db/              # Database client and helpers
└── supabase/
    └── migrations/
        └── 20251115000000_loopos_phase_7_setup.sql
```

### Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.6.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **State**: Zustand 5.0.2
- **Database**: Supabase (shared instance)
- **Auth**: Supabase passwordless magic links
- **Animation**: Framer Motion 11.11.17
- **AI**: Anthropic Claude (Coach + Designer Mode)
- **Validation**: Zod 3.22.4
- **UI**: Lucide React icons

### Design System

- **Accent**: Slate Cyan `#3AA9BE`
- **Background**: Matte Black `#0F1113`
- **Foreground**: White/Light Grey
- **Border**: `#2A2D30`
- **Font**: Inter (sans), JetBrains Mono (mono)
- **Language**: British English (all code, docs, UI)

---

## 📦 Database Schema

### Core Tables

| Table | Purpose | RLS Enabled |
|-------|---------|-------------|
| `loopos_workspaces` | Workspace management | ✅ |
| `loopos_workspace_members` | Workspace membership + roles | ✅ |
| `loopos_nodes` | Timeline canvas nodes | ✅ |
| `loopos_notes` | Quick notes (linked to nodes) | ✅ |
| `loopos_journal_entries` | Journal entries (text/voice) | ✅ |
| `loopos_moodboard_items` | Visual references | ✅ |
| `loopos_creative_packs` | Templates + resources | ✅ |
| `loopos_playbook_chapters` | Strategic guidance | ✅ |
| `loopos_flow_sessions` | Focused work sessions | ✅ |
| `loopos_agent_executions` | AI agent runs | ✅ |
| `loopos_auto_chains` | Automation workflows | ✅ |
| `loopos_exports` | Generated exports | ✅ |

### RLS Policies

All tables implement Row Level Security (RLS) with policies for:
- **SELECT**: Users can view workspace data they belong to
- **INSERT**: Editors and owners can create data
- **UPDATE**: Editors and owners can modify data
- **DELETE**: Owners can delete data (editors for some tables)

Journal entries and flow sessions are user-scoped (only viewable by creator).

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase project (or local instance)
- Anthropic API key (optional, for AI features)

### Installation

```bash
# From monorepo root
pnpm install

# Navigate to LoopOS
cd apps/loopos

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Create `.env` in `apps/loopos/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# AI (optional)
ANTHROPIC_API_KEY=your-anthropic-key

# TAP Integration (optional)
TAP_API_URL=https://api.totalaudiopromo.com
TAP_API_KEY=your-tap-api-key
```

### Database Setup

```bash
# From monorepo root
pnpm db:migrate

# Or run migration directly
supabase db push
```

This creates all LoopOS tables with RLS policies.

### Development

```bash
# From monorepo root
pnpm dev

# Or from apps/loopos
pnpm dev
```

LoopOS runs on `http://localhost:3001` (separate from aud-web on 3000).

---

## 📱 Features

### ✅ Implemented (Phase 7a)

- [x] Supabase passwordless authentication (magic links)
- [x] Multi-workspace support
- [x] Workspace creation, switching, and management
- [x] Role-based access control (owner, editor, viewer)
- [x] RLS policies on all tables
- [x] Workspace switcher UI
- [x] Responsive navigation (desktop + mobile)
- [x] Dashboard with auth guards
- [x] PWA manifest and service worker
- [x] Environment variable validation

### 🚧 In Progress

- [ ] Timeline canvas with React Flow
- [ ] Node creation and management
- [ ] Packs library
- [ ] Playbook chapters
- [ ] Coach AI interface
- [ ] Journal with voice memos
- [ ] Export Centre

### 📋 Planned (Phase 7b-7d)

**Track 2: TAP Integration**
- [ ] Console export (tasks, creative refs)
- [ ] Audio Intel enrichment (audience insights)
- [ ] Tracker submission helpers
- [ ] Pitch generation (press releases, EPKs)

**Track 3: AI Designer Mode**
- [ ] VisionOS-inspired visual engine
- [ ] AI scene generation
- [ ] Strategy visualisation
- [ ] Iterative regeneration

**Track 4: iOS/PWA**
- [ ] Touch gestures (pinch, drag, long-press)
- [ ] Offline mode with sync queue
- [ ] Install prompts
- [ ] Haptic feedback

---

## 🛠️ Development Commands

```bash
# Development
pnpm dev                  # Start dev server (port 3001)
pnpm build                # Build for production
pnpm start                # Start production server

# Code Quality
pnpm lint                 # Check for linting issues
pnpm lint:fix             # Auto-fix linting issues
pnpm typecheck            # TypeScript type checking

# Utilities
pnpm clean                # Clean build artifacts
```

---

## 📁 Project Structure

```
apps/loopos/
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   ├── dashboard/        # Main timeline view
│   │   ├── packs/            # Creative Packs
│   │   ├── playbook/         # Playbook chapters
│   │   ├── coach/            # AI Coach interface
│   │   ├── journal/          # Journal entries
│   │   ├── export/           # Export Centre
│   │   ├── designer/         # AI Designer Mode
│   │   ├── login/            # Auth login page
│   │   ├── auth/callback/    # Auth callback
│   │   └── logout/           # Logout route
│   ├── components/           # React components
│   │   ├── AppShell.tsx      # Main nav layout
│   │   ├── AuthGuard.tsx     # Auth protection
│   │   └── WorkspaceSwitcher.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Auth state
│   │   └── useWorkspace.ts   # Workspace state
│   ├── stores/               # Zustand stores
│   │   └── workspace.ts
│   ├── lib/                  # Utilities
│   │   ├── env.ts            # Env validation (Zod)
│   │   └── auth.ts           # Auth helpers
│   ├── integrations/         # TAP integration layer
│   │   ├── console/          # Console API
│   │   ├── audio-intel/      # Intel API
│   │   ├── tracker/          # Tracker API
│   │   └── pitch/            # Pitch generation
│   └── types/                # TypeScript types
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   └── icons/                # App icons
└── package.json

packages/loopos-db/
├── src/
│   ├── client.ts             # Supabase client
│   ├── types.ts              # Database types
│   ├── workspace.ts          # Workspace helpers
│   ├── nodes.ts              # Nodes helpers
│   ├── journal.ts            # Journal helpers
│   ├── packs.ts              # Packs helpers
│   └── playbook.ts           # Playbook helpers
└── package.json
```

---

## 🎨 Design Principles

### British English
All code, documentation, and UI uses British English:
- ✅ `colour`, `centre`, `organisation`, `visualise`
- ❌ `color`, `center`, `organization`, `visualize`

### Mobile-First
- All UI designed for mobile first
- Responsive navigation (sidebar on desktop, drawer on mobile)
- Touch-optimised interactions
- PWA-ready for installation

### TypeScript Strict Mode
- No `any` types allowed
- Zod validation for all API routes
- Comprehensive type definitions

---

## 🔒 Security

- **RLS enforced** on all database tables
- **Environment validation** on startup (Zod)
- **Magic link authentication** (passwordless)
- **Workspace isolation** (users only see their workspaces)
- **Role-based permissions** (owner, editor, viewer)

---

## 🚢 Deployment

LoopOS can be deployed independently or alongside aud-web:

```bash
# Build production
pnpm build

# Deploy to Railway/Vercel
railway up
# or
vercel deploy
```

**Environment variables must be set** in deployment platform.

---

## 📚 Documentation

- [PHASE_7_IMPLEMENTATION.md](./docs/PHASE_7_IMPLEMENTATION.md) - Complete implementation guide
- [API.md](./docs/API.md) - API documentation (coming soon)
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Contribution guidelines (coming soon)

---

## 🤝 Integration with Total Audio Promo

LoopOS integrates with TAP via client-side API calls:

| TAP Feature | LoopOS Integration |
|-------------|-------------------|
| Console | Export sequences to tasks |
| Audio Intel | Enrich campaigns with audience insights |
| Tracker | Convert nodes to submissions |
| Pitch | Generate press materials |

**Note**: Integration layer uses public TAP APIs only (no direct database access).

---

## 📄 License

Part of the totalaud.io experimental project.

---

## 🧑‍💻 Development Status

**Current Phase**: Phase 7a Complete (Auth + Workspaces + RLS)
**Next Phase**: Phase 7b (TAP Integration Layer)
**Timeline**: Iterative development, no fixed deadline

---

**Last Updated**: 2025-11-15
