/**
 * LoopOS Credit Charging Wrapper
 * Wraps API route handlers to check and deduct credits before execution
 */

import { NextResponse } from 'next/server'
import { creditsDb } from '@total-audio/loopos-db'
import { DEV_MODE_CONFIG, GRACE_CONFIG } from '@/config/plans'

export interface CreditContext {
  workspaceId: string
  userId: string
  cost: number
  reason: string
  eventType: string
  category: string
  meta?: Record<string, any>
}

export interface InsufficientCreditsError {
  code: 'INSUFFICIENT_CREDITS'
  message: string
  currentBalance: number
  required: number
  planId?: string
}

/**
 * Wrap an API handler with credit checking and deduction
 */
export async function withCredits<T>(
  context: CreditContext,
  handler: () => Promise<T>
): Promise<T> {
  const { workspaceId, userId, cost, reason, eventType, category, meta = {} } = context

  // Dev mode: skip balance checks but still log usage
  if (DEV_MODE_CONFIG.enabled && DEV_MODE_CONFIG.skipBalanceChecks) {
    console.log('[DEV MODE] Would charge', cost, 'credits for', reason)

    // Still record usage for analytics
    if (DEV_MODE_CONFIG.logUsage) {
      try {
        await creditsDb.useCredits(
          workspaceId,
          userId,
          0, // Don't actually deduct in dev mode
          `[DEV] ${reason}`,
          eventType,
          category,
          { ...meta, dev_mode: true }
        )
      } catch (error) {
        console.error('[DEV MODE] Failed to log usage:', error)
      }
    }

    return await handler()
  }

  // Get current credit balance
  const currentBalance = await creditsDb.getBalance(workspaceId)

  // Check if workspace has enough credits
  const hasEnoughCredits = currentBalance >= cost

  // Allow grace period overdraft
  const allowGrace = currentBalance + GRACE_CONFIG.allowedOverdraft >= cost

  if (!hasEnoughCredits && !allowGrace) {
    throw new Error(
      JSON.stringify({
        code: 'INSUFFICIENT_CREDITS',
        message: `Insufficient credits. You need ${cost} credits but only have ${currentBalance}.`,
        currentBalance,
        required: cost,
      } as InsufficientCreditsError)
    )
  }

  // Deduct credits and record usage
  const success = await creditsDb.useCredits(
    workspaceId,
    userId,
    cost,
    reason,
    eventType,
    category,
    meta
  )

  if (!success) {
    throw new Error(
      JSON.stringify({
        code: 'INSUFFICIENT_CREDITS',
        message: 'Failed to deduct credits. Please try again.',
        currentBalance,
        required: cost,
      } as InsufficientCreditsError)
    )
  }

  // Execute the handler
  return await handler()
}

/**
 * Wrap a Next.js API route handler with credit checking
 */
export async function withCreditsHandler(
  context: CreditContext,
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await withCredits(context, handler)
  } catch (error) {
    // Check if it's an insufficient credits error
    if (error instanceof Error && error.message.startsWith('{')) {
      try {
        const errorData: InsufficientCreditsError = JSON.parse(error.message)

        if (errorData.code === 'INSUFFICIENT_CREDITS') {
          return NextResponse.json(errorData, { status: 402 })
        }
      } catch {
        // Not a JSON error, fall through
      }
    }

    // Re-throw other errors
    throw error
  }
}

/**
 * Check if a workspace has access to a feature based on their plan
 */
export async function checkFeatureAccess(
  workspaceId: string,
  feature: string
): Promise<{ allowed: boolean; planId?: string }> {
  try {
    const subscription = await creditsDb.subscriptionDb.get(workspaceId)

    if (!subscription) {
      // Default to free plan
      return { allowed: false, planId: 'free' }
    }

    const plan = await creditsDb.planDb.get(subscription.plan_id)

    if (!plan) {
      return { allowed: false }
    }

    const allowed = plan.features[feature] === true

    return { allowed, planId: plan.id }
  } catch (error) {
    console.error('Failed to check feature access:', error)
    // Fail open in case of errors (don't hard block)
    return { allowed: true }
  }
}
