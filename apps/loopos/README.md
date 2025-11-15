# LoopOS

> Notion meets Ableton meets AI for indie artists

**Status**: Experimental Foundation (Phase 1)
**Purpose**: Help indie artists see their creative-promotion loop visually, know what to do today, and automate tasks using AI agents.

---

## 🎯 Core Metaphor

LoopOS blends three powerful paradigms:

- **Ableton Session View** → Looping timeline, triggers, animations, visual rhythm
- **Notion** → Tasks, notes, templates, structured thinking
- **AI Agents** → Content generation, task automation, intelligent suggestions

---

## 🏗️ Architecture

```
apps/loopos/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main LoopOS home page
│   ├── layout.tsx         # Root layout with fonts
│   └── globals.css        # Global styles and design tokens
├── canvas/                # Loop Canvas (Ableton-style)
│   └── LoopCanvas.tsx     # Main canvas with playback, zoom, pan
├── nodes/                 # Loop Nodes
│   └── LoopNode.tsx       # Draggable action nodes with animations
├── state/                 # State management
│   └── loopStore.ts       # Zustand store for loop state
├── momentum/              # Momentum Engine
│   ├── momentumStore.ts   # Momentum tracking and decay
│   └── MomentumMeter.tsx  # Visual momentum meter
├── notes/                 # Notes System (Notion-like)
│   ├── notesStore.ts      # Notes state management
│   ├── NoteCard.tsx       # Individual note card
│   └── NotesList.tsx      # Notes list with add/remove
├── agents/                # AI Agent System (scaffolding)
│   ├── AgentTypes.ts      # Type definitions
│   ├── AgentManager.ts    # Agent orchestration (mocked)
│   └── agentSchemas.ts    # Zod validation schemas
├── sounds/                # Audio Engine
│   └── audioEngine.ts     # Web Audio API sound system
└── components/            # Shared components
    └── DailyActions.tsx   # Daily action list
```

---

## ✨ Features Implemented

### 1. Loop Canvas (Ableton-style)
- ✅ Draggable action nodes with smooth animations
- ✅ Playback system with BPM control (120 BPM default)
- ✅ Zoom and pan controls
- ✅ Visual grid background
- ✅ Node categories: Create, Promote, Analyse, Refine
- ✅ Node states: upcoming, active, completed
- ✅ Friction indicators (task difficulty 0-10)
- ✅ Priority system (0-10)

### 2. Momentum Engine
- ✅ Real-time momentum tracking (0-100)
- ✅ Momentum decay over time (0.5 points/minute)
- ✅ Streak tracking (current and longest)
- ✅ Momentum levels: Low, Building, Strong, Peak
- ✅ Dynamic colour coding based on momentum
- ✅ Visual meter with animations

### 3. Notes System (Notion-like)
- ✅ Create, read, delete notes
- ✅ Category tagging (Create, Promote, Analyse, Refine)
- ✅ Timestamp tracking
- ✅ Card-based UI with smooth animations
- ✅ Quick add form

### 4. Daily Actions
- ✅ Priority-sorted action list
- ✅ Top 5 pending actions display
- ✅ One-click completion
- ✅ Momentum gain on completion
- ✅ AI suggestions (placeholder)

### 5. Sound System
- ✅ Web Audio API integration
- ✅ Sound types: tick, complete, click, whoosh, error
- ✅ Playback cursor tick sounds
- ✅ Completion sound effects

### 6. AI Agent System (Scaffolding)
- ✅ Type definitions for agents
- ✅ Mock agent execution
- ✅ Agent roles: create, promote, analyse, refine
- ✅ Prompt structure
- ✅ Response handling
- ⏳ **No real API calls yet** (placeholder responses)

---

## 🎨 Design System

### Colour Palette
- **Background**: `#0F1113` (Matte Black)
- **Accent**: `#3AA9BE` (Slate Cyan)
- **Grey Scale**: 100-900 shades

### Node Categories
- **Create**: Cyan `#3AA9BE`
- **Promote**: Purple `#A855F7`
- **Analyse**: Amber `#F59E0B`
- **Refine**: Emerald `#10B981`

### Motion Tokens
- **Fast**: 120ms (micro interactions)
- **Normal**: 240ms (transitions)
- **Slow**: 400ms (ambient effects)

### Typography
- **Sans**: Geist Sans / Inter
- **Mono**: Geist Mono (for BPM, stats)

