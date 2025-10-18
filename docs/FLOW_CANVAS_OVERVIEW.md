# Flow Canvas Overview

Visual workflow builder for orchestrating AI agent skills in TotalAud.io.

## Overview

The Flow Canvas is an interactive, node-based interface for creating, visualizing, and executing multi-step agent workflows. It provides:

- **Visual workflow design** using drag-and-drop nodes
- **Real-time execution status** with color-coded nodes
- **Live data flow** visualization between skills
- **Persistent sessions** saved to database
- **SSE integration** for progress updates

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Flow Canvas UI                       │
│                   (React Flow)                          │
│  • Nodes = Skills or Agents                            │
│  • Edges = Data flow                                   │
│  • Status colors = pending/running/complete            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Zustand Flow Store                      │
│  • nodes: Node[]                                        │
│  • edges: Edge[]                                        │
│  • sessionId: string                                    │
│  • isExecuting: boolean                                 │
└────────────────────┬────────────────────────────────────┘
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│ Flow API         │  │ Supabase         │
│ /api/flows       │  │ Realtime         │
│ (CRUD ops)       │  │ (Live updates)   │
└──────────────────┘  └──────────────────┘
```

## Node Types

### 1. Input Node (Start)

The entry point for every workflow:

```typescript
{
  id: "start",
  type: "input",
  position: { x: 250, y: 100 },
  data: {
    label: "🎬 Start",
    description: "Workflow entry point"
  },
  style: {
    background: "#10b981",
    color: "white",
    border: "2px solid #059669"
  }
}
```

### 2. Skill Nodes

Individual skill executions:

```typescript
{
  id: "skill-1",
  type: "default",
  position: { x: 250, y: 200 },
  data: {
    label: "🔍 Research Contacts",
    skillName: "research-contacts",
    status: "pending",
    input: { query: "indie radio UK", ... },
    output: null
  },
  style: {
    background: "#3b82f6",
    color: "white",
    border: "2px solid rgba(255, 255, 255, 0.3)"
  }
}
```

### 3. Agent Nodes (Future)

Full agent personas:

```typescript
{
  id: "agent-scout",
  type: "agent",
  position: { x: 250, y: 300 },
  data: {
    label: "🧭 Scout Agent",
    agentName: "scout-agent",
    availableSkills: ["research-contacts", "discover-opportunities"],
    systemPrompt: "..."
  }
}
```

## Node Status Colors

Nodes change color based on execution status:

| Status | Color | Border | Meaning |
|--------|-------|--------|---------|
| **pending** | Gray (`#6b7280`) | 2px solid | Not started yet |
| **running** | Blue (`#3b82f6`) | 3px solid | Currently executing |
| **completed** | Green (`#10b981`) | 3px solid | Successfully finished |
| **failed** | Red (`#ef4444`) | 3px solid | Error occurred |

## Edges (Connections)

Edges represent data flow between nodes:

```typescript
{
  id: "e1-2",
  source: "skill-1",
  target: "skill-2",
  type: "smoothstep",
  animated: true,  // When workflow is executing
  style: {
    stroke: "#64748b",
    strokeWidth: 2
  }
}
```

**Edge Types:**
- `default` - Straight line
- `smoothstep` - Curved with steps (recommended)
- `straight` - Direct line
- `step` - Right-angle connections

## Real-time Updates

### SSE Integration

When executing a workflow, the Flow Canvas subscribes to SSE events:

```typescript
// POST /api/agents/[name]/stream
// Returns events: start, update, complete, error

// On "update" event:
{
  step_number: 1,
  skill: "research-contacts",
  status: "running",
  output: { contacts: [...] }
}

// Update corresponding node:
updateNodeStatus("skill-1", "running")
```

### Supabase Realtime

Direct database subscription for session steps:

```typescript
supabase
  .channel(`flow_session_${sessionId}`)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "agent_session_steps",
    filter: `session_id=eq.${sessionId}`
  }, (payload) => {
    const { step_number, status, output } = payload.new
    updateNodeStatus(`skill-${step_number}`, status, output)
  })
  .subscribe()
```

## Data Flow

### Creating a Flow

1. User drags skills from palette onto canvas
2. User connects nodes with edges
3. User clicks "Execute" button
4. Frontend creates workflow definition:

```typescript
const workflow = {
  agent_name: "custom-flow",
  steps: nodes
    .filter(n => n.type === "skill")
    .map((node, i) => ({
      skill: node.data.skillName,
      description: node.data.label,
      input: node.data.input || {}
    }))
}
```

5. POST to `/api/flows` creates session
6. POST to `/api/agents/custom-flow/stream` executes

