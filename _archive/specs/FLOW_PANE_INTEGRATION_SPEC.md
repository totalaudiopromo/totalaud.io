# Flow Pane Integration Spec v1.0

**Date**: October 2025
**Status**: Planning - Stage 9 Addendum
**Purpose**: Transform Flow Studio into a visual workflow planner within Console "Plan" mode

---

## 🎯 Strategic Vision

**From**: Standalone experimental prototype (dark grid, neon green, unclear purpose)
**To**: Integrated creative workspace - "DAW for marketing automation"

**User Value**: Visual campaign pipeline designer that directly links to Console actions

---

## 🧩 Integration Architecture

### Option A: Replace "Plan" Mode (RECOMMENDED)

**Current State**: "Plan" mode = text inputs or placeholder
**New State**: Visual workflow designer using Flow grid

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Console Header (totalaud.io | Campaign Name | Settings)     │
├─────────────────────────────────────────────────────────────┤
│ Mission │                                          │ Insight │
│  Stack  │      Flow Pane (visual workflow)        │  Panel  │
│ ┌─────┐ │                                          │         │
│ │PLAN │ │  [Research] → [Score] → [Pitch]         │ Metrics │
│ │ DO  │ │      ↓                                   │ for     │
│ │TRACK│ │  [Follow-up]                            │ selected│
│ │LEARN│ │                                          │ node    │
│ └─────┘ │                                          │         │
├─────────────────────────────────────────────────────────────┤
│ Agent Footer (0 active agents • READY)                      │
└─────────────────────────────────────────────────────────────┘
```

**Benefits**:
- Preserves Console continuity (header, footer, sidebar)
- Makes "Plan" mode genuinely visual
- Nodes link to real Console actions
- Insight Panel shows metrics for selected node

---

## 🎨 Design Adjustments

### 1. Color Migration (Neon → Slate Cyan)

**OLD** (Flow Studio):
```css
--grid-color: rgba(0, 255, 0, 0.1);    /* Neon green */
--node-active: #00FF00;                 /* Bright green */
--node-inactive: rgba(255, 255, 255, 0.6);
--connection-line: #00FF00;
```

**NEW** (Flow Pane):
```css
--grid-color: rgba(58, 169, 190, 0.1);     /* Subtle slate blue */
--node-active: var(--accent);               /* #3AA9BE - Slate Cyan */
--node-inactive: rgba(234, 236, 238, 0.7); /* 70% opacity text-primary */
--connection-line: var(--accent);           /* 1px stroke, no glow */
--node-hover: var(--accent-alt);            /* #6FC8B5 */
```

### 2. Typography Updates

**OLD**:
```css
font-family: monospace;
font-size: 16px;
font-weight: 400;
text-transform: uppercase;
```

**NEW**:
```css
font-family: var(--font-geist);  /* Geist Sans */
font-size: 14px;
font-weight: 600;
text-transform: none;            /* Sentence case only */
letter-spacing: -0.01em;
```

### 3. Motion Simplification

**OLD**:
```javascript
// Pop animation with spring physics
initial: { scale: 0, rotate: -180 }
animate: { scale: 1, rotate: 0 }
transition: { type: 'spring', stiffness: 200 }
```

**NEW**:
```javascript
// Fast, professional fade/scale
initial: { scale: 0.95, opacity: 0 }
animate: { scale: 1, opacity: 1 }
transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] }
```

**Motion Timing**:
- Node add/remove: 120ms easeOut
- Connection draw: 240ms easeOut
- Hover state: 120ms easeOut
- Grid drift: OFF (reduces cognitive load)

### 4. Node Design

**OLD**:
```
┌──────────────┐
│   NODE       │  ← Neon green border, 2px
│   (all caps) │  ← Uppercase text
└──────────────┘
```

**NEW**:
```
┌──────────────┐
│ Research     │  ← Accent border, 1px, 4px radius
│ 5 contacts   │  ← Slate Cyan text, Geist Sans 14px/600
└──────────────┘
     ↓ 1px accent stroke
```

**Node States**:
```css
/* Default */
border: 1px solid var(--border);
background: var(--surface);
color: var(--text-secondary);

/* Active (selected) */
border: 1px solid var(--accent);
background: var(--surface);
color: var(--accent);
box-shadow: 0 0 0 1px var(--accent); /* Subtle outer glow */

/* Hover */
border: 1px solid var(--accent-alt);
background: rgba(111, 200, 181, 0.05);
color: var(--text-primary);

