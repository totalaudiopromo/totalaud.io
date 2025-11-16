# Phase 9: Agent Runtime + Behaviour Engine - Implementation Documentation

**Project**: totalaud.io (Experimental Multi-Agent System)
**Phase**: 9 - Agent Runtime + Behaviour Engine
**Status**: ✅ Complete
**Date**: November 2025
**Branch**: `feature/agent-runtime-behaviour-engine`

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Runtime Components](#core-runtime-components)
4. [Agent Behaviours](#agent-behaviours)
5. [UI Components](#ui-components)
6. [Database Schema](#database-schema)
7. [Integration Guide](#integration-guide)
8. [Usage Examples](#usage-examples)
9. [Testing](#testing)
10. [Future Enhancements](#future-enhancements)

---

## Overview

Phase 9 introduces a complete **Agent Runtime + Behaviour Engine** that transforms totalaud.io's timeline into an interactive, agent-driven creative workspace. Agents now behave like "musical instruments" on the timeline, triggering actions as the playhead passes through clips.

### Key Features

- ✅ **Event-Driven Agent Runtime** - Execute agents based on timeline playback
- ✅ **4 Specialised Agent Behaviours** - Scout, Coach, Tracker, Insight
- ✅ **Clip Interpretation Engine** - Convert clips into agent instructions
- ✅ **Rate Limiting + State Management** - Prevent agent storms
- ✅ **Dialogue System** - OS personality-specific messaging
- ✅ **Real-Time UI Components** - Activity logs, status bars, decision modals
- ✅ **Database Persistence** - Supabase integration for events, outputs, messages
- ✅ **Mixtape Export Integration** - Agent insights in shareable exports

### Philosophy

Agents are **creative collaborators**, not automation tools. They:
- React to your timeline as you build it
- Generate analogue story cards to track emotional journey
- Detect bottlenecks and suggest optimisations
- Request your input when uncertain
- Adapt to your OS personality (ascii, xp, aqua, daw, analogue)

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Timeline Playback                   │
│  User creates clips → Playhead moves → Clips activated  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Clip Interpreter                        │
│   Validates clip metadata → Extracts behaviour payload  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    Agent Runner                          │
│  - Matches clip to behaviour                             │
│  - Checks rate limits                                    │
│  - Creates agent context                                 │
│  - Executes behaviour                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│               Agent Behaviour (Scout/Coach/etc.)        │
│  - Processes clip payload                               │
│  - Generates new clips/cards                            │
│  - Sends dialogue messages                              │
│  - Returns output                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Output Handlers                         │
│  - Update timeline state (add clips/cards)               │
│  - Log events to Supabase                                │
│  - Update UI (activity bar, log panel)                   │
│  - Trigger OS personality notifications                  │
└─────────────────────────────────────────────────────────┘
```

### Core Concepts

**Agent Context**: Everything an agent needs to make decisions
- Campaign metadata (goal, name, theme)
- Timeline state (clips, tracks, playhead position)
- Card state (analogue story cards)
- Current OS theme
- Execution mode (auto/manual/assist)
- User preferences

**Behaviour Types**: Different action patterns
- `research` - Discovery and opportunity finding (Scout)
- `planning` - Task breakdown and organisation (Coach)
- `followup` - Scheduling and completion tracking (Tracker)
- `analysis` - Pattern detection and optimisation (Insight)
- `story` - Emotional narrative building (Insight)
- `custom` - User-defined behaviours

**Execution Modes**:
- `auto` - Agent executes automatically during playback
- `manual` - User must manually trigger execution
- `assist` - Agent suggests but waits for approval

---

## Core Runtime Components

### 1. Agent Context (`packages/agents/runtime/agent-context.ts`)

Provides campaign and OS context to behaviours.

```typescript
export interface AgentContext {
  campaign: CampaignMeta
  timeline: TimelineState
  cards: CardState
  currentOS: ThemeId
  osActivity: Record<ThemeId, number>
  clipId?: string
  executionMode: 'auto' | 'manual' | 'assist'
  userPreferences: {
    allowAutoExecution: boolean
    maxAutoActionsPerMinute: number
    preferredAgents: string[]
  }
  timestamp: Date
  sessionId: string
}

// Factory function
createAgentContext(
  meta: CampaignMeta,
  timeline: TimelineState,
  cards: CardState,
  currentOS: ThemeId,
  sessionId: string,
  overrides?: Partial<AgentContext>
): AgentContext
```

**Capabilities System**:
```typescript
export interface AgentCapabilities {
  canCreateClips: boolean
  canModifyClips: boolean
  canDeleteClips: boolean
  canCreateCards: boolean
  canRequestUserInput: boolean
  canAccessExternalAPIs: boolean
}
```

### 2. Agent State Manager (`packages/agents/runtime/agent-state.ts`)

Tracks agent execution state and enforces rate limiting.

```typescript
export class AgentStateManager {
  // Check if agent can execute (rate limiting)
  canExecute(agentName: string): boolean

  // Record execution for rate limiting
  recordExecution(agentName: string): void

  // Start/complete/fail execution
  startExecution(agentName: string, clipId: string): void
  completeExecution(agentName: string, output?: unknown): void
  failExecution(agentName: string, error: string): void

  // Get current status
  getAgentStatus(agentName: string): AgentStatus
  getAllStates(): AgentExecutionState[]

  // Queue management
  enqueue(agentName: string, clipId: string): void
  dequeue(): { agentName: string; clipId: string } | undefined
}
```

**Agent Status Types**:
- `idle` - Agent is available
- `running` - Currently executing a clip
- `waiting` - In execution queue
- `error` - Last execution failed

### 3. Agent Logger (`packages/agents/runtime/agent-logger.ts`)

Structured logging with filtering and subscriptions.

```typescript
export class AgentLogger {
  // Log a message
  log(
    agentName: string,
    level: LogLevel,
    message: string,
    clipId?: string,
    metadata?: Record<string, unknown>
  ): void

  // Subscribe to new logs
  subscribe(listener: (entry: AgentLogEntry) => void): () => void

  // Get recent logs
  getRecent(count: number): AgentLogEntry[]

  // Filter logs
  filterBy(filters: {
    agentName?: string
    level?: LogLevel
    clipId?: string
  }): AgentLogEntry[]

  // Clear all logs
  clear(): void
}
```

**Log Levels**: `debug`, `info`, `warn`, `error`

### 4. Agent Events (`packages/agents/runtime/agent-events.ts`)

Defines all agent event types for pub/sub communication.

```typescript
export type AgentEventType =
  | 'clip_activated'
  | 'clip_completed'
  | 'clip_rejected'
  | 'card_created'
  | 'timeline_updated'
  | 'agent_error'
  | 'agent_output'
  | 'agent_request_input'
  | 'agent_started'
  | 'agent_finished'

export interface AgentEvent<T = unknown> {
  type: AgentEventType
  agentName: string
  clipId?: string
  payload: T
  timestamp: Date
}
```

### 5. Agent Runner (`packages/agents/runtime/agent-runner.ts`)

Core execution orchestrator - the heart of the runtime.

```typescript
export class AgentRunner {
  // Register a behaviour
  registerBehaviour(behaviour: AgentBehaviour): void

  // Execute a clip
  async executeClip(
    clip: TimelineClip,
    context: AgentContext
  ): Promise<AgentBehaviourOutput | null>

  // Timeline playback integration
  async onClipActivated(
    clip: TimelineClip,
    playheadPosition: number,
    context: AgentContext
  ): Promise<void>

  // Event system
  on<T>(
    eventType: AgentEventType,
    listener: AgentEventListener<T>
  ): () => void

  emit<T>(event: AgentEvent<T>): void

  // Active clip tracking
  isClipActive(clipId: string): boolean
}
```

### 6. Clip Interpreter (`packages/timeline/clip-interpreter.ts`)

Validates and interprets clip metadata into agent instructions.

```typescript
export const ClipBehaviourSchema = z.object({
  behaviourType: z.enum([
    'research',
    'planning',
    'followup',
    'analysis',
    'story',
    'custom',
  ]),
  assignedAgent: z.enum(['scout', 'coach', 'tracker', 'insight']).optional(),
  executionMode: z.enum(['auto', 'manual', 'assist']).default('manual'),
  payload: z.record(z.unknown()).optional(),
})

export function interpretClip(clip: TimelineClip): ClipBehaviour | null
```

---

## Agent Behaviours

### Scout Agent (`packages/agents/behaviours/scout.ts`)

**Purpose**: Research and discovery - finds opportunities and gathers information

**Supported Clip Types**: `research`, `custom`

**Capabilities**:
- ✅ Can create clips
- ✅ Can create cards
- ✅ Can request user input

**Behaviour Logic**:
1. Simulates research execution (500ms delay)
2. Generates 20-25 discovery opportunities
3. Creates timeline clips for each opportunity
4. Creates "breakthrough" cards for major discoveries
5. Requests Insight agent for deeper analysis

**Example Output**:
```json
{
  "success": true,
  "message": "Research complete: 23 opportunities discovered",
  "data": {
    "opportunities": [
      { "title": "BBC Radio 1 - Playlist submission open", "confidence": 0.85 },
      { "title": "Spotify Editorial team contact", "confidence": 0.72 }
    ]
  },
  "clipsToCreate": [ /* 23 opportunity clips */ ],
  "cardsToCreate": [
    { "type": "breakthrough", "content": "Major discovery: Direct contact with BBC" }
  ]
}
```

### Coach Agent (`packages/agents/behaviours/coach.ts`)

**Purpose**: Planning and task breakdown - organises work into actionable steps

**Supported Clip Types**: `planning`, `custom`

**Capabilities**:
- ✅ Can create clips
- ✅ Can modify clips
- ✅ Can create cards
- ✅ Can request user input

**Behaviour Logic**:
1. Analyses task description from clip
2. Detects vague tasks and requests clarification
3. Breaks complex tasks into subtasks
4. Assigns agents to each subtask
5. Creates "clarity" cards when plan is well-defined

**Example Output**:
```json
{
  "success": true,
  "message": "Plan created: 5 subtasks identified",
  "data": {
    "subtasks": [
      { "title": "Research radio stations", "agent": "scout", "duration": 10 },
      { "title": "Draft press release", "agent": "coach", "duration": 15 }
    ]
  },
  "clipsToCreate": [ /* 5 subtask clips */ ],
  "cardsToCreate": [
    { "type": "clarity", "content": "Clear plan with defined milestones" }
  ]
}
```

### Tracker Agent (`packages/agents/behaviours/tracker.ts`)

**Purpose**: Follow-up and completion tracking - monitors progress and schedules reminders

**Supported Clip Types**: `followup`, `custom`

**Capabilities**:
- ✅ Can create clips
- ✅ Can create cards

**Behaviour Logic**:
1. Checks completion status of linked tasks
2. Calculates completion percentage
3. Generates "pride" cards for high completion (>80%)
4. Generates "frustration" cards for low completion (<30%)
5. Schedules follow-up clips (default: 7 days)

**Example Output**:
```json
{
  "success": true,
  "message": "Follow-up scheduled: 7/10 tasks completed (70%)",
  "data": {
    "completed": 7,
    "total": 10,
    "completionPercentage": 70,
    "nextFollowUp": "2025-11-23T10:00:00Z"
  },
  "clipsToCreate": [
    { "name": "Follow-up: Check remaining tasks", "startTime": 604800 }
  ],
  "cardsToCreate": [
    { "type": "pride", "content": "Great progress! 70% complete" }
  ]
}
```

### Insight Agent (`packages/agents/behaviours/insight.ts`)

**Purpose**: Pattern analysis and optimisation - detects bottlenecks and generates emotional narrative

**Supported Clip Types**: `analysis`, `story`, `custom`

**Capabilities**:
- ✅ Can create clips
- ✅ Can modify clips
- ✅ Can create cards (PRIMARY card generator)

**Behaviour Logic**:
1. Analyses entire timeline for patterns
2. Detects 4 bottleneck types:
   - `missing_sentiment` - Many clips without story cards
   - `agent_imbalance` - Overuse of one agent
   - `low_card_diversity` - Limited emotional range
   - `timeline_health` - Overall efficiency below 50%
3. Generates sentiment cards based on analysis:
   - `excitement` - Good progress (>20 clips, >70% health)
   - `clarity` - Balanced workflow
   - `doubt` - High-severity bottlenecks detected
   - `breakthrough` - Milestones reached (50+ clips)
4. Suggests optimisations
5. Auto-implements low/medium severity fixes

**Timeline Health Algorithm**:
```typescript
function calculateTimelineHealth(clipCount: number, cardCount: number): number {
  if (clipCount === 0) return 1
  const cardRatio = Math.min(cardCount / clipCount, 1)  // Ideal: 1 card per clip
  const clipScore = Math.min(clipCount / 30, 1)          // Ideal: 30+ clips
  return (cardRatio + clipScore) / 2
}
```

**Example Output**:
```json
{
  "success": true,
  "message": "Analysis complete: 2 bottlenecks detected, 4 sentiment cards generated",
  "data": {
    "analysis": {
      "totalClips": 45,
      "totalCards": 32,
      "timelineHealth": 0.78,
      "clipsByAgent": { "scout": 15, "coach": 12, "tracker": 10, "insight": 8 }
    },
    "bottlenecks": [
      {
        "type": "missing_sentiment",
        "severity": "medium",
        "description": "12 clips don't have story cards attached"
      }
    ]
  },
  "cardsToCreate": [
    { "type": "excitement", "content": "Amazing progress! 45 clips with 78% efficiency" },
    { "type": "clarity", "content": "Campaign workflow is well-balanced" }
  ]
}
```

---

## UI Components

### 1. AgentLogPanel (`apps/aud-web/src/components/agents/AgentLogPanel.tsx`)

Real-time activity log displaying all agent actions.

**Features**:
- Subscribes to `agentLogger` for live updates
- Filters by agent (scout/coach/tracker/insight) and log level
- Auto-scroll toggle
- Download logs as `.txt` file
- Clear all logs button
- Colour-coded by agent and severity
- Keeps last 100 log entries

**Usage**:
```tsx
<AgentLogPanel isOpen={logPanelOpen} onClose={() => setLogPanelOpen(false)} />
```

### 2. AgentActivityBar (`apps/aud-web/src/components/agents/AgentActivityBar.tsx`)

Real-time status indicators for all agents.

**Features**:
- Polls `agentStateManager` every 500ms
- Shows 4 agent badges (scout, coach, tracker, insight)
- Status icons: idle (✓), running (⚡), waiting (⏱), error (⚠)
- Pulsing animation when running
- Tooltips show current clip ID
- Agent-specific colours

**Usage**:
```tsx
<AgentActivityBar className="fixed bottom-4 right-4" showLabels={true} />
```

### 3. AgentDecisionModal (`apps/aud-web/src/components/agents/AgentDecisionModal.tsx`)

Handles agent requests for user input/decisions.

**Features**:
- Subscribes to `agentDialogue.getPendingDecisions()`
- Shows one decision at a time (queue indicator)
- OS personality-specific message formatting
- Multiple choice options or free-text response
- Priority indicators (low/medium/high/critical)
- Context display (JSON metadata)

**Usage**:
```tsx
<AgentDecisionModal
  onResponse={(messageId, response) => {
    console.log('User responded:', response)
  }}
/>
```

### 4. AgentEmotionPulse (`apps/aud-web/src/components/agents/AgentEmotionPulse.tsx`)

Animated emotion indicators for analogue story cards.

**Features**:
- Supports all 9 card types (hope, doubt, pride, fear, clarity, excitement, frustration, breakthrough, uncertainty)
- Different animation patterns per emotion:
  - **Excitement**: Fast pulse (0.8s duration)
  - **Breakthrough**: Bright flash (1.2s duration)
  - **Clarity**: Steady calm pulse (2s duration)
  - **Doubt/Uncertainty**: Slow hesitant fade (3s duration)
  - **Fear/Frustration**: Sharp erratic pulse (0.6s duration)
- 3 sizes: sm/md/lg
- 3 intensity levels: low/medium/high
- Optional label

**Usage**:
```tsx
<AgentEmotionPulse
  emotion="excitement"
  size="md"
  intensity="high"
  showLabel={true}
/>

<AgentEmotionCluster emotions={['hope', 'clarity', 'breakthrough']} size="sm" />
```

### 5. AgentOSDisplay (`apps/aud-web/src/components/agents/AgentOSDisplay.tsx`)

OS personality-specific visualisations of agent activity.

**Themes**:

**ASCII Theme** - Terminal-style display
```
> agents: [SCO] ● [COA] [TRA] [INS]
```

**XP Theme** - Nostalgic Windows XP style
- Blue gradient background
- Bouncy spring animations
- Coloured status squares

**Aqua Theme** - Glassy Mac OS Aqua
- Frosted glass blur
- Soft drop shadows
- Smooth y-axis animations

**DAW Theme** - Technical tempo-synced
- 120 BPM beat indicator
- VU meter-style bars
- Height pulses synced to beat (0.5s)

**Analogue Theme** - Warm tactile studio
- VU meter indicators
- Vintage tape reel aesthetic
- Warm gradient backgrounds

**Usage**:
```tsx
<AgentOSDisplay variant="bar" className="fixed top-4 right-4" />
```

---

## Database Schema

### Migration: `20251116000000_create_agent_tables.sql`

**3 Tables Created**:

#### 1. `agent_events`
Tracks all agent execution events.

```sql
CREATE TABLE agent_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES timeline_clips(id) ON DELETE SET NULL,

  agent_name TEXT NOT NULL CHECK (agent_name IN ('scout', 'coach', 'tracker', 'insight')),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'clip_activated', 'clip_completed', 'clip_rejected',
    'card_created', 'timeline_updated', 'agent_error',
    'agent_output', 'agent_request_input', 'agent_started', 'agent_finished'
  )),

  payload JSONB DEFAULT '{}'::jsonb,
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**: campaign_id, user_id, clip_id, agent_name, event_type, created_at

#### 2. `agent_outputs`
Stores agent execution outputs and performance metrics.

```sql
CREATE TABLE agent_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES timeline_clips(id) ON DELETE CASCADE,

  agent_name TEXT NOT NULL,
  behaviour_type TEXT NOT NULL,

  output_data JSONB NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  execution_time_ms INTEGER,

  clips_created INTEGER DEFAULT 0,
  cards_created INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**: campaign_id, user_id, clip_id, agent_name, created_at

#### 3. `agent_messages`
Manages agent dialogue and user decision requests.

```sql
CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES timeline_clips(id) ON DELETE SET NULL,

  agent_name TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  requires_decision BOOLEAN DEFAULT false,
  decision_options JSONB,
  user_response TEXT,

  context JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
);
```

**Indexes**: campaign_id, user_id, agent_name, requires_decision, expires_at

**Row Level Security (RLS)**: All tables have RLS enabled with policies for SELECT, INSERT, UPDATE, DELETE based on `auth.uid() = user_id`

**Statistics View**:
```sql
CREATE VIEW agent_performance_stats AS
SELECT
  agent_name,
  COUNT(*) as total_executions,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_executions,
  AVG(execution_time_ms) as avg_execution_time_ms,
  SUM(clips_created) as total_clips_created,
  SUM(cards_created) as total_cards_created,
  MAX(created_at) as last_execution
FROM agent_outputs
GROUP BY agent_name;
```

---

## Integration Guide

### Timeline Playback Integration

**File**: `apps/aud-web/src/components/timeline/TimelineCanvas.tsx`

```typescript
import { agentRunner } from '@totalaud/agents/runtime'
import { createAgentContext } from '@totalaud/agents/runtime'

const [activatedClips, setActivatedClips] = useState<Set<string>>(new Set())

useEffect(() => {
  if (!timeline.isPlaying) return

  const currentPosition = timeline.playheadPosition
  const clipsToActivate: TimelineClip[] = []

  timeline.clips.forEach((clip) => {
    const clipEnd = clip.startTime + clip.duration
    const isActive = currentPosition >= clip.startTime && currentPosition < clipEnd

    if (isActive && !activatedClips.has(clip.id) && clip.agentSource) {
      clipsToActivate.push(clip)
    }
  })

  if (clipsToActivate.length > 0) {
    const context = createAgentContext(
      meta,
      timeline,
      cards,
      meta.currentTheme,
      crypto.randomUUID(),
      { executionMode: 'auto' }
    )

    clipsToActivate.forEach(async (clip) => {
      await agentRunner.onClipActivated(clip, currentPosition, context)
      setActivatedClips((prev) => new Set(prev).add(clip.id))
    })
  }
}, [timeline.isPlaying, timeline.playheadPosition])
```

### Active Clip Visual Effects

**File**: `apps/aud-web/src/components/timeline/Clip.tsx`

```typescript
const [isActive, setIsActive] = useState(false)

useEffect(() => {
  if (!timeline.isPlaying) {
    setIsActive(false)
    return
  }

  const checkActive = () => {
    const active = agentRunner.isClipActive(clip.id)
    setIsActive(active)
  }

  const interval = setInterval(checkActive, 100)
  checkActive()

  return () => clearInterval(interval)
}, [timeline.isPlaying, clip.id])

// Visual effects
<motion.div
  className={`${isActive ? 'ring-2 ring-white ring-offset-2' : ''}`}
  style={{
    boxShadow: isActive ? `0 0 20px ${clip.colour}, 0 0 40px ${clip.colour}80` : undefined,
    zIndex: isActive ? 5 : 1,
  }}
  animate={isActive ? { opacity: [1, 0.9, 1] } : {}}
>
  {isActive && (
    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
      <Play size={8} fill="currentColor" />
    </motion.div>
  )}
</motion.div>
```

### Mixtape Export Integration

**Usage**:
```typescript
import { downloadMixtape } from '@totalaud/export/mixtape'
import type { AgentInsights } from '@totalaud/os-state/campaign'

const insights: AgentInsights = {
  totalExecutions: 145,
  agentBreakdown: {
    scout: { executions: 45, successRate: 0.95 },
    coach: { executions: 38, successRate: 0.92 },
    tracker: { executions: 32, successRate: 0.98 },
    insight: { executions: 30, successRate: 0.87 },
  },
  bottlenecks: [
    {
      type: 'missing_sentiment',
      severity: 'medium',
      description: '12 clips lack story cards',
    },
  ],
  recommendations: [
    {
      title: 'Add sentiment cards',
      description: 'Track emotional journey',
      impact: 'medium',
      agent: 'insight',
    },
  ],
  emotionalJourney: [
    { emotion: 'excitement', count: 15, trend: 'increasing' },
    { emotion: 'clarity', count: 12, trend: 'stable' },
  ],
}

downloadMixtape({
  campaign: meta,
  timeline,
  cards: cards.cards,
  agentInsights: insights,
  exportedAt: new Date(),
  exportConfig: {
    includeCards: true,
    includeTimestamps: true,
    theme: meta.currentTheme,
    title: meta.name,
    description: meta.goal,
  },
})
```

---

## Usage Examples

### Example 1: Research Campaign with Scout Agent

```typescript
// 1. Create a research clip
const researchClip = {
  id: crypto.randomUUID(),
  trackId: 'research-track',
  name: 'Find radio stations for indie rock',
  startTime: 0,
  duration: 10,
  colour: '#51CF66',
  agentSource: 'scout',
  cardLinks: [],
  metadata: {
    behaviourType: 'research',
    payload: {
      genre: 'indie rock',
      region: 'UK',
      targetAudience: '18-34',
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

// 2. Play timeline
timeline.play()

// 3. When playhead reaches clip (0s-10s), Scout agent executes
// Output: 23 opportunity clips + breakthrough card

// 4. View results in AgentLogPanel
// [INFO] [SCOUT] Research complete: 23 opportunities discovered
```

### Example 2: Task Planning with Coach Agent

```typescript
// 1. Create a planning clip
const planningClip = {
  id: crypto.randomUUID(),
  name: 'Plan single release campaign',
  agentSource: 'coach',
  metadata: {
    behaviourType: 'planning',
    payload: {
      task: 'Release new single on streaming platforms',
    },
  },
}

// 2. Coach detects vague task → Requests clarification via AgentDecisionModal
// Message: "The task 'Release new single' needs more detail. What's your timeline?"
// Options: ["Next week", "Next month", "Next quarter"]

// 3. User responds → Coach generates subtasks
// Output: 5 subtask clips + clarity card
```

### Example 3: Follow-up Tracking with Tracker Agent

```typescript
// 1. Create follow-up clip linked to previous tasks
const followupClip = {
  id: crypto.randomUUID(),
  name: 'Check radio submissions',
  agentSource: 'tracker',
  metadata: {
    behaviourType: 'followup',
    payload: {
      linkedClips: ['clip1', 'clip2', 'clip3'],
    },
  },
}

// 2. Tracker calculates completion
// Result: 7/10 tasks complete (70%)

// 3. Generates pride card + schedules next follow-up
// Card: "Great progress! 70% complete"
// New clip: "Follow-up: Check remaining tasks" (scheduled 7 days ahead)
```

### Example 4: Timeline Analysis with Insight Agent

```typescript
// 1. Create analysis clip
const analysisClip = {
  id: crypto.randomUUID(),
  name: 'Analyse campaign health',
  agentSource: 'insight',
  metadata: {
    behaviourType: 'analysis',
  },
}

// 2. Insight agent analyses entire timeline
// Detects: Missing sentiment cards (medium severity)

// 3. Generates sentiment cards
// - Excitement: "Amazing progress! 45 clips with 78% efficiency"
// - Clarity: "Campaign workflow is well-balanced"

// 4. Suggests optimisation
// Recommendation: "Add sentiment cards to track emotional journey"
```

---

## Testing

### Manual Testing Checklist

- [ ] **Timeline Playback**
  - [ ] Agents execute when playhead reaches clips
  - [ ] Active clips show glow effects
  - [ ] Rate limiting prevents agent storms (max 10 actions/min)
  - [ ] Execution stops when timeline pauses

- [ ] **Agent Behaviours**
  - [ ] Scout: Creates opportunity clips
  - [ ] Coach: Breaks down tasks, requests clarification
  - [ ] Tracker: Calculates completion, schedules follow-ups
  - [ ] Insight: Detects bottlenecks, generates sentiment cards

- [ ] **UI Components**
  - [ ] AgentLogPanel: Shows real-time logs, filters work
  - [ ] AgentActivityBar: Status updates correctly, pulses when running
  - [ ] AgentDecisionModal: Displays messages, handles responses
  - [ ] AgentEmotionPulse: Animations match emotion types
  - [ ] AgentOSDisplay: Renders correctly for all 5 themes

- [ ] **Database Persistence**
  - [ ] Events logged to `agent_events`
  - [ ] Outputs saved to `agent_outputs`
  - [ ] Messages stored in `agent_messages`
  - [ ] RLS policies prevent unauthorised access

- [ ] **Mixtape Export**
  - [ ] Agent insights section appears in HTML
  - [ ] Performance stats calculated correctly
  - [ ] Bottlenecks/recommendations display properly

### Automated Testing

```bash
# Run all tests (from apps/aud-web)
pnpm test

# Test coverage
pnpm test:coverage

# Watch mode during development
pnpm vitest
```

---

## Future Enhancements

### Phase 9.1: Advanced Agent Features
- [ ] **Agent Memory System** - Agents remember past decisions
- [ ] **Multi-Agent Collaboration** - Agents can call each other
- [ ] **Learning from User Feedback** - Adapt behaviour based on user responses
- [ ] **Custom Agent Creation** - Users can define their own agents

### Phase 9.2: External Integrations
- [ ] **Spotify API Integration** - Scout agent pulls real playlists
- [ ] **Email Automation** - Tracker sends follow-up emails
- [ ] **Calendar Integration** - Coach syncs deadlines to Google Calendar
- [ ] **Social Media Monitoring** - Insight tracks campaign performance

### Phase 9.3: Performance & Analytics
- [ ] **Agent Performance Dashboard** - Visualise execution stats
- [ ] **A/B Testing for Agent Behaviours** - Compare strategy effectiveness
- [ ] **Real-Time Collaboration** - Multiple users see agent activity
- [ ] **Undo/Redo Agent Actions** - Rollback unwanted changes

### Phase 9.4: AI/LLM Integration
- [ ] **GPT-4 Integration** - Natural language task processing
- [ ] **Claude Code Integration** - Code generation for custom behaviours
- [ ] **Voice Input** - Speak tasks to agents via Web Speech API
- [ ] **Semantic Search** - Find clips/cards by meaning, not keywords

---

## File Manifest

### Core Runtime (14 files)
- `packages/agents/runtime/agent-context.ts`
- `packages/agents/runtime/agent-state.ts`
- `packages/agents/runtime/agent-logger.ts`
- `packages/agents/runtime/agent-events.ts`
- `packages/agents/runtime/agent-runner.ts`
- `packages/agents/runtime/index.ts`
- `packages/agents/behaviours/scout.ts`
- `packages/agents/behaviours/coach.ts`
- `packages/agents/behaviours/tracker.ts`
- `packages/agents/behaviours/insight.ts`
- `packages/agents/behaviours/index.ts`
- `packages/agents/dialogue/agent-dialogue.ts`
- `packages/timeline/clip-interpreter.ts`
- `supabase/migrations/20251116000000_create_agent_tables.sql`

### UI Components (5 files)
- `apps/aud-web/src/components/agents/AgentLogPanel.tsx`
- `apps/aud-web/src/components/agents/AgentActivityBar.tsx`
- `apps/aud-web/src/components/agents/AgentDecisionModal.tsx`
- `apps/aud-web/src/components/agents/AgentEmotionPulse.tsx`
- `apps/aud-web/src/components/agents/AgentOSDisplay.tsx`

### Timeline Integration (2 files)
- `apps/aud-web/src/components/timeline/TimelineCanvas.tsx` (modified)
- `apps/aud-web/src/components/timeline/Clip.tsx` (modified)

### Export Extension (2 files)
- `packages/export/mixtape/exportMixtape.ts` (modified)
- `packages/os-state/campaign/campaign.types.ts` (modified - added AgentInsights)

### Documentation (1 file)
- `PHASE_9_IMPLEMENTATION.md` (this file)

**Total**: 24 files (19 new, 5 modified)
**Lines of Code**: ~2,700 lines

---

## Commit History

```bash
git log --oneline feature/agent-runtime-behaviour-engine

cd82f17 feat(agents): implement Phase 9 Agent Runtime + Behaviour Engine (core)
3a89cbe feature(timeline): add DAW Timeline Engine + Analogue Story Cards system
```

---

## Credits

**Implemented by**: Claude Code (Anthropic)
**Project**: totalaud.io
**Owner**: Chris Schofield
**Date**: November 2025
**Branch**: `feature/agent-runtime-behaviour-engine`

---

## Glossary

| Term | Definition |
|------|------------|
| **Agent** | AI-powered assistant that executes tasks on the timeline |
| **Behaviour** | Agent's logic for handling a specific clip type |
| **Clip** | Timeline segment representing a task or action |
| **Card** | Analogue story card tracking emotional journey |
| **Context** | Campaign/timeline state provided to agents |
| **Execution Mode** | How agent runs: auto/manual/assist |
| **Rate Limiting** | Prevents too many agent actions in short time |
| **Dialogue** | OS personality-specific agent messaging |
| **Mixtape** | Shareable HTML export of campaign timeline |
| **OS Personality** | Theme affecting agent display (ascii/xp/aqua/daw/analogue) |

---

**END OF DOCUMENTATION**
