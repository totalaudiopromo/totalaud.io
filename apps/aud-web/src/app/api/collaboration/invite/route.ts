/**
 * Collaboration Invite API
 *
 * Stage 8: Studio Personalisation & Collaboration
 * Handles invitation creation and acceptance for campaign collaboration.
 *
 * Endpoints:
 * - POST /api/collaboration/invite - Create invite
 * - POST /api/collaboration/accept - Accept invite
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { randomBytes } from 'crypto'

/**
 * Generate secure random invite token
 * 32 bytes = 256 bits of entropy
 * Base64URL encoding (URL-safe)
 */
function generateInviteToken(): string {
  return randomBytes(32)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 32)
}

/**
 * POST /api/collaboration/invite
 * Create invitation for campaign collaborator
 *
 * Body:
 * {
 *   campaign_id: string
 *   invited_email: string
 *   role: 'editor' | 'viewer'
 * }
 *
 * Returns:
 * {
 *   invite_token: string
 *   invite_url: string
 *   expires_at: string
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
    const { campaign_id, invited_email, role } = body

    // Validate inputs
    if (!campaign_id || !invited_email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: campaign_id, invited_email, role' },
        { status: 400 }
      )
    }

    if (!['editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "editor" or "viewer"' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(invited_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user is campaign owner
    const { data: collaborator, error: collabError } = await supabase
      .from('campaign_collaborators')
      .select('role')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user.id)
      .single()

    if (collabError || !collaborator || collaborator.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only campaign owners can invite collaborators' },
        { status: 403 }
      )
    }

    // Check if campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Check if user is already a collaborator
    const { data: existingCollab } = await supabase
      .from('campaign_collaborators')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingCollab) {
      return NextResponse.json(
        { error: 'User is already a collaborator on this campaign' },
        { status: 409 }
      )
    }

    // Check if there's already a pending invite for this email
    const { data: existingInvite } = await supabase
      .from('collaboration_invites')
      .select('id, expires_at')
      .eq('campaign_id', campaign_id)
      .eq('invited_email', invited_email)
      .is('accepted_at', null)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle()

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invite for this email is already pending' },
        { status: 409 }
      )
    }

    // Generate invite token
    const invite_token = generateInviteToken()
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create invite record
    const { data: invite, error: inviteError } = await supabase
      .from('collaboration_invites')
      .insert({
        campaign_id,
        invited_email,
        role,
        invite_token,
        invited_by: user.id,
        expires_at: expires_at.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      console.error('[Invite API] Error creating invite:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      )
    }

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const invite_url = `${baseUrl}/console/invite/${invite_token}`

    return NextResponse.json(
      {
        invite_token,
        invite_url,
        expires_at: expires_at.toISOString(),
        campaign_title: campaign.title,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Invite API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