### Execution Flow

```
1. Create agent_session in database
        ↓
2. For each node (in order):
   a. Update node status to "running"
   b. Execute skill
   c. Receive SSE "update" event
   d. Update node status to "completed"
   e. Store output in node.data.output
        ↓
3. On workflow complete:
   a. Update session status to "completed"
   b. Show success notification
   c. Enable export/save
```

## Persistence

### Saving Flows

Flows are saved as `agent_sessions`:

```sql
INSERT INTO agent_sessions (
  id,
  agent_name,
  user_id,
  name,
  description,
  initial_input,
  status
) VALUES (
  'uuid',
  'custom-flow',
  'user-id',
  'My Campaign Workflow',
  'Find contacts → Score → Generate pitches',
  '{"canvas": {"nodes": [...], "edges": [...]}}',
  'pending'
);
```

### Loading Flows

```typescript
// GET /api/flows/[id]
const { flow } = await fetch(`/api/flows/${flowId}`).then(r => r.json())

// Convert to React Flow format
const nodes = flow.canvas.nodes
const edges = flow.canvas.edges

setNodes(nodes)
setEdges(edges)
setSessionId(flow.id)
```

## JSON Schema

### Flow Session Schema

```typescript
interface FlowSession {
  id: string
  agent_name: string
  user_id: string
  name?: string
  description?: string
  initial_input: {
    canvas?: {
      nodes: Node[]
      edges: Edge[]
    }
  }
  final_output?: any
  status: "pending" | "running" | "completed" | "failed"
  created_at: string
  completed_at?: string
}
```

### Node Schema

```typescript
interface FlowNode {
  id: string
  type: "input" | "default" | "agent"
  position: { x: number; y: number }
  data: {
    label: string
    skillName?: string
    agentName?: string
    status?: "pending" | "running" | "completed" | "failed"
    input?: Record<string, any>
    output?: Record<string, any>
    description?: string
  }
  style?: {
    background?: string
    color?: string
    border?: string
    borderRadius?: string
    padding?: string
  }
}
```

### Edge Schema

```typescript
interface FlowEdge {
  id: string
  source: string
  target: string
  type?: "default" | "smoothstep" | "straight" | "step"
  animated?: boolean
  style?: {
    stroke?: string
    strokeWidth?: number
  }
}
```

## UI Components

### Skills Palette

Left sidebar showing available skills:

```tsx
<div className="skills-palette">
  <h3>Skills Palette</h3>
  {skills.map(skill => (
    <button
      key={skill.name}
      onClick={() => setSelectedSkill(skill.name)}
      className={selectedSkill === skill.name ? "active" : ""}
    >
      {skill.label}
    </button>
  ))}
</div>
```

**Interaction:**
1. Click skill to select
2. Click canvas to place
3. Node appears at cursor position

### Execution Panel

Top-right status indicator:

```tsx
{isExecuting && (
  <div className="execution-status">
    <div className="pulse-indicator" />
    Executing workflow...
  </div>
)}
```

### Legend Panel

Bottom-right status legend:

```tsx
<Panel position="bottom-right">
  <div className="legend">
    <div><span className="dot pending" />Pending</div>
    <div><span className="dot running" />Running</div>
    <div><span className="dot completed" />Completed</div>
    <div><span className="dot failed" />Failed</div>
  </div>
</Panel>
```

## Controls

### React Flow Controls

- **Zoom In/Out:** `+` / `-` buttons or scroll
- **Fit View:** Reset zoom to fit all nodes
- **Lock:** Toggle canvas dragging
- **Mini Map:** Overview of entire canvas

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` | Remove selected node/edge |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + A` | Select all |
| `Ctrl/Cmd + C` | Copy selection |
| `Ctrl/Cmd + V` | Paste |

## Agent Metadata for Flows

### Database Schema

```sql
ALTER TABLE agents 
ADD COLUMN flow_shape text DEFAULT 'circle',
ADD COLUMN description_short text;
```

**Fields:**
- `flow_shape`: Visual representation (`circle`, `rectangle`, `diamond`)
- `description_short`: Tooltip text

### Shape Meanings

| Agent | Shape | Meaning |
|-------|-------|---------|
| Scout | Diamond | Discovery/Research |
| Coach | Circle | Generation/Creation |
| Tracker | Rectangle | Monitoring/Analysis |
| Insight | Circle | Intelligence/Patterns |

## Example Workflows

### 1. Contact Research Flow

```
Start
  ↓
Research Contacts (🔍)
  ↓
Score Contacts (⭐)
  ↓
Generate Pitch (✍️)
  ↓
End
```

