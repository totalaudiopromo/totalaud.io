# Theme System Anti-Gimmick Refactor - Implementation Plan

**Branch**: `feature/theme-system-anti-gimmick-refactor`
**Date**: October 2025
**Status**: Planning Complete → Implementation Starting

---

## Executive Summary

This refactor transforms the theme system from aesthetic variations into **posture-based workflows** where each theme represents a distinct **way of working**, not just visual styling.

### Core Philosophy
- **Same power, different posture** - Every theme runs identical workflows; difference is framing, feedback, and focus
- **One core use case each** - Clear answer to "When would I choose this?"
- **Zero clutter** - Every element earns its pixel
- **Feel before features** - Motion, sound, and language do as much work as UI

---

## Phase 1: Type System & Foundation ✅

### 1.1 Theme ID Migration

**Current → New Mappings**:
```typescript
'ascii' → 'operator'  // The fast lane (keyboard-first CLI)
'xp' → 'guide'        // The pathfinder (step-by-step wizard)
'aqua' → 'map'        // The strategist (spatial canvas)
'daw' → 'timeline'    // The sequencer (time-based clips)
'analogue' → 'tape'   // The receipt (notes → actions)
```

**Files to Update**:
- [x] `apps/aud-web/src/components/themes/types.ts` - OSTheme type definition
- [x] `apps/aud-web/src/components/themes/index.ts` - Export mappings
- [x] `apps/aud-web/src/hooks/useUserPrefs.ts` - Default theme ('operator')
- [x] `apps/aud-web/src/types/themes.ts` - Legacy type definitions
- [x] All theme config files (operator.theme.ts, guide.theme.ts, etc.)

### 1.2 Extended Type System

**New interface additions**:
```typescript
export type ThemePosture = 'operator' | 'guide' | 'map' | 'timeline' | 'tape'

export interface ThemeWorkflow {
  posture: ThemePosture
  primaryLayout: 'split-cli' | 'wizard' | 'canvas' | 'tracks' | 'journal'
  coreActions: string[]  // Top-level actions available
  inputModel: 'command-bar' | 'form-wizard' | 'drag-connect' | 'clip-drag' | 'natural-lang'
  feedbackStyle: 'inline-ticks' | 'next-step-chip' | 'edge-heat' | 'playhead-sweep' | 'parse-propose'
}

export interface ThemeConfig {
  // ... existing fields
  workflow: ThemeWorkflow
  microcopy: {
    tagline: string        // "when you need speed."
    emptyState: string     // "Nothing here yet. Add one thing that matters."
    primaryCTA: string     // Theme-specific action label
    onboardingHint: string // One-liner for first-time users
  }
}
```

---

## Phase 2: Motion & Sound Token Centralisation

### 2.1 Motion Tokens

**Create**: `apps/aud-web/src/tokens/motion.ts`

```typescript
export const motionTokens = {
  fast: {
    duration: 120,  // ms
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    use: 'Micro feedback, key confirmations'
  },
  normal: {
    duration: 240,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    use: 'Pane transitions, modal opens'
  },
  slow: {
    duration: 400,
    easing: 'ease-in-out',
    use: 'Calm fades, ambient effects'
  }
} as const
```

**Replace all hardcoded durations** with token references across:
- ConsoleLayout.tsx
- All theme-specific components
- Modal animations
- Page transitions

### 2.2 Sound Tokens

**Create**: `apps/aud-web/src/tokens/sounds.ts`

```typescript
export const soundTokens = {
  'confirm-short': { frequency: 880, duration: 60, type: 'sine' },
  'task-armed': { frequency: 1200, duration: 80, type: 'square' },
  'clip-fired': { frequency: 660, duration: 100, type: 'sawtooth' },
  'parse-complete': { frequency: 440, duration: 120, type: 'triangle' },
} as const

// Respects Calm Mode and reduced motion preferences
export function playSound(
  soundId: keyof typeof soundTokens,
  options: { muted?: boolean; calmMode?: boolean }
): void
```

---

## Phase 3: BaseWorkflow Component Architecture

### 3.1 Core BaseWorkflow Component

**Create**: `apps/aud-web/src/components/workflows/BaseWorkflow.tsx`

```typescript
interface BaseWorkflowProps {
  posture: ThemePosture
  slots: {
    primary: ReactNode    // The lens (CLI/wizard/canvas/tracks/journal)
    secondary?: ReactNode // Context/help/inspector
    composer?: ReactNode  // Pitch/comms generator
    metrics?: ReactNode   // Campaign KPIs
    activity?: ReactNode  // Live stream
  }
  layoutConfig?: {
    primaryColumns: number  // Grid columns for primary pane
    showSecondary: boolean
    showComposer: boolean
  }
}

export function BaseWorkflow({ posture, slots, layoutConfig }: BaseWorkflowProps) {
  // Render slots with posture-specific grid layout
  // Handle keyboard shortcuts (⌘K, 1-5 theme switch, etc.)
  // Manage focus states and accessibility
}
```

