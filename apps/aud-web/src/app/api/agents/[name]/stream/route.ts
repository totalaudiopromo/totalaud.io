import { runAgentWorkflow } from "@total-audio/core-agent-executor"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function POST(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // TODO: Replace with real auth
        const userId = "demo-user-id"
        const { steps, initialInput } = await req.json()

        // Send start event
        controller.enqueue(
          encoder.encode(
            `event: start\ndata: ${JSON.stringify({ agent: params.name, status: "started" })}\n\n`
          )
        )

        // Run workflow with callbacks
        const result = await runAgentWorkflow(
          params.name,
          userId,
          steps,
          initialInput || {},
          {
            onStep: (stepUpdate) => {
              // Send step update event
              controller.enqueue(
                encoder.encode(
                  `event: update\ndata: ${JSON.stringify(stepUpdate)}\n\n`
                )
              )
            },
            onComplete: (finalResult) => {
              // Send complete event
              controller.enqueue(
                encoder.encode(
                  `event: complete\ndata: ${JSON.stringify(finalResult)}\n\n`
                )
              )
            },
            onError: (error) => {
              // Send error event
              controller.enqueue(
                encoder.encode(
                  `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`
                )
              )
            }
          }
        )

        // Final complete event (in case onComplete wasn't called)
        controller.enqueue(
          encoder.encode(
            `event: complete\ndata: ${JSON.stringify(result)}\n\n`
          )
        )

      } catch (error) {
        // Send error event
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ 
              message: error instanceof Error ? error.message : "Unknown error"
            })}\n\n`
          )
        )
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no" // Disable buffering for nginx
    }
  })
}

