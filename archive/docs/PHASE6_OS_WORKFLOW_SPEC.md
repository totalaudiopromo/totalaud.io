# Phase 6: OS Studio Refactor - Complete Specification

## 🎯 Overview

The OS Studio Refactor transforms the totalaud.io dashboard from a single node-based interface into **five distinct creative environments**, each with its own metaphor, interaction model, and emotional tone. All Studios share the same underlying workflow engine (`BaseWorkflow.tsx`) but present radically different user experiences.

**Status**: ✅ **COMPLETE** - All 5 Studios implemented with routing and command palette integration

---

## 🏗️ Architecture

### Core Components

```
apps/aud-web/src/
├── components/
│   ├── BaseWorkflow.tsx           # Shared logic layer (agents, state, execution)
│   └── Studios/
│       ├── ASCIIStudio.tsx        # Terminal desk environment
│       ├── XPStudio.tsx           # Guided wizard interface
│       ├── AquaStudio.tsx         # Visual drag canvas
│       ├── DAWStudio.tsx          # Timeline sequencer
│       ├── AnalogueStudio.tsx     # Reflective journal
│       └── index.ts               # Studio exports
├── hooks/
│   └── useThemeLayout.ts          # OS-specific layout configs
└── app/
    └── studio/
        └── [theme]/
            └── page.tsx           # Dynamic Studio router
```

### Data Flow

```
User Action → BaseWorkflow (state management)
            ↓
     WorkflowActions (exposed via render props)
            ↓
     Studio UI (theme-specific rendering)
```

---

## 📐 Studio Specifications

### 1. ASCII Studio

**Metaphor**: Terminal Desk
**Route**: `/studio/ascii`
**Theme**: `ascii`

**Layout**:
- Left: Flow graph (always visible)
- Right: Command input + log stream
- Bottom: Quick action buttons

**Interaction Model**:
- Primary: Keyboard/typing
- Command-driven interface
- Instant feedback in logs
- Node visibility: Always visible as data logs