**Steps:**
1. `research-contacts`: Find 10 indie radio contacts
2. `score-contacts`: Rank by relevance
3. `generate-pitch`: Create personalized messages

### 2. Campaign Monitor Flow

```
Start
  ↓
Track Campaign (📊)
  ↓
Analyze Responses (📈)
  ↓
Generate Report (📄)
  ↓
End
```

### 3. Multi-Agent Flow

```
Start
  ↓
Scout Agent (🧭) → [parallel] ← Coach Agent (🎙️)
  ↓                            ↓
  └──────────→ Insight Agent (💡)
                    ↓
                   End
```

## Performance Optimization

### Virtual Rendering

React Flow uses virtual rendering for large graphs:

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  maxZoom={2}
  minZoom={0.1}
  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
  // Only render visible nodes
  onlyRenderVisibleElements={true}
/>
```

### Debounced Updates

Prevent excessive re-renders:

```typescript
import { debounce } from "lodash"

const debouncedUpdate = debounce((nodes) => {
  setStoreNodes(nodes)
}, 300)
```

### Memoization

Memo expensive components:

```typescript
const NodeComponent = memo(({ data }) => (
  <div>{data.label}</div>
))
```

## Error Handling

### Invalid Connections

Prevent invalid edge connections:

```typescript
const isValidConnection = (connection) => {
  // Can't connect to Start node
  if (connection.target === "start") return false
  
  // Can't create cycles (simplified check)
  if (connection.target === connection.source) return false
  
  return true
}

<ReactFlow
  isValidConnection={isValidConnection}
  // ...
/>
```

### Execution Errors

Show error state on failed nodes:

```typescript
if (payload.new.status === "failed") {
  updateNodeStatus(nodeId, "failed")
  showNotification({
    type: "error",
    message: `Skill ${skillName} failed: ${payload.new.error_message}`
  })
}
```

## Future Enhancements

### Phase 2: Advanced Features

- **Conditional branching:** If/else logic
- **Loops:** Repeat steps
- **Variables:** Store intermediate results
- **Subflows:** Nested workflows
- **Templates:** Pre-built flows

### Phase 3: Collaboration

- **Multi-user editing:** Real-time collaboration
- **Comments:** Annotate nodes
- **Version control:** Flow history
- **Sharing:** Public/private flows

### Phase 4: Intelligence

- **Auto-layout:** Intelligent node positioning
- **Recommendations:** Suggest next steps
- **Optimization:** Improve workflow efficiency
- **A/B testing:** Compare flow versions

## Testing

### Manual Testing

```bash
# Start dev server
pnpm dev

# Open Flow Canvas
# Visit: http://localhost:3000/flows

# Test workflow:
1. Click "Research Contacts" in palette
2. Click canvas to place node
3. Drag from Start to new node
4. Click "Execute" button
5. Watch nodes change color
6. Verify in Supabase Studio
```

### API Testing

```bash
# Create flow
curl -X POST http://localhost:3000/api/flows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Flow",
    "agent_name": "custom-flow",
    "initial_input": {
      "canvas": {
        "nodes": [...],
        "edges": [...]
      }
    }
  }'

# Get flow
curl http://localhost:3000/api/flows/[id]

# Update flow
curl -X PATCH http://localhost:3000/api/flows/[id] \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## Best Practices

### 1. Modular Workflows

Break complex workflows into smaller, reusable flows:

```
❌ One giant 10-step flow
✅ Three 3-4 step flows combined
```

### 2. Clear Naming

Use descriptive labels:

```
❌ "Skill 1" → "Skill 2"
✅ "Research UK Radio" → "Score by Genre Match"
```

### 3. Error Handling

Always add error handling nodes:

```
Research → [on error] → Retry Logic → Notification
```

### 4. Save Frequently

Auto-save canvas state:

```typescript
useEffect(() => {
  const autoSave = setInterval(() => {
    if (sessionId) {
      saveFlow(sessionId, { nodes, edges })
    }
  }, 30000) // Every 30 seconds

  return () => clearInterval(autoSave)
}, [sessionId, nodes, edges])
```

## Conclusion

The Flow Canvas provides a powerful, visual interface for creating and orchestrating AI agent workflows in TotalAud.io. By combining React Flow's flexibility with real-time SSE updates and Supabase persistence, users can build complex, observable workflows with ease.

---

**See also:**
- [REALTIME_AGENT_UI.md](./REALTIME_AGENT_UI.md) - SSE streaming architecture
- [AGENT_SYSTEM_OVERVIEW.md](./AGENT_SYSTEM_OVERVIEW.md) - Agent system design
- [React Flow Docs](https://reactflow.dev/docs) - Official React Flow documentation

