export interface AgentStep {
  skill: string
  description: string
  input: Record<string, any>
}

export interface AgentWorkflowResult {
  sessionId: string
  outputs: Record<string, any>[]
  duration_ms: number
  status: 'completed' | 'failed'
}

export interface AgentConfig {
  name: string
  description: string
  systemPrompt?: string
  availableSkills: string[]
}

