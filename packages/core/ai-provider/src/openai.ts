import OpenAI from 'openai'
import type { AIMessage, AICompletionOptions, AICompletionResult } from './types'

// Lazy-load the OpenAI client to avoid build-time errors when OPENAI_API_KEY is not set
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export async function completeWithOpenAI(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const model = options.model || 'gpt-4o'

  const completion = await getOpenAIClient().chat.completions.create({
    model,
    messages: messages as any,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
  })

  const usage = completion.usage!
  const content = completion.choices[0].message.content || ''

  // Rough cost calculation (update with real pricing)
  const inputCost = (usage.prompt_tokens / 1000) * 0.01
  const outputCost = (usage.completion_tokens / 1000) * 0.03
  const cost_usd = inputCost + outputCost

  return {
    content,
    tokens_used: usage.total_tokens,
    cost_usd,
    model,
  }
}
