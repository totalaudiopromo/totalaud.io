import { executeSkill } from '@total-audio/core-skills-engine'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@total-audio/core-logger'
import {
  validateRequestBody,
  ValidationError,
  validationErrorResponse,
} from '@aud-web/lib/api-validation'

const log = logger.scope('SkillsInvokeAPI')

// Schema for skill invocation input
const skillInvokeSchema = z.object({
  input: z.record(z.unknown()),
  session_id: z.string().uuid().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const validatedBody = await validateRequestBody(request, skillInvokeSchema)
    const resolvedParams = await params

    // TODO: Replace with real auth once Supabase is configured
    // For now, use a demo user ID for testing
    const authHeader = request.headers.get('Authorization')
    const userId = authHeader === 'Bearer demo-token' ? 'demo-user-id' : 'anonymous'

    log.info('Executing skill', {
      skillName: resolvedParams.name,
      userId,
      sessionId: validatedBody.session_id,
    })

    const result = await executeSkill(resolvedParams.name, validatedBody.input, userId)

    log.info('Skill executed successfully', {
      skillName: resolvedParams.name,
      success: result.success,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error)
    }

    log.error('Skill execution error', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
