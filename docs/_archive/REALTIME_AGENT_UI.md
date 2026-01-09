# Real-time Agent UI Architecture

Complete guide to the streaming agent bubble system with Server-Sent Events (SSE) and Supabase Realtime.

## Overview

The TotalAud.io agent system provides **real-time, conversational interfaces** through:

1. **Server-Sent Events (SSE)** for streaming updates during workflow execution
2. **Agent Chat Bubbles** for persistent chat-style interaction
3. **Supabase Realtime** for database-level observability
4. **Agent Personas** with avatars and custom colors

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AgentChat Component (UI)                   │
│          WebSocket-style message interface              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│       SSE Stream: /api/agents/[name]/stream            │
│         (Server-Sent Events endpoint)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           runAgentWorkflow (with callbacks)             │
│  • onStep: fired after each skill execution             │
│  • onComplete: fired when workflow finishes             │
│  • onError: fired on failures                           │
└────────────────────┬────────────────────────────────────┘
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│ Execute Skills   │  │ Supabase         │
│ (Research, etc.) │  │ Realtime Updates │
└──────────────────┘  └──────────────────┘
```

## Server-Sent Events (SSE)

### Why SSE?

**Advantages:**
- ✅ Unidirectional server → client (perfect for progress updates)
- ✅ Built on HTTP (no special infrastructure needed)
- ✅ Automatic reconnection
- ✅ Simple implementation
- ✅ Works with Edge Runtime

**Disadvantages:**
- ❌ Server → client only (client must use POST for requests)
- ❌ Less efficient than WebSockets for bidirectional comms
- ❌ Browser connection limits (6 per domain)

**When to Use:**
- Progress updates
- Real-time notifications
- Streaming AI responses
- Log tailing

**When to Use WebSockets Instead:**
- True bidirectional communication
- High-frequency updates (>1/second)
- Gaming, collaborative editing

### Event Format

SSE uses a simple text-based format:

```
event: start
data: {"agent": "promo-coach", "status": "started"}

event: update
data: {"step_number": 1, "skill": "research-contacts", "status": "running"}

event: update
data: {"step_number": 1, "skill": "research-contacts", "status": "completed", "output": {...}}

event: complete
data: {"sessionId": "uuid", "outputs": [...], "duration_ms": 1234}

event: error
data: {"message": "Skill execution failed"}
```

### Implementation

**Server (Edge Runtime):**

```typescript
export const runtime = "edge"

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send events using controller.enqueue()
      controller.enqueue(
        encoder.encode(`event: start\ndata: ${JSON.stringify(data)}\n\n`)
      )
      
      // Close when done
      controller.close()
    }
  })
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  })
}
```

**Client:**

```typescript
const response = await fetch("/api/agents/scout/stream", {
  method: "POST",
  body: JSON.stringify({ steps })
})

const reader = response.body!.getReader()
const decoder = new TextDecoder()
let buffer = ""

while (true) {
  const { value, done } = await reader.read()
  if (done) break
  
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split("\n\n")
  
  for (const line of lines.slice(0, -1)) {
    if (line.startsWith("event:")) {
      const match = line.match(/event: (\w+)\ndata: (.+)/)
      if (match) {
        const [, event, dataStr] = match
        const data = JSON.parse(dataStr)
        handleEvent(event, data)
      }
    }
  }
  
  buffer = lines[lines.length - 1]
}
```

### Event Types

#### 1. `start`

Fired when workflow begins:

```json
{
  "agent": "promo-coach",
  "status": "started"
}
```

#### 2. `update`

Fired for each step update:

```json
{
  "step_number": 1,
  "skill": "research-contacts",
  "description": "Find relevant contacts",
  "status": "running" | "completed" | "failed",
  "output": { "contacts": [...] },  // When completed
  "duration_ms": 523                 // When completed
}
```

#### 3. `complete`

Fired when workflow finishes:

```json
{
  "sessionId": "uuid",
  "outputs": [
    { "contacts": [...] }
  ],
  "duration_ms": 1234,
  "status": "completed"
}
```

#### 4. `error`

Fired on failures:

```json
{
  "message": "Skill execution failed: Invalid input"
}
```

## Agent Chat Bubbles

### Design Principles

1. **Persistent**: Stays on screen, like a chat window
2. **Contextual**: Remembers conversation history
3. **Visual**: Shows agent personality (emoji, color)
4. **Real-time**: Streams responses as they happen
5. **Mobile-friendly**: Works on all screen sizes

### Component Structure

```typescript
<AgentChat
  agentName="promo-coach"
  agentEmoji="🎙️"
  agentColor="#6366f1"
  onClose={() => setShowChat(false)}
