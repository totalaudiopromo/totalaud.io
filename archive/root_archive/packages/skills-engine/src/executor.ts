import { complete } from '@total-audio/core-ai-provider'
import { supabase } from '@total-audio/core-supabase'
import { skillRegistry } from './registry'
import type { SkillExecutionContext, SkillExecutionResult } from './types'

export async function executeSkill(
  skillName: string,
  input: Record<string, any>,
  userId: string,
  sessionId?: string
): Promise<SkillExecutionResult> {
  const startTime = Date.now()
  const executionId = crypto.randomUUID()

  // Initialize registry if needed
  await skillRegistry.initialize()

  // Get skill definition
  const skill = skillRegistry.get(skillName)
  if (!skill) {
    throw new Error(`Skill not found: ${skillName}`)
  }

  if (!skill.enabled) {
    throw new Error(`Skill is disabled: ${skillName}`)
  }

  try {
    let output: Record<string, any>
    let tokens_used = 0
    let cost_usd = 0

    if (skill.provider === 'custom') {
      // Custom logic - implement based on skill name
      output = await executeCustomSkill(skillName, input)
    } else {
      // AI-powered skill
      const messages = [
        {
          role: 'system' as const,
          content: `You are executing the "${skill.name}" skill. ${skill.description}\n\nReturn your response as valid JSON matching this schema: ${JSON.stringify(skill.output)}`,
        },
        {
          role: 'user' as const,
          content: JSON.stringify(input),
        },
      ]

      const result = await complete(skill.provider, messages, {
        model: skill.model,
        temperature: 0.7,
        max_tokens: 2000,
      })

      output = JSON.parse(result.content)
      tokens_used = result.tokens_used
      cost_usd = result.cost_usd
    }

    const duration_ms = Date.now() - startTime

    // Log execution
    await supabase.from('skill_executions').insert({
      id: executionId,
      skill_name: skillName,
      input,
      output,
      duration_ms,
      tokens_used,
      cost_usd,
      status: 'success',
      user_id: userId,
      agent_session_id: sessionId,
      completed_at: new Date().toISOString(),
    })

    return {
      output,
      tokens_used,
      cost_usd,
      duration_ms,
    }
  } catch (error) {
    const duration_ms = Date.now() - startTime

    // Log error
    await supabase.from('skill_executions').insert({
      id: executionId,
      skill_name: skillName,
      input,
      duration_ms,
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      user_id: userId,
      agent_session_id: sessionId,
      completed_at: new Date().toISOString(),
    })

    throw error
  }
}

async function executeCustomSkill(
  skillName: string,
  input: Record<string, any>
): Promise<Record<string, any>> {
  // Import custom skill implementations
  const { researchContactsCustom } = await import('./custom/researchContacts')

  switch (skillName) {
    case 'research-contacts':
      return researchContactsCustom(input as any)
    default:
      throw new Error(`Custom skill not implemented: ${skillName}`)
  }
}
