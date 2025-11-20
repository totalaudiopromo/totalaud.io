import OpenAI from 'openai'
import type { AIMessage, AICompletionOptions, AICompletionResult } from './types'

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing or empty. Set it in your environment to use the OpenAI provider.'
    )
  }

  return new OpenAI({
    apiKey,
  })
}

export async function completeWithOpenAI(
  messages: AIMessage[],
  options: AICompletionOptions = {}
): Promise<AICompletionResult> {
  const model = options.model || 'gpt-4o'
  const openai = getOpenAIClient()

  const completion = await openai.chat.completions.create({
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
