/**
 * Credits API Route
 *
 * GET /api/credits - Get user's credit balance
 * POST /api/credits - Add credits to user's balance (for purchases/bonuses)
 *
 * Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { ENRICHMENT_COST_PENCE } from '@/lib/credits/constants'

const log = logger.scope('CreditsAPI')

// ============================================================================
// Types
// ============================================================================

interface CreditsBalance {
  balance_pence: number
  total_purchased_pence: number
  total_spent_pence: number
}

interface CreditsResponse {
  success: boolean
  balance: {
    balancePence: number
    balancePounds: string
    totalPurchasedPence: number
    totalSpentPence: number
    enrichmentCostPence: number
    enrichmentsAvailable: number
  }
}

interface CreditsError {
  success: false
  error: string
  code?: string
}

// ============================================================================
// GET - Fetch user's credit balance
// ============================================================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<CreditsResponse | CreditsError>> {
  try {
    const supabase = await createRouteSupabaseClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      log.error('Session error', sessionError)
      return NextResponse.json(
        { success: false, error: 'Authentication error', code: 'AUTH_ERROR' },
        { status: 401 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Fetch or create credits record
    // Note: user_credits table added in migration 20251228100000
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('user_credits')
      .select('balance_pence, total_purchased_pence, total_spent_pence')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error) {
      log.error('Failed to fetch credits', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch credits', code: 'QUERY_ERROR' },
        { status: 500 }
      )
    }

    // If no credits record exists, return zero balance
    const balance: CreditsBalance = (data as CreditsBalance) || {
      balance_pence: 0,
      total_purchased_pence: 0,
      total_spent_pence: 0,
    }

    return NextResponse.json({
      success: true,
      balance: {
        balancePence: balance.balance_pence,
        balancePounds: (balance.balance_pence / 100).toFixed(2),
        totalPurchasedPence: balance.total_purchased_pence,
        totalSpentPence: balance.total_spent_pence,
        enrichmentCostPence: ENRICHMENT_COST_PENCE,
        enrichmentsAvailable: Math.floor(balance.balance_pence / ENRICHMENT_COST_PENCE),
      },
    })
  } catch (error) {
    log.error('Unexpected error', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Add credits (for purchases/bonuses)
// ============================================================================

interface AddCreditsBody {
  amountPence: number
  transactionType: 'purchase' | 'refund' | 'bonus'
  description?: string
  metadata?: Record<string, unknown>
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; newBalance?: number; error?: string }>> {
  try {
    const supabase = await createRouteSupabaseClient()

    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse body
    const body: AddCreditsBody = await request.json()
    const { amountPence, transactionType, description, metadata } = body

    // Validate
    if (!amountPence || amountPence <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 })
    }

    if (!['purchase', 'refund', 'bonus'].includes(transactionType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction type' },
        { status: 400 }
      )
    }

    // Call the add_credits function
    // Note: add_credits function added in migration 20251228100000
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('add_credits', {
      p_user_id: session.user.id,
      p_amount_pence: amountPence,
      p_transaction_type: transactionType,
      p_description: description || `${transactionType} credits`,
      p_metadata: metadata || {},
    })

    if (error) {
      log.error('Failed to add credits', error)
      return NextResponse.json({ success: false, error: 'Failed to add credits' }, { status: 500 })
    }

    const result = (data as { success: boolean; new_balance?: number; error?: string }) || {
      success: false,
      error: 'No response',
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to add credits' },
        { status: 400 }
      )
    }

    log.info(`Added ${amountPence} pence credits for user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      newBalance: result.new_balance,
    })
  } catch (error) {
    log.error('Unexpected error', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
