# UI Next Phase - Creative Interface Evolution

How TotalAud.io's interface will evolve from Command Palette to full creative studio.

## Current State ✅

**Command Palette (⌘K)**
- Modal overlay with keyboard shortcut
- Text input for natural language queries
- Suggestion prompts for common tasks
- Loading states and results display
- Working skill execution

**Technologies:**
- Next.js 15 App Router
- React 18 (Client Components)
- Framer Motion for animations
- Tailwind CSS for styling

## Phase 1: Enhanced Command Palette (Week 4)

### Improvements

#### Smart Autocomplete
```typescript
// Real-time suggestions as you type
const suggestions = useMemo(() => {
  return fuzzyMatch(query, [
    { text: "Find UK indie radio...", category: "Scout" },
    { text: "Write pitch for...", category: "Coach" },
    { text: "Track my campaign...", category: "Tracker" }
  ])
}, [query])
```

#### Recent & Favorites
```typescript
interface CommandHistory {
  recent: Command[]
  favorites: Command[]
  templates: Command[]
}

// Store in localStorage + Supabase
const { recent, favorites } = useCommandHistory(userId)
```

#### Agent Selection
```typescript
// Choose which agent handles the query
<AgentPicker>
  <Agent icon="🔍" name="Scout" color="blue" />
  <Agent icon="💬" name="Coach" color="green" />
  <Agent icon="📊" name="Tracker" color="purple" />
  <Agent icon="💡" name="Insight" color="yellow" />
</AgentPicker>
```

#### Rich Results
```typescript
// Render different result types
<ResultRenderer>
  {result.type === 'contacts' && <ContactList data={result.contacts} />}
  {result.type === 'pitch' && <PitchPreview content={result.pitch} />}
  {result.type === 'insights' && <InsightsChart data={result.data} />}
</ResultRenderer>
```

## Phase 2: Agent Bubbles (Week 5)

### Concept

Persistent chat-style interfaces for each agent, floating on the screen like AI assistants.

### Visual Design

```
┌─────────────────────────────────────────┐
│  ┌──────┐                               │
│  │ 🔍   │  Scout Agent                 │
│  └──────┘                               │
│                                         │
│  You: Find UK indie radio for synthpop │
│                                         │
│  Scout: Found 12 contacts! Here are... │
│  ┌──────────────────┐                  │
│  │ DJ Nova          │  93% match       │
│  │ Indie Wave FM    │                  │
│  └──────────────────┘                  │
│                                         │
│  [Type to continue...]                 │
└─────────────────────────────────────────┘
```

### Implementation

```typescript
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: "user" | "agent"
  content: string
  timestamp: Date
  data?: any
}

export function AgentBubble({
  agent,
  onClose
}: {
  agent: "scout" | "coach" | "tracker" | "insight"
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)

  const config = {
    scout: { icon: "🔍", color: "blue", name: "Scout" },
    coach: { icon: "💬", color: "green", name: "Coach" },
    tracker: { icon: "📊", color: "purple", name: "Tracker" },
    insight: { icon: "💡", color: "yellow", name: "Insight" }
  }[agent]

  async function handleSend() {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setStreaming(true)

    try {
      // Execute agent workflow
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent,
          message: input,
          history: messages
        })
      })

      const result = await response.json()

      // Add agent response
      const agentMessage: Message = {
        role: "agent",
        content: result.content,
        data: result.data,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      console.error("Agent error:", error)
    } finally {
      setStreaming(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 w-96 h-[600px] bg-slate-800 rounded-2xl shadow-2xl border-2 border-${config.color}-500 flex flex-col`}
    >
      {/* Header */}
      <div className={`p-4 border-b border-slate-700 bg-${config.color}-500/10 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl">{config.icon}</div>
          <div>
            <h3 className="font-bold text-white">{config.name} Agent</h3>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700 text-white"
              }`}
            >
              {msg.content}
              {msg.data && <ResultPreview data={msg.data} />}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="bg-slate-700 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder={`Ask ${config.name}...`}
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg outline-none"
          />
          <button
            onClick={handleSend}
            disabled={streaming}
            className={`px-4 py-2 bg-${config.color}-500 hover:bg-${config.color}-600 text-white rounded-lg disabled:opacity-50`}
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  )
}
```

### Multi-Bubble Management

```typescript
"use client"

import { useState } from "react"
import { AgentBubble } from "./AgentBubble"

