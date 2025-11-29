/**
 * Server-Side Exports
 *
 * This file exports agents and utilities that require Node.js APIs
 * (googleapis, filesystem, etc.) and should only be imported in
 * server-side code (API routes, server components, etc.)
 */

// Re-export everything from index (client-safe)
export * from './index'

// Server-only agent exports (named exports to avoid type conflicts)
export { TrackerAgent, createTrackerAgent } from './agents/trackerAgent'
export type { TrackerAgentOptions, TrackerAgentResult, TrackerMetrics } from './agents/trackerAgent'

export { CoachAgent, createCoachAgent } from './agents/coachAgent'
export type { CoachAgentOptions, CoachAgentResult, CoachDraft } from './agents/coachAgent'

export { InsightAgent, createInsightAgent } from './agents/insightAgent'
export type { InsightAgentConfig, InsightAgentResult, Mixdown } from './agents/insightAgent'

// Re-export OSTheme type (used by server agents)
export type { OSTheme } from './agents/coachAgent'

export * from './orchestrator'