---

## 🚀 Getting Started

### Install Dependencies
```bash
cd apps/loopos
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

Visit [http://localhost:3001](http://localhost:3001)

### Build for Production
```bash
pnpm build
pnpm start
```

---

## 🧪 Tech Stack

- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.2.0
- **TypeScript**: 5+ (strict mode)
- **State Management**: Zustand 4.5.0
- **Animation**: Framer Motion 11.0.0
- **Styling**: Tailwind CSS 3.4.0
- **Icons**: Lucide React 0.546.0
- **Sound**: Web Audio API
- **Validation**: Zod 3.22.4
- **IDs**: Nanoid 5.1.6

---

## 📋 Current State

### What Works
✅ Full interactive UI
✅ Draggable nodes with animations
✅ Playback system with sound
✅ Momentum tracking and decay
✅ Notes CRUD operations
✅ Daily action list
✅ Sound feedback system

### What's Missing (Next Steps)
⏳ Real AI agent integration (Claude API)
⏳ Database persistence (Supabase)
⏳ User authentication
⏳ Collaborative features
⏳ Analytics and insights
⏳ Integration with TotalAud.io tools
⏳ Export/import functionality
⏳ Custom node types
⏳ Templates and presets

---

## 🎓 Key Concepts

### Loop Nodes
Each node represents an action in your creative loop. Nodes have:
- **Title**: What the action is
- **Category**: Create, Promote, Analyse, or Refine
- **Status**: upcoming, active, or completed
- **Friction**: How difficult (0-10)
- **Priority**: How urgent (0-10)
- **Position**: (x, y) coordinates on canvas
- **Colour**: Category-based colour coding

### Momentum
A score from 0-100 that represents your creative momentum:
- Gained by completing actions (+5 to +10)
- Decays over time (-0.5 per minute)
- Visualised with colour and level labels
- Tracks daily streaks

### Agent Actions (Scaffolding)
AI agents can:
- Generate content (lyrics, ideas)
- Suggest marketing strategies
- Analyse performance data
- Provide improvement feedback

**Note**: Currently using mock responses. Real Claude API integration coming next.

---

## 🔧 Development Commands

```bash
pnpm dev         # Start dev server (port 3001)
pnpm build       # Build for production
pnpm start       # Start production server
pnpm lint        # Run ESLint
pnpm lint:fix    # Fix linting issues
pnpm typecheck   # Check TypeScript types
pnpm clean       # Clean build artifacts
```

---

## 🌟 Vision

LoopOS should help indie artists:

1. **See their loop** → Visual canvas shows the creative-promotion cycle
2. **Know what to do** → Daily actions sorted by priority and friction
3. **Stay motivated** → Momentum meter and streak tracking
4. **Automate hard tasks** → AI agents handle tedious work
5. **Track progress** → Notes and analytics in one place
6. **Integrate tools** → Connect with Audio Intel, Pitch, Tracker

---

## 📝 Notes for Developers

### British English
- Use British spelling throughout: `colour`, `behaviour`, `optimise`, etc.
- Exception: Keep framework conventions (`backgroundColor` in React props)

### Motion Guidelines
- Use Framer Motion (NOT CSS transitions)
- Follow motion token durations (120/240/400ms)
- All animations should feel smooth and intentional

### State Management
- Zustand for global state
- Separate stores for different concerns (loop, momentum, notes)
- Keep stores minimal and focused

### Sound Design
- Use Web Audio API (no external files)
- Oscillator-based sounds (sine, square, sawtooth)
- Keep volumes low (0.1-0.3 range)
- Always wrap in try-catch (graceful degradation)

---

## 🚨 Safety & Isolation

This app is **fully isolated** from other apps in the monorepo:
- ✅ No shared state with aud-web or other apps
- ✅ No environment variable dependencies (yet)
- ✅ No database writes (yet)
- ✅ Safe to develop independently

---

## 🎯 Next Session Goals

1. **Add real Claude API integration** for agents
2. **Add Supabase persistence** for nodes and notes
3. **Build agent UI** for triggering AI actions
4. **Add templates** for common workflows
5. **Create onboarding flow** for new users
6. **Add keyboard shortcuts** (⌘K command palette)
7. **Build export functionality** (export loop as JSON/PDF)

---

**Built with ❤️ for indie artists**
**Part of the TotalAud.io experimental ecosystem**
