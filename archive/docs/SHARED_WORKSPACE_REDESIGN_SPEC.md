# Shared Workspace Redesign Specification

**Project**: totalaud.io Operator-Driven Workspace
**Status**: 🔨 In Progress
**Date**: January 2025
**Philosophy**: Collapse OS dashboards → One workspace, many lenses

---

## 🎯 Core Vision

Transform totalaud.io from **multiple OS-themed dashboards** into a **single Shared Workspace** controlled by the Operator. Each OS lens (ASCII / XP / Aqua / DAW / Analogue) becomes purely a **visual & motion layer**, toggled via a side **StudioPicker**.

### Key Principle
**Same data, same actions, different aesthetic** — lens switching changes how the workspace *feels*, not what it *does*.

---

## 🏗️ Architecture

### Before (Phase 6)
```
5 separate Studios → 5 different routes → 5 different UIs
/studio/ascii    → ASCIIStudio.tsx
/studio/xp       → XPStudio.tsx
/studio/aqua     → AquaStudio.tsx
/studio/daw      → DAWStudio.tsx
/studio/analogue → AnalogueStudio.tsx
```

### After (Shared Workspace)
```
1 unified workspace → 1 route → 5 visual lenses
/workspace → SharedWorkspace.tsx + StudioPicker (lens selector)

Tabs: Plan | Do | Track | Learn
Lenses: ASCII | XP | Aqua | DAW | Analogue (visual/motion only)
```

---

## 📐 SharedWorkspace Structure

### 4 Core Tabs

#### 1. Plan Tab
**Purpose**: Define releases and create campaigns
**Primary Actions**:
- Add release (artist, title, date)
- Create campaign from release
- Browse campaign templates

**Data Model**:
```typescript
interface Release {
  id: string
  artist: string
  title: string
  release_date: string
  genre: string[]
  links: { spotify?: string; bandcamp?: string }
}

interface Campaign {
  id: string
  release_id: string
  name: string
  goal: 'radio' | 'press' | 'playlist' | 'blog'
  status: 'draft' | 'active' | 'complete'
  targets: Target[]
}
```

**UI Components**:
- Release card grid
- Campaign creation wizard
- Template picker

---

#### 2. Do Tab
**Purpose**: Execute agent workflows
**Primary Actions**:
- Start run (find curators, generate pitch, send emails)
- Monitor agent progress
- View live logs

**Data Model**:
```typescript
interface Run {
  id: string
  campaign_id: string
  workflow_type: 'find_curators' | 'generate_pitch' | 'send_outreach'
  status: 'pending' | 'running' | 'complete' | 'failed'
  started_at: string
  completed_at?: string
  results: any
}
```

**UI Components**:
- Workflow launcher
- Agent status cards
- Live log stream
- Progress indicators

---

#### 3. Track Tab
**Purpose**: Monitor campaign results
**Primary Actions**:
- View campaign metrics (open rate, reply rate, playlist adds)
- Browse found curators
- Analyze outreach performance

**Data Model**:
```typescript
interface CampaignMetrics {
  campaign_id: string
  curators_found: number
  pitches_sent: number
  emails_opened: number
  replies_received: number
  playlist_adds: number
  updated_at: string
}

interface Target {
  id: string
  campaign_id: string
  name: string
  type: 'radio' | 'playlist' | 'blog' | 'press'
  status: 'found' | 'pitched' | 'opened' | 'replied' | 'added'
  contact_email?: string
}
```

**UI Components**:
- Metrics dashboard
- Target list table
- Activity timeline

---

#### 4. Learn Tab
**Purpose**: Surface insights and recommendations
**Primary Actions**:
- View AI-generated insights
- Browse successful pitch examples
- Analyze campaign patterns

**Data Model**:
```typescript
interface Insight {
  id: string
  type: 'recommendation' | 'pattern' | 'opportunity'
  title: string
  description: string
  relevance_score: number
  created_at: string
}
```

**UI Components**:
- Insight cards
- Pattern visualizations
- Recommendation feed

