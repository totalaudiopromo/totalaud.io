import { NextRequest, NextResponse } from 'next/server'
import { executeAgent, AgentInputSchema } from '@/agents/AgentExecutor'

/**
 * POST /api/ai/run-agent
 * Execute a specific AI agent
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validatedInput = AgentInputSchema.parse(body)

    // Execute the agent
    const output = await executeAgent(validatedInput)

    return NextResponse.json({ output }, { status: 200 })
  } catch (error) {
    console.error('Error running agent:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to execute agent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
