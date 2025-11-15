# LoopOS

> **Cinematic workflow engine for music marketing campaigns**

---

## 🎯 What is LoopOS?

LoopOS is a standalone creative campaign management system that combines:

- **Timeline/Canvas** - Visual campaign sequencing with cinematic feedback
- **Journal** - Daily reflections and momentum tracking
- **Coach** - AI-powered campaign guidance
- **Moodboard** - Visual references and inspiration
- **Creative Packs** - Pre-built campaign templates
- **Playbook** - Strategic chapters and frameworks
- **Flow Insights** - Real-time campaign metrics (Flow Meter v3)
- **Agent SDK** - Extensible skill system for automation
- **Creator Exports** - One-click PDF/HTML/EPK generation

---

## 🚀 Quick Start

```bash
# From monorepo root
cd apps/loopos

# Install dependencies (via pnpm workspace)
pnpm install

# Start development server
pnpm dev

# Visit http://localhost:3001
```

---

## 🏗️ Architecture

### Core Pages

- `/` - Home dashboard with navigation
- `/timeline` - Cinematic canvas with nodes and timeline
- `/journal` - Daily entries and reflections
- `/coach` - AI coaching interface
- `/moodboard` - Visual mood board grid
- `/packs` - Creative pack browser
- `/playbook` - Strategic playbook chapters
- `/insights` - Flow Meter v3 analytics
- `/agents` - Agent workbench (skills testing)
- `/agents/history` - Agent execution history
- `/export` - Export centre (PDF/HTML/EPK/Briefs)

### Database

LoopOS uses a dedicated set of tables via `packages/loopos-db`:

- `loopos_nodes` - Campaign nodes
- `loopos_notes` - General notes
- `loopos_journal_entries` - Daily journal
- `loopos_momentum_sessions` - Flow tracking
- `loopos_creative_packs` - Template packs
- `loopos_playbook_chapters` - Strategy chapters
- `loopos_moodboard_items` - Visual references
- `loopos_agent_executions` - Agent run history

---

## 🎨 Design System

**Palette**:
- Background: Matte Black `#0F1113`
- Accent: Slate Cyan `#3AA9BE`
- Foreground: White/Light Grey

**Motion Tokens**:
- Fast: `120ms cubic-bezier(0.22, 1, 0.36, 1)` (micro feedback)
- Normal: `240ms cubic-bezier(0.22, 1, 0.36, 1)` (transitions)
- Slow: `400ms ease-in-out` (ambient fades)

**Typography**:
- Primary: Geist Sans
- Monospace: Geist Mono

**Language**: British English throughout

---

## 📦 Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.2.0
- **TypeScript**: 5.x (strict mode)
- **Styling**: Tailwind CSS 3.4.0
- **Animation**: Framer Motion 11.x
- **State**: Zustand 4.5.0
- **Database**: Supabase (RLS enabled)
- **Canvas**: React Flow 11.11.4
- **AI**: Anthropic Claude via `@anthropic-ai/sdk`

---

## 🤖 Agent SDK

LoopOS includes a built-in Agent SDK for skills-based automation:

### Built-in Skills

1. **generateNodesSkill** - Generate campaign nodes from brief
2. **improveSequenceSkill** - Optimise node dependencies
3. **coachDailyPlanSkill** - Generate daily action plan
4. **insightExplainerSkill** - Explain Flow Insights v3 data
5. **packCustomiserSkill** - Tailor Creative Packs to artist

### Usage

```typescript
import { runSkill } from '@loopos/agents-sdk/runtime'

const result = await runSkill('generateNodesSkill', {
  brief: 'Radio campaign for indie rock single',
  goals: ['BBC Radio 6', 'Regional stations'],
  timeHorizon: '6 weeks'
}, context)
```

---

## 📤 Export System

Generate professional deliverables:

### Export Types

- **Campaign Pack** (PDF/HTML/JSON) - Full campaign summary
- **EPK** (PDF/HTML) - Electronic press kit
- **PR Brief** (PDF) - For PR agencies
- **Radio Brief** (PDF) - For radio pluggers
- **Social Brief** (PDF) - For social media teams

### Architecture

```
src/export/
├── serializers/        # Data gathering
├── templates/          # PDF/HTML templates
└── exporters/          # Generation logic
```

---

## 📱 Mobile Optimisation

Phase 6 includes mobile-first responsive design:

- **Touch gestures** on timeline (drag, pinch-zoom)
- **Bottom navigation** for phone/tablet
- **Responsive layouts** for all pages
- **Performance** optimisations (lazy-loading, code-splitting)

---

## 🔧 Development Commands

```bash
# Development
pnpm dev              # Start dev server (port 3001)
pnpm build            # Build for production
pnpm start            # Start production server

# Quality
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint check
pnpm lint:fix         # Auto-fix linting issues

# Clean
pnpm clean            # Remove .next build folder
```

---

## 🗄️ Database Migrations

LoopOS migrations are in `supabase/migrations/`:

```sql
-- Example: loopos_nodes table
CREATE TABLE loopos_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  position jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE loopos_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own nodes" ON loopos_nodes FOR SELECT USING (auth.uid() = user_id);
```

---

## 🚨 Constraints

- **Isolated**: LoopOS must not import from `apps/aud-web` or other apps
- **Self-contained**: All logic in `apps/loopos` and `packages/loopos-db`
- **Strict TypeScript**: No `any` types in production code
- **Zod validation**: All API routes and DB inputs must be validated
- **British English**: Mandatory for all user-facing text

---

## 📚 Documentation

- [PHASE_6_IMPLEMENTATION.md](../../PHASE_6_IMPLEMENTATION.md) - Full implementation details
- [CLAUDE.md](../../CLAUDE.md) - Project configuration
- [README.md](../../README.md) - Monorepo overview

---

## 🎯 Phase 6 Goals

This implementation covers:

✅ **Track A**: Agent SDK with 5 built-in skills
✅ **Track B**: Mobile + touch optimisation
✅ **Track C**: Creator exports (PDF/HTML/EPK/Briefs)

---

**Version**: 1.0.0
**Status**: Active Development
**Language**: British English
**Design**: Matte Black × Slate Cyan
