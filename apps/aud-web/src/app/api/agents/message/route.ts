import { sendAgentMessage } from '@total-audio/core-agent-executor'
import { logger } from '@total-audio/core-logger'
import { createApiHandler, commonSchemas } from '@aud-web/lib/api-validation'

const log = logger.scope('AgentsMessageAPI')

export const POST = createApiHandler({
  bodySchema: commonSchemas.agentMessage,
  handler: async ({ body }) => {
    log.info('Sending agent message', {
      from: body!.from_agent,
      to: body!.to_agent,
      sessionId: body!.session_id,
    })

    const data = await sendAgentMessage(body!)

    log.info('Agent message sent successfully', { messageId: data.id })

    return data
  },
})
