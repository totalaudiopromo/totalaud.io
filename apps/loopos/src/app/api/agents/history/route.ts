import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // TODO: Get actual user ID from auth
    // const userId = 'demo-user-id'

    // TODO: Fetch from database
    // const executions = await getAgentExecutions(supabase, userId, { limit: 50 })
    // const stats = await getAgentExecutionStats(supabase, userId)

    // Mock data for now
    const executions = []
    const stats = {
      total: 0,
      successful: 0,
      failed: 0,
      avgDurationMs: 0,
    }

    return NextResponse.json({ executions, stats })
  } catch (error) {
    console.error('Agent history error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