### 3.2 Posture-Specific Layouts

**Grid Layouts by Posture**:
```typescript
const postureLayouts = {
  operator: {
    primary: '1 / 6',      // Command bar left (40%)
    secondary: '6 / -1',   // Live feed right (60%)
    composer: 'hidden',
    metrics: 'hidden',
  },
  guide: {
    primary: '1 / 10',     // Single wizard track
    secondary: '10 / -1',  // Context drawer right
    composer: 'bottom',    // Below wizard
    metrics: 'top-right',
  },
  map: {
    primary: '1 / 10',     // Canvas main
    secondary: '10 / -1',  // Details drawer (never overlaps canvas)
    composer: 'modal',
    metrics: 'overlay',
  },
  timeline: {
    primary: '1 / -1',     // Full-width timeline
    secondary: 'hidden',
    composer: 'modal',
    metrics: 'overlay',
  },
  tape: {
    primary: '1 / 7',      // Notes left
    secondary: '7 / -1',   // Conversion panel right
    composer: 'integrated',
    metrics: 'hidden',
  },
}
```

---

## Phase 4: Individual Workflow Implementations

### 4.1 Operator (CLI)

**File**: `apps/aud-web/src/components/workflows/OperatorWorkflow.tsx`

**Features**:
- Split layout: Command bar (40%) + Live stream (60%)
- Inline hinting with Tab completion
- Four core actions: `run research`, `generate pitch`, `send batch`, `follow up`
- All actions executable via keyboard (Enter to run)
- 120ms feedback (inline ticks)
- Disable mouse-only affordances

**Components**:
- `OperatorCommandBar.tsx` - CLI input with hints
- `OperatorLiveStream.tsx` - Right-pane activity feed

### 4.2 Guide (Wizard)

**File**: `apps/aud-web/src/components/workflows/GuideWorkflow.tsx`

**Features**:
- 4-step wizard: Define release → Find targets → Generate pitch → Send + schedule
- Progress indicator at top
- One strong CTA per view
- "Next best step" chip appears after each confirm
- Form fragments with suggested defaults
- 240ms slide transitions

**Components**:
- `GuideWizardStep.tsx` - Single step wrapper
- `GuideProgressBar.tsx` - Step indicator
- `GuideNextStepChip.tsx` - Suggested action hint

### 4.3 Map (Canvas)

**File**: `apps/aud-web/src/components/workflows/MapWorkflow.tsx`

**Features**:
- Canvas grid with nodes = phases, edges = dependencies
- Drag to connect; context panel never overlaps canvas
- Edge heat colours by activity; pulse where work happening
- 240–400ms ease for edges (slight elastic)
- Core actions: Add phase, attach target set, start automation, watch heatmap

**Components**:
- `MapCanvas.tsx` - React Flow integration
- `MapNode.tsx` - Phase node component
- `MapEdge.tsx` - Dependency edge with heat visualization
- `MapContextPanel.tsx` - Details drawer

### 4.4 Timeline (Clips)

**File**: `apps/aud-web/src/components/workflows/TimelineWorkflow.tsx`

**Features**:
- Time ruler with lanes: Research, Outreach, Follow-ups, Content
- Clips support drag, split, duplicate, nudge (arrow keys)
- Playhead sweeps with subtle glow
- Mini meters on active lanes
- 120ms micro-interactions, 240ms lane open/close
- Clips tint by status (idle/active/complete)

**Components**:
- `TimelineRuler.tsx` - Time scale header
- `TimelineLane.tsx` - Single lane container
- `TimelineClip.tsx` - Task batch clip
- `TimelinePlayhead.tsx` - Current time indicator

### 4.5 Tape (Notes → Runs)

**File**: `apps/aud-web/src/components/workflows/TapeWorkflow.tsx`

