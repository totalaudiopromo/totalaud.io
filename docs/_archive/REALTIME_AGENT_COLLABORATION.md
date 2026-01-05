# Real-Time Multi-Agent Collaboration

**Design Principle**: *"Each agent is a performer. Broker conducts. The user directs."*

---

## 🎭 Overview

The Real-Time Multi-Agent Collaboration system transforms the Flow Canvas into a live performance stage where multiple AI agents execute workflows collaboratively with real-time status updates visible to the user.

### Key Features
- **Live Status Updates**: Real-time agent execution tracking via Supabase Realtime
- **Visual Indicators**: Color-coded borders and status badges on Flow Canvas nodes
- **Agent Bubbles**: Emoji avatars showing which agent is working on each node
- **Activity Monitor**: Live feed of agent messages and progress
- **Command Bridge**: Natural language commands from Broker to execute workflows
- **Theme Integration**: Agent-specific sound cues and visual effects

---

## 🏗️ Architecture

### Database Layer

**Table**: `agent_activity_log`
**Location**: `supabase/migrations/20251019020000_add_agent_activity_log.sql`

```sql
CREATE TABLE agent_activity_log (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES agent_sessions(id),
  agent_name text NOT NULL,
  node_id text NOT NULL,
  status text CHECK (status IN ('queued', 'running', 'complete', 'error', 'cancelled')),
  message text,
  result jsonb,
  metadata jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
);
```

**Realtime Enabled**: Yes - all activity logs broadcast via Supabase Realtime

**Indexes**:
- `idx_agent_activity_session_id` - Fast session filtering
- `idx_agent_activity_node_id` - Fast node lookup
- `idx_agent_activity_session_node` - Composite for realtime queries

### Agent Registry

**File**: [packages/core/agent-executor/src/config/agentRoles.ts](../packages/core/agent-executor/src/config/agentRoles.ts)

**5 Specialized Agents**:

| Agent | Emoji | Color | Skills | Voice | Sound Cue |
|-------|-------|-------|--------|-------|-----------|
| **Broker** | 🎙️ | Indigo | orchestrate, delegate, summarize | witty, supportive, coordinating | transition |
| **Scout** | 🧭 | Green | research-contacts, analyze-datasets | optimistic, adventurous | ping |
| **Coach** | 🎯 | Blue | write-pitch, refine-language | supportive, confident | chime |
| **Tracker** | 📊 | Amber | monitor-campaign, analyze-metrics | analytical, calm | pulse |
| **Insight** | 💡 | Purple | generate-insights, recommend-strategy | wise, poetic | pad |

```typescript
export const agentRoles: Record<string, AgentRole> = {
  broker: {
    id: 'broker',
    name: 'Broker',
    emoji: '🎙️',
    color: '#6366f1',
    skills: ['orchestrate', 'delegate', 'summarize'],
    voice: 'witty, supportive, coordinating',
    expertise: 'Workflow orchestration and team coordination',
    soundCue: 'transition',
    description: 'Your audio liaison - coordinates all agents'
  },
  // ... other agents
}
```

### Execution Hook

**File**: [packages/core/agent-executor/src/hooks/useAgentExecution.ts](../packages/core/agent-executor/src/hooks/useAgentExecution.ts)

**Purpose**: Manages agent execution with real-time updates

```typescript
const {
  executeNode,      // Execute a node with specific agent
  nodeStatuses,     // Latest status for each node
  updatesByNode,    // All activity updates grouped by node
  cancelNode,       // Cancel execution
  clearLogs,        // Clear all logs
  isLoading,        // Loading state
  error             // Error state
} = useAgentExecution({
  supabaseClient,
  sessionId,
  enableRealtime: true
})
```

**How it works**:
1. Subscribes to `agent_activity_log` via Supabase Realtime
2. Filters by `session_id` for current user
3. Updates local state when new activity arrives
4. Provides `executeNode` function to trigger agent work

---

## 🎨 Visual System

### Flow Node Enhancements

**File**: [apps/aud-web/src/components/FlowNode.tsx](../apps/aud-web/src/components/FlowNode.tsx)

