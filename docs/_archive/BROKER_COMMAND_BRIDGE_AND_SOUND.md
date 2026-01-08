# Broker Command Bridge & Agent Sound Cues

**Design Principle**: *"Running your campaign should feel like pressing play."*

---

## 🎯 Overview

The Broker Command Bridge transforms natural language into executable agent workflows, while unique synthesized sound cues provide audio feedback for each agent's activity. Together, they create an intuitive, performance-like experience where users can orchestrate their campaigns through conversation and sound.

### Key Features
- **Natural Language Commands**: Parse user intent ("run the campaign flow")
- **Goal-Based Execution**: Automatically select workflow templates
- **Sequential & Parallel Modes**: Execute nodes in order or simultaneously
- **Agent-Specific Sounds**: Unique audio signatures for each of 5 agents
- **Real-Time Audio Feedback**: Sounds play on status transitions
- **100% Synthesized Audio**: No copyrighted samples, all Web Audio API

---

## 🎤 Broker Command Bridge

### Hook: `useCommandBridge`

**Location**: [packages/core/agent-executor/src/hooks/useCommandBridge.ts](../packages/core/agent-executor/src/hooks/useCommandBridge.ts)

**Purpose**: Parse natural language commands and orchestrate multi-agent workflows

```typescript
const {
  parseCommand,       // Parse NL command and execute
  runFlow,           // Execute complete goal-based flow
  runSequence,       // Execute specific nodes
  cancelFlow,        // Cancel running execution
  retryFailedNodes,  // Retry failed nodes
  isExecuting        // Current execution state
} = useCommandBridge({
  agentExecution,   // useAgentExecution instance
  memory,           // Broker memory data
  themeSounds: {
    start: (agentId) => playAgentSound(agentId, 'start'),
    complete: (agentId) => playAgentSound(agentId, 'complete'),
    error: (agentId) => playAgentSound(agentId, 'error')
  },
  onCommandRecognized: (command, intent) => console.log('Command:', command),
  onFlowStart: (template) => console.log('Starting:', template.name),
  onFlowComplete: (result) => console.log('Complete:', result),
  onFlowError: (error) => console.error('Error:', error)
})
```

### Command Recognition

**Supported Commands**:

| User Input | Recognized Intent | Action |
|------------|-------------------|--------|
| "Run the campaign flow" | `execute_flow` | Execute complete goal-based template |
| "Start the workflow" | `execute_flow` | Execute complete goal-based template |
| "Run everything in parallel" | `execute_flow` (parallel) | Execute all nodes simultaneously |
| "Pause the flow" | `pause_flow` | Cancel all running/queued nodes |
| "Stop execution" | `pause_flow` | Cancel all running/queued nodes |
| "Cancel the campaign" | `cancel_flow` | Cancel and clear all activity logs |
| "Abort workflow" | `cancel_flow` | Cancel and clear all activity logs |
| "Retry failed nodes" | `retry_node` | Re-execute all nodes with 'error' status |
| "Try again" | `retry_node` | Re-execute all nodes with 'error' status |

### Intent Structure

```typescript
interface CommandIntent {
  action: 'execute_flow' | 'pause_flow' | 'cancel_flow' | 'retry_node' | 'unknown'
  target?: string
  parameters?: Record<string, any>
}
```

### Goal-Based Flow Execution

When a user says **"Run the campaign flow"**, Broker:

1. Retrieves the goal from memory (e.g., "radio airplay")
2. Looks up the corresponding flow template from `goalToFlowMap`
3. Executes each step sequentially (or in parallel if requested)
4. Plays agent sound cues at each transition
5. Tracks results and timing
6. Calls `onFlowComplete` with execution summary

```typescript
// Example: Execute "radio" flow
const result = await runFlow('radio', false) // false = sequential

// Result:
{
  template: { name: 'Radio Airplay Campaign', steps: [...] },
  startedAt: Date,
  completedAt: Date,
  durationMs: 45000,
  nodesExecuted: 4,
  nodesSucceeded: 4,
  nodesFailed: 0,
  results: {
    'research-radio-contacts': { contacts: 23 },
    'score-contacts': { scored: 23, highPriority: 8 },
    'generate-pitch': { pitch: '...' },
    'send-emails': { sent: 8 }
  }
}
```

