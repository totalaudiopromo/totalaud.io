# Console Interaction Specification

**Version**: 1.0
**Date**: October 24, 2025
**Status**: Phase 2 Complete - Refined Workspace

---

## 🎯 Overview

The Console Environment is a single-screen workspace that replaces traditional dashboard navigation with a fluid, mode-based interface. Inspired by studio control surfaces and creative tools, it emphasizes **smooth motion, contextual actions, and calm continuity** over traditional CRUD interfaces.

---

## 🏗️ Architecture

### Three-Pane Layout (12-Column Grid)

```
┌────────────────────────────────────────────────────────────────────┐
│  totalaud.io          Untitled Campaign                       ⌘K   │  ← Header (64px)
├────────────────────────────────────────────────────────────────────┤
│          │                                    │                     │
│ Mission  │        Context Pane                │   Insight Panel     │
│  Stack   │     (Dynamic Content)              │   (Metrics/Goals)   │
│ (3 cols) │         (6 cols)                   │      (3 cols)       │
│          │                                    │                     │
│  • Plan  │  [Plan Mode: Release Form]         │  Active Agents: 3   │
│  • Do    │  [Do Mode: Pitch Launcher]         │  Tasks: 12          │
│  • Track │  [Track Mode: Metrics Dashboard]   │  Contacts: 47       │
│  • Learn │  [Learn Mode: Analytics]           │  Open Rate: 24%     │
│          │                                    │                     │
│          │  OR                                │  Current Goals:     │
│          │                                    │  • 100 contacts     │
│          │  [Activity Stream]                 │  • 50 pitches       │
│          │  (when activePane = 'activity')    │  • 30% open rate    │
│          │                                    │                     │
├────────────────────────────────────────────────────────────────────┤
│  ● 0 active agents      ▮▮▮▮▮▮▯▯▯▯▯▯               READY           │  ← Footer (48px)
└────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual System

### Color Palette

```typescript
background: {
  primary: '#0F1113',      // Deep charcoal base
  secondary: '#1A1D21',    // Panel backgrounds
  tertiary: '#252A30',     // Raised surfaces (cards, inputs)
}

accent: {
  primary: '#3AE1C2',      // Teal - primary actions
  hover: '#4AEFD4',        // Lighter teal
  muted: '#2AB89F',        // Darker teal
}

text: {
  primary: '#E5E7EB',      // Almost white - main content
  secondary: '#9CA3AF',    // Gray - supporting text
  tertiary: '#6B7280',     // Darker gray - labels
}

border: {
  default: '#252A30',      // Subtle dividers
  subtle: '#1F2428',       // Even more subtle
  focus: '#3AE1C2',        // Focus states
  accent: 'rgba(58, 225, 194, 0.2)',  // 20% opacity dividers
}
```

### Typography

- **Brand**: Inter, system-ui, sans-serif
- **Mono**: Space Grotesk, JetBrains Mono
- **Sizes**: 14px (small), 16px (body), 18px (h3), 20px (h2), 24px (h1)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)

### Spacing (12px Grid System)

- Element padding: 12px
- Pane padding: 24px
- Section margin: 16px
- Container padding: 24px
- Gap: 24px

---

## 🎭 Motion System

### Spring Motion (240ms Tight Spring)

**Activity Stream Entry Animation:**
```typescript
{
  initial: { y: 12, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.8,
      duration: 0.24,  // 240ms
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  }
}
```

**Characteristics:**
- Stiffness: 400 (responsive, tight)
- Damping: 30 (minimal overshoot)
- Mass: 0.8 (lightweight feel)
- Duration: ≤ 240ms (feels instant, not sluggish)

### Pane Switching (150ms Horizontal Slide)

**Mode Transition:**
```typescript
{
  initial: (direction) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1],  // easeOutSoft
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -20 : 20,
    opacity: 0,
    transition: { duration: 0.15 },
  }),
}
```

**Characteristics:**
- Direction-aware (left/right based on mode order)
- Horizontal slide: 20px displacement
- Duration: 150ms (seamless, non-disruptive)
- Easing: easeOutSoft for smooth deceleration

### Visual Hierarchy

- **Active pane**: 100% opacity
- **Inactive panes**: 85% opacity (subtle de-emphasis)
- **Older events** (index > 5): 60% opacity (visual recency hierarchy)
- **Accent dividers**: 20% opacity teal borders between center pane

---

## 🔄 Interaction Patterns

### Mode Switching (No Route Changes)

**Mission Stack Buttons:**
1. User clicks "Plan" / "Do" / "Track" / "Learn"
2. `setMissionView(mode)` updates store
3. `setActivePane('mission')` ensures center shows ContextPane
4. Center pane animates horizontally (150ms slide)
5. Mode header updates: "PLAN" / "DO" / "TRACK" / "LEARN"
6. Contextual content renders based on `activeMode`

**No Page Reloads:**
- All transitions happen client-side
- State managed via Zustand (`useConsoleStore`)
- URL stays `/console` (no route params)

### Activity Stream Batching

**Event Generation:**
- Mock events generate every 3 seconds
- Events buffer in `pendingEvents` array
- Batch render every 5 seconds for smooth animation
- Prevents constant reflows and visual "jump"

**Visual Flow:**
```
Generate → Buffer → Batch Render (5s intervals)
   ↓          ↓            ↓
  3s        Queue      Smooth spring animation