**Status Colors**:
```typescript
const statusColors = {
  queued: "#64748b",     // Gray
  running: "#3b82f6",    // Blue
  complete: "#10b981",   // Green
  error: "#ef4444",      // Red
  cancelled: "#6b7280"   // Dark Gray
}
```

**Agent Bubble** (top-right of node):
```tsx
{agent && (status === "running" || status === "complete") && (
  <div
    className="w-10 h-10 rounded-full"
    style={{
      backgroundColor: agent.color,
      border: `3px solid ${statusColor}`,
      boxShadow: `0 0 15px ${agent.color}80`
    }}
  >
    {agent.emoji}
  </div>
)}
```

**Node Content** (displays agent info):
- Agent emoji + name
- Current status
- Progress message
- Timestamps (started_at, completed_at)

### Flow Canvas Integration

**File**: [apps/aud-web/src/components/FlowCanvas.tsx](../apps/aud-web/src/components/FlowCanvas.tsx)

**Real-time Updates**:
```typescript
// Subscribe to agent status changes
const { nodeStatuses, executeNode } = useAgentExecution({
  supabaseClient: supabase,
  sessionId,
  enableRealtime: true
})

// Update nodes with agent status
useEffect(() => {
  setNodes((nds) =>
    nds.map((node) => {
      const agentStatus = nodeStatuses[node.id]
      if (agentStatus) {
        return {
          ...node,
          data: {
            ...node.data,
            status: agentStatus.status,
            agentName: agentStatus.agent_name,
            message: agentStatus.message,
            result: agentStatus.result
          },
          style: {
            borderColor: getStatusColor(agentStatus.status),
            borderWidth: "3px"
          }
        }
      }
      return node
    })
  )
}, [nodeStatuses, setNodes])
```

**Activity Monitor** (bottom-left):
```tsx
<div className="absolute bottom-20 left-4 z-10">
  <h3>Agent Activity</h3>
  {Object.entries(nodeStatuses).map(([nodeId, activity]) => (
    <div key={nodeId}>
      <span style={{ color: getStatusColor(activity.status) }}>●</span>
      <span>{activity.agent_name}</span>
      <span>→ {nodeId}</span>
      {activity.message && <div>{activity.message}</div>}
    </div>
  ))}
</div>
```

---

## 🎮 Execution Flow

### Manual Execution (Dev Mode)

```typescript
// Execute a specific node with an agent
await executeNode('scout', 'research-radio-contacts', {
  genre: 'Electronic',
  location: 'UK'
})
```

**What happens**:
1. Insert "running" status → `agent_activity_log`
2. Supabase broadcasts update → All subscribers receive
3. FlowCanvas updates node border to blue
4. Agent bubble appears on node (🧭 Scout)
5. Simulated work (1.5s delay)
6. Insert "complete" status → `agent_activity_log`
7. Node border turns green, agent bubble remains

### Broker-Commanded Execution (Future)

**File**: `apps/aud-web/src/components/BrokerChat.tsx` (to be implemented)

```typescript
// User types: "Run the campaign flow"
// Broker interprets and delegates:
const handleCommand = async (userMessage: string) => {
  if (userMessage.includes('run') && userMessage.includes('flow')) {
    const nodes = getFlowNodes()
    for (const node of nodes) {
      const agent = getAgentBySkill(node.data.skillId)
      if (agent) {
        await executeNode(agent.id, node.id)
      }
    }
  }
}
```

---

## 🔊 Sound Integration

### Theme Engine Sound Cues

**Location**: Theme Engine already has sounds defined

**Agent Sound Mapping**:
```typescript
// In agentRoles.ts
broker: { soundCue: 'transition' }
scout: { soundCue: 'ping' }
coach: { soundCue: 'chime' }
tracker: { soundCue: 'pulse' }
insight: { soundCue: 'pad' }
```

**Play Agent Sound** (to be implemented):
```typescript
// When agent starts work
const agent = getAgent(agentName)
if (agent.soundCue) {
  audioEngine.play(themeManifest.sounds[agent.soundCue])
}
```

**Current Status**: Sound system ready, integration pending

---

## 🧪 Testing

### Manual Testing Flow

**Prerequisites**:
```bash
# 1. Ensure Supabase is running (local or remote)
npm run db:migrate

# 2. Start dev server
npm run dev

# 3. Visit Flow Canvas
http://localhost:3004/
```

