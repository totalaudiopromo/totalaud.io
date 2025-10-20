/**
 * Coach Send Endpoint
 *
 * POST /api/coach/send
 * Body: { draftId: string, customBody?: string }
 *
 * Sends a follow-up email draft via Gmail API.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidAccessToken } from '@/lib/oauth'
import { createGmailClient } from '@total-audio/core-integrations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { draftId, customBody } = body as {
      draftId: string
      customBody?: string
    }

    if (!draftId) {
      return NextResponse.json({ error: 'Draft ID is required' }, { status: 400 })
    }

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get draft from database
    const { data: draft, error: draftError } = await supabase
      .from('coach_drafts')
      .select('*')
      .eq('id', draftId)
      .eq('user_id', user.id)
      .single()

    if (draftError || !draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    const draftRecord = draft as any

    // Check if already sent
    if (draftRecord.status === 'sent') {
      return NextResponse.json({ error: 'Draft already sent' }, { status: 400 })
    }

    // Get valid Gmail access token
    const accessToken = await getValidAccessToken(supabase as any, user.id, 'gmail')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Gmail not connected. Please connect Gmail first.' },
        { status: 400 }
      )
    }

    // Create Gmail client
    const gmail = createGmailClient(accessToken)

    // Send follow-up email
    const emailBody = customBody || draftRecord.body
    const { messageId, threadId } = await gmail.sendFollowUp({
      threadId: draftRecord.thread_id,
      to: draftRecord.contact_email,
      subject: draftRecord.subject,
      body: emailBody,
    })

    // Update draft status
    await supabase
      .from('coach_drafts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        body: emailBody, // Save the final sent version
        metadata: {
          ...draftRecord.metadata,
          message_id: messageId,
          sent_thread_id: threadId,
        },
      } as any)
      .eq('id', draftId)

    // Update gmail_tracked_emails to mark as followed up
    await supabase
      .from('gmail_tracked_emails')
      .update({
        metadata: {
          followed_up: true,
          follow_up_sent_at: new Date().toISOString(),
        },
      } as any)
      .eq('thread_id', draftRecord.thread_id)
      .eq('user_id', user.id)

    // Update campaign metrics
    if (draftRecord.session_id) {
      await supabase.from('campaign_results').insert({
        session_id: draftRecord.session_id,
        agent_name: 'coach',
        metric_key: 'follow_ups_sent',
        metric_value: 1,
        metric_label: 'Follow-Ups Sent',
        metric_unit: 'emails',
        metadata: {
          contact_email: draftRecord.contact_email,
          thread_id: threadId,
        },
      } as any)
    }

    return NextResponse.json({
      success: true,
      message: `Follow-up sent to ${draftRecord.contact_email}`,
      messageId,
      threadId,
    })
  } catch (error) {
    console.error('[Coach Send] Error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send email'

    return NextResponse.json(
      {
        success: false,
        error: message,
        message: `Failed to send follow-up: ${message}`,
      },
      { status: 500 }
    )
  }
}
