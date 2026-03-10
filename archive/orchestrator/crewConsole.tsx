#!/usr/bin/env node
/**
 * Crew Console
 *
 * Live CLI dashboard for Claude sub-agent orchestration
 * Uses Ink (React-for-CLI) to display real-time agent progress
 *
 * Usage:
 *   pnpm demo              # Run standalone demo
 *   import CrewConsole     # Integrate with orchestrator
 */

import React, { useEffect, useState } from 'react'
import { render, Box, Text } from 'ink'
import chalk from 'chalk'

// ──────────────────────────────────────────────
//  Agent colour / emoji map
// ──────────────────────────────────────────────
const agentTheme = {
  flow_architect: {
    color: '#7BDCB5',
    emoji: '🏗️',
    label: 'Flow Architect',
  },
  experience_composer: {
    color: '#F6B26B',
    emoji: '🎨',
    label: 'Experience Composer',
  },
  motion_choreographer: {
    color: '#6FA8DC',
    emoji: '💫',
    label: 'Motion Choreographer',
  },
  sound_director: {
    color: '#A64D79',
    emoji: '🎧',
    label: 'Sound Director',
  },
  aesthetic_curator: {
    color: '#C27BA0',
    emoji: '🪞',
    label: 'Aesthetic Curator',
  },
  realtime_engineer: {
    color: '#76A5AF',
    emoji: '⚡',
    label: 'Realtime Engineer',
  },
  analytics_analyst: {
    color: '#B6D7A8',
    emoji: '📊',
    label: 'Analytics Analyst',
  },
  signal_writer: {
    color: '#FFD966',
    emoji: '✍️',
    label: 'Signal Writer',
  },
  orchestrator: {
    color: '#E06666',
    emoji: '🎯',
    label: 'Orchestrator',
  },
}

// Example: orchestrator pushes updates here
export type AgentId = keyof typeof agentTheme
export type AgentState = 'waiting' | 'running' | 'done' | 'error'

export type AgentStatus = {
  id: AgentId
  progress: number // 0–100
  state: AgentState
  message?: string
}

// ──────────────────────────────────────────────
//  UI Component
// ──────────────────────────────────────────────
interface CrewConsoleProps {
  feed?: AsyncIterable<AgentStatus>
  initialStatuses?: Record<string, AgentStatus>
}

const CrewConsole: React.FC<CrewConsoleProps> = ({ feed, initialStatuses = {} }) => {
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>(initialStatuses)

  // Optional live feed integration
  useEffect(() => {
    if (!feed) return
    ;(async () => {
      for await (const update of feed) {
        setStatuses((s) => ({ ...s, [update.id]: update }))
      }
    })()
  }, [feed])

  const agents = Object.keys(agentTheme) as AgentId[]

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
      <Text bold color="cyan">
        🎛️ Crew Console — live Claude agents
      </Text>
      <Text dimColor> </Text>
      {agents.map((id) => {
        const theme = agentTheme[id]
        const st = statuses[id] || { progress: 0, state: 'waiting' }
        const color = theme.color
        const barWidth = Math.round(st.progress / 5) // 20 blocks total
        const bar =
          chalk.hex(color)('▓'.repeat(barWidth)) + chalk.hex('#444')('░'.repeat(20 - barWidth))
        const stateIcon = {
          waiting: '⏳',
          running: '🌀',
          done: '✅',
          error: '❌',
        }[st.state]

        return (
          <Box key={id}>
            <Text>
              {chalk.hex(color)(`${theme.emoji} ${theme.label.padEnd(22)} `)}
              {bar} {stateIcon} {st.message ? `– ${st.message}` : ''}
            </Text>
          </Box>
        )
      })}
    </Box>
  )
}

// ──────────────────────────────────────────────
//  Demo runner (standalone mode)
// ──────────────────────────────────────────────
async function* createDemoFeed(): AsyncGenerator<AgentStatus> {
  const ids = Object.keys(agentTheme) as AgentId[]

  // Phase 1: Flow Architect scaffolding
  yield { id: 'orchestrator', progress: 10, state: 'running', message: 'Decomposing task...' }
  await sleep(500)
  yield { id: 'orchestrator', progress: 20, state: 'done', message: 'Task plan ready' }

  yield { id: 'flow_architect', progress: 0, state: 'running', message: 'Reading BaseWorkflow.tsx' }
  await sleep(800)
  yield {
    id: 'flow_architect',
    progress: 30,
    state: 'running',
    message: 'Creating SharedWorkspace.tsx',
  }
  await sleep(1000)
  yield {
    id: 'flow_architect',
    progress: 60,
    state: 'running',
    message: 'Building workspaceStore.ts',
  }
  await sleep(1200)
  yield { id: 'flow_architect', progress: 90, state: 'running', message: 'Creating tab components' }
  await sleep(800)
  yield { id: 'flow_architect', progress: 100, state: 'done', message: 'Scaffold complete ✓' }

  // Phase 2: Experience Composer
  await sleep(500)
  yield {
    id: 'experience_composer',
    progress: 0,
    state: 'running',
    message: 'Analyzing user flows',
  }
  await sleep(1000)
  yield {
    id: 'experience_composer',
    progress: 40,
    state: 'running',
    message: 'Simplifying PlanTab layout',
  }
  await sleep(1200)
  yield {
    id: 'experience_composer',
    progress: 70,
    state: 'running',
    message: 'Adding progressive hints',
  }
  await sleep(800)
  yield { id: 'experience_composer', progress: 100, state: 'done', message: 'UX optimized ✓' }

  // Phase 3: Motion Choreographer
  await sleep(500)
  yield {
    id: 'motion_choreographer',
    progress: 0,
    state: 'running',
    message: 'Creating motion library',
  }
  await sleep(1000)
  yield {
    id: 'motion_choreographer',
    progress: 50,
    state: 'running',
    message: 'Building StudioTransition.tsx',
  }
  await sleep(1000)
  yield { id: 'motion_choreographer', progress: 100, state: 'done', message: 'Animations wired ✓' }

  // Phase 4: Sound Director
  await sleep(500)
  yield { id: 'sound_director', progress: 0, state: 'running', message: 'Scanning sound assets' }
  await sleep(1000)
  yield { id: 'sound_director', progress: 60, state: 'running', message: 'Implementing crossfades' }
  await sleep(1000)
  yield { id: 'sound_director', progress: 100, state: 'done', message: 'Audio layer complete ✓' }

  // Phase 5: Aesthetic Curator
  await sleep(500)
  yield {
    id: 'aesthetic_curator',
    progress: 0,
    state: 'running',
    message: 'Auditing design tokens',
  }
  await sleep(1000)
  yield {
    id: 'aesthetic_curator',
    progress: 50,
    state: 'running',
    message: 'Creating StudioPicker.tsx',
  }
  await sleep(1000)
  yield { id: 'aesthetic_curator', progress: 100, state: 'done', message: 'Style guide ready ✓' }

  // Final summary
  await sleep(500)
  yield { id: 'orchestrator', progress: 100, state: 'done', message: 'All stages complete 🚀' }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ──────────────────────────────────────────────
//  Main entry point
// ──────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const demoFeed = createDemoFeed()
  render(<CrewConsole feed={demoFeed} />)
}

export default CrewConsole
export { agentTheme }
