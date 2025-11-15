import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runSkill } from '@/agents-sdk/runtime'
import { registerBuiltInSkills } from '@/agents-sdk/skills'
import type { AgentContext } from '@/agents-sdk/types'

// Register skills on module load
registerBuiltInSkills()

const RunSkillRequestSchema = z.object({
  skillId: z.string(),
  input: z.record(z.unknown()),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skillId, input } = RunSkillRequestSchema.parse(body)

    // TODO: Get actual user ID from auth
    const userId = 'demo-user-id'

    const context: AgentContext = {
      userId,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    }

    const result = await runSkill(skillId, input, context)

    // TODO: Save to database via loopos-db package
    // await createAgentExecution(supabase, userId, {
    //   skill_id: skillId,
    //   input,
    //   output: result.data,
    //   success: result.success,
    //   error: result.error,
    //   duration_ms: result.duration,
    // })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Agent run error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