/>
```

### Message Types

```typescript
interface Message {
  role: "user" | "agent" | "system"
  content: string
  data?: any              // Structured data (contacts, etc.)
  timestamp: Date
}
```

**User Message:**
```json
{
  "role": "user",
  "content": "Find UK indie radio contacts"
}
```

**Agent Message:**
```json
{
  "role": "agent",
  "content": "Found 3 contacts: DJ Nova, Sarah Thompson, Alex Rivera",
  "data": {
    "contacts": [...]
  }
}
```

**System Message:**
```json
{
  "role": "system",
  "content": "⚙️ Searching database..."
}
```

### Visual States

**Loading:**
```tsx
<div className="flex gap-1">
  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
</div>
```

**Typing Indicator:**
```tsx
{loading && (
  <div className="bg-slate-700 p-3 rounded-lg">
    <span className="text-slate-400">Agent is thinking...</span>
  </div>
)}
```

**Structured Data Display:**
```tsx
{msg.data?.contacts && (
  <div className="mt-2 space-y-2">
    {msg.data.contacts.map(contact => (
      <ContactCard key={contact.email} contact={contact} />
    ))}
  </div>
)}
```

## Supabase Realtime

### Setup

```typescript
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Subscribe to Skill Executions

```typescript
const channel = supabase
  .channel("skill_executions_realtime")
  .on(
    "postgres_changes",
    {
      event: "*",                    // INSERT, UPDATE, DELETE
      schema: "public",
      table: "skill_executions",
      filter: `user_id=eq.${userId}` // Optional filter
    },
    (payload) => {
      console.log("Skill execution update:", payload)
      
      if (payload.eventType === "INSERT") {
        // New execution started
        const execution = payload.new
        showNotification(`Skill ${execution.skill_name} started`)
      } else if (payload.eventType === "UPDATE") {
        // Execution completed
        const execution = payload.new
        if (execution.status === "success") {
          showNotification(`Skill ${execution.skill_name} completed`)
        }
      }
    }
  )
  .subscribe()

// Cleanup
return () => supabase.removeChannel(channel)
```

### Subscribe to Agent Sessions

```typescript
const channel = supabase
  .channel(`agent_session_${sessionId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "agent_sessions",
      filter: `id=eq.${sessionId}`
    },
    (payload) => {
      const session = payload.new
      console.log(`Session ${session.id}: ${session.status}`)
      
      if (session.status === "completed") {
        showSuccessMessage("Workflow completed!")
      }
    }
  )
  .subscribe()