---

## 🎨 Studio Lenses (Visual/Motion Layers Only)

### Lens System Architecture

Each lens applies:
1. **Color palette** (accent, background, foreground)
2. **Typography** (font family, weight, case)
3. **Motion profile** (transition speed, easing, parallax)
4. **Sound bank** (ambient loop, UI SFX)
5. **Layout spacing** (padding, gap, border radius)

**CRITICAL**: Lenses do NOT change:
- Tab structure (Plan / Do / Track / Learn always present)
- Data model (releases, campaigns, runs, insights)
- Available actions (add release, start run, etc.)
- Workflow logic (agent execution, Supabase queries)

### Lens Configurations

| Lens | Accent | Motion Speed | Ambient Sound | Personality |
|------|--------|--------------|---------------|-------------|
| **ASCII** | #10b981 (green) | Instant (0ms) | None (silent focus) | Minimalist producer |
| **XP** | #3b82f6 (blue) | Bouncy (600ms spring) | Soft chimes | Nostalgic optimist |
| **Aqua** | #60a5fa (sky) | Slow dissolve (800ms) | Water flow | Perfectionist designer |
| **DAW** | #a855f7 (purple) | Tempo-synced (500ms) | 120 BPM loop | Experimental creator |
| **Analogue** | #f59e0b (amber) | Organic drift (1200ms) | Tape hiss | Human warmth |

### Lens Switching Behavior

**Requirements**:
- Switching lens ≤ 500ms transition time
- **Zero layout shift** (content positions preserved)
- **Zero scroll position change**
- **Zero data re-fetch** (state persists)
- Crossfade between ambient sounds (400ms)

**Implementation**:
```typescript
function switchLens(newLens: StudioLens) {
  // 1. Fade out current ambient sound (200ms)
  crossfadeAmbient(currentLens, newLens, 400)

  // 2. Apply new CSS variables (instant)
  applyThemeTokens(newLens)

  // 3. Trigger transition animation (300ms letterbox)
  playStudioTransition(currentLens, newLens)

  // 4. Fade in new ambient sound (200ms)
  // Already handled by crossfade

  // Total: 500ms
}
```

---

## 🎛️ Operator Command Surface

Replace "Signal" system with **Operator** — a command palette + action router.

### Core Commands (6)

1. **add release**
   Opens release creation modal

2. **find curators**
   Launches Find Curators workflow for active campaign

3. **generate pitch**
   Launches Pitch Generation workflow

4. **start run**
   Executes selected workflow

5. **import curators**
   Upload CSV of existing contacts

6. **summarise campaign**
   Generates AI summary of campaign performance

### Command Structure

```typescript
interface OperatorCommand {
  id: string
  name: string
  keywords: string[]
  icon: LucideIcon
  action: () => Promise<void>
  requiresContext?: 'release' | 'campaign'
}
```

### Implementation

```typescript
// operator/commands.ts
export const operatorCommands: OperatorCommand[] = [
  {
    id: 'add-release',
    name: 'add release',
    keywords: ['add', 'create', 'new', 'release', 'artist'],
    icon: Plus,
    action: async () => {
      openModal('ReleaseCreationModal')
    }
  },
  {
    id: 'find-curators',
    name: 'find curators',
    keywords: ['find', 'search', 'curators', 'contacts', 'radio'],
    icon: Search,
    action: async () => {
      const campaign = getActiveCampaign()
      if (!campaign) throw new Error('No active campaign')
      await runWorkflow('find_curators', { campaign_id: campaign.id })
    },
    requiresContext: 'campaign'
  },
  // ... rest
]
```

---

## 🗂️ State Management

### useWorkspaceStore (Zustand)

```typescript
interface WorkspaceState {
  // Data
  releases: Release[]
  campaigns: Campaign[]
  targets: Target[]
  runs: Run[]
  insights: Insight[]

  // UI State
  activeTab: 'plan' | 'do' | 'track' | 'learn'
  activeCampaignId: string | null
  activeReleaseId: string | null
  currentLens: StudioLens

  // Actions
  addRelease: (release: Release) => void
  addCampaign: (campaign: Campaign) => void
  runAction: (type: WorkflowType, params: any) => Promise<void>
  addInsight: (insight: Insight) => void
  switchLens: (lens: StudioLens) => void
  switchTab: (tab: string) => void
}
```

