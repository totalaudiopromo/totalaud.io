# totalaud.io - Project Summary for ChatGPT

**Last Updated**: October 2025
**Purpose**: Context document for ChatGPT to understand totalaud.io experimental project

---

## 🎯 PROJECT IDENTITY

**Name**: totalaud.io
**Type**: Experimental R&D project (NOT customer acquisition focused)
**Location**: `/Users/chrisschofield/workspace/active/totalaud.io`
**Live URL**: https://totalaud.io (Vercel)
**Vision**: Cinematic AI agent workspace for music promotion - "operator → signal journey"

**Key Distinction**: This is separate from the main Total Audio Platform (customer acquisition project at `/Users/chrisschofield/workspace/active/total-audio-platform/`). This is a learning sandbox for innovation.

---

## 🏗️ TECHNICAL ARCHITECTURE

### Tech Stack
- **Framework**: Next.js 15.0.3 (App Router, React 18.3.1)
- **Language**: TypeScript 5.6.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **State**: Zustand 5.0.2
- **Database**: Supabase (shared with main platform)
- **Animation**: Framer Motion 11.11.17
- **Flow Canvas**: React Flow 11.11.4
- **Sound**: Web Audio API
- **Build**: Turborepo + pnpm workspace
- **Deployment**: Vercel

### Monorepo Structure
```
totalaud.io/
├── apps/
│   └── aud-web/              # Main experimental app (Next.js 15)
│       ├── src/
│       │   ├── app/          # App router pages
│       │   ├── components/   # React components
│       │   │   ├── Onboarding/      # 4-phase onboarding system
│       │   │   ├── themes/          # 5 theme configs
│       │   │   ├── AgentSpawnModal.tsx
│       │   │   ├── FlowCanvas.tsx
│       │   │   ├── FlowStudio.tsx
│       │   │   └── GlobalCommandPalette.tsx
│       │   ├── hooks/        # Custom React hooks
│       │   │   ├── useOnboardingPhase.ts
│       │   │   ├── useOperatorInput.ts
│       │   │   ├── useOSSelection.ts
│       │   │   ├── useAgentSpawner.ts
│       │   │   ├── useTheme.ts
│       │   │   └── useUISound.ts
│       │   ├── lib/          # Utilities
│       │   └── stores/       # Zustand state
│       └── package.json
├── packages/
│   └── core/
│       ├── agent-executor/   # Multi-agent execution engine
│       ├── supabase/         # Supabase client & utilities
│       ├── schemas/          # Shared TypeScript types
│       └── integrations/     # External API integrations
└── supabase/
    └── migrations/
        └── 20251022000000_add_agent_manifests.sql
```

---

## ✅ IMPLEMENTED FEATURES (October 2025)

### Phase 4: Cinematic Onboarding System ✅
**Status**: Complete
**Location**: `apps/aud-web/ONBOARDING.md`

**4-Phase Flow**:
1. **operator** - Terminal boot sequence, operator name input
2. **selection** - Theme selection with arrow keys (5 themes)
3. **transition** - Animated boot sequence based on selected theme
4. **signal** - Main workspace (FlowStudio)

**Components**:
- `OperatorTerminal.tsx` - Boot animation + name input
- `OSSelector.tsx` - Theme cards with arrow key navigation
- `TransitionSequence.tsx` - Boot messages + fade transitions
- `FlowStudio.tsx` - Main workspace wrapper

**Hooks**:
- `useOnboardingPhase()` - State machine for phase transitions
- `useOperatorInput()` - Terminal boot sequence logic (async character typing)
- `useOSSelection()` - Arrow key navigation for theme selection

**Persistence**:
- localStorage tracks `onboarding_completed`
- Can skip with URL param `?skip_onboarding=true`

### Phase 5: Agent Spawning System ✅
**Status**: Complete
**Database**: `agent_manifests` table in Supabase

**Features**:
- Modal-based agent spawning
- 5 agent roles: scout, coach, tracker, insight, custom
- Full configuration: name, role, personality, colour
- Keyboard navigation (Tab, Enter, Escape)
- Command palette integration (⌘K)
- Database persistence with RLS policies

**Components**:
- `AgentSpawnModal.tsx` - Full-featured modal
- `GlobalCommandPalette.tsx` - Command integration

