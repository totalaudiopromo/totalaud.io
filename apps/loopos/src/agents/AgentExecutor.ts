import type { AgentInput, AgentOutput, AgentType } from './types'
import { AgentOutputSchema } from './types'
import { buildAgentPrompt } from './prompts'

/**
 * Execute an AI agent using Anthropic Claude API
 */
export async function runAgent(
  agentType: AgentType,
  context: string,
  additionalData?: Record<string, unknown>
): Promise<AgentOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  // Build the prompt
  const prompt = buildAgentPrompt(agentType, context, additionalData)

  try {
    // Call Claude API using fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `Anthropic API error: ${response.status} - ${JSON.stringify(errorData)}`
      )
    }

    const data = await response.json()

    // Extract the text content from Claude's response
    const textContent = data.content?.[0]?.text

    if (!textContent) {
      throw new Error('No text content in Claude response')
    }

    // Parse the JSON response
    let parsedOutput: unknown
    try {
      parsedOutput = JSON.parse(textContent)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent)
      throw new Error('Claude response was not valid JSON')
    }

    // Validate against schema
    const validatedOutput = AgentOutputSchema.parse(parsedOutput)

    return validatedOutput
  } catch (error) {
    console.error(`Error running ${agentType} agent:`, error)
    throw error
  }
}

/**
 * Execute an agent with structured input
 */
export async function executeAgent(input: AgentInput): Promise<AgentOutput> {
  return runAgent(input.agentType, input.context, input.additionalData)
}

/**
 * Execute multiple agents in parallel
 */
export async function executeAgents(
  inputs: AgentInput[]
): Promise<AgentOutput[]> {
  return Promise.all(inputs.map((input) => executeAgent(input)))
}
