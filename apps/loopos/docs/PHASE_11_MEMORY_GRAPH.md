# LoopOS Phase 11 — Artist Memory Graph

**Status**: ✅ COMPLETE
**Implementation Date**: 2025-11-16
**Files Created**: 12
**Lines Added**: ~2,400+

---

## 🎯 Overview

Phase 11 adds a semantic memory graph system that learns the artist's creative identity from all LoopOS content (journal, coach, timeline, designer, packs, moodboards, usage). This "creative brain" feeds context back into AI features for personalised responses.

---

## ✅ Implemented Features

### 1. Memory Graph Database

Four-table semantic graph structure:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **loopos_memory_nodes** | Semantic concepts | kind, label, summary, confidence, occurrences |
| **loopos_memory_edges** | Relationships | from_node_id, to_node_id, relation, strength |
| **loopos_memory_sources** | Content links | source_type, source_id, excerpt |
| **loopos_memory_snapshots** | Identity snapshots | summary, stats |

**Node Kinds**:
- `theme` - Creative themes (nostalgia, urban isolation, freedom)
- `tone` - Emotional tones (melancholic, energetic, intimate)
- `visual_motif` - Visual concepts (neon lights, grainy textures, vintage film)
- `audience` - Target audience (late-night listeners, bedroom pop fans)
- `value` - Artist values (authenticity, experimentation, community)
- `skill` - Technical skills (808 programming, vocal layering)
- `goal` - Creative goals (release debut EP, build fanbase)
- `collaborator` - Collaborators/influences (producer X, inspired by Y)
- `genre` - Musical genres (lo-fi hip hop, indie electronic)
- `instrument` - Instruments (MPC, Juno-106, vocals)
- `technique` - Production techniques (sidechain compression, vinyl sampling)

**Edge Relations**:
- `relates_to` - General connection
- `contrasts_with` - Opposition or contrast
- `inspires` - One concept inspires another
- `caused_by` - Causal relationship
- `part_of` - Hierarchical relationship
- `similar_to` - Similarity

### 2. AI Extraction Pipelines

Anthropic Claude-powered extraction from different content types:

```typescript
extractFromJournal(workspaceId, entryId, content)
extractFromCoach(workspaceId, conversationId, messages)
extractFromTimeline(workspaceId, milestoneId, title, description)
extractFromDesigner(workspaceId, sceneId, prompt, nodes)
extractFromPack(workspaceId, packId, name, description, tags)
extractFromMoodboard(workspaceId, moodboardId, title, images)
extractFromUsage(workspaceId, summary)
```

**Extraction Output**:
```typescript
{
  nodes: [
    { kind: 'theme', label: 'Nostalgia', summary: '...', confidence: 0.9 }
  ],
  edges: [
    { fromLabel: 'Nostalgia', toLabel: 'Lo-fi', relation: 'inspires', strength: 0.8 }
  ]
}
```

**AI Model**: `claude-3-5-haiku-20241022` (fast, cost-effective)

### 3. Memory Context Injection

Helper functions that format memory for AI prompts:

```typescript
// General context
getMemoryContext(workspaceId) → { themes, tones, values, visualMotifs, prompt }

// Feature-specific
getCoachMemoryContext(workspaceId)     → formatted prompt for Coach
getDesignerMemoryContext(workspaceId)  → formatted prompt for Designer
getPacksMemoryContext(workspaceId)     → formatted prompt for Packs
```

**Example Prompt Injection**:
```
## Artist Identity (Memory Graph)

**Creative Themes**: Nostalgia, Urban isolation, Freedom
**Emotional Tones**: Melancholic, Intimate, Energetic
**Core Values**: Authenticity, Experimentation, Community
**Visual Motifs**: Neon lights, Grainy textures, Vintage film

Use this identity context to personalise your responses and suggestions.
```

### 4. Artist Identity Page (`/identity`)

Beautiful UI showing:
- Memory stats (node count, edge count)
- Creative themes (with confidence %)
- Emotional tones (with confidence %)
- Core values (with confidence %)
- Visual motifs (with confidence %)
- Manual snapshot creation
- Link to Memory Inspector

**Features**:
- Empty state for new workspaces
- Visual confidence indicators (opacity)
- Responsive grid layout

### 5. Memory Inspector Page (`/memory`)

Developer-focused debugging tool:
- Filter by node kind (theme, tone, visual_motif, etc.)
- Expandable node cards
- View node connections (edges)
- View source content links
- Node metadata (ID, first/last seen dates)

**Use Cases**:
- Debug extraction quality
- Explore semantic relationships
- Verify source attributions
- Track memory growth over time