**Test Scenario 1: Generate Flow from Broker**
```
1. Visit /onboarding/os-selector?force=true
2. Choose a theme (e.g., ASCII)
3. Complete Broker onboarding:
   - Artist name: "Test Artist"
   - Genre: "Electronic"
   - Goal: "Radio airplay"
4. Confirm "Yes, let's do it"
5. Verify: 4 nodes appear on Flow Canvas
6. Check: All nodes have "pending" status (gray borders)
```

**Test Scenario 2: Execute Individual Node**
```typescript
// Open browser console on Flow Canvas page
const { executeNode } = useAgentExecution({
  supabaseClient: supabase,
  sessionId: 'test-session',
  enableRealtime: true
})

// Execute first node
await executeNode('scout', 'research-radio-contacts', {
  genre: 'Electronic',
  location: 'UK'
})

// Expected behavior:
// 1. Node border turns blue (running)
// 2. Scout bubble (🧭) appears on node
// 3. After 1.5s, border turns green (complete)
// 4. Activity Monitor shows "Agent scout executing research-radio-contacts"
```

**Test Scenario 3: Real-time Collaboration**
```
1. Open Flow Canvas in two browser tabs
2. In Tab 1: Execute a node
3. In Tab 2: Watch real-time update
4. Verify: Both tabs show same status changes
```

### Automated Tests (Future)

```typescript
// tests/agent-execution.test.ts
describe('Agent Execution System', () => {
  it('should update node status in real-time', async () => {
    const { executeNode, nodeStatuses } = useAgentExecution({
      supabaseClient: mockSupabase,
      sessionId: 'test-123',
      enableRealtime: true
    })

    await executeNode('scout', 'test-node', {})

    await waitFor(() => {
      expect(nodeStatuses['test-node'].status).toBe('running')
    })

    await waitFor(() => {
      expect(nodeStatuses['test-node'].status).toBe('complete')
    }, { timeout: 3000 })
  })
})
```

---

## 🚀 Future Enhancements

### 1. Agent Command Bridge

**Goal**: Natural language commands in Broker trigger multi-agent workflows

```typescript
// BrokerChat.tsx
const handleCommand = async (userMessage: string) => {
  // Parse command via LLM
  const intent = await parseCommand(userMessage)

  if (intent.action === 'execute_flow') {
    const nodes = getFlowNodesInOrder()
    for (const node of nodes) {
      const agent = getAgentBySkill(node.data.skillId)
      await executeNode(agent.id, node.id)
    }
  }
}
```

**Example Commands**:
- "Run the campaign flow"
- "Scout, find me 20 radio contacts"
- "Coach, write a pitch for this track"
- "Execute the full workflow"

### 2. Agent Personality Integration

**Goal**: Agents speak in their unique voice during execution

```typescript
// When agent starts
const message = formatAgentMessage(agent, 'starting', {
  taskName: node.label
})
// Scout: "Alright, let's explore some contacts! 🧭"
// Coach: "Time to craft a compelling pitch. 🎯"
```

### 3. Agent Streaming Messages

**Goal**: Live updates of agent progress

```typescript
// Instead of: "Agent scout executing research-contacts"
// Stream:
// "Found 5 contacts..."
// "Enriching contact data..."
// "Scoring relevance..."
// "Complete! 23 contacts ready."
```

### 4. Agent Handoffs

**Goal**: Agents pass work to each other automatically

```typescript
// Scout finishes → automatically triggers Coach
onAgentComplete('scout', 'research-contacts', (result) => {
  if (result.contacts.length > 0) {
    executeNode('coach', 'generate-pitch', {
      contacts: result.contacts
    })
  }
})
```

### 5. Agent Error Recovery

**Goal**: Agents handle failures gracefully

```typescript
// If agent fails, Broker suggests alternatives
onAgentError('scout', 'research-contacts', (error) => {
  brokerSuggest([
    'Retry with different parameters?',
    'Try manual contact entry?',
    'Skip this step?'
  ])
})
```

---

## 📊 Performance Considerations

### Realtime Subscription Limits
- **Supabase Free Tier**: 2 concurrent realtime connections
- **Supabase Pro**: 500 concurrent connections
- **Recommendation**: Use per-session channels, not per-node

