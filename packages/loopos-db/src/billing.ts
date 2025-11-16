/**
 * LoopOS Billing & Credits Helpers
 */

import { supabase } from './client'
import { z } from 'zod'

// =====================================================
// SCHEMAS
// =====================================================

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  monthly_price_cents: z.number(),
  max_workspaces: z.number(),
  ai_credits_per_month: z.number(),
  features: z.record(z.boolean()),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const SubscriptionSchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  plan_id: z.string(),
  billing_status: z.enum(['trial', 'active', 'past_due', 'cancelled', 'paused']),
  stripe_customer_id: z.string().nullable(),
  stripe_subscription_id: z.string().nullable(),
  current_period_start: z.string().nullable(),
  current_period_end: z.string().nullable(),
  renewal_date: z.string().nullable(),
  cancelled_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const CreditLedgerEntrySchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  change: z.number(),
  reason: z.string(),
  meta: z.record(z.any()).optional(),
  created_by: z.string().nullable(),
  created_at: z.string(),
})

export const UsageEventSchema = z.object({
  id: z.string(),
  workspace_id: z.string(),
  user_id: z.string().nullable(),
  event_type: z.string(),
  category: z.string(),
  credits_used: z.number(),
  meta: z.record(z.any()).optional(),
  created_at: z.string(),
})

export type Plan = z.infer<typeof PlanSchema>
export type Subscription = z.infer<typeof SubscriptionSchema>
export type CreditLedgerEntry = z.infer<typeof CreditLedgerEntrySchema>
export type UsageEvent = z.infer<typeof UsageEventSchema>

// =====================================================
// PLAN OPERATIONS
// =====================================================

export const planDb = {
  /**
   * Get all active plans
   */
  async list(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('loopos_plans')
      .select('*')
      .eq('is_active', true)
      .order('monthly_price_cents', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Get plan by ID
   */
  async get(planId: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from('loopos_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  },
}

// =====================================================
// SUBSCRIPTION OPERATIONS
// =====================================================

export const subscriptionDb = {
  /**
   * Get workspace subscription
   */
  async get(workspaceId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('loopos_subscriptions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  },

  /**
   * Get workspace plan
   */
  async getPlan(workspaceId: string): Promise<Plan | null> {
    const subscription = await this.get(workspaceId)

    if (!subscription) {
      // Default to free plan
      return await planDb.get('free')
    }

    return await planDb.get(subscription.plan_id)
  },

  /**
   * Update workspace plan
   */
  async updatePlan(workspaceId: string, planId: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from('loopos_subscriptions')
      .update({ plan_id: planId })
      .eq('workspace_id', workspaceId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Cancel subscription
   */
  async cancel(workspaceId: string): Promise<Subscription> {
    const { data, error } = await supabase
      .from('loopos_subscriptions')
      .update({
        billing_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('workspace_id', workspaceId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// =====================================================
// CREDIT OPERATIONS
// =====================================================

export const creditsDb = {
  /**
   * Get current credit balance
   */
  async getBalance(workspaceId: string): Promise<number> {
    const { data, error } = await supabase.rpc('loopos_current_credit_balance', {
      p_workspace_id: workspaceId,
    })

    if (error) throw error
    return data || 0
  },

  /**
   * Get credit balance for period
   */
  async getPeriodBalance(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const { data, error } = await supabase.rpc('loopos_period_credit_balance', {
      p_workspace_id: workspaceId,
      p_start_date: startDate?.toISOString(),
      p_end_date: endDate?.toISOString(),
    })

    if (error) throw error
    return data || 0
  },

  /**
   * Check if workspace has enough credits
   */
  async hasCredits(workspaceId: string, required: number): Promise<boolean> {
    const { data, error } = await supabase.rpc('loopos_has_credits', {
      p_workspace_id: workspaceId,
      p_required: required,
    })

    if (error) throw error
    return data || false
  },

  /**
   * Use credits (deduct from balance)
   */
  async useCredits(
    workspaceId: string,
    userId: string,
    credits: number,
    reason: string,
    eventType: string,
    category: string,
    meta: Record<string, any> = {}
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('loopos_use_credits', {
      p_workspace_id: workspaceId,
      p_user_id: userId,
      p_credits: credits,
      p_reason: reason,
      p_event_type: eventType,
      p_category: category,
      p_meta: meta,
    })

    if (error) throw error
    return data || false
  },

  /**
   * Add credits to balance (manual top-up or allocation)
   */
  async addCredits(
    workspaceId: string,
    credits: number,
    reason: string,
    meta: Record<string, any> = {}
  ): Promise<CreditLedgerEntry> {
    const { data, error } = await supabase
      .from('loopos_credit_ledger')
      .insert({
        workspace_id: workspaceId,
        change: credits,
        reason,
        meta,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get credit ledger history
   */
  async getLedger(workspaceId: string, limit = 50): Promise<CreditLedgerEntry[]> {
    const { data, error } = await supabase
      .from('loopos_credit_ledger')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Allocate monthly credits
   */
  async allocateMonthlyCredits(workspaceId: string): Promise<void> {
    const { error } = await supabase.rpc('loopos_allocate_monthly_credits', {
      p_workspace_id: workspaceId,
    })

    if (error) throw error
  },
}

// =====================================================
// USAGE OPERATIONS
// =====================================================

export const usageDb = {
  /**
   * Record usage event
   */
  async record(
    workspaceId: string,
    userId: string | null,
    eventType: string,
    category: string,
    creditsUsed: number,
    meta: Record<string, any> = {}
  ): Promise<UsageEvent> {
    const { data, error } = await supabase
      .from('loopos_usage_events')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        event_type: eventType,
        category,
        credits_used: creditsUsed,
        meta,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get usage events
   */
  async list(workspaceId: string, limit = 100): Promise<UsageEvent[]> {
    const { data, error } = await supabase
      .from('loopos_usage_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Get usage summary by category
   */
  async getSummary(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Record<string, { count: number; credits: number }>> {
    let query = supabase
      .from('loopos_usage_events')
      .select('category, credits_used')
      .eq('workspace_id', workspaceId)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    // Group by category
    const summary: Record<string, { count: number; credits: number }> = {}

    data?.forEach((event) => {
      if (!summary[event.category]) {
        summary[event.category] = { count: 0, credits: 0 }
      }
      summary[event.category].count++
      summary[event.category].credits += event.credits_used
    })

    return summary
  },

  /**
   * Get total credits used in period
   */
  async getTotalUsed(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    let query = supabase
      .from('loopos_usage_events')
      .select('credits_used')
      .eq('workspace_id', workspaceId)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    return data?.reduce((sum, event) => sum + event.credits_used, 0) || 0
  },
}
