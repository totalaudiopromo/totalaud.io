import type { AIMessage, AICompletionOptions, AICompletionResult, AIProvider } from './types'
import { completeWithOpenAI } from './openai'
import { completeWithAnthropic } from './anthropic'

export * from './types'
export * from './openai'
export * from './anthropic'

export async function complete(
  provider: AIProvider,
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  switch (provider) {
    case 'openai':
      return completeWithOpenAI(messages, options)
    case 'anthropic':
      return completeWithAnthropic(messages, options)
    case 'custom':
      throw new Error('Custom provider not yet implemented')
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