### Database Growth
- **agent_activity_log** will grow large over time
- **Recommendation**: Archive logs older than 30 days
- **Query**: `DELETE FROM agent_activity_log WHERE created_at < NOW() - INTERVAL '30 days'`

### Frontend Performance
- **Node Updates**: Batched via React state updates
- **Realtime Payload**: Keep metadata minimal
- **Visual Effects**: Use CSS animations, not JS

---

## 🔐 Security

### Row Level Security (RLS)

```sql
-- Users can only view their own session activity
CREATE POLICY "Users can view own session activity"
  ON agent_activity_log
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM agent_sessions
      WHERE user_id = auth.uid()
    )
  );

-- Agents can insert activity logs (service role key)
CREATE POLICY "Agents can insert activity logs"
  ON agent_activity_log
  FOR INSERT
  WITH CHECK (true);
```

### Agent Authentication

**Current**: No authentication (dev mode)
**Future**: Service role key for agent API endpoints

```typescript
// Server-side agent executor
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Full access
)

await supabase.from('agent_activity_log').insert({
  agent_name: 'scout',
  session_id: userSessionId,
  status: 'running'
})
```

---

## 📝 API Reference

### `useAgentExecution`

```typescript
function useAgentExecution(options: UseAgentExecutionOptions): UseAgentExecutionReturn

interface UseAgentExecutionOptions {
  supabaseClient: SupabaseClient
  sessionId: string
  enableRealtime?: boolean
}

interface UseAgentExecutionReturn {
  executeNode: (agent: string, nodeId: string, payload?: any) => Promise<void>
  cancelNode: (nodeId: string) => Promise<void>
  clearLogs: () => Promise<void>
  updates: AgentActivity[]
  updatesByNode: Record<string, AgentActivity[]>
  nodeStatuses: Record<string, AgentActivity>
  isLoading: boolean
  error: Error | null
}
```

### `getAgent`

```typescript
function getAgent(agentId: string): AgentRole | null

interface AgentRole {
  id: string
  name: string
  emoji: string
  color: string
  skills: string[]
  voice: string
  expertise: string
  soundCue: 'ping' | 'chime' | 'pulse' | 'pad' | 'transition'
  description: string
}
```

### `getAgentBySkill`

```typescript
function getAgentBySkill(skillId: string): AgentRole | null
```

### `getStatusColor`

```typescript
function getStatusColor(status: AgentStatus): string

type AgentStatus = 'queued' | 'running' | 'complete' | 'error' | 'cancelled'
```

---

## 🎯 Design Decisions

### Why Supabase Realtime?
- **Native integration** with PostgreSQL
- **Automatic broadcasting** of database changes
- **Row-level security** enforcement
- **Minimal setup** compared to WebSockets

### Why Agent Roles Registry?
- **Single source of truth** for agent metadata
- **Type-safe** access to agent properties
- **Easy to extend** with new agents
- **Centralized** skill-to-agent mapping

### Why Activity Log Table?
- **Persistence** for debugging and analytics
- **Historical record** of all agent actions
- **Realtime subscription** source
- **User-specific filtering** via session_id

### Why Agent Bubbles?
- **Visual feedback** of which agent is working
- **Personality** - users see agent emojis
- **Status indication** via border color
- **Minimal clutter** - only show when active

---

## 📚 Related Documentation

- [Broker Memory & Flow Generation](./BROKER_MEMORY_AND_FLOW.md)
- [Broker Personality System](./BROKER_PERSONALITY_OVERVIEW.md)
- [Theme Engine Implementation](./THEME_ENGINE_IMPLEMENTATION.md)
- [Agent Roles Configuration](../packages/core/agent-executor/src/config/agentRoles.ts)

---

**Status**: ✅ Core Implementation Complete
**Last Updated**: October 19, 2025
**Maintainer**: chris@totalaud.io

**Next Steps**:
1. Implement agent command bridge in BrokerChat
2. Add sound cue playback on agent status changes
3. Test complete multi-agent workflow execution
4. Add streaming agent messages
5. Implement agent handoffs and error recovery

**The stage is set.** Agents are ready to perform. 🎭