**Features**:
- Left: Note entries with tag parsing (#radio, #press, #asset)
- Right: Conversion panel showing extracted actions
- Natural language input with intent detection
- "Make it a run" button commits to real workflow
- 240ms soft transitions
- Paper-thin rustle sound on create, stamp on commit

**Components**:
- `TapeNoteEditor.tsx` - Left column note input
- `TapeConversionPanel.tsx` - Right column action proposals
- `TapeNoteEntry.tsx` - Single note display
- `TapeActionProposal.tsx` - Extracted action with accept/reject

---

## Phase 5: Cross-Theme Primitives

### 5.1 Shared Components (Work Everywhere)

**Location**: `apps/aud-web/src/components/shared/`

- `CommandPalette.tsx` - Global ⌘K palette
- `ActivityStreamWidget.tsx` - Live event feed (adapts to layout)
- `InsightPanelWidget.tsx` - Metrics display (adapts to layout)
- `TargetsTable.tsx` - Contact/target list
- `ComposerModal.tsx` - Pitch/email generator
- `MetricsCard.tsx` - KPI display component

### 5.2 Shared Keyboard Map

**Global Shortcuts** (works in all themes):
```typescript
const globalKeyMap = {
  '⌘K': 'Open command palette',
  '1': 'Switch to Operator',
  '2': 'Switch to Guide',
  '3': 'Switch to Map',
  '4': 'Switch to Timeline',
  '5': 'Switch to Tape',
  'Shift+Enter': 'Run current action',
  '⌘.': 'Focus help',
  '⌘M': 'Mute/unmute sounds',
  'Esc': 'Dismiss modal/palette',
  '⌘/': 'Show keyboard shortcuts',
}
```

**Implementation**: `apps/aud-web/src/hooks/useGlobalKeyboard.ts`

### 5.3 Status Colour System

**Consistent across all themes**:
```typescript
const statusColours = {
  info: '#3B82F6',      // Blue
  action: 'var(--accent)',  // Theme accent (Slate Cyan)
  warning: '#F59E0B',   // Amber
  success: '#10B981',   // Green
  error: '#EF4444',     // Red
}
```

---

## Phase 6: Microcopy & Narrative

### 6.1 Theme-Specific Copy

**Update**: `apps/aud-web/src/content/themeCopy.ts`

```typescript
export const themeCopy = {
  operator: {
    tagline: 'when you need speed.',
    emptyState: 'Nothing here yet. Type a command.',
    primaryCTA: 'Run',
    onboarding: 'Keyboard works everywhere.',
  },
  guide: {
    tagline: 'when you want a path.',
    emptyState: 'Nothing here yet. Start a release.',
    primaryCTA: 'Next Step',
    onboarding: 'You can always undo.',
  },
  map: {
    tagline: 'when you think in systems.',
    emptyState: 'Connect two phases to see flow.',
    primaryCTA: 'Add Phase',
    onboarding: 'We'll stay out of your way.',
  },
  timeline: {
    tagline: 'when time is the instrument.',
    emptyState: 'No lanes armed. Drop in your week.',
    primaryCTA: 'Add Clip',
    onboarding: 'Calm Mode is ready when you are.',
  },
  tape: {
    tagline: 'when notes become runs.',
    emptyState: 'Write a note. We'll turn it into work.',
    primaryCTA: 'Make it a Run',
    onboarding: 'Write it. Run it.',
  },
}
```

### 6.2 Brand Lines (Global)

**Update**: `apps/aud-web/src/content/brandCopy.ts`

```typescript
export const brandLines = [
  'Creative control for artists.',
  'Your campaign, in flow.',
  'Built from real promotion work.',
  'Quiet tools for loud ideas.',
]

export const consoleLines = [
  'Plan once. Release clean.',
  'Send with precision.',
  'See what resonates.',
  'Small signals. Big moves.',
  'Write it. Run it.',
]
```

---

## Phase 7: Migration & Integration

### 7.1 ConsoleLayout Integration

**Update**: `apps/aud-web/src/layouts/ConsoleLayout.tsx`

```typescript
import { BaseWorkflow } from '@aud-web/components/workflows/BaseWorkflow'
import { OperatorWorkflow } from '@aud-web/components/workflows/OperatorWorkflow'
// ... other workflows

export function ConsoleLayout() {
  const { currentTheme } = useTheme()

  const workflowMap = {
    operator: <OperatorWorkflow />,
    guide: <GuideWorkflow />,
    map: <MapWorkflow />,
    timeline: <TimelineWorkflow />,
    tape: <TapeWorkflow />,
  }

  return (
    <div className="console-layout">
      {workflowMap[currentTheme]}
    </div>
  )
}
```

### 7.2 Theme Switcher UI Update

**Update**: `apps/aud-web/src/components/ui/ThemeToggle.tsx`

New microcopy:
- Operator — when you need speed.
- Guide — when you want a path.
- Map — when you think in systems.
- Timeline — when time is the instrument.
- Tape — when notes become runs.

### 7.3 Database Schema Update

**Migration**: `supabase/migrations/YYYYMMDD_rename_theme_values.sql`

```sql
-- Update user_prefs table to use new theme IDs
UPDATE user_prefs SET theme = 'operator' WHERE theme = 'ascii';
UPDATE user_prefs SET theme = 'guide' WHERE theme = 'xp';
UPDATE user_prefs SET theme = 'map' WHERE theme = 'aqua';
UPDATE user_prefs SET theme = 'timeline' WHERE theme = 'daw';
UPDATE user_prefs SET theme = 'tape' WHERE theme = 'analogue';

-- Update enum if exists (or create new constraint)
ALTER TABLE user_prefs DROP CONSTRAINT IF EXISTS user_prefs_theme_check;
ALTER TABLE user_prefs ADD CONSTRAINT user_prefs_theme_check
  CHECK (theme IN ('operator', 'guide', 'map', 'timeline', 'tape'));
```

---

## Phase 8: Testing & Validation

### 8.1 Acceptance Criteria (Per Theme)

- [ ] **Operator**: All 4 core actions executable via keyboard, no modal navigation
- [ ] **Guide**: New user can complete campaign in one sitting, clear next steps
- [ ] **Map**: Can read plan in 10 seconds from 3 feet away
- [ ] **Timeline**: Can schedule a week and feel the load, not count it
- [ ] **Tape**: Every note can produce at least one measurable action

### 8.2 Cross-Theme Tests

- [ ] Same campaign completable in any theme without switching
- [ ] All keyboard shortcuts work consistently
- [ ] WCAG AA compliance (contrast, focus states, target sizes ≥24px)
- [ ] Reduced motion respected (Calm Mode + user preference)
- [ ] All text British English spelling

### 8.3 Performance Tests

- [ ] Theme switch < 240ms
- [ ] First 60 seconds: user can set up or execute something real
- [ ] No layout shift on theme change
- [ ] Smooth 60fps animations (no jank)

---

## Phase 9: Documentation

### 9.1 Developer Documentation

**Create**: `docs/theme-system/WORKFLOW_ARCHITECTURE.md`
- Posture-based design philosophy
- BaseWorkflow component API
- Creating custom workflows
- Slot system documentation
- Testing workflows

### 9.2 User Documentation

**Update**: `docs/user-guide/CHOOSING_A_THEME.md`
- When to use each theme
- Switching themes mid-campaign
- Keyboard shortcuts per theme
- Accessibility features

### 9.3 Migration Guide

**Create**: `docs/migration/THEME_REFACTOR_V2.md`
- Breaking changes
- Code migration examples
- Database migration steps
- Rollback procedure

---

## Implementation Timeline

### Week 1: Foundation
- ✅ Day 1: Type system updates, theme ID migrations
- ⏳ Day 2: Motion/sound token centralisation
- ⏳ Day 3: BaseWorkflow component architecture
- ⏳ Day 4: Shared primitives (CommandPalette, keyboard map)

### Week 2: Workflows
- ⏳ Day 5: Operator workflow (CLI)
- ⏳ Day 6: Guide workflow (Wizard)
- ⏳ Day 7: Map workflow (Canvas)
- ⏳ Day 8: Timeline workflow (Clips)
- ⏳ Day 9: Tape workflow (Notes→Runs)

### Week 3: Integration & Polish
- ⏳ Day 10: ConsoleLayout integration
- ⏳ Day 11: Microcopy updates, theme switcher UI
- ⏳ Day 12: Database migration, testing
- ⏳ Day 13: Accessibility audit, performance testing
- ⏳ Day 14: Documentation, final QA

---

## Rollback Plan

If critical issues arise:

1. **Immediate**: Revert to `main` branch
2. **Database**: Run rollback migration (map new → old theme IDs)
3. **User Data**: Preserve user preferences with fallback mapping
4. **Communication**: Notify users of temporary UI revert

**Rollback Trigger**: > 10% user error rate OR critical accessibility failure

---

## Success Metrics

**Launch Criteria**:
- ✅ All 5 workflows functional and tested
- ✅ Zero TypeScript errors
- ✅ WCAG AA compliance verified
- ✅ All acceptance criteria met
- ✅ Documentation complete

**Post-Launch Monitoring**:
- Theme switch rate (expect 20-30% users switch within 7 days)
- Keyboard shortcut usage (target 40%+ power users)
- Time to first action (target < 60s for all themes)
- Support tickets related to theme confusion (target < 5%)

---

## Notes for Claude Code

### British English Reminders
- ✅ colour (not color)
- ✅ behaviour (not behavior)
- ✅ centre (not center)
- ✅ optimise (not optimize)
- ✅ organise (not organize)
- ✅ visualise (not visualize)

### Code Style
- Use Framer Motion for all animations (NOT CSS transitions)
- Motion tokens only: 120ms/240ms/400ms
- All animation easing: `cubic-bezier(0.22, 1, 0.36, 1)` (except slow: ease-in-out)
- Tailwind responsive utilities (never hardcode media queries)
- Component naming: PascalCase for components, kebab-case for utilities

### Git Workflow
- Feature branch: `feature/theme-system-anti-gimmick-refactor`
- Commit format: `feat(theme): description` or `refactor(workflow): description`
- PR title: "Theme System Anti-Gimmick Refactor - Posture-Based Workflows"

---

**Implementation starts**: Now
**Target completion**: Week 3 Day 14
**Branch ready for review**: After all acceptance criteria met
