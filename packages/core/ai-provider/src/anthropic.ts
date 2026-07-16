import Anthropic from '@anthropic-ai/sdk'
import type { AIMessage, AICompletionOptions, AICompletionResult } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Default model is configurable via env so future model changes are a config
// edit, not a deploy. claude-sonnet-5 is the documented drop-in replacement
// for the retired claude-sonnet-4-20250514 (retired 15 June 2026).
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'

// USD per million tokens (input, output). Unknown models fall back to the
// Sonnet-tier rate so cost figures stay indicative rather than absent.
const PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5': { input: 3, output: 15 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-haiku-4-5': { input: 1, output: 5 },
}

function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING_PER_MTOK[model] ?? PRICING_PER_MTOK['claude-sonnet-5']
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output
}

export async function completeWithAnthropic(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const model = options.model || DEFAULT_MODEL

  // Extract system message
  const systemMessage = messages.find((m) => m.role === 'system')?.content || ''
  const conversationMessages = messages.filter((m) => m.role !== 'system')

  // Note: `temperature` is intentionally not forwarded. Current Claude models
  // (Sonnet 5 and newer) reject non-default sampling parameters with a 400.
  const completion = await anthropic.messages.create({
    model,
    system: systemMessage,
    messages: conversationMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    max_tokens: options.max_tokens ?? 2000,
  })

  const textBlock = completion.content.find((block) => block.type === 'text')
  const content = textBlock?.type === 'text' ? textBlock.text : ''

  const cost_usd = estimateCostUsd(
    model,
    completion.usage.input_tokens,
    completion.usage.output_tokens
  )

  return {
    content,
    tokens_used: completion.usage.input_tokens + completion.usage.output_tokens,
    cost_usd,
    model,
  }
}
