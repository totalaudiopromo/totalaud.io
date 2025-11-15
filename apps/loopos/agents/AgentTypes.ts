/**
 * AI Agent type definitions for LoopOS
 * This is scaffolding - no actual API calls yet
 */

export type AgentRole =
  | 'create' // Content creation (lyrics, melodies, ideas)
  | 'promote' // Marketing and promotion strategies
  | 'analyse' // Data analysis and insights
  | 'refine' // Feedback and improvement suggestions

export interface AgentPrompt {
  role: AgentRole
  context: string
  instruction: string
  constraints?: string[]
}

export interface AgentResponse {
  success: boolean
  output: string
  suggestions?: string[]
  error?: string
}

export interface AgentAction {
  id: string
  title: string
  role: AgentRole
  prompt: AgentPrompt
  status: 'pending' | 'running' | 'completed' | 'failed'
  response?: AgentResponse
  createdAt: number
  completedAt?: number
}
