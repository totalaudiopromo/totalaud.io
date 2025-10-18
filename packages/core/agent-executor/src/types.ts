export interface AgentStep {
  skill: string
  description: string
  input: Record<string, any>
}

export interface AgentStepUpdate {
  step_number: number
  skill: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: Record<string, any>
  error?: string
  duration_ms?: number
}

export interface AgentWorkflowResult {
  sessionId: string
  outputs: Record<string, any>[]
  duration_ms: number
  status: 'completed' | 'failed'
}

export interface AgentWorkflowCallbacks {
  onStep?: (update: AgentStepUpdate) => void
  onComplete?: (result: AgentWorkflowResult) => void
  onError?: (error: Error) => void
}

export interface AgentConfig {
  name: string
  description: string
  systemPrompt?: string
  availableSkills: string[]
  avatar_emoji?: string
  color?: string
}

