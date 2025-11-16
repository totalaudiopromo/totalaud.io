/**
 * LoopOS Plan Configuration
 * Defines subscription tiers, credit allocations, and feature gates
 */

export interface PlanFeatures {
  timeline: boolean
  journal: boolean
  coach: boolean
  designer: boolean
  packs: boolean
  exports: boolean
  realtime: boolean
}

export interface Plan {
  id: string
  name: string
  description: string
  monthlyPriceCents: number
  maxWorkspaces: number
  aiCreditsPerMonth: number
  features: PlanFeatures
}

export const PLAN_FEATURES = {
  free: {
    maxWorkspaces: 1,
    aiCreditsPerMonth: 200,
    features: {
      timeline: true,
      journal: true,
      coach: true,
      designer: true,
      packs: true,
      exports: false, // Gated on free plan
      realtime: true,
    },
  },
  creator: {
    maxWorkspaces: 3,
    aiCreditsPerMonth: 2000,
    features: {
      timeline: true,
      journal: true,
      coach: true,
      designer: true,
      packs: true,
      exports: true,
      realtime: true,
    },
  },
  agency: {
    maxWorkspaces: 20,
    aiCreditsPerMonth: 10000,
    features: {
      timeline: true,
      journal: true,
      coach: true,
      designer: true,
      packs: true,
      exports: true,
      realtime: true,
    },
  },
} as const

/**
 * Credit costs for various actions
 */
export const CREDIT_COSTS = {
  // AI interactions
  ai_coach_message: 2,
  ai_designer_scene: 10,
  ai_pack_generation: 5,
  ai_insights: 3,
  ai_auto_chain: 8,

  // Exports
  export_pdf: 5,
  export_html: 3,
  export_json: 1,

  // Other billable actions
  realtime_session_hour: 1, // Per hour of collaborative session
} as const

/**
 * Dev mode configuration
 * Generous credits and no hard blocks for development
 */
export const DEV_MODE_CONFIG = {
  enabled: process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_LOOPOS_DEV_MODE === 'true',
  fakeCredits: 99999,
  skipBalanceChecks: true,
  logUsage: true, // Still log usage for analytics
}

/**
 * Grace period configuration
 * Allow some usage even when out of credits
 */
export const GRACE_CONFIG = {
  allowedOverdraft: 50, // Allow up to 50 credits overdraft
  gracePeriodDays: 7, // 7 days to top up before hard block
}

/**
 * Feature display names
 */
export const FEATURE_NAMES: Record<keyof PlanFeatures, string> = {
  timeline: 'Timeline Canvas',
  journal: 'Journal & Voice Memos',
  coach: 'AI Coach',
  designer: 'AI Designer Mode',
  packs: 'Creative Packs',
  exports: 'Export Centre',
  realtime: 'Real-Time Collaboration',
}

/**
 * Plan display information
 */
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out LoopOS',
    monthlyPriceCents: 0,
    maxWorkspaces: 1,
    aiCreditsPerMonth: 200,
    features: PLAN_FEATURES.free.features,
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'For solo artists and creators',
    monthlyPriceCents: 1900, // £19/month
    maxWorkspaces: 3,
    aiCreditsPerMonth: 2000,
    features: PLAN_FEATURES.creator.features,
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'For teams and agencies',
    monthlyPriceCents: 9900, // £99/month
    maxWorkspaces: 20,
    aiCreditsPerMonth: 10000,
    features: PLAN_FEATURES.agency.features,
  },
]

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === planId)
}

/**
 * Check if a feature is available on a plan
 */
export function hasFeature(planId: string, feature: keyof PlanFeatures): boolean {
  const plan = getPlanById(planId)
  return plan?.features[feature] || false
}

/**
 * Format price in pounds
 */
export function formatPrice(priceCents: number): string {
  if (priceCents === 0) return 'Free'
  const pounds = (priceCents / 100).toFixed(2)
  return `£${pounds}/mo`
}