```

### Subscribe to Session Steps

```typescript
const channel = supabase
  .channel(`agent_session_steps_${sessionId}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "agent_session_steps",
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      if (payload.eventType === "INSERT") {
        console.log("New step started:", payload.new)
      } else if (payload.eventType === "UPDATE") {
        console.log("Step updated:", payload.new)
      }
    }
  )
  .subscribe()
```

## Agent Personas

### Database Schema

```sql
CREATE TABLE agents (
  name text PRIMARY KEY,
  version text NOT NULL,
  description text,
  system_prompt text NOT NULL,
  available_skills text[] NOT NULL,
  avatar_emoji text DEFAULT '🤖',   -- NEW
  color text DEFAULT '#6366f1',     -- NEW
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

### Agent Metadata

| Agent | Emoji | Color | Description |
|-------|-------|-------|-------------|
| **scout-agent** | 🧭 | `#10b981` (green) | Finds opportunities |
| **coach-agent** | 🎙️ | `#6366f1` (indigo) | Helps craft pitches |
| **tracker-agent** | 📊 | `#f59e0b` (amber) | Monitors campaigns |
| **insight-agent** | 💡 | `#8b5cf6` (purple) | Surfaces analytics |

### Using Agent Metadata

```typescript
// Fetch agent config
const { data: agent } = await supabase
  .from("agents")
  .select("*")
  .eq("name", "scout-agent")
  .single()

// Render chat bubble with persona
<AgentChat
  agentName={agent.name}
  agentEmoji={agent.avatar_emoji}
  agentColor={agent.color}
/>
```

### Color Theming

```tsx
<div
  className="p-4 rounded-lg"
  style={{ backgroundColor: `${agentColor}15` }}
>
  <div className="text-3xl">{agentEmoji}</div>
  <h3 style={{ color: agentColor }}>
    {agentName}
  </h3>
</div>
```

## UI Flow Diagrams

### Chat Interaction Flow

```
User types message
       ↓
Message added to UI
       ↓
POST /api/agents/[name]/stream
       ↓
SSE connection established
       ↓
event: start
       ↓
  System message: "Starting workflow..."
       ↓
event: update (running)
       ↓
  System message: "Searching database..."
       ↓
event: update (completed)
       ↓
  Agent message: "Found 3 contacts"
       ↓
event: complete
       ↓
  System message: "Completed in 1234ms"
       ↓
Connection closed
```

### Multi-Step Workflow

```
Step 1: research-contacts
       ↓
  event: update (running)
  event: update (completed)
       ↓
Step 2: score-contacts
       ↓
  event: update (running)
  event: update (completed)
       ↓
Step 3: generate-pitch
       ↓
  event: update (running)
  event: update (completed)
       ↓
event: complete
```

## Performance Considerations

### SSE Connection Limits

Browsers limit concurrent connections per domain:
- **Chrome/Firefox**: 6 connections
- **Safari**: 6 connections
- **Edge**: 6 connections

**Solutions:**
1. **Use domains**: Host API on subdomain
2. **Connection pooling**: Reuse connections
3. **WebSockets**: For high-frequency updates

### Buffering

Disable buffering in production:

```typescript
headers: {
  "X-Accel-Buffering": "no"  // For nginx
}
```

### Timeouts

Edge Functions have timeouts:
- **Vercel Edge**: 25 seconds
- **Cloudflare Workers**: 30 seconds
- **AWS Lambda@Edge**: 30 seconds

For long-running workflows, use:
1. **Webhook callbacks**: Notify client when done
2. **Polling**: Client checks status periodically
3. **Serverless Functions**: No timeout limits

## Error Handling

### SSE Connection Errors

```typescript
try {
  const reader = response.body!.getReader()
  // ... read stream
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Connection closed by user")
  } else if (error.name === "NetworkError") {
    console.error("Network error, retrying...")
    // Implement retry logic
  } else {
    console.error("Stream error:", error)
  }
}
```

### Agent Workflow Errors

```typescript
if (event === "error") {
  setMessages(prev => [
    ...prev,
    {
      role: "system",
      content: `❌ Error: ${data.message}`,
      timestamp: new Date()
    }
  ])
  
  // Show retry button
  setCanRetry(true)
}
```

## Testing

### Test SSE Endpoint

```bash
curl -N -X POST http://localhost:3000/api/agents/scout-agent/stream \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [{
      "skill": "research-contacts",
      "description": "Test",
      "input": {
        "query": "test",
        "type": "radio",
        "genres": ["indie"],
        "regions": ["UK"],
        "max_results": 1
      }
    }]
  }'
```

### Test in Browser

```javascript
const eventSource = new EventSource("/api/agents/scout-agent/stream")

eventSource.addEventListener("start", (e) => {
  console.log("Started:", JSON.parse(e.data))
})

eventSource.addEventListener("update", (e) => {
  console.log("Update:", JSON.parse(e.data))
})

eventSource.addEventListener("complete", (e) => {
  console.log("Complete:", JSON.parse(e.data))
  eventSource.close()
})
```

## Best Practices

### 1. Close Connections

Always close SSE connections when done:

```typescript
useEffect(() => {
  const reader = response.body!.getReader()
  
  return () => {
    reader.cancel() // Cleanup
  }
}, [])
```

### 2. Handle Reconnection

SSE reconnects automatically, but handle state:

```typescript
const [isConnected, setIsConnected] = useState(false)
const [retryCount, setRetryCount] = useState(0)

// Show connection status
{!isConnected && retryCount > 0 && (
  <div className="text-yellow-500">
    Reconnecting... (attempt {retryCount})
  </div>
)}
```

### 3. Optimize Message Size

Keep SSE messages small:

```typescript
// ❌ Bad: Send entire contact list
{ contacts: [/* 100 contacts */] }

// ✅ Good: Send summary + link
{ contactCount: 100, sessionId: "uuid" }
```

### 4. Use Compression

Enable gzip for SSE responses:

```typescript
headers: {
  "Content-Encoding": "gzip"
}
```

## Conclusion

The TotalAud.io real-time agent system combines:
- **SSE** for streaming workflow updates
- **Agent Chat Bubbles** for conversational UI
- **Supabase Realtime** for database observability
- **Agent Personas** for delightful UX

This architecture provides a **responsive, observable, and delightful** experience for AI-powered music marketing workflows.

---

**Next Steps:**
- Enable AgentChat on homepage
- Add multi-agent support
- Implement streaming AI responses
- Build agent selection UI

