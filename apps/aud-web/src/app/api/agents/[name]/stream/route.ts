import { runAgentWorkflow } from '@total-audio/core-agent-executor/server'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('AgentStreamAPI')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // Prevent static analysis during build

const agentStreamSchema = z.object({
  steps: z.array(z.record(z.unknown())).min(1, 'At least one step is required'),
  initialInput: z.record(z.unknown()).optional().default({}),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // TODO: Replace with real auth
        const userId = 'demo-user-id'

        const body = await req.json()
        const validated = agentStreamSchema.parse(body)
        const { steps, initialInput } = validated
        const resolvedParams = await params

        log.info('Starting agent workflow stream', {
          agentName: resolvedParams.name,
          userId,
          stepCount: steps.length
        })

        // Send start event
        controller.enqueue(
          encoder.encode(
            `event: start\ndata: ${JSON.stringify({ agent: resolvedParams.name, status: 'started' })}\n\n`
          )
        )

        // Run workflow with callbacks
        const result = await runAgentWorkflow(
          resolvedParams.name,
          userId,
          steps,
          initialInput,
          {
            onStep: (stepUpdate) => {
              log.debug('Workflow step update', { agentName: resolvedParams.name, step: stepUpdate })
              // Send step update event
              controller.enqueue(
                encoder.encode(`event: update\ndata: ${JSON.stringify(stepUpdate)}\n\n`)
              )
            },
            onComplete: (finalResult) => {
              log.info('Workflow completed', { agentName: resolvedParams.name, success: finalResult.success })
              // Send complete event
              controller.enqueue(
                encoder.encode(`event: complete\ndata: ${JSON.stringify(finalResult)}\n\n`)
              )
            },
            onError: (error) => {
              log.error('Workflow error', error, { agentName: resolvedParams.name })
              // Send error event
              controller.enqueue(
                encoder.encode(
                  `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`
                )
              )
            },
          }
        )

        // Final complete event (in case onComplete wasn't called)
        controller.enqueue(encoder.encode(`event: complete\ndata: ${JSON.stringify(result)}\n\n`))
      } catch (error) {
        log.error('Agent stream error', error)
        // Send error event
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({
              message: error instanceof Error ? error.message : 'Unknown error',
            })}\n\n`
          )
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    },
  })
}