export function AgentHub() {
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set())

  function toggleAgent(agent: string) {
    setActiveAgents(prev => {
      const next = new Set(prev)
      if (next.has(agent)) {
        next.delete(agent)
      } else {
        next.add(agent)
      }
      return next
    })
  }

  return (
    <>
      {/* Agent Launcher */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-2">
        {["scout", "coach", "tracker", "insight"].map(agent => (
          <button
            key={agent}
            onClick={() => toggleAgent(agent)}
            className={`w-12 h-12 rounded-full shadow-lg ${
              activeAgents.has(agent) ? "ring-2 ring-white" : ""
            }`}
          >
            {agentIcon[agent]}
          </button>
        ))}
      </div>

      {/* Active Bubbles */}
      <AnimatePresence>
        {Array.from(activeAgents).map((agent, i) => (
          <AgentBubble
            key={agent}
            agent={agent as any}
            onClose={() => toggleAgent(agent)}
            style={{ right: `${6 + i * 25}rem` }}
          />
        ))}
      </AnimatePresence>
    </>
  )
}
```

## Phase 3: Flow Canvas (Week 6)

### Concept

Visual workflow builder where users can chain skills together and see data flow.

### Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│  Flow Canvas                                                 │
│                                                              │
│  ┌─────────────┐       ┌─────────────┐      ┌────────────┐│
│  │ Research    │──────>│ Score       │─────>│ Generate   ││
│  │ Contacts    │       │ Contacts    │      │ Pitch      ││
│  └─────────────┘       └─────────────┘      └────────────┘│
│       ▲                      │                    │         │
│       │                      ▼                    ▼         │
│  [Query Input]          [12 contacts]       [3 messages]   │
│                                                              │
│  [+ Add Step]  [▶ Run Flow]  [💾 Save Template]           │
└─────────────────────────────────────────────────────────────┘
```

### Technologies

- **React Flow** for node-based UI
- **Zustand** for flow state management
- **Real-time execution** with step-by-step updates

### Implementation Sketch

```typescript
import ReactFlow, { Node, Edge } from 'reactflow'
import 'reactflow/dist/style.css'

interface FlowNode extends Node {
  data: {
    skill: string
    input: Record<string, any>
    output?: Record<string, any>
    status: 'pending' | 'running' | 'completed' | 'error'
  }
}

export function FlowCanvas() {
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  async function runFlow() {
    for (const node of nodes) {
      // Update node status
      updateNode(node.id, { status: 'running' })

      // Execute skill
      const result = await executeSkill(node.data.skill, node.data.input)

      // Update with results
      updateNode(node.id, {
        status: 'completed',
        output: result.output
      })

      // Pass output to next node
      const nextNode = getNextNode(node.id, edges)
      if (nextNode) {
        updateNode(nextNode.id, {
          input: { ...nextNode.data.input, ...result.output }
        })
      }
    }
  }

  return (
    <div className="h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={customNodeTypes}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}
```

## Phase 4: Dashboard & Analytics (Week 7)

### Overview Page

```typescript
export function Dashboard() {
  const { sessions, stats } = useAgentAnalytics(userId)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Quick Stats */}
      <StatCard
        title="Active Campaigns"
        value={stats.activeCampaigns}
        change="+12%"
        trend="up"
      />
      <StatCard
        title="Contacts Found"
        value={stats.totalContacts}
        change="+34"
        trend="up"
      />
      <StatCard
        title="Response Rate"
        value={`${stats.responseRate}%`}
        change="+5%"
        trend="up"
      />

      {/* Recent Sessions */}
      <div className="col-span-2">
        <SessionHistory sessions={sessions} />
      </div>

      {/* Agent Activity */}
      <div>
        <AgentUsageChart data={stats.agentUsage} />
      </div>

      {/* Cost Tracking */}
      <div className="col-span-3">
        <CostBreakdown data={stats.costByAgent} />
      </div>
    </div>
  )
}
```

## Implementation Timeline

### Week 4: Enhanced Command Palette
- Smart autocomplete
- Recent & favorites
- Agent selection
- Rich result rendering

### Week 5: Agent Bubbles
- Basic chat interface
- Multi-bubble management
- Streaming responses
- Context preservation

### Week 6: Flow Canvas
- Node-based editor
- Visual workflow builder
- Template library
- Flow execution

### Week 7: Dashboard
- Analytics overview
- Session history
- Cost tracking
- Performance insights

## Design Principles

### 1. Progressive Disclosure
Start simple, reveal complexity as needed. Command Palette → Bubbles → Canvas.

### 2. Immediate Feedback
Every action provides instant visual feedback. Loading states, progress bars, animations.

### 3. Flexible Interaction
Multiple ways to accomplish tasks: keyboard shortcuts, mouse clicks, voice commands.

### 4. Personality & Delight
Agents have character. Animations are smooth. Success feels rewarding.

### 5. Mobile-First
Everything works on mobile. Touch-optimized. Responsive layouts.

## Technical Stack

```typescript
{
  "framework": "Next.js 15 App Router",
  "ui": "React 18 + TypeScript",
  "styling": "Tailwind CSS + Framer Motion",
  "state": "Zustand + React Query",
  "realtime": "Supabase Realtime",
  "charts": "Recharts",
  "flow": "React Flow",
  "ai": "Vercel AI SDK (future)"
}
```

## Accessibility

- Keyboard navigation throughout
- Screen reader support
- High contrast mode
- Reduced motion mode
- ARIA labels and roles

## Performance Targets

- **Initial Load**: < 2s
- **Command Palette Open**: < 100ms
- **Skill Execution**: < 5s
- **Real-time Updates**: < 500ms latency
- **Bundle Size**: < 500KB gzipped

## Conclusion

The TotalAud.io UI will evolve from a simple command palette into a full creative studio, maintaining the balance between simplicity and power. Each phase builds on the previous, creating a cohesive, delightful experience for music professionals.

---

**Next Steps:**
1. Complete Command Palette enhancements
2. Prototype Agent Bubbles
3. User test with real artists
4. Iterate based on feedback