**Hook**:
- `useAgentSpawner()` - CRUD operations for agent manifests
  - `spawn()` - Create agent
  - `list()` - Fetch all user agents
  - `remove()` - Delete agent

**Database Schema**:
```sql
CREATE TABLE agent_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text UNIQUE NOT NULL,
  role text NOT NULL,
  personality text,
  colour text DEFAULT '#10b981',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Command Palette Integration**:
- 5 spawn commands (one per role)
- 1 list agents command
- Full keyboard navigation
- Theme switching commands

### Theme System ✅
**Status**: Complete - 5 themes with full configs
**Themes**: ascii, xp, aqua, daw, analogue

**Architecture**:
- `ThemeResolver.tsx` - Manages theme selection, injects CSS variables
- `ThemeContext.tsx` - React Context for currentTheme, setTheme
- Individual theme configs in `themes/` directory

**Theme Configuration** (TypeScript interface `ThemeConfig`):
```typescript
{
  id: string;
  name: string;
  colors: { background, foreground, accent, border };
  typography: { fontFamily, fontSize, letterSpacing, textTransform };
  motion: { duration: { fast, base, slow }, easing };
  sound: { oscillator, frequencies: { start, complete, error }, durations };
  layout: { borderStyle, borderRadius, shadow, depth, glow, padding };
  narrative: { tagline, personality };
  ambient: { gridMotion, gridSpeed, hoverScale, hapticsEnabled };
}
```

**Theme Personalities**:
- **ascii**: "type. test. repeat." - minimalist producer, green terminal, square waves
- **xp**: "click. bounce. smile." - nostalgic optimist, spring bounce, sine waves
- **aqua**: "craft with clarity." - perfectionist designer, glassy blur, triangle waves
- **daw**: "sync. sequence. create." - experimental creator, 120 BPM tempo-synced, sawtooth
- **analogue**: "touch the signal." - warm lo-fi studio, gentle sine waves, tape grain

**Theme Integration**:
- `MissionPanel` - Uses theme.layout for borders, shadows, glows
- `FlowCanvas` - Theme-aware grid background colors and motion animations
- `AmbientSoundLayer` - Per-theme sound banks (Web Audio API)
- `GlobalCommandPalette` - Theme switching commands

**UI Sounds** (Web Audio API):
- Each theme has unique oscillator type and frequencies
- Respects user preferences (`mute_sounds`, `audio_volume`)
- Example: ascii uses square waves (880Hz start, 1760Hz complete, 220Hz error)

### Code Quality Infrastructure ✅
**Status**: Complete - Production-ready tooling

**Implemented**:
- ✅ ESLint + Prettier (automated formatting)
- ✅ Environment variable validation (`lib/env.ts`)
- ✅ Structured logging (`lib/logger.ts`)
- ✅ API input validation with Zod (`lib/api-validation.ts`)
- ✅ Local fonts (GDPR compliant, no Google CDN)
- ✅ Vitest + React Testing Library (15/15 passing tests)

**Commands**:
```bash
pnpm lint              # Check code quality
pnpm lint:fix          # Auto-fix issues
pnpm format            # Format all code
pnpm test              # Run tests
pnpm typecheck         # TypeScript validation
```

---

## 🎨 DESIGN SYSTEM

### Visual Language
- **Typography**: Lowercase throughout, monospace fonts (JetBrains Mono)
- **Spacing**: 8px rhythm system (DRS - Design Rhythm System)
- **Colors**: Theme-specific palettes, agent green accent (#10b981)
- **Motion**: Reduced motion support, theme-specific animations

### UX Principles
- Keyboard-first navigation (⌘K, ⌘F, arrow keys, escape)
- Accessibility (ARIA labels, reduced-motion, focus states)
- Audio feedback (respects mute preferences)
- Progressive enhancement (works without JavaScript for critical paths)

---

## 🚀 DEPLOYMENT (Vercel)

### Configuration
- **Root Directory**: `apps/aud-web`
- **Build Command**: `cd ../.. && pnpm install && pnpm turbo build --filter=aud-web`
- **Output Directory**: `apps/aud-web/.next`
- **Framework**: Next.js

### Environment Variables (Production)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ANTHROPIC_API_KEY=<anthropic-key>
NEXT_PUBLIC_APP_URL=https://totalaud.io
NODE_ENV=production
```

