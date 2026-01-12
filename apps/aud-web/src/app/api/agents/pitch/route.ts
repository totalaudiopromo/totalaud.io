/**
 * Pitch Agent API Route
 * Phase 15.2-C: Agent Integration Layer
 *
 * Purpose:
 * - Generate pitch content with asset attachments
 * - Respect privacy settings (no private assets in external shares)
 * - Log telemetry events for asset_attach_to_pitch
 *
 * POST /api/agents/pitch
 * Body: {
 *   goal: string
 *   context?: string
 *   attachments?: AssetAttachment[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import type { AssetAttachment } from '@/types/asset-attachment'
import { createRouteSupabaseClient } from '@aud-web/lib/supabase/server'

const log = logger.scope('PitchAgentAPI')

const assetAttachmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['audio', 'image', 'document', 'archive', 'link', 'other']),
  url: z.string(),
  is_public: z.boolean(),
  byte_size: z.number().optional(),
  mime_type: z.string().optional(),
  created_at: z.string().optional(),
})

const pitchRequestSchema = z.object({
  goal: z.string().min(1, 'Goal is required'),
  context: z.string().optional(),
  attachments: z.array(assetAttachmentSchema).optional(),
  sessionId: z.string().optional(),
  contactName: z.string().optional(),
  campaignId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const { goal, context, attachments, sessionId, contactName, campaignId } =
      pitchRequestSchema.parse(body)

    log.info('Pitch request received', {
      goal,
      hasContext: !!context,
      attachmentCount: attachments?.length || 0,
      sessionId,
      contactName,
      campaignId,
    })

    const supabase = await createRouteSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Failed to verify session', sessionError)
      return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const authenticatedUserId = session.user.id

    // Filter out private attachments for external shares
    const publicAttachments = attachments?.filter((a) => a.is_public) || []

    // Warn if private assets were filtered
    if (attachments && publicAttachments.length < attachments.length) {
      const filteredCount = attachments.length - publicAttachments.length
      log.warn('Private assets filtered from pitch', {
        total: attachments.length,
        filtered: filteredCount,
        public: publicAttachments.length,
      })
    }

    // Build pitch context with asset information
    const assetContext =
      publicAttachments.length > 0
        ? `\n\nAttached Assets (${publicAttachments.length}):\n${publicAttachments
            .map(
              (a) =>
                `- ${a.title} (${a.kind})${a.byte_size ? ` - ${formatBytes(a.byte_size)}` : ''}`
            )
            .join('\n')}`
        : ''

    const fullContext = `${context || ''}${assetContext}`

    // Generate pitch (placeholder - would call LLM in real implementation)
    const pitch = await generatePitch(goal, fullContext, publicAttachments)

    // Write outreach log to database if authenticated
    if (campaignId && contactName) {
      try {
        // Create outreach log entry
        const { error: insertError } = await (supabase as any)
          .from('campaign_outreach_logs')
          .insert({
            user_id: authenticatedUserId,
            campaign_id: campaignId,
            contact_name: contactName,
            message_preview: pitch.substring(0, 200), // First 200 chars
            asset_ids: publicAttachments.map((a) => a.id),
            status: 'sent',
            sent_at: new Date().toISOString(),
          })

        if (insertError) {
          log.warn('Failed to write outreach log', { error: insertError })
        } else {
          log.info('Outreach log saved', {
            campaignId,
            contactName,
            assetCount: publicAttachments.length,
          })
        }
      } catch (dbError) {
        log.warn('Failed to save outreach log to database', { error: dbError })
        // Don't fail the request if DB write fails
      }
    }

    // Log telemetry event for asset attachments
    if (publicAttachments.length > 0) {
      // In real implementation, this would go to flow_telemetry table
      log.info('Telemetry event: asset_attach_to_pitch', {
        sessionId,
        attachmentCount: publicAttachments.length,
        attachmentTypes: publicAttachments.map((a) => a.kind),
      })
    }

    return NextResponse.json(
      {
        success: true,
        pitch,
        attachments: publicAttachments,
        metadata: {
          goal,
          attachmentCount: publicAttachments.length,
          filteredPrivateCount: attachments ? attachments.length - publicAttachments.length : 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Pitch generation failed', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Pitch generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Generate pitch content
 * Placeholder - would call Claude/GPT in real implementation
 */
async function generatePitch(
  goal: string,
  context: string,
  attachments: AssetAttachment[]
): Promise<string> {
  log.debug('Generating pitch', {
    goal,
    contextLength: context.length,
    attachmentCount: attachments.length,
  })

  // Simulate LLM processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Build pitch with asset awareness
  const assetMentions = attachments
    .map((a) => {
      if (a.kind === 'audio') return `I've attached "${a.title}" for your consideration`
      if (a.kind === 'image') return `Please see the attached "${a.title}"`
      if (a.kind === 'document') return `The attached "${a.title}" provides more details`
      return `See attached: "${a.title}"`
    })
    .join('. ')

  const pitch = `
Subject: ${goal}

${context ? `${context}\n\n` : ''}
I'm reaching out to share my music with you. ${goal.toLowerCase().includes('radio') ? 'I believe it would be a great fit for your show.' : 'I think you might enjoy it.'}

${assetMentions ? `\n${assetMentions}.\n` : ''}
Looking forward to hearing from you.

Best regards

---
Generated with ${attachments.length} attached asset${attachments.length === 1 ? '' : 's'}
`.trim()

  return pitch
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
