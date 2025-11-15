import { skillRegistry } from './registry'
import type { AgentContext, AgentExecutionResult } from './types'

/**
 * Agent Skill Runtime
 *
 * Executes registered skills with validation, logging, and error handling.
 */

/**
 * Run a skill by ID
 */
export async function runSkill<TOutput = unknown>(
  skillId: string,
  input: unknown,
  context: AgentContext
): Promise<AgentExecutionResult<TOutput>> {
  const logs: string[] = []
  const startTime = Date.now()

  try {
    // Get skill from registry
    const skill = skillRegistry.getSkillById(skillId)
    if (!skill) {
      throw new Error(`Skill "${skillId}" not found or disabled`)
    }

    logs.push(`Starting skill: ${skill.name}`)

    // Validate input
    let validatedInput: unknown
    try {
      validatedInput = skill.inputSchema.parse(input)
      logs.push('Input validation passed')
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Input validation failed: ${error.message}`)
      }
      throw new Error('Input validation failed')
    }

    // Execute skill
    logs.push(`Executing skill...`)
    const output = await skill.run(validatedInput, context)

    // Validate output
    let validatedOutput: TOutput
    try {
      validatedOutput = skill.outputSchema.parse(output) as TOutput
      logs.push('Output validation passed')
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Output validation failed: ${error.message}`)
      }
      throw new Error('Output validation failed')
    }

    const duration = Date.now() - startTime
    logs.push(`Skill completed in ${duration}ms`)

    return {
      success: true,
      data: validatedOutput,
      logs,
      duration,
      metadata: {
        skillId,
        timestamp: new Date().toISOString(),
        userId: context.userId,
      },
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logs.push(`Error: ${errorMessage}`)

    return {
      success: false,
      error: errorMessage,
      logs,
      duration,
      metadata: {
        skillId,
        timestamp: new Date().toISOString(),
        userId: context.userId,
      },
    }
  }
}

/**
 * Run multiple skills in sequence
 */
export async function runSkillSequence(
  skillIds: string[],
  inputs: unknown[],
  context: AgentContext
): Promise<AgentExecutionResult[]> {
  if (skillIds.length !== inputs.length) {
    throw new Error('Number of skill IDs must match number of inputs')
  }

  const results: AgentExecutionResult[] = []

  for (let i = 0; i < skillIds.length; i++) {
    const result = await runSkill(skillIds[i], inputs[i], context)
    results.push(result)

    // Stop if a skill fails
    if (!result.success) {
      break
    }
  }

  return results
}

/**
 * Estimate skill execution time and cost
 */
export function estimateSkillExecution(skillId: string): {
  duration?: number
  cost?: { tokens?: number; credits?: number }
} | null {
  const skill = skillRegistry.getSkillById(skillId)
  if (!skill) return null

  return {
    duration: skill.estimatedDuration,
    cost: skill.costEstimate,
  }
}