```

**Performance:**
- Keep last 200 events maximum
- Smooth 60fps animation even with rapid updates
- No scroll position jump (maintains anchor)

### Form Submissions

**Plan Mode (Release Info):**
1. User enters release name + date
2. Clicks "Save Release Info"
3. Event added: `"Release planned: "{name}" on {date}"`
4. Form clears, ready for next entry
5. Event appears in Activity Stream (if visible)

**Do Mode (Pitch Launcher):**
1. User enters pitch target (e.g., "BBC Radio 1")
2. Clicks "Launch Pitch"
3. Event added: `"Pitch launched to: {target}"`
4. Form clears
5. Tip reminder: Use ⌘K for "generate pitch" / "find curators"

---

## 🎹 Keyboard Shortcuts

### Command Palette (⌘K)

**Console Navigation:**
- `open plan` - Navigate to Plan mode
- `open do` - Navigate to Do mode
- `open track` - Navigate to Track mode
- `open learn` - Navigate to Learn mode
- `open activity` - Switch center pane to Activity Stream
- `open insight` - Focus Insight Panel

**Sound Feedback:**
- Each command triggers theme-specific sound (respects mute)
- "interact" sound on mode switch
- "execute" sound on action completion

---

## 📊 Performance Metrics

### Target Benchmarks

- **Frame Rate**: ≥ 55fps during feed activity
- **Spring Animation**: 240ms (feels immediate)
- **Pane Switch**: 150ms (seamless)
- **Event Batching**: 5-second intervals (smooth, not jarring)
- **Memory**: Handle 200+ events without degradation

### Achieved Results (Phase 2)

✅ **Spring Motion**: 240ms tight spring with stiffness 400
✅ **Pane Switching**: 150ms horizontal slide with AnimatePresence
✅ **Event Batching**: 5-second batch rendering for smooth flow
✅ **Visual Hierarchy**: 85% inactive opacity, 60% older events
✅ **Accent Dividers**: 20% teal borders for spatial separation

---

## 🧩 Component Architecture

### State Management (Zustand)

```typescript
useConsoleStore:
  - activePane: 'mission' | 'activity' | 'insight'
  - missionView: 'plan' | 'do' | 'track' | 'learn'
  - activeMode: 'plan' | 'do' | 'track' | 'learn'
  - activityFilter: 'all' | 'agents' | 'workflows' | 'errors'
  - timeRange: '1h' | '24h' | '7d' | '30d'
