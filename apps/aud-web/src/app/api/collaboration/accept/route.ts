/**
 * Collaboration Accept API
 *
 * Stage 8: Studio Personalisation & Collaboration
 * Handles accepting campaign collaboration invites.
 *
 * POST /api/collaboration/accept
 * Body: { invite_token: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getSupabaseClient,
  type CollaborationInvite,
  type CampaignCollaborator,
  type Campaign,
} from '@/lib/supabaseClient'

/**
 * POST /api/collaboration/accept
 * Accept invitation and add user as collaborator
 *
 * Body:
 * {
 *   invite_token: string
 * }
 *
 * Returns:
 * {
 *   campaign_id: string
 *   campaign_title: string
 *   role: 'editor' | 'viewer'
 * }
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseClient()

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { invite_token } = body

    if (!invite_token) {
      return NextResponse.json({ error: 'Missing required field: invite_token' }, { status: 400 })
    }

    // Find invite by token
    const { data: invite, error: inviteError } = (await supabase
      .from('collaboration_invites')
      .select('*')
      .eq('invite_token', invite_token)
      .single()) as { data: CollaborationInvite | null; error: any }

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or expired invite token' }, { status: 404 })
    }

    // Check if invite has expired
    const now = new Date()
    const expiresAt = new Date(invite.expires_at)

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 410 } // 410 Gone
      )
    }

    // Check if invite has already been accepted
    if (invite.accepted_at) {
      return NextResponse.json({ error: 'Invite has already been accepted' }, { status: 409 })
    }

    // Verify user's email matches invited email
    if (user.email !== invite.invited_email) {
      return NextResponse.json(
        { error: 'This invite was sent to a different email address' },
        { status: 403 }
      )
    }

    // Check if user is already a collaborator
    const { data: existingCollab } = (await supabase
      .from('campaign_collaborators')
      .select('id, role')
      .eq('campaign_id', invite.campaign_id)
      .eq('user_id', user.id)
      .maybeSingle()) as { data: Pick<CampaignCollaborator, 'id' | 'role'> | null; error: any }

    if (existingCollab) {
      // Update invite as accepted anyway
      await (supabase
        .from('collaboration_invites')
        // @ts-expect-error - Supabase type inference limitation
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id) as unknown as Promise<{ error: any }>)

      // Get campaign details
      const { data: campaign } = (await supabase
        .from('campaigns')
        .select('title')
        .eq('id', invite.campaign_id)
        .single()) as { data: Pick<Campaign, 'title'> | null; error: any }

      return NextResponse.json(
        {
          campaign_id: invite.campaign_id,
          campaign_title: campaign?.title || 'Untitled Campaign',
          role: existingCollab.role,
          message: 'You are already a collaborator on this campaign',
        },
        { status: 200 }
      )
    }
    // @ts-expect-error - Supabase type inference limitation

    // Add user as collaborator
    const { error: collabError } = (await supabase.from('campaign_collaborators').insert({
      campaign_id: invite.campaign_id,
      user_id: user.id,
      role: invite.role,
      invited_by: invite.invited_by,
    })) as { error: any }

    if (collabError) {
      console.error('[Accept API] Error adding collaborator:', collabError)
      return NextResponse.json({ error: 'Failed to add collaborator' }, { status: 500 })
    }

    // Mark invite as accepted
    const { error: updateError } = (await supabase
      .from('collaboration_invites')
      // @ts-expect-error - Supabase type inference limitation
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)) as { error: any }

    if (updateError) {
      console.error('[Accept API] Error updating invite:', updateError)
      // Don't fail the request - collaborator was added successfully
    }

    // Get campaign details
    const { data: campaign } = (await supabase
      .from('campaigns')
      .select('title')
      .eq('id', invite.campaign_id)
      .single()) as { data: Pick<Campaign, 'title'> | null; error: any }

    return NextResponse.json(
      {
        campaign_id: invite.campaign_id,
        campaign_title: campaign?.title || 'Untitled Campaign',
        role: invite.role,
        message: 'Successfully joined campaign',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Accept API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
