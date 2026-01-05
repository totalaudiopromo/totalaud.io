# Multi-Agent Collaboration System

## Overview

The TotalAud.io platform supports collaborative workflows where multiple AI agents can communicate and coordinate to accomplish complex tasks. This document explains the architecture, patterns, and usage of the multi-agent collaboration system.

## Architecture

### Agent Messaging Bus

At the core of the multi-agent system is a messaging bus that enables asynchronous communication between agents:

```
┌─────────┐    message    ┌──────────────┐    message    ┌─────────┐
│  Scout  │ ────────────> │  Message Bus │ ────────────> │  Coach  │
└─────────┘               └──────────────┘               └─────────┘
     │                            │                            │
     │                            │                            │
     v                            v                            v
┌──────────┐              ┌─────────────┐              ┌──────────┐
│ Database │              │  Realtime   │              │ Database │
└──────────┘              │   Channel   │              └──────────┘
                          └─────────────┘
```

### Database Schema

**Table: `agent_messages`**

```sql
CREATE TABLE agent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES agent_sessions(id),
  from_agent text NOT NULL,
  to_agent text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'info' CHECK (message_type IN ('info', 'request', 'response', 'error')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `from_agent`: Name of the sending agent (e.g., "scout-agent", "coach-agent")
- `to_agent`: Name of the receiving agent
- `content`: The message payload
- `message_type`: Classification of the message
  - `info`: Informational message
  - `request`: Requesting another agent to perform an action
  - `response`: Response to a previous request
  - `error`: Error or failure notification
- `metadata`: Additional structured data (JSON)

### Message Types

#### 1. Info Messages
Used for status updates and notifications:

```typescript
{
  from_agent: "scout-agent",
  to_agent: "coach-agent",
  content: "Found 12 relevant radio contacts in the UK indie scene",
  message_type: "info",
  metadata: { count: 12, region: "UK", genre: "indie" }
}
```

#### 2. Request Messages
Used to ask another agent to perform work:

```typescript
{
  from_agent: "scout-agent",
  to_agent: "coach-agent",
  content: "Please generate personalized pitches for these 12 contacts",
  message_type: "request",
  metadata: { 
    contacts: [...],
    context: "New single release",
    tone: "casual"
  }
}
```

#### 3. Response Messages
Used to reply to a request:

```typescript
{
  from_agent: "coach-agent",
  to_agent: "scout-agent",
  content: "Generated 12 personalized pitches",
  message_type: "response",
  metadata: { 
    pitches: [...],
    request_id: "uuid-of-original-request"
  }
}
```

#### 4. Error Messages
Used to notify of failures:

```typescript
{
  from_agent: "coach-agent",
  to_agent: "scout-agent",
  content: "Failed to generate pitches: API rate limit exceeded",
  message_type: "error",
  metadata: { 
    error_code: "RATE_LIMIT",
    retry_after: 60
  }
}
```

## Agent Coordination Patterns

### 1. Sequential Handoff

Scout → Coach → Tracker → Insight

```typescript
// Step 1: Scout finds contacts
await sendAgentMessage({
  from_agent: "scout-agent",
  to_agent: "coach-agent",
  content: "Found 12 contacts",
  session_id,
  message_type: "request",
  metadata: { contacts: [...] }
})

// Step 2: Coach generates pitches
await sendAgentMessage({
  from_agent: "coach-agent",
  to_agent: "tracker-agent",
  content: "Generated 12 pitches, ready to send",
  session_id,
  message_type: "request",
  metadata: { pitches: [...] }
})

// Step 3: Tracker monitors sends
await sendAgentMessage({
  from_agent: "tracker-agent",
  to_agent: "insight-agent",
  content: "Sent 12 emails, 3 opened, 1 replied",
  session_id,
  message_type: "info",
  metadata: { sent: 12, opened: 3, replied: 1 }
})

// Step 4: Insight analyzes results
await sendAgentMessage({
  from_agent: "insight-agent",
  to_agent: "user",
  content: "25% open rate is above average. Recommend A/B testing subject lines.",
  session_id,
  message_type: "response"
})
```

### 2. Parallel Execution

Multiple agents work simultaneously and report back:

```
        ┌─────────> Scout (UK)    ────┐
        │                              │
User ───┼─────────> Scout (US)    ────┼──> Aggregator
        │                              │
        └─────────> Scout (Europe) ───┘
```

### 3. Request-Response

One agent requests help from another:

```typescript
// Coach requests research from Scout
await sendAgentMessage({
  from_agent: "coach-agent",
  to_agent: "scout-agent",
  content: "Need more context on this curator's taste",
  session_id,
  message_type: "request",
  metadata: { curator_id: "xyz" }
})

// Scout responds with findings
await sendAgentMessage({
  from_agent: "scout-agent",
  to_agent: "coach-agent",
  content: "Curator prefers upbeat electronic tracks, dislikes ballads",
  session_id,
  message_type: "response",
  metadata: { 
    preferences: ["upbeat", "electronic"],
    dislikes: ["ballads"]
  }
})
```

### 4. Broadcasting

One agent notifies all others:

```typescript
await sendAgentMessage({
  from_agent: "tracker-agent",
  to_agent: "all",
  content: "Campaign budget 80% depleted",
  session_id,
  message_type: "info",
  metadata: { budget_remaining: 0.2 }
})
```

## API Usage

### Backend (Packages)

```typescript
import { sendAgentMessage, fetchAgentMessages } from "@total-audio/core-agent-executor"

// Send a message
await sendAgentMessage({
  from_agent: "scout-agent",
  to_agent: "coach-agent",
  content: "Found 12 contacts",
  session_id: "uuid",
  message_type: "info"
})

