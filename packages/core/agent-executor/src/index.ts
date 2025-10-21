export * from './types'
export * from './messaging'

// Server-safe exports (no React hooks)
export * from './personas/broker'
export * from './personas/brokerPersonalityRegistry'
export * from './config/goalToFlowMap'
export * from './config/agentRoles'

// Client-only exports (React hooks) - COMMENTED OUT to prevent server-side bundling
// Import these directly when needed in client components:
// e.g., import { useBrokerMemory } from '@total-audio/core-agent-executor/src/hooks/useBrokerMemory'
// export * from './hooks/types'
// export * from './hooks/useBrokerMemory'
// export * from './hooks/useBrokerMemoryLocal'
// export * from './hooks/useAgentExecution'
// export * from './hooks/useCommandBridge'

// Server-only exports (use Node.js APIs) - import from '@total-audio/core-agent-executor/server'
// export * from './orchestrator'
// export * from './agents/trackerAgent'
// export * from './agents/coachAgent'
// export * from './agents/insightAgent'
