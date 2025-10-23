import { supabase } from '@total-audio/core-supabase'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@total-audio/core-logger'
import {
  createApiHandler,
  commonSchemas,
  ValidationError,
  validationErrorResponse,
} from '@aud-web/lib/api-validation'

const log = logger.scope('FlowsAPI')

// GET /api/flows - List all flows for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user-id'

    log.debug('Fetching flows for user', { userId })

    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    log.info('Flows fetched successfully', { count: data.length })

    return NextResponse.json({ flows: data })
  } catch (error) {
    log.error('Failed to fetch flows', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/flows - Create a new flow session
export const POST = createApiHandler({
  bodySchema: commonSchemas.flowCreate,
  handler: async ({ req, body }) => {
    const userId = req.headers.get('x-user-id') || 'demo-user-id'

    log.info('Creating new flow', { userId, flowName: body!.name })

    const { data, error } = await supabase
      .from('agent_sessions')
      .insert({
        agent_name: body!.agent_name,
        user_id: userId,
        name: body!.name,
        description: body!.description,
        initial_input: body!.initial_input,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      log.error('Failed to create flow', error, { userId })
      throw error
    }

    log.info('Flow created successfully', { flowId: data.id })

    return { flow: data }
  },
})