### Sequential vs Parallel Execution

**Sequential** (default):
```typescript
await runFlow('radio', false)
// Node 1 → complete → Node 2 → complete → Node 3 → complete
// Stops on first error
```

**Parallel**:
```typescript
await runFlow('radio', true)
// All nodes execute simultaneously
// Continues even if one fails
```

### Execution Callbacks

**onCommandRecognized**: Called when command intent is parsed
```typescript
onCommandRecognized: (command, intent) => {
  console.log(`User said: "${command}"`)
  console.log(`Interpreted as: ${intent.action}`)
}
```

**onFlowStart**: Called when flow execution begins
```typescript
onFlowStart: (template) => {
  console.log(`Starting: ${template.name}`)
  console.log(`Estimated time: ${template.estimatedTime}`)
  showLoadingSpinner()
}
```

**onFlowComplete**: Called when flow finishes successfully
```typescript
onFlowComplete: (result) => {
  console.log(`Completed in ${result.durationMs}ms`)
  console.log(`Success rate: ${result.nodesSucceeded}/${result.nodesExecuted}`)
  hideLoadingSpinner()
  showSuccessMessage()
}
```

**onFlowError**: Called if flow execution fails
```typescript
onFlowError: (error) => {
  console.error('Flow failed:', error.message)
  showErrorMessage(error.message)
}
```

---

## 🔊 Agent Sound Cues

### Sound System Architecture

**Location**: [packages/core/theme-engine/src/sounds.ts](../packages/core/theme-engine/src/sounds.ts)

**Purpose**: Provide unique audio signatures for each agent's activity

### Agent Sound Profiles

#### 1. **Broker** 🎙️ - The Conductor
**Mood**: Warm, coordinating, professional
**Frequency Range**: 220Hz - 440Hz (A3 - A4)

```typescript
broker: {
  start: () => {
    // Deep, authoritative tone
    audioEngine.play({
      waveform: 'sine',
      frequency: 220, // A3
      duration: 300,
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.5, release: 0.2 }
    })
  },
  complete: () => {
    // Resolution tone
    audioEngine.play({
      waveform: 'sine',
      frequency: 440, // A4
      duration: 150
    })
  },
  error: () => {
    // Dissonant warning
    audioEngine.play({
      waveform: 'sawtooth',
      frequency: 185, // F#3
      duration: 400
    })
  }
}
```

#### 2. **Scout** 🧭 - The Explorer
**Mood**: Bright, optimistic, searching
**Frequency Range**: 880Hz - 1046Hz (A5 - C6)

```typescript
scout: {
  start: () => {
    // Bright alert ping
    audioEngine.play({
      waveform: 'triangle',
      frequency: 880, // A5
      duration: 200
    })
  },
  complete: () => {
    // Discovery chord
    audioEngine.playChord([880, 1046.5], 200) // A5-C6
  },
  error: () => {
    // Search failed tone
    audioEngine.play({
      waveform: 'square',
      frequency: 740, // F#5
      duration: 300
    })
  }
}
```

#### 3. **Coach** 🎯 - The Mentor
**Mood**: Supportive, confident, guiding
**Frequency Range**: 523Hz - 784Hz (C5 - G5)

```typescript
coach: {
  start: () => {
    // Supportive interval
    audioEngine.playChord([523.25, 659.25], 300) // C5-E5
  },
  complete: () => {
    // Major chord success
    audioEngine.playChord([523.25, 659.25, 783.99], 400) // C5-E5-G5
  },
  error: () => {
    // Encouraging but incomplete
    audioEngine.play({
      waveform: 'sine',
      frequency: 494, // B4
      duration: 400
    })
  }
}
```

#### 4. **Tracker** 📊 - The Analyst
**Mood**: Steady, rhythmic, precise
**Frequency Range**: 220Hz - 440Hz (A3 - A4)