### 6. Memory API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/memory/extract` | POST | Trigger extraction from content |
| `/api/memory/identity` | GET | Get artist identity summary |
| `/api/memory/nodes` | GET | List nodes (filterable by kind) |
| `/api/memory/nodes/[id]` | GET | Get node details + graph |
| `/api/memory/snapshots` | GET | List snapshots |
| `/api/memory/snapshots` | POST | Create snapshot |

---

## 📦 Database Schema

### loopos_memory_nodes

```sql
id uuid PRIMARY KEY
workspace_id uuid → loopos_workspaces
kind text (theme, tone, visual_motif, etc.)
label text (short name)
summary text (longer description)
confidence numeric(3,2) (0.0-1.0)
occurrences integer (how many times seen)
first_seen_at timestamptz
last_seen_at timestamptz
embedding_model text (future: vector search)
embedding vector(1536) (future: pgvector)
created_at timestamptz
updated_at timestamptz
```

**Indexes**: workspace_id, kind, label, confidence

### loopos_memory_edges

```sql
id uuid PRIMARY KEY
workspace_id uuid → loopos_workspaces
from_node_id uuid → loopos_memory_nodes
to_node_id uuid → loopos_memory_nodes
relation text (relates_to, contrasts_with, inspires, etc.)
strength numeric(3,2) (0.0-1.0)
evidence text (why this edge exists)
created_at timestamptz
updated_at timestamptz

UNIQUE (from_node_id, to_node_id, relation)
```

**Indexes**: workspace_id, from_node_id, to_node_id, relation

### loopos_memory_sources

```sql
id uuid PRIMARY KEY
workspace_id uuid → loopos_workspaces
node_id uuid → loopos_memory_nodes
source_type text (journal, coach, timeline, designer, pack, moodboard, usage)
source_id uuid (ID of source entity)
excerpt text (relevant quote/summary)
created_at timestamptz
```

**Indexes**: workspace_id, node_id, source_type, source_id

### loopos_memory_snapshots

```sql
id uuid PRIMARY KEY
workspace_id uuid → loopos_workspaces
snapshot_type text (auto, manual)
summary text (AI-generated summary)
stats jsonb (node_count, edge_count, top_themes, etc.)
created_at timestamptz
```

**Indexes**: workspace_id, created_at

---

## 🔧 Database Functions

### loopos_get_top_nodes(workspace_id, kind, limit)

Returns top N nodes of a specific kind by confidence and occurrences.

```sql
SELECT id, label, summary, confidence, occurrences
FROM loopos_memory_nodes
WHERE workspace_id = ? AND kind = ?
ORDER BY confidence DESC, occurrences DESC
LIMIT ?
```

### loopos_get_node_graph(node_id)

Returns node with all connected edges and nodes (outgoing + incoming).

```sql
-- Outgoing edges
SELECT node, edge, connected_node, relation, strength
FROM loopos_memory_nodes n
JOIN loopos_memory_edges e ON e.from_node_id = n.id
...

UNION ALL

-- Incoming edges
...
```

### loopos_upsert_memory_node(...)

Create or update node (upserts by workspace + kind + label):
- If node exists → increment occurrences, update confidence
- If new → insert node

Returns node ID.

### loopos_create_memory_edge(...)

Create edge (upserts on conflict):
- If edge exists → update strength and evidence
- If new → insert edge

Returns edge ID.

### loopos_get_artist_identity(workspace_id)

Returns JSONB summary:
```json
{
  "themes": [{ "label": "...", "confidence": 0.9 }],
  "tones": [...],
  "values": [...],
  "visual_motifs": [...],
  "node_count": 42,
  "edge_count": 67
}
```

---

## 🧩 Code Structure

### packages/loopos-db/src/memory.ts

Database helpers with Zod validation:

```typescript
// Nodes
memoryDb.nodes.list(workspaceId, limit)
memoryDb.nodes.listByKind(workspaceId, kind, limit)
memoryDb.nodes.get(nodeId)
memoryDb.nodes.upsert(workspaceId, kind, label, summary, confidence)
memoryDb.nodes.getTopByKind(workspaceId, kind, limit)
memoryDb.nodes.delete(nodeId)

// Edges
memoryDb.edges.list(workspaceId, limit)
memoryDb.edges.getForNode(nodeId)
memoryDb.edges.getNodeGraph(nodeId)
memoryDb.edges.create(workspaceId, fromId, toId, relation, strength, evidence)
memoryDb.edges.delete(edgeId)

// Sources
memoryDb.sources.listForNode(nodeId, limit)
memoryDb.sources.create(workspaceId, nodeId, sourceType, sourceId, excerpt)
memoryDb.sources.delete(sourceId)

// Snapshots
memoryDb.snapshots.list(workspaceId, limit)
memoryDb.snapshots.create(workspaceId, summary, stats, type)
memoryDb.snapshots.getLatest(workspaceId)

// Identity
memoryDb.identity.get(workspaceId)
```