### Supabase Integration

**Tables**:
- `releases`
- `campaigns`
- `campaign_targets`
- `workflow_runs`
- `insights`

**Realtime Channels**:
- `workflow_runs:${user_id}` — Live run updates
- `campaign_targets:${campaign_id}` — New targets found

---

## 🎨 Component Structure

```
apps/aud-web/src/components/
├── SharedWorkspace.tsx               # Main workspace shell
├── StudioPicker.tsx                  # Lens selector sidebar
├── StudioTransition.tsx              # Lens switch animation
├── Operator/
│   ├── CommandPalette.tsx            # ⌘K interface
│   └── commands.ts                   # Command definitions
├── Workspace/
│   ├── PlanTab.tsx                   # Release & campaign management
│   ├── DoTab.tsx                     # Workflow execution
│   ├── TrackTab.tsx                  # Metrics & results
│   └── LearnTab.tsx                  # Insights & recommendations
└── themes/
    ├── tokens.ts                     # Unified design tokens
    ├── ascii/
    │   └── tokens.ts                 # ASCII-specific overrides
    ├── xp/
    │   └── tokens.ts
    ├── aqua/
    │   └── tokens.ts
    ├── daw/
    │   └── tokens.ts
    └── analogue/
        └── tokens.ts
```

---

## 🎯 First-Hour Flow (XP Lens)

**Goal**: New user completes their first campaign run in <3 minutes

### Step-by-Step Journey

1. **Land in SharedWorkspace** (Plan tab, XP lens by default)
   See: Welcome message + "Add your first release" CTA

2. **Click "add release"**
   Modal opens with friendly form (Artist, Title, Release Date, Genre)

3. **Fill & submit**
   Release card appears in Plan tab grid

4. **Click release card**
   "Create campaign" button appears

5. **Click "Create campaign"**
   Wizard opens: Campaign name → Goal (radio/press/playlist) → Create

6. **Campaign created**
   Auto-switches to Do tab, shows "Start your first run" panel

7. **Click "Find curators"**
   Workflow launches, progress indicators appear

8. **Watch agents work**
   Live logs stream in (ASCII lens would show terminal, XP shows friendly dialogue)

9. **Run completes**
   Confetti animation (XP lens), notification: "Found 42 curators!"

10. **Auto-switch to Track tab**
    See curator list, metrics dashboard

**Total time**: ~2 minutes (if user doesn't hesitate)

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] All 4 tabs implemented (Plan / Do / Track / Learn)
- [ ] All 6 Operator commands functional
- [ ] Lens switching ≤ 500ms with zero layout shift
- [ ] State persists across lens switches
- [ ] Realtime updates work across all tabs
- [ ] First-hour flow completable in <3 minutes (XP lens)

### Performance Requirements

- [ ] 60fps during lens transitions
- [ ] <100ms command palette open time
- [ ] <300ms realtime event → UI update latency
- [ ] <500KB total JS bundle for workspace

### Accessibility Requirements

- [ ] Full keyboard navigation (Tab, Enter, Esc, ⌘K)
- [ ] Reduced motion support (disable crossfades, use instant cuts)
- [ ] ARIA labels for all interactive elements
- [ ] Screen reader tested

---

## 🪄 Optional "Pop" Enhancements

### Operator Mood Macros

```
operator: focus     → Switches to ASCII lens, hides Learn tab, mutes ambient
operator: perform   → Switches to DAW lens, shows only Do tab, beat-synced UI
operator: reflect   → Switches to Analogue lens, shows only Learn tab, warm tones
```

### Auto-Record Share Clips

On successful run completion, automatically record last 8 seconds of activity as shareable video clip (using browser APIs).

### Invite-Code Easter Egg

