/**
 * DELETE /api/tokens/:tokenId — revoke a personal access token.
 * Revocation is immediate; the MCP endpoint refuses revoked tokens.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { logger } from '@/lib/logger'

const log = logger.scope('TokenRevokeRoute')

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const { tokenId } = await params

  const { data, error } = await auth.supabase
    .from('user_api_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', tokenId)
    .eq('user_id', auth.user.id)
    .is('revoked_at', null)
    .select('id')
    .maybeSingle()

  if (error) {
    log.error('Token revoke failed', error)
    return NextResponse.json({ error: 'Could not revoke the token' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  log.info('Token revoked', { userId: auth.user.id, tokenId })
  return NextResponse.json({ revoked: true })
}