/* Running (agent executing node) */
border: 1px solid var(--accent);
background: rgba(58, 169, 190, 0.1);
color: var(--accent);
/* Pulse animation: 2s infinite */
```

### 5. Context Header

**Add at top of Flow Pane**:
```
Workflow Designer
Visualise how your agents collaborate in real time.
━━━━━━━━━━━━━━
```

**Styling**:
```css
h2 {
  font-family: var(--font-geist);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

p {
  font-family: var(--font-inter);
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

hr {
  border: none;
  border-top: 1px solid var(--accent);
  opacity: 0.3;
  margin-bottom: var(--space-4);
}
```

---

## 📐 Technical Implementation

### File Structure

```
apps/aud-web/src/
├── components/
│   ├── console/
│   │   ├── FlowPane.tsx              ← NEW: Refactored from FlowStudio
│   │   ├── MissionStack.tsx          ← Update to render FlowPane when activeMode === 'plan'
│   │   └── InsightPanel.tsx          ← Update to show node metrics
│   └── features/
│       └── flow/
│           ├── FlowStudio.tsx        ← KEEP for reference (or delete after migration)
│           ├── FlowNode.tsx          ← Update with Slate Cyan theme
│           └── FlowCanvas.tsx        ← Update grid color
├── stores/
│   └── consoleStore.ts               ← Add workflow state management
└── layouts/
    └── ConsoleLayout.tsx             ← Wire up FlowPane
```

### Migration Checklist

#### Phase 1: Refactor Core Components

- [ ] Copy `FlowStudio.tsx` → `FlowPane.tsx`
- [ ] Remove standalone header/footer (use Console's)
- [ ] Update colors to Slate Cyan palette
- [ ] Update typography to Geist Sans 14px/600
- [ ] Simplify motion to 120ms/240ms easeOut
- [ ] Add context header ("Workflow Designer")

#### Phase 2: Update Node Components

- [ ] `FlowNode.tsx`: Apply new color states (default/active/hover/running)
- [ ] `FlowNode.tsx`: Update typography (Geist Sans, sentence case)
- [ ] `FlowNode.tsx`: Add 120ms transition timing
- [ ] `FlowCanvas.tsx`: Change grid color to `rgba(58, 169, 190, 0.1)`
- [ ] `FlowCanvas.tsx`: Remove grid drift animation

#### Phase 3: Console Integration

- [ ] Update `consoleStore.ts`: Add workflow node state
- [ ] Update `MissionStack.tsx`: Render `<FlowPane />` when `activeMode === 'plan'`
- [ ] Update `ContextPane.tsx`: Show node details when node selected
- [ ] Update `InsightPanel.tsx`: Show node metrics (e.g., "5 contacts researched")

#### Phase 4: Database Persistence

- [ ] Create migration: `20251025000000_add_campaign_workflows.sql`
- [ ] Add `campaign_workflows` table schema
- [ ] Wire up node CRUD operations to Supabase
- [ ] Add realtime subscription for multi-user collaboration

---

## 🗄️ Database Schema

### New Table: `campaign_workflows`

```sql
CREATE TABLE campaign_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Node graph data (JSON)
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT campaign_workflows_unique UNIQUE (campaign_id)
);

-- RLS Policies
ALTER TABLE campaign_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflows"
  ON campaign_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflows"
  ON campaign_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
  ON campaign_workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
  ON campaign_workflows FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_campaign_workflows_campaign_id ON campaign_workflows(campaign_id);
CREATE INDEX idx_campaign_workflows_user_id ON campaign_workflows(user_id);

-- Updated timestamp trigger
CREATE TRIGGER update_campaign_workflows_updated_at
  BEFORE UPDATE ON campaign_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Node Data Structure (TypeScript)

```typescript
interface FlowNode {
  id: string;                    // UUID
  type: 'research' | 'score' | 'pitch' | 'follow-up' | 'custom';
  label: string;                 // Display name (e.g., "Research BBC contacts")
  position: { x: number; y: number };
  data: {
    agentType?: string;          // Which agent executes this node
    status: 'pending' | 'running' | 'completed' | 'failed';
    metrics?: {
      contactsFound?: number;
      emailsSent?: number;
      responsesReceived?: number;
    };
    config?: Record<string, unknown>;  // Node-specific settings
  };
}

interface FlowEdge {
  id: string;                    // UUID
  source: string;                // Source node ID
  target: string;                // Target node ID
  type?: 'default' | 'conditional';
  condition?: string;            // For conditional edges
}

interface WorkflowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}
```

---

## 🔌 Node → Agent Integration

### How Nodes Connect to Console Actions

Each node type maps to a Console command palette action:

| Node Type | Command Palette Action | Agent Type |
|-----------|----------------------|------------|
| Research | "spawn agent scout" | Scout |
| Score | "spawn agent insight" | Insight |
| Pitch | Custom workflow | Multiple |
| Follow-up | "spawn agent tracker" | Tracker |

**Execution Flow**:
1. User clicks "Run Workflow" in Flow Pane
2. System iterates through nodes in topological order
3. For each node:
   - Spawn agent via Command Palette API
   - Wait for agent completion
   - Update node status (`running` → `completed`)
   - Pass output to next node
4. Show live progress in Activity Stream

---

## 🎭 UX Continuity

### Preserving Console Feel

**Bottom Status Bar** (same as Console):
```
0 active agents • READY
```

**Command Palette** (⌘K):
- Still accessible within Flow Pane
- Add new commands:
  - "add research node"
  - "add score node"
  - "add pitch node"
  - "run workflow"
  - "clear workflow"

**Keyboard Shortcuts**:
- `⌘K` - Open Command Palette
- `Delete` - Remove selected node
- `Escape` - Deselect all nodes
- `Space + Drag` - Pan canvas
- `Scroll` - Zoom in/out

**Accessibility**:
- All nodes keyboard navigable
- Focus ring: `0 0 0 2px var(--accent)` at 70% opacity
- Screen reader labels: "Research node, pending, 0 contacts found"

---

## 📊 Performance Targets

| Metric | Target | Current (Flow Studio) | Status |
|--------|--------|----------------------|--------|
| Grid render FPS | ≥ 60 | ~55 | ⚠️ Needs optimization |
| Node add latency | ≤ 50ms | ~80ms | ⚠️ Reduce motion complexity |
| Connection draw | ≤ 100ms | ~120ms | ✅ Acceptable |
| Canvas pan FPS | ≥ 60 | ~58 | ✅ Good |
| Initial load | ≤ 500ms | ~600ms | ⚠️ Lazy load canvas |

**Optimization Strategies**:
1. Lazy load Flow Pane (only when "Plan" mode active)
2. Use `React.memo()` for nodes
3. Virtualize off-screen nodes (if > 50 nodes)
4. Debounce drag events to 16ms (60 FPS)
5. Use CSS `will-change` for transforms

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// FlowPane.test.tsx
describe('FlowPane', () => {
  it('renders with Slate Cyan theme', () => {
    render(<FlowPane />)
    const grid = screen.getByTestId('flow-canvas')
    expect(grid).toHaveStyle({ backgroundColor: 'rgba(58, 169, 190, 0.1)' })
  })

  it('adds node on command', () => {
    render(<FlowPane />)
    fireEvent.click(screen.getByText('Add Research Node'))
    expect(screen.getByText('Research')).toBeInTheDocument()
  })

  it('persists workflow to Supabase', async () => {
    // Test workflow save
  })
})
```

### Integration Tests (Playwright)

```typescript
// flowPane.spec.ts
test('Flow Pane integration in Console', async ({ page }) => {
  await page.goto('/console')

  // Click "Plan" mode
  await page.click('text=PLAN')

  // Verify Flow Pane renders
  await expect(page.locator('[data-testid="flow-pane"]')).toBeVisible()

  // Add a node
  await page.keyboard.press('Meta+K')
  await page.fill('input[placeholder*="Search"]', 'add research node')
  await page.keyboard.press('Enter')

  // Verify node appears
  await expect(page.locator('text=Research')).toBeVisible()

  // Check Slate Cyan color
  const node = page.locator('[data-node-type="research"]')
  await expect(node).toHaveCSS('border-color', 'rgb(58, 169, 190)')
})
```

---

## 🚀 Deliverables

### Code

- [ ] `/apps/aud-web/src/components/console/FlowPane.tsx`
- [ ] `/apps/aud-web/src/components/features/flow/FlowNode.tsx` (updated)
- [ ] `/apps/aud-web/src/components/features/flow/FlowCanvas.tsx` (updated)
- [ ] `/apps/aud-web/src/stores/consoleStore.ts` (workflow state)
- [ ] `/supabase/migrations/20251025000000_add_campaign_workflows.sql`

### Documentation

- [ ] `/specs/FLOW_PANE_INTEGRATION_SPEC.md` (this file)
- [ ] `/specs/FLOW_NODE_API.md` (node types, props, methods)
- [ ] `/apps/aud-web/src/components/console/FlowPane.README.md` (usage guide)

### Testing

- [ ] Unit tests for FlowPane, FlowNode, FlowCanvas
- [ ] Integration tests for Console + Flow Pane
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Performance benchmarks (60 FPS target)

### Final Update

- [ ] `STAGE_9_COMPLETE.md` - Updated with Flow Pane inclusion

---

## 🎯 Success Metrics

### User Experience

- [ ] Users can visually design workflows in < 2 minutes
- [ ] Workflow execution visible in Activity Stream
- [ ] Node metrics update in real-time (< 500ms latency)
- [ ] Keyboard shortcuts feel natural (Figma/Linear parity)

### Technical

- [ ] 60 FPS canvas performance (pan, zoom, drag)
- [ ] < 50ms node add latency
- [ ] Workflow persists to Supabase successfully
- [ ] Realtime collaboration works (multi-user editing)

### Business

- [ ] "DAW for marketing automation" narrative resonates in demos
- [ ] Flow Pane becomes primary differentiator vs competitors
- [ ] Users create reusable workflow templates

---

## 💬 Why This Matters

**Before**: Flow Studio was a beautiful prototype without clear purpose
**After**: Flow Pane is the creative control layer that makes totalaud.io feel like a professional tool

**The Moment**: When a user drags "Research" → "Score" → "Pitch" nodes and watches agents execute them in real-time, that's when they go *"oh wow, this is different."*

It's your DAW moment. Your Figma Auto Layout moment. Your Linear Project View moment.

It's the feature that makes people tell their friends.

---

**Last Updated**: October 2025
**Status**: Specification Complete - Ready for Implementation
**Next Step**: Phase 1 - Refactor Core Components