Hidden command: `resonance verified` → Unlocks "Resonance" lens (secret 6th lens with experimental features)

---

## 📊 Implementation Roadmap

### Stage 1: Flow Architect — Scaffold
- [ ] Create `SharedWorkspace.tsx` with tab structure
- [ ] Implement `useWorkspaceStore.ts`
- [ ] Build `runAction()` router
- [ ] Remove legacy per-OS logic

### Stage 2: Experience Composer — Simplify
- [ ] Map each tab to 1 clear goal
- [ ] Simplify layouts (remove duplicate panels)
- [ ] Add progressive disclosure hints
- [ ] Output `/specs/USABILITY_CHECKLIST.md`

### Stage 3: Motion Choreographer — Animate
- [ ] Build `StudioTransition.tsx`
- [ ] Implement `useStudioMotion.ts`
- [ ] Populate `/themes/[theme]/fx.config.ts`
- [ ] Verify zero layout shift on lens switch

### Stage 4: Sound Director — Audio
- [ ] Create `useStudioSound.ts`
- [ ] Add crossfade logic (400ms, -30 LUFS)
- [ ] Map UI actions → SFX in `fx.config.ts`
- [ ] Update `/public/sounds/[theme]`

### Stage 5: Flow Architect (2nd pass) — Operator
- [ ] Build `CommandPalette.tsx`
- [ ] Implement 6 core commands
- [ ] Wire `operator.execute()` to `/core/actions/*`

### Stage 6: Aesthetic Curator — Tokens
- [ ] Define unified design tokens
- [ ] Align spacing, typography, radii
- [ ] Implement `StudioPicker.tsx`
- [ ] Output `/specs/STYLE_GUIDE.md`

### Stage 7: Experience Composer (final) — Validate
- [ ] Test first-hour flow (0 → Release → Campaign → Run)
- [ ] Confirm <3 min completion in XP lens
- [ ] Generate `/specs/FIRST_HOUR_REPORT.md`

---

## 📚 Deliverables

- `/components/SharedWorkspace.tsx`
- `/components/StudioPicker.tsx`
- `/components/StudioTransition.tsx`
- `/hooks/useStudioTheme.ts`
- `/hooks/useStudioMotion.ts`
- `/hooks/useStudioSound.ts`
- `/operator/CommandPalette.tsx`
- `/operator/commands.ts`
- `/themes/*/fx.config.ts`
- `/themes/tokens.ts`
- `/state/useWorkspaceStore.ts`
- `/specs/USABILITY_CHECKLIST.md`
- `/specs/STYLE_GUIDE.md`
- `/specs/FIRST_HOUR_REPORT.md`

---

## 🧪 Testing Strategy

### Unit Tests
- Zustand store actions
- Command routing logic
- Theme token resolution

### Integration Tests
- Tab switching preserves state
- Lens switching preserves scroll position
- Realtime events update correct tab
- Operator commands execute workflows

### E2E Tests (Playwright)
- Complete first-hour flow
- All 6 commands functional
- Lens switching performance
- Keyboard navigation

### User Testing
- 3 testers complete first-hour flow unaided
- Measure completion time per lens
- Collect friction point feedback

---

## 🚨 Migration Notes

### From Phase 6 Studios

**What stays**:
- `BaseWorkflow.tsx` logic (reuse in Do tab)
- Theme system (colors, typography, motion)
- Sound assets in `/public/sounds/`
- Supabase integration patterns

**What changes**:
- `/studio/[theme]` routes → `/workspace` (single route)
- 5 separate Studio components → 4 tab components + 5 lens configs
- Theme switching via router → Theme switching via StudioPicker
- Per-Studio navigation → Per-Tab navigation

**What's removed**:
- Onboarding flow (Phase 4) — replaced by in-workspace tutorial
- Mission panels — replaced by Tab structure
- Per-Studio command palettes → Unified Operator

---

**Last Updated**: January 2025
**Status**: 🔨 Ready for Implementation
**Next Step**: Flow Architect scaffolding