**Key Features**:
- Terminal-style command parsing (`run`, `stop`, `reset`, `add`, `help`)
- Green monochrome aesthetic (#10b981)
- Live log streaming
- Beat-synced feedback (optional)

**Personality**: Focused producer, minimalist, direct

---

### 2. XP Studio

**Metaphor**: Guided Assistant
**Route**: `/studio/xp`
**Theme**: `xp`

**Layout**:
- Center: Large wizard cards
- Top: Progress indicator (5 steps)
- Right: Optional advanced workflow view

**Interaction Model**:
- Primary: Clicking/tapping
- Step-by-step wizard flow
- Friendly, reassuring language
- Node visibility: Hidden by default (advanced toggle)

**Steps**:
1. Welcome - Introduction with benefits grid
2. Configure - Campaign name and goal selection
3. Review - Summary of configuration
4. Execute - Launch campaign with loading state
5. Complete - Success confirmation

**Personality**: Nostalgic optimist, friendly guide, approachable

---

### 3. Aqua Studio

**Metaphor**: Visual Map
**Route**: `/studio/aqua`
**Theme**: `aqua`

**Layout**:
- Full canvas: ReactFlow with glassy controls
- Top-right: Floating control panel
- Bottom: Execution log drawer (when active)

**Interaction Model**:
- Primary: Dragging nodes
- Visual spatial thinking
- Calm, uncluttered interface
- Node visibility: Always visible

**Key Features**:
- Glassy/blur effects throughout
- Minimap toggle
- Grid visibility toggle
- Floating action panels
- Smooth, slow animations

**Personality**: Perfectionist designer, clarity-focused, calm

---

### 4. DAW Studio

**Metaphor**: Timeline
**Route**: `/studio/daw`
**Theme**: `daw`

**Layout**:
- Top: Transport controls (play/pause/stop)
- Center: Horizontal timeline with tracks
- Ruler: Beat markers (0-20)
- Playhead: Animated position indicator

**Interaction Model**:
- Primary: Sequencing/arranging
- Tempo-synced (120 BPM)
- Clips represent workflow segments
- Node visibility: Nodes appear as timeline clips

**Key Features**:
- Real-time playhead animation
- Multiple tracks with color coding
- Clip progress bars during execution
- Settings panel (tempo, grid snap)
- Dark theme (#18181b zinc)

**Personality**: Experimental creator, precision-focused, rhythmic

---

### 5. Analogue Studio

**Metaphor**: Journal
**Route**: `/studio/analogue`
**Theme**: `analogue`

**Layout**:
- Center: Scrollable journal entries
- Bottom: Writing input textarea
- Hidden: Workflow insights (toggle to reveal)

**Interaction Model**:
- Primary: Writing/reflection
- Conversational AI responses
- Warm, tactile aesthetics
- Node visibility: Hidden by default ("Insight View" reveals)

**Key Features**:
- Journal entry history (user + agent responses)
- Lined paper background effect
- Serif typography for user input
- Agent responses in amber callouts
- ⌘+Enter to submit
- Gradient warm colors (amber/orange)

**Personality**: Human hands, warm reflection, contemplative

---

## 🔧 Technical Implementation

### BaseWorkflow Component

**Purpose**: Shared logic layer for all Studios

**Responsibilities**:
- Agent execution state management
- Node/edge operations (add, delete, connect)
- Realtime synchronization
- Flow execution lifecycle
- Render props pattern for flexible UI

**API**:
```typescript
interface WorkflowState {
  nodes: Node[]
  edges: Edge[]
  isExecuting: boolean
  executionLogs: string[]
  agentStatuses: Record<string, AgentStatus>
  sessionId: string
}

interface WorkflowActions {
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: Connection) => void
  executeFlow: () => void
  stopExecution: () => void
  resetFlow: () => void
  addNode: (type: string, position: { x: number; y: number }) => void
  deleteNode: (nodeId: string) => void
}
```

**Usage Pattern**:
```tsx
<BaseWorkflow initialTemplate={template}>
  {(state, actions) => (
    <YourStudioUI state={state} actions={actions} />
  )}
</BaseWorkflow>
```

---

### useThemeLayout Hook

**Purpose**: Provides OS-specific layout configurations

**Return Type**:
```typescript
interface ThemeLayoutConfig {
  layout: 'terminal' | 'steps' | 'canvas' | 'timeline' | 'journal'
  nodeVisibility: 'always' | 'hidden' | 'toggle' | 'segments'
  defaultState: 'active-input' | 'wizard' | 'overview' | 'tracks' | 'reflective'
  metaphor: string
  primaryInteraction: 'typing' | 'clicking' | 'dragging' | 'sequencing' | 'writing'
  showAdvancedTools: boolean
  ambientSound: { enabled: boolean; intensity: 'subtle' | 'medium' | 'immersive' }
  motion: { transitionSpeed: string; enableParallax: boolean; enableHoverEffects: boolean }
  ui: {
    showConsoleShell: boolean
    showMissionPanel: boolean
    showFlowCanvas: boolean
    showTimeline: boolean
    showJournal: boolean
  }
}
```

**Usage**:
```tsx
const config = useThemeLayout('ascii')
// config.layout === 'terminal'
// config.nodeVisibility === 'always'
```

---

## 🎨 Design System Integration

### Per-Studio Colors

| Studio | Primary | Accent | Background |
|--------|---------|---------|------------|
| ASCII | #10b981 (green) | #0a3d0a | #000000 |
| XP | #3b82f6 (blue) | #10b981 | gradient(blue-50, white, green-50) |
| Aqua | #60a5fa (sky) | #0ea5e9 | gradient(slate-50, blue-50) |
| DAW | #a855f7 (purple) | #ec4899 | #18181b (zinc-900) |
| Analogue | #f59e0b (amber) | #f97316 | gradient(amber-50, orange-50) |

### Motion Profiles

| Studio | Speed | Parallax | Hover Effects |
|--------|-------|----------|---------------|
| ASCII | Fast | No | Yes (glow) |
| XP | Medium | Yes | Yes (bounce) |
| Aqua | Slow | Yes | Yes (scale) |
| DAW | Fast | No | Yes (highlight) |
| Analogue | Slow | Yes | No |

---

## 🗺️ Routing

### Dynamic Routes

All Studios use a single dynamic route: `/studio/[theme]`

**Valid themes**: `ascii`, `xp`, `aqua`, `daw`, `analogue`

**Implementation**: `apps/aud-web/src/app/studio/[theme]/page.tsx`

**Static Generation**: All 5 theme pages pre-rendered at build time

**Navigation**:
```tsx
// Via Next.js Link
<Link href="/studio/ascii">ASCII Studio</Link>

// Via router
router.push('/studio/aqua')

// Via Command Palette
⌘K → "open aqua studio"
```

---

## ⌘ Command Palette Integration

### New Commands (5 added)

```
⌘K → "open ascii studio"      → /studio/ascii
⌘K → "open xp studio"          → /studio/xp
⌘K → "open aqua studio"        → /studio/aqua
⌘K → "open daw studio"         → /studio/daw
⌘K → "open analogue studio"    → /studio/analogue
```

**Icons**:
- ASCII: Terminal
- XP: Sparkles
- Aqua: Layers
- DAW: Music
- Analogue: BookOpen

**Keywords** (searchable):
- ASCII: studio, ascii, terminal, command, minimal
- XP: studio, xp, wizard, guided, friendly
- Aqua: studio, aqua, canvas, visual, map, design
- DAW: studio, daw, timeline, sequencer, tempo
- Analogue: studio, analogue, analog, journal, writing, reflection

---

## 🎯 UX Principles

### Progressive Disclosure

1. **First 60 seconds**: Should feel approachable and inspiring
2. **After first success**: Reveal advanced tools (nodes, logs, metrics)
3. **Expert mode**: Full control and visibility

### Emotional Alignment

Each Studio evokes its creative archetype:
- **ASCII**: Focus and speed
- **XP**: Play and confidence
- **Aqua**: Clarity and calm
- **DAW**: Rhythm and precision
- **Analogue**: Warmth and reflection

### Sound + Motion

- Ambient sound layers per OS theme
- UI sounds tied to actions (spawn, execute, complete)
- Motion speed matches creative tempo

---

## 📊 Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| `useThemeLayout` hook | ✅ Complete | 5 configs defined |
| `BaseWorkflow.tsx` | ✅ Complete | Render props pattern |
| ASCII Studio | ✅ Complete | Terminal + command parser |
| XP Studio | ✅ Complete | 5-step wizard flow |
| Aqua Studio | ✅ Complete | Full canvas + controls |
| DAW Studio | ✅ Complete | Timeline + beat sync |
| Analogue Studio | ✅ Complete | Journal + insights |
| Dynamic routing | ✅ Complete | `/studio/[theme]` |
| Command palette | ✅ Complete | 5 navigation commands |
| Documentation | ✅ Complete | This file! |

---

## 🚀 Next Steps (Future Enhancements)

### Phase 6.1: Analytics & Metrics
- Add `FirstHourExperience()` component
- Track friction points per Studio
- A/B test Studio preferences

### Phase 6.2: Studio Customization
- Allow users to customize Studio layouts
- Save per-Studio preferences
- Share Studio configurations

### Phase 6.3: Cross-Studio Workflows
- Start in XP, finish in ASCII
- Copy/paste workflows between Studios
- Studio-specific export formats

### Phase 6.4: Mobile Studios
- Responsive Studio layouts
- Touch-optimized interactions
- Mobile-first Studio (new metaphor?)

---

## 📚 Related Documentation

- [CLAUDE.md](CLAUDE.md) - Project configuration
- [README.md](README.md) - Getting started
- [apps/aud-web/ONBOARDING.md](apps/aud-web/ONBOARDING.md) - Phase 4 onboarding
- [Flow State Design System](https://docs.totalaudio.com/design) - Design principles

---

**Specification Version**: 1.0.0
**Last Updated**: October 2025
**Author**: Claude Code + Chris Schofield
**Status**: ✅ Implementation Complete

---

## 🎉 Summary

The OS Studio Refactor successfully transforms totalaud.io from a single technical interface into **five emotionally distinct creative environments**. Each Studio maintains the same powerful workflow engine while presenting a unique interaction model tailored to different creative working styles.

**Key Achievement**: Users can now choose the Studio that matches their creative process, making the platform approachable for beginners (XP), powerful for experts (ASCII), visual for designers (Aqua), rhythmic for producers (DAW), and reflective for strategists (Analogue).

**Result**: A single platform that feels like five different applications, all powered by the same realtime multi-agent system. 🚀
