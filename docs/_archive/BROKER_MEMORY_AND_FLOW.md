# Broker Memory & Auto-Flow Generation

**Design Principle**: *"Broker remembers so the user can stay in flow."*

---

## 🧠 Overview

The Broker Memory system bridges personality-driven conversation and productive workflow by:
1. **Remembering** user responses during onboarding
2. **Inferring** their promotional goals
3. **Generating** a pre-configured workflow automatically

This transforms chat into action without asking the user to manually configure anything.

---

## 📊 Architecture

### Database Schema

**Migration**: `supabase/migrations/20251019000000_add_broker_conversation_fields.sql`

```sql
ALTER TABLE user_profiles ADD COLUMN
  artist_name text,
  genre text,
  goal text,
  experience text,
  broker_session_id text,
  broker_completed_at timestamptz;
```

**Why these fields?**
- `artist_name`: Personalizes future interactions
- `genre`: Helps tailor contact research
- `goal`: Maps to flow template (radio, press, playlists, etc.)
- `experience`: Adjusts complexity of suggested workflows

---

## 🪝 Memory Hooks

### `useBrokerMemory` (Supabase - Future)

For authenticated users, persists to database:

```typescript
import { useBrokerMemory } from '@total-audio/core-agent-executor'

const { save, recall, complete, getAll } = useBrokerMemory(sessionId, supabaseClient)

// Save individual fields
await save('artist_name', 'sadact')
await save('genre', 'Electronic / Dance')
await save('goal', 'Radio airplay')

// Recall a field
const name = await recall('artist_name')

// Get all data
const data = await getAll()

// Mark onboarding complete
await complete()
```

### `useBrokerMemoryLocal` (localStorage - Current)

Temporary implementation until auth is ready:

```typescript
import { useBrokerMemoryLocal } from '@total-audio/core-agent-executor'

const { save, recall, complete, getAll, data } = useBrokerMemoryLocal(sessionId)

// Save (synchronous)
save('artist_name', 'sadact')

// Recall (synchronous)
const name = recall('artist_name')

// Get all
const allData = getAll()

// Mark complete
complete()
```

---

## 🎯 Goal-to-Flow Mapping

**File**: `packages/core/agent-executor/src/config/goalToFlowMap.ts`

Maps user goals to pre-configured campaign templates:

| User Goal | Template | Steps | Difficulty |
|-----------|----------|-------|------------|
| Radio airplay | Radio Campaign | 4 | Intermediate |
| Press coverage | Press Campaign | 4 | Intermediate |
| Playlist placement | Playlist Campaign | 4 | Beginner |
| Live bookings | Live Bookings | 3 | Intermediate |
| All of the above | Full Campaign | 6 | Advanced |

### Template Structure

```typescript
interface FlowTemplate {
  name: string
  description: string
  steps: FlowStep[]
  estimatedTime?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

interface FlowStep {
  id: string
  label: string
  type: 'skill' | 'agent' | 'decision'
  icon?: string
  position?: { x: number; y: number }
  agentId?: string
  skillId?: string
}
```

### Example: Radio Campaign

```typescript
{
  name: 'Radio Airplay Campaign',
  description: 'Research radio contacts, prepare your pitch, and send professional emails',
  estimatedTime: '2-3 hours',
  difficulty: 'intermediate',
  steps: [
    {
      id: 'research-radio-contacts',
      label: 'Research Radio Contacts',
      type: 'skill',
      icon: '🔍',
      skillId: 'research-contacts',
      position: { x: 100, y: 100 }
    },
    {
      id: 'score-contacts',
      label: 'Score Contact Relevance',
      type: 'skill',
      icon: '⭐',
      skillId: 'score-contacts',
      position: { x: 300, y: 100 }
    },
    // ... more steps
  ]
}
```

---

## 🔄 Conversation → Flow Pipeline

### 1. BrokerChat Saves Responses

```typescript
// In BrokerChat.tsx
const memory = useBrokerMemoryLocal(sessionId)

// When user answers a question
const updateUserData = (stepId: string, value: string) => {
  if (stepId === 'ask_name') {
    memory.save('artist_name', value)
  }
  if (stepId === 'ask_goals') {
    memory.save('goal', value)
  }
  // ... etc
}
```

### 2. Broker Generates Flow Template

```typescript
// When onboarding completes
const handleCompletion = () => {
  // Get all saved data
  const memoryData = memory.getAll()

  // Generate flow based on goal
  const flowTemplate = getFlowTemplateForGoal(memoryData.goal)

  // Serialize for URL
  const serialized = serializeFlowTemplate(flowTemplate)

  // Redirect with flow data
  window.location.href = `/?welcome=true&flow=${serialized}`
}
```

### 3. HomePage Deserializes & Displays

```typescript
// In page.tsx
const searchParams = useSearchParams()
const flowParam = searchParams.get('flow')

let flowTemplate = null
if (flowParam) {
  flowTemplate = deserializeFlowTemplate(flowParam)
}

// Pass to FlowCanvas
<FlowCanvas initialTemplate={flowTemplate} />
```

### 4. FlowCanvas Renders Nodes