```

### Component Hierarchy

```
ConsoleLayout
├── Header
│   ├── Brand ("totalaud.io")
│   ├── Campaign Name
│   └── Operator Toggle (⌘K)
├── Main (3-pane grid)
│   ├── MissionStack (Left)
│   │   ├── Plan Button
│   │   ├── Do Button
│   │   ├── Track Button
│   │   └── Learn Button
│   ├── CenterPane (Dynamic)
│   │   ├── ContextPane (if activePane === 'mission')
│   │   │   ├── PlanMode
│   │   │   ├── DoMode
│   │   │   ├── TrackMode
│   │   │   └── LearnMode
│   │   └── ActivityStream (if activePane === 'activity')
│   └── InsightPanel (Right)
│       ├── Campaign Metrics
│       ├── Current Goals
│       └── AI Recommendations
└── Footer
    └── AgentFooter
        ├── Agent Count
        ├── Grid Indicator
        └── System Status
```

---

## 🎯 User Experience Goals

### Achieved (Phase 2)

✅ **Feed scrolls like a live studio meter** - 240ms spring motion, batch rendering
✅ **Sidebar modes transition seamlessly** - 150ms horizontal slide, no route changes
✅ **Artists can do something in Plan and Do** - Release form, pitch launcher
✅ **Console feels like a control surface** - Smooth, restrained, genuinely usable

### Design Philosophy

**Calm Continuity:**
- No jarring page reloads
- Smooth, predictable transitions
- Visual hierarchy through opacity
- Batched updates prevent constant motion

**Creative Control Surface:**
- Mode-based workflow (Plan → Do → Track → Learn)
- Contextual actions per mode
- Instant feedback (240ms feels immediate)
- Professional studio aesthetic

**Meaningful Actions:**
- Plan: Define release goals
- Do: Launch pitches, execute workflows
- Track: Monitor progress (coming soon)
- Learn: Analyze outcomes (coming soon)

---

## 🔮 Next Actions

### Phase 3: Realtime Integration

- [ ] Connect Activity Stream to Supabase Realtime
- [ ] Replace mock events with live agent actions
- [ ] Wire Track mode to campaign metrics
- [ ] Wire Learn mode to analytics data

### Phase 4: Advanced Interactions

- [ ] Drag-and-drop file uploads (artwork, EPK)
- [ ] Inline editing for campaign details
- [ ] Quick actions menu (right-click context)
- [ ] Keyboard navigation (arrow keys, tab order)

### Phase 5: Mobile Responsiveness

- [ ] Responsive grid (collapse to single column)
- [ ] Touch-optimized interactions
- [ ] Mobile navigation drawer
- [ ] Progressive disclosure for small screens

---

## 📝 Technical Notes

### File Structure

```
/layouts/
  ConsoleLayout.tsx         # Main layout container

/components/console/
  MissionStack.tsx          # Left pane - mode buttons
  ContextPane.tsx           # Dynamic center content
    ├── PlanMode            # Release info form
    ├── DoMode              # Pitch launcher
    ├── TrackMode           # Metrics dashboard (placeholder)
    └── LearnMode           # Analytics (placeholder)
  ActivityStream.tsx        # Event feed with spring motion
  InsightPanel.tsx          # Right pane - metrics
  AgentFooter.tsx           # Footer status bar

/stores/
  consoleStore.ts           # Zustand state management

/themes/
  consolePalette.ts         # Visual system constants
```

### Motion Configuration

**Spring Preset (springTight):**
```typescript
stiffness: 400
damping: 30
mass: 0.8
duration: 0.24
```

**Slide Preset (easeOutSoft):**
```typescript
duration: 0.15
ease: [0.25, 0.1, 0.25, 1]
```

---

## ✅ Acceptance Criteria (All Met)

✅ Feed updates visually smooth (≤ 240ms spring, no jump)
✅ Pane switching instant and non-disruptive (150ms slide)
✅ Plan and Do modes contain usable actions (forms work)
✅ Console feels continuous and calm when idle
✅ 0 runtime or TypeScript errors
✅ Visual hierarchy applied (85% inactive, 60% older events)
✅ Accent dividers for spatial separation (20% teal)

---

**End of Specification**
**Status**: ✅ Phase 2 Complete - Ready for Realtime Integration
