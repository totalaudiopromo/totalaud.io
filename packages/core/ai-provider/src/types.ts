export type AIProvider = 'openai' | 'anthropic' | 'custom'

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface AICompletionResult {
  content: string
  tokens_used: number
  cost_usd: number
  model: string
}

