'use client'

import type { OSSlug } from '@/components/os/navigation'

export type AgentRole = 'scout' | 'coach' | 'tracker' | 'insight' | 'custom'

export type AgentStatus = 'idle' | 'queued' | 'running' | 'done' | 'error'

// Extend core OSSlug with LoopOS without changing OSProvider types
export type AgentOriginOS = OSSlug | 'loopos'

export interface AgentRun {
  id: string
  role: AgentRole
  status: AgentStatus
  originOS: AgentOriginOS
  target?: {
    loopId?: string
    clipId?: string
    osSlug?: AgentOriginOS
  }
  input: string
  output?: string
  errorMessage?: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
  meta?: {
    teamRunId?: string
    teamId?: string
    teamStepIndex?: number
    personaId?: string | null
    companionId?: string | null
  }
}

export interface AgentKernelState {
  runs: AgentRun[]
  activeRunId: string | null
}

export interface SpawnAgentRunParams {
  role: AgentRole
  originOS: AgentOriginOS
  target?: { loopId?: string; clipId?: string; osSlug?: AgentOriginOS }
  input: string
  meta?: AgentRun['meta']
}

export interface AgentKernelActions {
  spawnAgentRun(params: SpawnAgentRunParams): Promise<{ id: string; output?: string | null } | null>
  setActiveRun(id: string | null): void
  updateRun(id: string, patch: Partial<AgentRun>): void
  clearCompletedRuns(): void
}

export type AgentKernelContextValue = AgentKernelState & AgentKernelActions