### apps/loopos/src/lib/memory/extraction.ts

AI extraction pipelines:

```typescript
extractFromJournal(workspaceId, entryId, content)
extractFromCoach(workspaceId, conversationId, messages)
extractFromTimeline(workspaceId, milestoneId, title, description)
extractFromDesigner(workspaceId, sceneId, prompt, nodes)
extractFromPack(workspaceId, packId, name, description, tags)
extractFromMoodboard(workspaceId, moodboardId, title, images)
extractFromUsage(workspaceId, summary)

// Helpers
callExtractionAI(prompt) → { nodes, edges }
persistExtraction(workspaceId, extraction, sourceType, sourceId, content)
```

**System Prompt** (EXTRACTION_SYSTEM_PROMPT):
- Defines all node kinds and edge relations
- Specifies output format (JSON)
- Sets confidence guidelines (0.9+ = explicit, 0.7-0.9 = implied, 0.5-0.7 = weak)
- Enforces British spelling

### apps/loopos/src/lib/memory/context.ts

Memory context for AI features:

```typescript
getMemoryContext(workspaceId) → MemoryContext
getCoachMemoryContext(workspaceId) → string
getDesignerMemoryContext(workspaceId) → string
getPacksMemoryContext(workspaceId) → string

// Helpers
formatMemoryPrompt(themes, tones, values, visualMotifs) → string
getRecentActivityContext(workspaceId) → { recentThemes, recentGoals }
getSkillsContext(workspaceId) → string[]
```

---

## 🎨 UI Components

### Artist Identity Page (`/identity`)

Shows:
- Memory stats cards (node count, edge count)
- Identity sections (themes, tones, values, visual motifs)
- Confidence indicators (opacity + percentage)
- Create Snapshot button
- Inspect Memory Graph link

**Empty State**:
> "Your artist identity will emerge as you use LoopOS. Try creating journal entries, chatting with Coach, or designing scenes."

### Memory Inspector Page (`/memory`)

Shows:
- Kind filter dropdown (all, theme, tone, visual_motif, etc.)
- Node list with expandable cards
- Node details: summary, connections, sources, metadata
- Connection count and strength indicators

**Developer Focus**: For debugging extraction quality and exploring graph structure.

---

## 🔌 API Integration

### Example: Trigger Extraction from Journal

```typescript
// apps/loopos/src/app/api/journal/route.ts
import { extractFromJournal } from '@/lib/memory/extraction'

export async function POST(req: Request) {
  const { workspaceId, userId, content } = await req.json()

  // Create journal entry
  const entry = await journalDb.create(workspaceId, userId, content)

  // Extract memory (non-blocking)
  extractFromJournal(workspaceId, entry.id, content).catch(console.error)

  return NextResponse.json({ success: true, entry })
}
```

### Example: Inject Memory into Coach

```typescript
// apps/loopos/src/app/api/coach/route.ts
import { getCoachMemoryContext } from '@/lib/memory/context'

export async function POST(req: Request) {
  const { workspaceId, message } = await req.json()

  // Get memory context
  const memoryContext = await getCoachMemoryContext(workspaceId)

  // Build system prompt
  const systemPrompt = `You are an AI coach for musicians.

${memoryContext}

Provide personalised advice based on the artist's identity.`

  // Call Anthropic
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  })

  return NextResponse.json({ response })
}
```

---

## 📊 Memory Growth Example

### After Creating Journal Entry

```
Journal: "Been working on dark, nostalgic lo-fi beats with a vintage feel"
```

**Extracted Nodes**:
- theme: "Nostalgia" (confidence: 0.9)
- tone: "Dark" (confidence: 0.85)
- genre: "Lo-fi beats" (confidence: 0.95)
- visual_motif: "Vintage aesthetics" (confidence: 0.8)

**Extracted Edges**:
- "Nostalgia" → inspires → "Vintage aesthetics" (strength: 0.9)
- "Dark" → relates_to → "Lo-fi beats" (strength: 0.7)

### After Coach Conversation

```
Artist: "How can I make my sound more distinctive?"
Coach: "Given your nostalgic themes, try adding vinyl crackle or tape saturation..."
```

**Extracted Nodes**:
- skill: "Vinyl sampling" (confidence: 0.7)
- technique: "Tape saturation" (confidence: 0.75)
- value: "Distinctive sound" (confidence: 0.6)

**Extracted Edges**:
- "Nostalgia" → inspires → "Vinyl sampling" (strength: 0.85)

### After Designer Scene

```
Prompt: "Create album cover with neon lights and grainy texture"
```

**Extracted Nodes**:
- visual_motif: "Neon lights" (confidence: 0.95)
- visual_motif: "Grainy texture" (confidence: 0.9)

**Extracted Edges**:
- "Neon lights" → contrasts_with → "Vintage aesthetics" (strength: 0.7)

---

## 🧪 Testing Workflow

### 1. Create Test Content

```bash
# Create journal entry
curl -X POST /api/journal \
  -d '{"workspaceId":"...","userId":"...","content":"Working on melancholic indie electronic tracks"}'

