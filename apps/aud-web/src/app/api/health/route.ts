import { NextResponse } from 'next/server'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('HealthAPI')

export async function GET() {
  log.debug('Health check requested')

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'aud-web',
  })
}
