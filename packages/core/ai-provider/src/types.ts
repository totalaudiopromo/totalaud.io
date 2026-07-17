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
  /**
   * Extended-thinking control. Sonnet 5 and newer enable thinking by default,
   * and those tokens count against `max_tokens` — which silently truncates
   * bounded outputs (e.g. structured JSON). Set to 'disabled' for calls that
   * need deterministic, budget-bounded responses.
   */
  thinking?: 'enabled' | 'disabled'
}

export interface AICompletionResult {
  content: string
  tokens_used: number
  cost_usd: number
  model: string
}