```typescript
tracker: {
  start: () => {
    // Pulse rhythm - 120 BPM
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        audioEngine.play({
          waveform: 'square',
          frequency: 330, // E4
          duration: 100
        })
      }, i * 250)
    }
  },
  complete: () => {
    // Completion beep
    audioEngine.play({
      waveform: 'square',
      frequency: 440, // A4
      duration: 200
    })
  },
  error: () => {
    // Low error beep
    audioEngine.play({
      waveform: 'square',
      frequency: 220, // A3
      duration: 300
    })
  }
}
```

#### 5. **Insight** 💡 - The Visionary
**Mood**: Ethereal, harmonic, thoughtful
**Frequency Range**: 261Hz - 523Hz (C4 - C5)

```typescript
insight: {
  start: () => {
    // Soft harmonic pad
    audioEngine.playChord([261.63, 329.63, 392.00, 523.25], 600) // C4-E4-G4-C5
  },
  complete: () => {
    // Harmonic sweep upward (C-D-E-F-G)
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00]
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        audioEngine.play({
          waveform: 'sine',
          frequency: freq,
          duration: 100
        })
      }, i * 80)
    })
  },
  error: () => {
    // Dissonant minor 2nd
    audioEngine.playChord([261.63, 277.18], 400) // C4-C#4
  }
}
```

### Sound Playback API

**Function**: `playAgentSound`

```typescript
playAgentSound(
  agentId: 'broker' | 'scout' | 'coach' | 'tracker' | 'insight',
  action: 'start' | 'complete' | 'error'
): void
```

**Examples**:
```typescript
// Play Scout's discovery sound
playAgentSound('scout', 'complete')

// Play Broker's start sound
playAgentSound('broker', 'start')

// Play Coach's error sound
playAgentSound('coach', 'error')
```

### Integration with Flow Canvas

**Location**: [apps/aud-web/src/components/FlowCanvas.tsx](../apps/aud-web/src/components/FlowCanvas.tsx)

```typescript
// Track previous statuses
const previousStatuses = useRef<Record<string, string>>({})

useEffect(() => {
  Object.entries(nodeStatuses).forEach(([nodeId, agentStatus]) => {
    const previousStatus = previousStatuses.current[nodeId]
    const currentStatus = agentStatus.status

    // Status changed - play sound cue
    if (previousStatus !== currentStatus) {
      const agent = getAgent(agentStatus.agent_name)

      if (agent) {
        if (currentStatus === 'running') {
          playAgentSound(agent.id, 'start')
        } else if (currentStatus === 'complete') {
          playAgentSound(agent.id, 'complete')
        } else if (currentStatus === 'error') {
          playAgentSound(agent.id, 'error')
        }
      }

      previousStatuses.current[nodeId] = currentStatus
    }
  })
}, [nodeStatuses])
```

---

## 🎨 User Experience Flow

### Typical Workflow

1. **User completes Broker onboarding**
   - Broker remembers goal (e.g., "radio airplay")
   - Flow Canvas opens with pre-filled nodes

2. **User types: "Run the campaign flow"**
   - Command bridge parses intent: `execute_flow`
   - Broker responds: *"On it. Let's execute your Radio Airplay Campaign."*
   - Flow execution begins

3. **Scout starts (Node 1)**
   - **Visual**: Node border turns blue
   - **Sound**: Scout's bright ping (880Hz)
   - **UI**: Scout bubble (🧭) appears on node

4. **Scout completes (Node 1)**
   - **Visual**: Node border turns green
   - **Sound**: Scout's discovery chord (A5-C6)
   - **UI**: Activity Monitor shows: "Agent scout completed research-radio-contacts"

5. **Coach starts (Node 2)**
   - **Visual**: Node border turns blue
   - **Sound**: Coach's supportive interval (C5-E5)
   - **UI**: Coach bubble (🎯) appears on node

6. **Repeat for each node...**

7. **All nodes complete**
   - **Visual**: All nodes green
   - **Sound**: Final success chord
   - **UI**: Broker message: *"Campaign complete! 8 contacts secured, 8 emails sent. Nice work."*

