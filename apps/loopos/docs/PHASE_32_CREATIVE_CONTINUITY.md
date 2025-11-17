# Phase 32 — Creative Continuity: Notebook → Timeline Smart Linking

**Status**: ✅ Complete
**Date**: November 2025
**Scope**: Unified creative graph connecting notes, cards, and timeline nodes

---

## 🎯 Objective

Build a seamless linking system that connects:
- Journal notes → Timeline nodes
- Analogue cards → Timeline nodes
- Coach suggestions → Timeline nodes
- Designer ideas → Timeline nodes

**Philosophy**: Not copy/paste. An interlinked creative graph inside one workspace.

**Impact**: totalaud.io now feels like one single creative instrument instead of separate OS modes.

**Tone**: British, calm, connected. "Add to timeline" not "Promote".

---

## 📋 Deliverables Completed

### 1. Database Schema ✅

**Migration**: `/supabase/migrations/20251116040000_loopos_phase_32_creative_continuity.sql`

**2 New Tables**:

#### `loopos_analogue_cards`
Structured cards from Analogue OS

**Columns**:
- `id` (uuid, primary key)
- `workspace_id` (uuid, references loopos_workspaces)
- `user_id` (uuid, references auth.users)
- `title` (text)
- `content` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**RLS**: Full workspace scoping (SELECT, INSERT, UPDATE, DELETE)

#### `loopos_note_links`
Bidirectional links between notes/cards and timeline nodes

**Columns**:
- `id` (uuid, primary key)
- `workspace_id` (uuid, references loopos_workspaces)
- `note_id` (uuid, nullable)
- `analogue_card_id` (uuid, references loopos_analogue_cards, nullable)
- `node_id` (uuid, NOT NULL)
- `link_type` (text: 'origin' | 'reference' | 'derived')
- `created_at` (timestamptz)

**Constraint**: Either `note_id` OR `analogue_card_id` must be set

**RLS**: Full workspace scoping (SELECT, INSERT, DELETE)

**Link Types**:
- **origin**: Note/card became this node (primary link)
- **reference**: Node references this note/card
- **derived**: AI-suggested link (lower confidence)

**4 New Columns** (added to existing tables):

#### `loopos_nodes` extensions:
- `origin_type` (text: 'note' | 'analogue' | 'coach' | 'designer', nullable)
- `origin_id` (uuid, nullable)
- `origin_confidence` (numeric 0.0-1.0, nullable)

#### `loopos_notes` / `loopos_journal_entries` extensions:
- `promoted_to_node` (boolean, default false)

**3 Helper Functions**:
- `get_note_linked_nodes(p_note_id)` - Returns all nodes linked to a note
- `get_card_linked_nodes(p_card_id)` - Returns all nodes linked to a card
- `get_node_origin(p_node_id)` - Returns origin source for a node

---

### 2. TypeScript Schemas ✅

**File**: `/packages/loopos-db/src/types.ts` (extended)

**Zod Schemas**:
```typescript
export const LinkTypeSchema = z.enum(['origin', 'reference', 'derived'])
export const OriginTypeSchema = z.enum(['note', 'analogue', 'coach', 'designer'])
```

**Interfaces**:
```typescript
export interface AnalogueCard {
  id: string
  workspace_id: string
  user_id: string
  title: string
  content: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface NoteLink {
  id: string
  workspace_id: string
  note_id: string | null
  analogue_card_id: string | null
  node_id: string
  link_type: LinkType
  created_at: string
}

export interface NodeOrigin {
  origin_type: OriginType | null
  origin_id: string | null
  origin_title: string | null
  origin_content: string | null
  link_type: LinkType | null
}

export interface LinkedNode {
  node_id: string
  node_title: string
  node_type: NodeType
  link_type: LinkType
  created_at: string
}
```

---

### 3. Database Module ✅

**File**: `/packages/loopos-db/src/linking.ts`

**Exports**:
```typescript
export const linkingDb = {
  analogueCard: {...},
  noteLink: {...},
  nodeOrigin: {...},
  notePromotion: {...},
}
```

#### Analogue Card Operations

**`create(workspaceId, userId, { title, content })`**
- Creates a new analogue card
- Returns created card

**`list(workspaceId)`**
- Lists all cards in workspace
- Ordered by created_at DESC

**`get(cardId)`**
- Fetch single card
- Throws if not found

**`update(cardId, updates)`**
- Partial update of card
- Auto-updates `updated_at`

**`delete(cardId)`**
- Deletes card
- Cascade deletes all links