# Wait 2-3 seconds for extraction
sleep 3

# Check memory nodes
curl /api/memory/nodes?workspaceId=...
# Should see: theme:"Melancholic", genre:"Indie electronic"
```

### 2. Check Artist Identity

```bash
# Get identity summary
curl /api/memory/identity?workspaceId=...

# Expected output:
{
  "themes": [{"label": "Melancholic", "confidence": 0.85}],
  "tones": [...],
  "node_count": 3,
  "edge_count": 1
}
```

### 3. Test Memory Context in Coach

```bash
# Ask Coach for advice
curl -X POST /api/coach \
  -d '{"workspaceId":"...","message":"What should I focus on?"}'

# Coach should reference "melancholic" and "indie electronic" in response
```

### 4. Create Snapshot

```bash
# Create manual snapshot
curl -X POST /api/memory/snapshots \
  -d '{"workspaceId":"...","snapshotType":"manual"}'

# Response includes AI-generated summary:
"An emerging artist exploring melancholic themes in indie electronic music..."
```

---

## 🔐 Security

### RLS Policies

- **Nodes**: Workspace members can view, system can manage
- **Edges**: Workspace members can view, system can manage
- **Sources**: Workspace members can view, system can manage
- **Snapshots**: Workspace members can view, owners can create manual snapshots

### Database Functions

- **SECURITY DEFINER**: Functions run with elevated privileges
- **Atomic Operations**: Upsert and edge creation in single transaction
- **Input Validation**: Zod schemas validate all API inputs

---

## 🚀 Future Enhancements

### 1. Vector Embeddings (pgvector)

Add semantic similarity search:
```sql
-- Already prepared in schema
embedding_model TEXT
embedding VECTOR(1536)
```

**Use Cases**:
- Find similar themes: "Find themes like 'Nostalgia'"
- Semantic recommendations: "Suggest packs matching my vibe"
- Duplicate detection: "Merge similar nodes"

### 2. Auto-Snapshots

Periodic identity snapshots (weekly/monthly):
```typescript
// Cron job
await memoryDb.snapshots.create(workspaceId, summary, stats, 'auto')
```

### 3. Memory Evolution Timeline

Show how identity has changed over time:
- Theme emergence graph
- Confidence trends
- New skills learned

### 4. Collaborative Memory

Share memory nodes between workspace members:
- Collaborative identity building
- Team themes and values
- Shared visual language

### 5. Memory Export

Export memory graph for external use:
```json
{
  "nodes": [...],
  "edges": [...],
  "format": "cytoscape" // or "graphml", "json-ld"
}
```

---

## 🐛 Known Limitations

1. **No Vector Search Yet**: Embeddings prepared but not implemented
2. **No Batch Processing**: Extraction runs per-item (could batch similar items)
3. **No Confidence Decay**: Old memory doesn't fade over time
4. **No Merge Suggestions**: Similar nodes not auto-merged
5. **Single Language**: Extraction prompt is English-only

---

## 🏆 Achievements

✅ **Complete Memory Graph System**: Nodes, edges, sources, snapshots
✅ **AI Extraction Pipelines**: 7 content types supported
✅ **Memory Context Injection**: Coach, Designer, Packs integration ready
✅ **Artist Identity UI**: Beautiful `/identity` page
✅ **Memory Inspector**: Developer-focused `/memory` debugging tool
✅ **Database Functions**: Optimised queries for graph operations
✅ **British English**: Throughout codebase
✅ **TypeScript Strict**: No `any` types, Zod validation
✅ **Non-Blocking**: Extraction never blocks user actions
✅ **Integration Guide**: Complete documentation for feature integration

---

**Status**: ✅ Phase 11 Complete - Memory Graph System Ready!
**Implementation Date**: 2025-11-16
**Ready For**: AI personalisation, memory-driven recommendations, identity evolution tracking

🧠 **LoopOS now has a creative brain that learns who you are as an artist!**