```typescript
// In FlowCanvas.tsx
useEffect(() => {
  if (initialTemplate) {
    // Convert steps to ReactFlow nodes
    const nodes = initialTemplate.steps.map(step => ({
      id: step.id,
      type: step.type,
      position: step.position,
      data: {
        label: step.label,
        icon: step.icon,
        // ... etc
      }
    }))

    // Create edges connecting nodes
    const edges = []
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `e${nodes[i].id}-${nodes[i + 1].id}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        animated: true
      })
    }

    setNodes(nodes)
    setEdges(edges)
  }
}, [initialTemplate])
```

---

## 🎨 UX Flow

1. **OS Selector**: User chooses theme → Broker personality adapts
2. **Broker Intro**: Personality-specific greeting
3. **Broker Chat**: Conversation with memory saving
   - "What's your artist name?" → `save('artist_name', ...)`
   - "What genre?" → `save('genre', ...)`
   - "What's your goal?" → `save('goal', ...)`
4. **Completion**: User confirms "Yes, build my flow"
   - Play success sound
   - Mark onboarding complete
   - Generate flow template
   - Redirect with serialized template
5. **Flow Canvas**: Auto-populated with nodes
   - Welcome message displays
   - Nodes connected in sequence
   - Ready to execute or customize

---

## 🔊 Audio & Visual Feedback

### Success Sound

```typescript
// When onboarding completes
audioEngine.play(themeManifest.sounds.success || themeManifest.sounds.click)
```

### Welcome Message

```typescript
{welcomeParam === 'true' && flowTemplate && (
  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
    <div>🎉 Campaign Flow Generated!</div>
    <div>{flowTemplate.name} - {flowTemplate.description}</div>
  </div>
)}
```

---

## 🧪 Testing

### Manual Test Flow

```bash
# 1. Start dev server
npm run dev

# 2. Visit OS Selector
http://localhost:3000/onboarding/os-selector?force=true

# 3. Choose any theme (e.g., ASCII)
# 4. Watch transition animation
# 5. See Broker intro with personality-specific greeting
# 6. Answer questions:
#    - Artist name: "sadact"
#    - Genre: "Electronic / Dance"
#    - Goal: "Radio airplay"
#    - Experience: "DIY for a while now"
# 7. Confirm "Yes, let's do it"
# 8. Verify:
#    ✓ Success sound plays
#    ✓ Broker says personality-specific confirmation
#    ✓ Redirects to Flow Canvas
#    ✓ Welcome message displays
#    ✓ 4 nodes appear (Radio Campaign)
#    ✓ Nodes are connected in sequence
```

### localStorage Verification

```javascript
// Open browser console
localStorage.getItem('broker_memory')
// Should show: {"artist_name":"sadact","genre":"Electronic / Dance",...}
```

---

## 🔮 Future Enhancements

### Supabase Integration (When Auth Ready)

Replace `useBrokerMemoryLocal` with `useBrokerMemory`:

```typescript
// Get Supabase client
const supabase = createClientComponentClient()

// Use Supabase-backed memory
const memory = useBrokerMemory(sessionId, supabase)
```

### LLM-Based Flow Customization

```typescript
// Instead of fixed templates, use LLM to generate custom flows
const customFlow = await generateFlowWithLLM({
  artistName: data.artist_name,
  genre: data.genre,
  goal: data.goal,
  experience: data.experience
})
```

### Flow Execution History

```typescript
// Save completed flows
await memory.saveFlowHistory({
  flowId: template.id,
  completedAt: new Date(),
  results: { /* ... */ }
})
```

---

## 📝 API Reference

### `useBrokerMemoryLocal(sessionId: string)`

Returns:
- `save(key, value)`: Save a field
- `recall(key)`: Get a field value
- `getAll()`: Get all saved data
- `complete()`: Mark onboarding done
- `clear()`: Remove all memory
- `data`: Current state

### `getFlowTemplateForGoal(goal: string)`

Maps goal text to template. Handles variations:
- "Radio airplay" → `radio` template
- "Press coverage" → `press` template
- "Playlist placement" → `playlists` template
- "Live bookings" → `live` template
- "All of the above" → `all` template

### `serializeFlowTemplate(template: FlowTemplate): string`

Converts template to URL-safe string.

### `deserializeFlowTemplate(serialized: string): FlowTemplate | null`

Converts URL param back to template object.

---

## 🛡️ Privacy & Data Handling

### localStorage (Current Implementation)
- Data stays on user's device
- Cleared on cache clear
- No server transmission
- No authentication required

### Supabase (Future Implementation)
- Data encrypted in transit
- Row-level security enforced
- User can delete anytime
- Tied to authenticated user ID

### What's Stored
- **Public**: Artist name, genre, goal, experience level
- **Not Stored**: Passwords, payment info, personal email

---

## 📊 Success Metrics

**Conversion**: % of users who complete onboarding → see generated flow
**Engagement**: % of generated flows that get executed
**Satisfaction**: User feedback on flow relevance

**Target**: 80% of onboarded users should find their generated flow relevant.

---

**Status**: ✅ Complete & Production-Ready
**Last Updated**: October 19, 2025
**Maintainer**: [chris@totalaud.io](mailto:chris@totalaud.io)

**The memory system is LIVE!** Broker now seamlessly transforms conversation into workflow. 🧠→🎨
