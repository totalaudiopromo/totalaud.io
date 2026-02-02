/**
 * Credits Deduct API Route
 *
 * POST /api/credits/deduct - Deduct credits for enrichment
 *
 * This is called internally when a user enriches a contact.
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { ENRICHMENT_COST_PENCE } from '@/lib/credits/constants'

const log = logger.scope('CreditsDeductAPI')

// ============================================================================
// Types
// ============================================================================

const deductCreditsSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  opportunityName: z.string().optional(),
})

interface DeductCreditsResponse {
  success: boolean
  transactionId?: string
  previousBalance?: number
  newBalance?: number
  amountDeducted?: number
  error?: string
  code?: string
}

// ============================================================================
// POST - Deduct credits for enrichment
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<DeductCreditsResponse>> {
  try {
    const supabase = await createRouteSupabaseClient()

    // Check authentication
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

    // Parse and validate body
    const parseResult = deductCreditsSchema.safeParse(await request.json())
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
    const { opportunityId, opportunityName } = parseResult.data

    // Call the deduct_credits function
    // Note: deduct_credits function added in migration 20251228100000
    const { data, error } = await (supabase.rpc as any)('deduct_credits', {
      p_user_id: session.user.id,
      p_amount_pence: ENRICHMENT_COST_PENCE,
      p_description: `Contact enrichment: ${opportunityName || opportunityId}`,
      p_metadata: { opportunity_id: opportunityId },
    })

    if (error) {
      log.error('Failed to deduct credits', error)
      return NextResponse.json(
        { success: false, error: 'Failed to deduct credits', code: 'DEDUCTION_ERROR' },
        { status: 500 }
      )
    }

    const result = (data || { success: false, error: 'No response' }) as {
      success: boolean
      transaction_id?: string
      previous_balance?: number
      new_balance?: number
      amount_deducted?: number
      error?: string
      message?: string
      current_balance?: number
      required?: number
    }

    if (!result.success) {
      // Check for insufficient funds
      if (result.error === 'insufficient_funds') {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient credits',
            code: 'INSUFFICIENT_FUNDS',
          },
          { status: 402 } // Payment Required
        )
      }

      // No credits record
      if (result.error === 'no_credits_record') {
        return NextResponse.json(
          {
            success: false,
            error: 'No credits available. Please purchase credits first.',
            code: 'NO_CREDITS',
          },
          { status: 402 }
        )
      }

      return NextResponse.json(
        { success: false, error: result.message || 'Deduction failed', code: result.error },
        { status: 400 }
      )
    }

    log.info(`Deducted ${ENRICHMENT_COST_PENCE}p for enrichment`, {
      userId: session.user.id,
      opportunityId,
      newBalance: result.new_balance,
    })

    return NextResponse.json({
      success: true,
      transactionId: result.transaction_id,
      previousBalance: result.previous_balance,
      newBalance: result.new_balance,
      amountDeducted: result.amount_deducted,
    })
  } catch (error) {
    log.error('Unexpected error', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
