/**
 * /api/integrations/gmail/status
 *
 * GET — is Gmail configured on this deployment, and has this artist
 * connected their inbox? Returns the connected address only, never tokens.
 * DELETE — disconnect (removes the stored tokens).
 */

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import {
  deleteGmailConnection,
  getGmailConnection,
  isGmailConfigured,
} from '@/lib/integrations/gmail'
import { logger } from '@/lib/logger'

const log = logger.scope('GmailStatusRoute')

export async function GET(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  if (!isGmailConfigured()) {
    return NextResponse.json({ configured: false, connected: false })
  }

  const connection = await getGmailConnection(auth.user.id)
  return NextResponse.json({
    configured: true,
    connected: !!connection,
    email: connection?.email ?? null,
  })
}

export async function DELETE(): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  try {
    await deleteGmailConnection(auth.user.id)
    return NextResponse.json({ connected: false })
  } catch (error) {
    log.error('Gmail disconnect failed', error instanceof Error ? error : undefined)
    return NextResponse.json({ error: 'Could not disconnect Gmail' }, { status: 500 })
  }
}
