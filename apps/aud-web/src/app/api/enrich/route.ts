/**
 * Contact Enrichment API Route
 *
 * POST /api/enrich - Enrich a music industry contact using AI
 *
 * Flow:
 * 1. Authenticate user
 * 2. Validate input (name required, email/outlet optional)
 * 3. Check credit balance >= ENRICHMENT_COST_PENCE
 * 4. Call Claude Haiku for enrichment
 * 5. Deduct credits only on success
 * 6. Return enrichment data
 *
 * Credits are deducted AFTER successful enrichment -- never charge if AI fails.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { ENRICHMENT_COST_PENCE } from '@/lib/credits/constants'
import { enrichContactWithAI } from '@/lib/enrichment/enrich-contact'
import type { EnrichmentOutput } from '@/lib/enrichment/enrich-contact'

const log = logger.scope('EnrichAPI')

// ============================================================================
// Input validation
// ============================================================================

const enrichRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  outlet: z.string().optional(),
})

// ============================================================================
// Response types
// ============================================================================

interface EnrichSuccessResponse {
  success: true
  data: EnrichmentOutput
  creditsDeducted: number
  newBalance: number
}

interface EnrichErrorResponse {
  success: false
  error: string
  balance?: number
  cost?: number
  code?: string
}

// ============================================================================
// POST - Enrich a contact
// ============================================================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<EnrichSuccessResponse | EnrichErrorResponse>> {
  try {
    const supabase = await createRouteSupabaseClient()

    // 1. Authenticate
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // 2. Validate input
    const parseResult = enrichRequestSchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid request',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }
    const { name, email, outlet } = parseResult.data

    // 3. Check credit balance
    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('balance_pence')
      .eq('user_id', session.user.id)
      .maybeSingle()

    const currentBalance = (creditsData as { balance_pence: number } | null)?.balance_pence ?? 0

    if (currentBalance < ENRICHMENT_COST_PENCE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient credits',
          balance: currentBalance,
          cost: ENRICHMENT_COST_PENCE,
          code: 'INSUFFICIENT_CREDITS',
        },
        { status: 402 }
      )
    }

    // 4. Call enrichment engine
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    let enrichmentData: EnrichmentOutput
    try {
      enrichmentData = await enrichContactWithAI(anthropic, { name, email, outlet })
    } catch (aiError) {
      log.error('Enrichment AI call failed', aiError)
      return NextResponse.json(
        {
          success: false,
          error: aiError instanceof Error ? aiError.message : 'Enrichment failed',
          code: 'AI_ERROR',
        },
        { status: 500 }
      )
    }

    // 5. Deduct credits (only after successful enrichment)
    const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits', {
      p_user_id: session.user.id,
      p_amount_pence: ENRICHMENT_COST_PENCE,
      p_description: `Contact enrichment: ${name}`,
      p_metadata: { contact_email: email, contact_name: name, outlet },
    })

    if (deductError) {
      log.error('Failed to deduct credits after successful enrichment', deductError)
      // Still return the data -- enrichment succeeded, credit deduction is secondary
      // Log for manual reconciliation
      return NextResponse.json({
        success: true,
        data: enrichmentData,
        creditsDeducted: 0,
        newBalance: currentBalance,
      })
    }

    const result = (deductResult || { new_balance: currentBalance - ENRICHMENT_COST_PENCE }) as {
      new_balance?: number
    }

    log.info(`Enriched contact: ${name}`, {
      userId: session.user.id,
      email,
      confidence: enrichmentData.confidence,
    })

    // 6. Return enrichment data
    return NextResponse.json({
      success: true,
      data: enrichmentData,
      creditsDeducted: ENRICHMENT_COST_PENCE,
      newBalance: result.new_balance ?? currentBalance - ENRICHMENT_COST_PENCE,
    })
  } catch (error) {
    log.error('Unexpected error in enrichment route', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
