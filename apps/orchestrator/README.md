# Orchestrator — Crew Console

Live CLI dashboard for Claude sub-agent orchestration.

## Features

- 🎨 **Real-time progress bars** for each agent
- 🌈 **Color-coded agents** with emoji identifiers
- ⚡ **Live state updates** (waiting → running → done → error)
- 📊 **Message streaming** for detailed progress

## Agents Tracked

| Agent | Emoji | Color | Role |
|-------|-------|-------|------|
| Flow Architect | 🏗️ | Teal | BaseWorkflow consistency, Studio variants |
| Experience Composer | 🎨 | Orange | UX flow, friction analysis, onboarding |
| Motion Choreographer | 💫 | Blue | Animation curves, timing, micro-interactions |
| Sound Director | 🎧 | Purple | Audio asset organization, Web Audio integration |
| Aesthetic Curator | 🪞 | Pink | Design tokens, visual consistency |
| Realtime Engineer | ⚡ | Cyan | Supabase Realtime, event batching |
| Analytics Analyst | 📊 | Green | Event tracking, privacy-respecting telemetry |
| Signal Writer | ✍️ | Yellow | Narrative tone, signal> messages |
| Orchestrator | 🎯 | Red | Task decomposition, coordination |

## Usage

### Standalone Demo

```bash
cd apps/orchestrator
pnpm demo
```

This runs a simulated orchestration showing all agents completing the SharedWorkspace redesign.

### Integration with Orchestrator

```typescript
import CrewConsole, { AgentStatus } from '@total-audio/orchestrator'
import { render } from 'ink'

// Create async generator that yields agent updates
async function* orchestrationFeed(): AsyncGenerator<AgentStatus> {
  yield { id: 'flow_architect', progress: 0, state: 'running', message: 'Starting...' }
  // ... your orchestration logic
  yield { id: 'flow_architect', progress: 100, state: 'done', message: 'Complete!' }
}

// Render the console
const feed = orchestrationFeed()
render(<CrewConsole feed={feed} />)
```

### Manual State Updates

```typescript
import CrewConsole from '@total-audio/orchestrator'
import { render } from 'ink'

const initialStatuses = {
  flow_architect: { id: 'flow_architect', progress: 50, state: 'running', message: 'Building components' },
  experience_composer: { id: 'experience_composer', progress: 0, state: 'waiting' }
}

const { rerender } = render(<CrewConsole initialStatuses={initialStatuses} />)

// Update statuses programmatically
function updateAgent(id, progress, state, message) {
  initialStatuses[id] = { id, progress, state, message }
  rerender(<CrewConsole initialStatuses={initialStatuses} />)
}
```

## Agent Status Types

```typescript
type AgentState = 'waiting' | 'running' | 'done' | 'error'

interface AgentStatus {
  id: AgentId
  progress: number   // 0-100
  state: AgentState
  message?: string   // Optional status message
}
```

## Development

```bash
# Watch mode (auto-restart on changes)
pnpm dev

# Run demo
pnpm demo

# Type check
pnpm typecheck

# Build
pnpm build
```

## Architecture

Built with:
- **Ink** — React for CLI interfaces
- **Chalk** — Terminal color styling
- **React** — Component model

Output format:
```
╭──────────────────────────────────────────────╮
│ 🎛️  Crew Console — live Claude agents       │
│                                              │
│ 🏗️ Flow Architect      ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ ✅ – Scaffold complete ✓ │
│ 🎨 Experience Composer ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 🌀 – Simplifying layouts  │
│ 💫 Motion Choreographer ░░░░░░░░░░░░░░░░░░░░ ⏳                       │
│ 🎧 Sound Director       ░░░░░░░░░░░░░░░░░░░░ ⏳                       │
│ 🪞 Aesthetic Curator    ░░░░░░░░░░░░░░░░░░░░ ⏳                       │
│ ⚡ Realtime Engineer    ░░░░░░░░░░░░░░░░░░░░ ⏳                       │
│ 📊 Analytics Analyst    ░░░░░░░░░░░░░░░░░░░░ ⏳                       │
│ ✍️ Signal Writer        ░░░░░░░░░░░░░░░░░░░░ ⏳                       │
│ 🎯 Orchestrator         ▓▓░░░░░░░░░░░░░░░░░░ 🌀 – Decomposing task... │
╰──────────────────────────────────────────────╯
```

## Example: SharedWorkspace Redesign

The demo simulates the 7-stage SharedWorkspace implementation:

1. **Flow Architect** — Scaffold SharedWorkspace + store
2. **Experience Composer** — Simplify layouts, add hints
3. **Motion Choreographer** — Create transitions + motion hooks
4. **Sound Director** — Implement ambient crossfades
5. **Aesthetic Curator** — Apply design tokens
6. **Experience Composer (final)** — Validate first-hour flow
7. **Orchestrator** — Coordinate all stages

## Tips

- **Screenshot for socials**: The colored progress bars + emojis make great "building in public" content
- **Live streaming**: Pipe real Claude Code output through the feed for authentic build logs
- **CI/CD integration**: Use error states (❌) to highlight failures in automated workflows

---

**Last Updated**: January 2025
**Status**: ✅ Complete
**Version**: 0.1.0