// Fetch messages for a session
const messages = await fetchAgentMessages("session-uuid")

// Fetch messages for a specific agent
const agentMessages = await fetchAgentMessages("session-uuid", "scout-agent")
```

### Frontend (aud-web)

```typescript
// Send a message via API
await fetch("/api/agents/message", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    from_agent: "user",
    to_agent: "scout-agent",
    content: "Find UK indie radio contacts",
    session_id: sessionId,
    message_type: "request"
  })
})
```

## Real-time Updates

The system uses Supabase Realtime to push message updates to connected clients:

```typescript
const supabase = createClient(...)

const channel = supabase
  .channel(`agent_messages_${sessionId}`)
  .on(
    "postgres_changes",
    { 
      event: "INSERT", 
      schema: "public", 
      table: "agent_messages",
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      console.log("New message:", payload.new)
      // Update UI
    }
  )
  .subscribe()
```

## UI Component: MultiAgentPanel

The `MultiAgentPanel` component provides a chat-style interface for multi-agent conversations:

```tsx
import MultiAgentPanel from "@/components/MultiAgentPanel"

function WorkflowPage() {
  const sessionId = "uuid"
  
  return (
    <div>
      <FlowCanvas />
      <MultiAgentPanel sessionId={sessionId} />
    </div>
  )
}
```

**Features:**
- Live message updates via Supabase Realtime
- Agent selection (Scout, Coach, Tracker, Insight)
- Message type indicators
- Timestamp display
- Color-coded agent identities

## Integration with Flow Canvas

In the Flow Canvas, agent nodes can display messaging activity:

```typescript
// Update node when a message arrives
supabase.on("postgres_changes", ..., (payload) => {
  const { from_agent, to_agent } = payload.new
  
  // Highlight sending node
  updateNode(from_agent, { 
    status: "sending",
    pulseColor: getAgentColor(from_agent)
  })
  
  // Highlight receiving node
  updateNode(to_agent, { 
    status: "receiving",
    pulseColor: getAgentColor(to_agent)
  })
})
```

## Best Practices

### 1. Use Descriptive Content
```typescript
// ❌ Bad
content: "Done"

// ✅ Good
content: "Generated 12 personalized pitches for UK indie radio stations"
```

### 2. Include Relevant Metadata
```typescript
metadata: {
  contact_count: 12,
  region: "UK",
  genre: "indie",
  execution_time_ms: 1245
}
```

### 3. Handle Errors Gracefully
```typescript
try {
  await sendAgentMessage(...)
} catch (error) {
  await sendAgentMessage({
    from_agent: "coach-agent",
    to_agent: "user",
    content: `Failed to generate pitches: ${error.message}`,
    session_id,
    message_type: "error"
  })
}
```

### 4. Use Message Types Consistently
- `info`: Status updates, progress notifications
- `request`: Asking another agent to do something
- `response`: Replying to a request
- `error`: Failures, exceptions, rate limits

### 5. Session-Scoped Messages
Always include `session_id` to keep messages organized by workflow:

```typescript
const sessionId = crypto.randomUUID()

// All messages in this workflow use the same session_id
await sendAgentMessage({ session_id: sessionId, ... })
```

## Example Workflow

**Goal:** Research contacts, generate pitches, send emails, analyze results

```typescript
// 1. User initiates workflow
const sessionId = await createSession("promo-campaign")

// 2. Scout finds contacts
await sendAgentMessage({
  from_agent: "scout-agent",
  to_agent: "coach-agent",
  content: "Found 12 relevant UK indie radio contacts",
  session_id: sessionId,
  message_type: "request",
  metadata: { contacts: [...], region: "UK", genre: "indie" }
})

// 3. Coach generates pitches
await sendAgentMessage({
  from_agent: "coach-agent",
  to_agent: "tracker-agent",
  content: "Generated 12 personalized pitches",
  session_id: sessionId,
  message_type: "request",
  metadata: { pitches: [...] }
})

// 4. Tracker sends emails and monitors
await sendAgentMessage({
  from_agent: "tracker-agent",
  to_agent: "insight-agent",
  content: "Sent 12 emails, 3 opened after 24 hours",
  session_id: sessionId,
  message_type: "info",
  metadata: { sent: 12, opened: 3, replied: 0, hours_elapsed: 24 }
})

// 5. Insight analyzes and recommends
await sendAgentMessage({
  from_agent: "insight-agent",
  to_agent: "user",
  content: "25% open rate is strong. Recommend following up with openers in 48 hours.",
  session_id: sessionId,
  message_type: "response",
  metadata: { 
    open_rate: 0.25,
    benchmark: 0.18,
    recommendations: ["follow_up", "a_b_test_subject_lines"]
  }
})
```

## Future Enhancements

- **Agent Registry**: Discover available agents and their capabilities
- **Message Routing**: Smart routing based on agent availability and skills
- **Message Queues**: Buffer messages when agents are busy
- **Agent State**: Persist agent context across messages
- **Authorization**: Control which agents can message each other
- **Analytics**: Track message patterns, latency, failure rates
- **Replay**: Replay message sequences for debugging

## Related Documentation

- [AGENT_SYSTEM_OVERVIEW.md](./AGENT_SYSTEM_OVERVIEW.md)
- [FLOW_CANVAS_OVERVIEW.md](./FLOW_CANVAS_OVERVIEW.md)
- [REALTIME_AGENT_UI.md](./REALTIME_AGENT_UI.md)

---

**Last Updated:** January 18, 2025  
**Version:** 1.0.0