### Known Issues
**Vercel Module Resolution**: Intermittent build failures with "Module not found" errors for Onboarding components despite files existing in Git. Suspected Turborepo workspace path resolution issue. Workarounds include direct CLI deployment (`vercel --prod`) and cache clearing.

---

## 📝 DEVELOPMENT WORKFLOW

### Getting Started
```bash
# Clone and install
cd /Users/chrisschofield/workspace/active/totalaud.io
pnpm install

# Start dev server
pnpm dev  # Runs on http://localhost:3000

# Type check
pnpm typecheck

# Run tests
cd apps/aud-web && pnpm test
```

### Code Quality Checklist
Before committing:
```bash
pnpm format           # Format code
pnpm lint             # Check for issues
pnpm typecheck        # Verify TypeScript
cd apps/aud-web && pnpm test  # Run tests
```

### Git Conventions
- **Commit Format**: `feat: description` or `fix: description`
- **Branch Naming**: `feature/description` or `bugfix/description`
- **Co-Author Footer**: Include Claude Code attribution in commits

---

## 🎯 PROJECT PHILOSOPHY

**This is an experimental sandbox for**:
- Learning new patterns and technologies
- Testing innovative multi-agent workflows
- Building prototypes without customer pressure
- Exploring AI-powered music industry automation
- Pushing creative boundaries with cinematic UX

**This is NOT**:
- A customer acquisition project (that's total-audio-platform)
- Revenue-focused (focus on innovation and learning)
- Subject to strict deadlines (can experiment and break things)

---

## 🔮 FUTURE ROADMAP

### Phase 6 (Next): Supabase Realtime Integration
- Live agent node rendering on FlowCanvas
- Real-time agent status updates
- Visual ripple effects on agent spawn
- Agent-to-agent communication visualization

### Phase 7 (Future): Personality System
- Theme-aware agent personalities
- Dynamic agent behaviour based on selected theme
- Agent mood states reflected in UI

### Phase 8 (Future): Campaign Execution
- Run campaign flows with real agents
- Progress tracking and analytics
- Results visualization (mixdown generation)

---

## 📚 DOCUMENTATION

**Project Root Documentation**:
- `CLAUDE.md` - Claude Code configuration (this file's counterpart)
- `apps/aud-web/ONBOARDING.md` - Detailed onboarding system docs
- `MIGRATION_GUIDE.md` - Code quality migration guide
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `QUICK_REFERENCE.md` - Command and pattern quick reference

---

## 🤝 COLLABORATION NOTES

### For ChatGPT
- **Vision and Strategy**: You excel at high-level product vision, user stories, and strategic direction
- **Technology Choices**: Validate architecture decisions and suggest alternative approaches
- **UX/UI Design**: Provide feedback on user experience and design patterns
- **Documentation**: Help maintain clear, comprehensive documentation

### For Claude Code
- **Implementation**: Claude Code has direct file access and can implement features
- **Debugging**: Can diagnose and fix issues with full codebase context
- **Refactoring**: Can systematically update code across multiple files
- **Testing**: Can run tests and validate changes

### Shared Context
Both tools should be aware of:
- The experimental nature of this project (freedom to experiment)
- Separation from main platform (different priorities)
- Code quality standards (ESLint, Prettier, TypeScript strict)
- Recent implementations (Phase 4/5 complete, Phase 6 next)

---

## 🚨 RECENT CHANGES (October 2025)

### Theme System Migration
- Renamed 'ableton' → 'daw' and 'punk' → 'analogue'
- Updated 6 files with new theme references
- All TypeScript errors resolved

### Agent Spawning Complete
- Modal-based spawning with full keyboard navigation
- Database persistence with RLS policies
- Command palette integration
- 5 agent roles with colour customization

### Onboarding System Complete
- 4-phase component-based flow
- Arrow key theme selection
- Animated boot sequences per theme
- localStorage persistence

### Code Quality Infrastructure
- ESLint/Prettier configured
- Structured logging implemented
- API validation utilities
- 15/15 tests passing

---

**End of Summary**

This document provides comprehensive context for ChatGPT to understand the totalaud.io project, its current state, and its future direction. Use this as a reference for all conversations about the project moving forward.
