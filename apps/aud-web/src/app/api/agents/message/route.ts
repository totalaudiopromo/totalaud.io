import { sendAgentMessage } from '@total-audio/core-agent-executor'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    if (!body.from_agent || !body.to_agent || !body.content || !body.session_id) {
      return Response.json(
        { error: 'Missing required fields: from_agent, to_agent, content, session_id' },
        { status: 400 }
      )
    }

    // Send the message
    const data = await sendAgentMessage(body)

    return Response.json(data)
  } catch (error) {
    console.error('Error sending agent message:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send message',
      },
      { status: 500 }
    )
  }
}