#### Note Link Operations

**`createFromNote(workspaceId, noteId, nodeId, linkType)`**
- Links journal note to timeline node
- Default linkType: 'origin'

**`createFromCard(workspaceId, cardId, nodeId, linkType)`**
- Links analogue card to timeline node
- Default linkType: 'origin'

**`getLinkedNodesForNote(noteId)`**
- Returns all nodes linked to this note
- Uses helper function `get_note_linked_nodes`

**`getLinkedNodesForCard(cardId)`**
- Returns all nodes linked to this card
- Uses helper function `get_card_linked_nodes`

**`getNodeOrigin(nodeId)`**
- Returns origin source for node
- Uses helper function `get_node_origin`
- Returns null if no origin

**`delete(linkId)`**
- Deletes single link

**`deleteForNode(nodeId)`**
- Deletes all links for a node
- Useful when node is deleted

#### Node Origin Operations

**`setOrigin(nodeId, originType, originId, confidence?)`**
- Sets origin fields on timeline node
- Optional confidence for AI-generated

**`clearOrigin(nodeId)`**
- Clears all origin fields

**`getNodesWithOrigin(workspaceId, originType, originId)`**
- Find all nodes created from a source
- Returns array of node IDs

#### Note Promotion Operations

**`markPromoted(noteId, tableName)`**
- Sets `promoted_to_node = true`
- Works with both `loopos_notes` and `loopos_journal_entries`
- Fire-and-forget (doesn't throw)

**`unmarkPromoted(noteId, tableName)`**
- Sets `promoted_to_node = false`
- Used when link is deleted

---

### 4. AI Suggestion API ✅

**Endpoint**: `POST /api/links/suggest-nodes`

**Purpose**: Suggests 0-3 timeline nodes from note/card content using AI

**Request Body**:
```typescript
{
  content: string          // Required: note/card content
  title?: string          // Optional: note/card title
  sourceType?: 'note' | 'analogue' | 'journal'
}
```

**Response**:
```typescript
{
  success: true,
  suggestions: [
    {
      title: "Release date decision",
      type: "decision",
      content: "You could try setting a rough release window based on your current momentum.",
      confidence: 0.8
    }
  ]
}
```

**AI Prompt Tone**:
- Quiet, British, optional
- "You could try..." not "You should..."
- Never forceful
- Returns empty array if note doesn't suggest timeline items

**Error Handling**:
- If AI not configured: Returns `{ suggestions: [] }` with 200 OK
- If parse fails: Returns empty suggestions (no UI break)
- If validation fails: Returns 400 with details

**File**: `/apps/loopos/src/app/api/links/suggest-nodes/route.ts`

---

### 5. UI Components ✅

**Directory**: `/apps/loopos/src/components/linking/`

#### `AddToTimelineModal.tsx`
**Purpose**: Modal for converting notes/cards to timeline nodes

**Features**:
- AI-powered suggestions (0-3 shown)
- "You could try:" British tone
- 6 node types (idea, milestone, task, reference, insight, decision)
- Custom title input (optional - defaults to source title)
- Custom content input (optional)
- Loading state for suggestions
- Submitting state
- Click suggestion to pre-fill form
- Accent colour theming

**Props**:
```typescript
{
  isOpen: boolean
  onClose: () => void
  sourceTitle: string
  sourceContent: string
  sourceType: 'note' | 'analogue' | 'journal'
  onConfirm: (nodeType, title?, content?) => Promise<void>
}
```

**Interactions**:
- Opens with AI suggestions loading
- User can click suggestion or manually select type
- "Add to timeline" button (not "Promote")
- Cancel button
- Click outside to close

#### `LinkedTimelineItems.tsx`
**Purpose**: Shows timeline nodes linked to a note/card

**Features**:
- Displays under each note/card
- Shows node title + type
- "View in timeline" button
- Hover to highlight (calls `onHighlightNode`)
- Accent border and background
- Empty state: no render if no links

**Props**:
```typescript
{
  linkedNodes: LinkedNode[]
  onViewNode?: (nodeId: string) => void
  onHighlightNode?: (nodeId: string | null) => void
}
```

**Layout**:
- Header: "LINKED TIMELINE ITEMS" (uppercase, muted, 12px)
- List of linked nodes (title, type badge, view button)
- Responsive flex layout

#### `NodeOriginSection.tsx`
**Purpose**: Shows origin source in Node Inspector

**Features**:
- Icon + label by origin type:
  - 📝 "Created from a note"
  - 🎴 "Created from an analogue card"
  - 🎯 "Created from a coach suggestion"
  - 🎨 "Created from a visual idea"
- Shows origin title
- Shows origin content snippet (max 200 chars, 4 lines)
- "Open note" / "View card" button (if applicable)
- Hover to highlight source (calls `onHighlightSource`)
- Italic helper text for coach/designer

**Props**:
```typescript
{
  origin: NodeOrigin | null
  onViewSource?: () => void
  onHighlightSource?: (highlighted: boolean) => void
}
```

**Styling**:
- Accent border (20% opacity)
- Accent background (3% opacity)
- Rounded corners (8px)
- 120ms transitions

---

### 6. Cross-OS Highlight System ✅

**File**: `/apps/loopos/src/hooks/linking/useCrossOSHighlight.ts`

**Purpose**: Lightweight postMessage bridge for highlighting linked items across surfaces

**Architecture**:
- No WebSockets
- No heavy state
- Just soft visual links via `window.postMessage`

**Message Types**:
```typescript
type HighlightMessageType =
  | 'highlight-note'
  | 'highlight-node'
  | 'highlight-card'
  | 'clear-highlight'

interface HighlightMessage {
  type: HighlightMessageType
  id: string | null
  source: 'loopos' | 'aud-web' | 'analogue'
}
```

**Hook Usage**:
```typescript
const { highlightNote, highlightNode, clearHighlight } = useCrossOSHighlight({
  onHighlightNote: (id) => setHighlightedNoteId(id),
  onHighlightNode: (id) => setHighlightedNodeId(id),
  enabled: true,
})

// Hover note → highlight linked node
<div onMouseEnter={() => highlightNode(linkedNodeId)}
     onMouseLeave={clearHighlight}>
  Note content
</div>
```

**Helper Functions**:

**`getHighlightStyle(isHighlighted: boolean)`**
- Returns glow + scale style
- Accent box-shadow (2px border, 20px glow)
- Transform: `scale(1.01)` (respects reduced motion)
- 120ms transition
- z-index: 10

**`getPulseStyle(isHighlighted: boolean)`**
- Alternative to scale (pulse effect)
- Accent box-shadow (same as above)
- Opacity: 0.95 (respects reduced motion)
- 120ms transition

**Reduced Motion Support**:
- Checks `prefers-reduced-motion: reduce`
- Disables scale/opacity if user prefers
- Keeps box-shadow for visibility

---

### 7. Memory Graph Integration ✅

**File**: `/apps/loopos/src/lib/linking/memory-integration.ts`

**Purpose**: Connect note-to-node links with the Memory Graph for semantic learning

#### `addLinkingMemoryEdges(workspaceId, sourceType, sourceId, nodeId, noteContent?)`

**Creates**:
1. **Derived edge**: `source → node`
   - Relationship: 'derived'
   - Weight: 0.9
   - Context: `{ source_type, link_type: 'origin', created_via: 'add_to_timeline' }`

2. **Theme edges**: `node → themes` (if content provided)
   - Extracts simple themes from note content
   - Creates theme nodes (e.g., `theme:release-planning`)
   - Links node → theme with weight 0.7
   - Max 3 themes per note

**Theme Extraction**:
Uses keyword matching across 10 categories:
- Release Planning
- Radio Promotion
- Social Media
- Press & PR
- Live Shows
- Marketing
- Branding
- Fan Engagement
- Music Distribution
- Collaboration

**Error Handling**:
- Fire-and-forget (doesn't throw)
- Memory graph is nice-to-have, not critical
- Logs warnings on failure

#### `removeLinkingMemoryEdges(sourceId, nodeId)`

**Purpose**: Cleanup when link is deleted

**Actions**:
- Removes derived edge: `source → node`
- Best effort (doesn't throw)

#### `getRelatedNodesFromMemory(workspaceId, noteContent)`

**Purpose**: Find related timeline nodes based on note content

**Algorithm**:
1. Extract themes from note content
2. For each theme, find nodes linked to that theme
3. Return unique node IDs (max 5)

**Use Case**: Future "Related timeline items" feature

---

## 🎨 Usage Patterns

### Pattern 1: Add Note to Timeline

**User Flow**:
1. User writes a journal note or creates analogue card
2. Clicks "Add to timeline" button (accent outline, small)
3. Modal opens with AI suggestions loading
4. AI suggests 0-3 timeline nodes: "You could try:"
5. User clicks suggestion OR manually selects node type
6. User optionally edits title/content
7. User clicks "Add to timeline"
8. System creates:
   - Timeline node with origin fields set
   - Note link with `link_type: 'origin'`
   - Memory graph edges (note → node, node → themes)
   - Marks note as `promoted_to_node: true`

**Code Example**:
```typescript
import { AddToTimelineModal } from '@/components/linking/AddToTimelineModal'
import { linkingDb, nodeOriginDb, memoryDb } from '@loopos/db'
import { addLinkingMemoryEdges } from '@/lib/linking/memory-integration'

const [showModal, setShowModal] = useState(false)

async function handleAddToTimeline(
  nodeType: NodeType,
  title?: string,
  content?: string
) {
  // 1. Create timeline node
  const node = await nodesDb.create(workspaceId, userId, {
    type: nodeType,
    title: title || note.title,
    content: content || note.content.substring(0, 200),
    colour: '#3AA9BE',
    position_x: 100,
    position_y: 100,
  })

  // 2. Set origin on node
  await nodeOriginDb.setOrigin(node.id, 'note', note.id)

  // 3. Create link
  await linkingDb.noteLink.createFromNote(
    workspaceId,
    note.id,
    node.id,
    'origin'
  )

  // 4. Mark note as promoted
  await linkingDb.notePromotion.markPromoted(note.id, 'loopos_notes')

  // 5. Add memory graph edges
  await addLinkingMemoryEdges(
    workspaceId,
    'note',
    note.id,
    node.id,
    note.content
  )
}

<AddToTimelineModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  sourceTitle={note.title}
  sourceContent={note.content}
  sourceType="note"
  onConfirm={handleAddToTimeline}
/>
```

### Pattern 2: Show Linked Items on Note

**User Flow**:
1. User views a note that has been added to timeline
2. Below note content, sees "Linked timeline items" section
3. Shows node title, type, and "View in timeline" button
4. Hover node → highlights corresponding timeline node (cross-OS)
5. Click "View in timeline" → opens LoopOS and zooms to node

**Code Example**:
```typescript
import { LinkedTimelineItems } from '@/components/linking/LinkedTimelineItems'
import { linkingDb } from '@loopos/db'
import { useCrossOSHighlight } from '@/hooks/linking/useCrossOSHighlight'

const [linkedNodes, setLinkedNodes] = useState<LinkedNode[]>([])

// Load linked nodes
useEffect(() => {
  async function loadLinks() {
    const nodes = await linkingDb.noteLink.getLinkedNodesForNote(note.id)
    setLinkedNodes(nodes)
  }
  loadLinks()
}, [note.id])

// Setup cross-OS highlighting
const { highlightNode } = useCrossOSHighlight()

function handleViewNode(nodeId: string) {
  // Navigate to LoopOS timeline and zoom to node
  window.location.href = `/timeline?node=${nodeId}`
}

<LinkedTimelineItems
  linkedNodes={linkedNodes}
  onViewNode={handleViewNode}
  onHighlightNode={highlightNode}
/>
```

### Pattern 3: Show Origin in Node Inspector

**User Flow**:
1. User selects a timeline node in LoopOS
2. Node Inspector opens
3. If node has origin, shows "Origin" section
4. Shows icon, label, origin title, content snippet
5. Shows "Open note" / "View card" button
6. Hover origin section → highlights source note/card (cross-OS)
7. Click "Open note" → opens note in journal surface

**Code Example**:
```typescript
import { NodeOriginSection } from '@/components/linking/NodeOriginSection'
import { linkingDb } from '@loopos/db'
import { useCrossOSHighlight } from '@/hooks/linking/useCrossOSHighlight'

const [origin, setOrigin] = useState<NodeOrigin | null>(null)

// Load origin
useEffect(() => {
  async function loadOrigin() {
    const nodeOrigin = await linkingDb.noteLink.getNodeOrigin(node.id)
    setOrigin(nodeOrigin)
  }
  loadOrigin()
}, [node.id])

// Setup cross-OS highlighting
const { highlightNote, highlightCard } = useCrossOSHighlight()

function handleViewSource() {
  if (!origin) return

  if (origin.origin_type === 'note') {
    window.location.href = `/journal?note=${origin.origin_id}`
  } else if (origin.origin_type === 'analogue') {
    window.location.href = `/analogue?card=${origin.origin_id}`
  }
}

function handleHighlightSource(highlighted: boolean) {
  if (!origin) return

  if (origin.origin_type === 'note') {
    highlightNote(highlighted ? origin.origin_id : null)
  } else if (origin.origin_type === 'analogue') {
    highlightCard(highlighted ? origin.origin_id : null)
  }
}

<NodeOriginSection
  origin={origin}
  onViewSource={handleViewSource}
  onHighlightSource={handleHighlightSource}
/>
```

---

## ✅ Acceptance Criteria

✅ Notes/cards can be added to timeline via modal
✅ AI suggests 0-3 node options with British tone
✅ Node Inspector shows origin with icon + snippet
✅ Links stored in DB with full RLS
✅ Hover glowing between OS surfaces (120ms, accent, reduced motion)
✅ Memory Graph integration (note → node → themes)
✅ All British English ("Add to timeline" not "Promote")
✅ No hype words, no clutter
✅ Calm animations (≤120ms for highlights, ≤240ms for modals)
✅ All styling via design tokens
✅ No breaking changes to existing LoopOS features
✅ TypeScript strict mode throughout

---

## 📦 Files Created

### Database (1 file)
1. `/supabase/migrations/20251116040000_loopos_phase_32_creative_continuity.sql`

### TypeScript Schemas (2 files)
2. `/packages/loopos-db/src/types.ts` (extended)
3. `/packages/loopos-db/src/linking.ts`
4. `/packages/loopos-db/src/index.ts` (export added)

### API Endpoints (1 file)
5. `/apps/loopos/src/app/api/links/suggest-nodes/route.ts`

### UI Components (3 files)
6. `/apps/loopos/src/components/linking/AddToTimelineModal.tsx`
7. `/apps/loopos/src/components/linking/LinkedTimelineItems.tsx`
8. `/apps/loopos/src/components/linking/NodeOriginSection.tsx`

### Hooks (1 file)
9. `/apps/loopos/src/hooks/linking/useCrossOSHighlight.ts`

### Integration Helpers (1 file)
10. `/apps/loopos/src/lib/linking/memory-integration.ts`

### Documentation (1 file)
11. `/apps/loopos/docs/PHASE_32_CREATIVE_CONTINUITY.md` (this file)

**Total**: 11 files

---

## 🎯 Impact Assessment

### Before Phase 32

- Notes, cards, and timeline are separate surfaces
- No connection between journal and campaign planning
- Copy/paste required to move ideas
- No semantic graph of creative work
- No origin tracking for timeline items

### After Phase 32

- ✅ One unified creative instrument
- ✅ Notes seamlessly become timeline nodes
- ✅ Bidirectional links with visual highlighting
- ✅ AI suggests timeline items from notes
- ✅ Memory Graph learns from connections
- ✅ Origin tracking shows where ideas came from
- ✅ Cross-surface hover highlighting
- ✅ Calm, British, helpful tone throughout

**Key Metric**: Creative continuity. Ideas flow from journal → timeline → memory graph without friction.

---

## 🔮 Future Enhancements (Optional)

### 1. Bulk Linking
Select multiple notes and add all to timeline in one action

### 2. Smart Suggestions Based on Memory
Use Memory Graph to suggest which existing nodes relate to a new note

### 3. Visual Link Graph
Show network visualization of note → node → theme connections

### 4. Link Annotations
Add comments or context to links (why was this note added to timeline?)

### 5. Bidirectional Sync
Edit node → updates source note (with conflict resolution)

### 6. Link Analytics
Show most-linked notes, orphaned nodes, connection density

### 7. Export Connected Graph
Export all notes + linked nodes as a connected document

---

## 📝 Notes

**Philosophy**: This is not copy/paste. This is an interlinked creative graph. The Memory Graph grows organically as users connect their thoughts to their timeline.

**Tone**: British, calm, connected. "Add to timeline" not "Promote". "You could try" not "You should".

**No Clutter**: Links are subtle. Highlighting is soft (120ms glow). AI suggestions are optional.

**Accessibility**: Reduced motion support throughout. Keyboard navigation in modal. ARIA labels on all interactive elements.

**Performance**: Fire-and-forget memory graph updates. No blocking operations. Suggestions load async.

**Privacy**: All data workspace-scoped. RLS enforced. No cross-workspace leakage.

---

**Implementation Date**: 2025-11-16
**Status**: ✅ Complete - Creative Continuity linking system implemented
**Git Commit**: `feat(linking): Phase 32 — Notebook → Timeline smart linking`

---

**Phase 32 Complete**: totalaud.io is now one single creative instrument. Notes, cards, timeline, and memory are unified. Creative continuity achieved.