### Error Handling

**If a node fails**:
- **Visual**: Node border turns red
- **Sound**: Agent's error sound (dissonant tone)
- **UI**: Broker message: *"Looks like Scout hit a snag. Want to retry?"*

**User types**: "Retry"
- **Action**: Command bridge recognizes `retry_node` intent
- **Execution**: Re-runs failed nodes
- **Sound**: Agent start sounds play again

---

## 🧪 Testing

### Manual Testing: Command Bridge

**Prerequisites**:
```bash
npm run dev
# Visit http://localhost:3004/
```

**Test Commands**:

```typescript
// In browser console:

// 1. Setup command bridge
const memory = { goal: 'radio' }
const { parseCommand } = useCommandBridge({
  agentExecution,
  memory
})

// 2. Test execute command
await parseCommand("Run the campaign flow")
// Expected: Flow executes, nodes turn blue → green

// 3. Test cancel command
await parseCommand("Cancel the flow")
// Expected: All running nodes stop

// 4. Test retry command
await parseCommand("Retry failed nodes")
// Expected: Failed nodes re-execute
```

### Manual Testing: Sound Cues

**Test Individual Sounds**:
```typescript
import { playAgentSound } from '@total-audio/core-theme-engine'

// Test each agent's sounds
playAgentSound('broker', 'start')
playAgentSound('broker', 'complete')
playAgentSound('broker', 'error')

playAgentSound('scout', 'start')
playAgentSound('scout', 'complete')
playAgentSound('scout', 'error')

// ... repeat for coach, tracker, insight
```

**Test Real-Time Integration**:
```typescript
// Execute a single node and listen for sounds
const { executeNode } = useAgentExecution({
  supabaseClient: supabase,
  sessionId: 'test-session'
})

await executeNode('scout', 'research-radio-contacts', {})

// Expected sounds:
// 1. Scout start sound (880Hz ping)
// 2. After 1.5s, Scout complete sound (A5-C6 chord)
```

### Automated Tests (Future)

```typescript
describe('useCommandBridge', () => {
  it('should recognize "run the flow" command', async () => {
    const { parseCommand } = useCommandBridge({ ... })
    const intent = await parseCommand("run the flow")
    expect(intent?.action).toBe('execute_flow')
  })

  it('should execute flow sequentially', async () => {
    const { runFlow } = useCommandBridge({ ... })
    const result = await runFlow('radio', false)
    expect(result.nodesExecuted).toBe(4)
    expect(result.nodesSucceeded).toBe(4)
  })

  it('should cancel running flow', async () => {
    const { runFlow, cancelFlow } = useCommandBridge({ ... })
    runFlow('radio') // Don't await
    await cancelFlow()
    // Expect all nodes cancelled
  })
})

describe('Agent Sound Cues', () => {
  it('should play Scout start sound', () => {
    const playMock = jest.spyOn(audioEngine, 'play')
    playAgentSound('scout', 'start')
    expect(playMock).toHaveBeenCalledWith({
      type: 'synth',
      waveform: 'triangle',
      frequency: 880,
      duration: 200
    })
  })
})
```

---

## 📚 API Reference

### `useCommandBridge`

```typescript
function useCommandBridge(options: CommandBridgeOptions): UseCommandBridgeReturn

interface CommandBridgeOptions {
  agentExecution: UseAgentExecutionReturn
  memory?: BrokerMemoryData
  themeSounds?: {
    start?: (agentId: string) => void
    complete?: (agentId: string) => void
    error?: (agentId: string) => void
  }
  onCommandRecognized?: (command: string, intent: CommandIntent) => void
  onFlowStart?: (template: FlowTemplate) => void
  onFlowComplete?: (result: FlowExecutionResult) => void
  onFlowError?: (error: Error) => void
}

interface UseCommandBridgeReturn {
  parseCommand: (message: string) => Promise<CommandIntent | null>
  runFlow: (goal: string, parallel?: boolean) => Promise<FlowExecutionResult | null>
  runSequence: (nodeIds: string[]) => Promise<void>
  cancelFlow: () => Promise<void>
  retryFailedNodes: () => Promise<void>
  isExecuting: boolean
}
```

