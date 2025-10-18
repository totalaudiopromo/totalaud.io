import Anthropic from '@anthropic-ai/sdk'
import type { AIMessage, AICompletionOptions, AICompletionResult } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function completeWithAnthropic(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const model = options.model || 'claude-sonnet-4-20250514'
  
  // Extract system message
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const conversationMessages = messages.filter(m => m.role !== 'system')

  const completion = await anthropic.messages.create({
    model,
    system: systemMessage,
    messages: conversationMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000
  })

  const content = completion.content[0].type === 'text' 
    ? completion.content[0].text 
    : ''

  // Rough cost calculation (update with real pricing)
  const inputCost = (completion.usage.input_tokens / 1000) * 0.003
  const outputCost = (completion.usage.output_tokens / 1000) * 0.015
  const cost_usd = inputCost + outputCost

  return {
    content,
    tokens_used: completion.usage.input_tokens + completion.usage.output_tokens,
    cost_usd,
    model
  }
}

