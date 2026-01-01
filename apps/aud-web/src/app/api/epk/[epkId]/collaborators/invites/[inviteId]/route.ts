import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('EpkInviteAPI')

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ epkId: string; inviteId: string }> }
) {
  try {
    const { epkId, inviteId } = await params

    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      return auth
    }

    const { supabase, session } = auth

    const campaignId = epkId

    const { data: ownerRecord, error: roleError } = await supabase
      .from('campaign_collaborators')
      .select('role')
      .eq('campaign_id', campaignId)
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (roleError) {
      log.error('Failed to resolve collaborator role', { error: roleError })
      return NextResponse.json({ error: 'Failed to resolve collaborator role' }, { status: 500 })
    }

    if (!ownerRecord || ownerRecord.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can revoke invites' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('collaboration_invites')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('id', inviteId)

    if (deleteError) {
      log.error('Failed to revoke invite', { error: deleteError })
      return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Unexpected invite deletion error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