### `playAgentSound`

```typescript
function playAgentSound(
  agentId: 'broker' | 'scout' | 'coach' | 'tracker' | 'insight',
  action: 'start' | 'complete' | 'error'
): void
```

### `agentSounds`

```typescript
const agentSounds: {
  broker: { start: () => void, complete: () => void, error: () => void }
  scout: { start: () => void, complete: () => void, error: () => void }
  coach: { start: () => void, complete: () => void, error: () => void }
  tracker: { start: () => void, complete: () => void, error: () => void }
  insight: { start: () => void, complete: () => void, error: () => void }
}
```

---

## 🚀 Future Enhancements

### 1. **Personality-Driven Execution**

**Goal**: Different themes execute flows differently

```typescript
// ASCII mode: Sequential, strict order
runFlow('radio', false)

// XP mode: Parallel multitasking
runFlow('radio', true)

// Aqua mode: Sequential with pauses
for (const step of steps) {
  await executeNode(step)
  await delay(500) // Smooth transition
}

// Ableton mode: Syncopated rhythm
for (const step of steps) {
  await executeNode(step)
  await delay(randomDelay(200, 400)) // Groove
}

// Punk mode: Randomized chaos
shuffle(steps).forEach(step => executeNode(step))
```

### 2. **Advanced Command Parsing**

**Goal**: More natural language understanding

```typescript
"Scout, find me 20 radio contacts for electronic music in London"
// Parsed as: { action: 'execute_node', agent: 'scout', params: { count: 20, genre: 'electronic', location: 'London' }}

"Coach, write a pitch using my track 'Midnight Drive'"
// Parsed as: { action: 'execute_node', agent: 'coach', params: { trackName: 'Midnight Drive' }}
```

### 3. **Agent Streaming Messages**

**Goal**: Live progress updates during execution

```typescript
// Instead of single message
"Agent scout executing research-contacts"

// Stream updates:
"Found 5 contacts..."
"Enriching contact data..."
"Scoring relevance..."
"Complete! 23 contacts ready."
```

### 4. **Agent Handoffs**

**Goal**: Automatic workflow chaining

```typescript
onAgentComplete('scout', 'research-contacts', (result) => {
  if (result.contacts.length > 0) {
    // Automatically trigger Coach to generate pitch
    executeNode('coach', 'generate-pitch', {
      contacts: result.contacts
    })
  }
})
```

### 5. **Campaign Mixdown Dashboard**

**Goal**: Compile results into visual report

```typescript
// After flow completes
const mixdown = createMixdown({
  scout: { contacts: 23, sources: ['BBC', 'Spotify'] },
  coach: { pitches: 23, avgScore: 8.5 },
  tracker: { emailsSent: 23, opened: 12, replied: 3 },
  insight: { recommendations: ['Follow up in 3 days', 'Try BBC 6 Music'] }
})

// Broker narrates summary
brokerNarrate(`Your campaign reached 23 contacts across BBC and Spotify.
12 opened your email, 3 replied. Top recommendation: Follow up in 3 days.`)
```

---

## 📝 Related Documentation

- [Real-Time Multi-Agent Collaboration](./REALTIME_AGENT_COLLABORATION.md)
- [Broker Memory & Flow Generation](./BROKER_MEMORY_AND_FLOW.md)
- [Agent Roles Configuration](../packages/core/agent-executor/src/config/agentRoles.ts)
- [Theme Engine Sound Synthesis](../packages/core/theme-engine/src/sounds.ts)

---

**Status**: ✅ Core Implementation Complete
**Last Updated**: October 19, 2026
**Maintainer**: chris@totalaud.io

**Next Steps**:
1. Integrate command bridge into BrokerChat
2. Add personality-driven execution patterns
3. Create streaming agent messages
4. Implement agent handoffs
5. Build Campaign Mixdown Dashboard

**The performance has begun.** 🎭🎵
