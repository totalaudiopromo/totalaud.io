/**
 * Stripe Configuration
 * totalaud.io - December 2025
 *
 * Server-side Stripe client and pricing utilities
 */

import Stripe from 'stripe'
import { env } from '@/lib/env'

// Server-side Stripe client (lazy initialisation to allow env validation)
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe is not configured. STRIPE_SECRET_KEY is required.')
    }
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return _stripe
}

// For backwards compatibility - throws if Stripe not configured
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const stripeInstance = getStripe()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (stripeInstance as any)[prop as string]
  },
})

// Subscription tiers
export type SubscriptionTier = 'starter' | 'pro' | 'pro_annual'
export type Currency = 'gbp' | 'usd' | 'eur'

// Price configuration (lazy getter to use validated env)
function getPriceIds(): Record<SubscriptionTier, Record<Currency, string | undefined>> {
  return {
    starter: {
      gbp: env.STRIPE_PRICE_STARTER_GBP,
      usd: env.STRIPE_PRICE_STARTER_USD,
      eur: env.STRIPE_PRICE_STARTER_EUR,
    },
    pro: {
      gbp: env.STRIPE_PRICE_PRO_GBP,
      usd: env.STRIPE_PRICE_PRO_USD,
      eur: env.STRIPE_PRICE_PRO_EUR,
    },
    pro_annual: {
      gbp: env.STRIPE_PRICE_PRO_ANNUAL_GBP,
      usd: env.STRIPE_PRICE_PRO_ANNUAL_USD,
      eur: env.STRIPE_PRICE_PRO_ANNUAL_EUR,
    },
  }
}

// Export for backwards compatibility
export const PRICE_IDS = getPriceIds()

// Display prices for UI
export const DISPLAY_PRICES: Record<SubscriptionTier, Record<Currency, string>> = {
  starter: {
    gbp: '£5',
    usd: '$6',
    eur: '€6',
  },
  pro: {
    gbp: '£19',
    usd: '$24',
    eur: '€22',
  },
  pro_annual: {
    gbp: '£149',
    usd: '$189',
    eur: '€179',
  },
}

// Tier limits for feature gating
export const TIER_LIMITS = {
  starter: {
    scoutViewsPerDay: 10,
    timelineProjects: 1,
    pitchCoachPerMonth: 3,
    canExport: false,
  },
  pro: {
    scoutViewsPerDay: Infinity,
    timelineProjects: Infinity,
    pitchCoachPerMonth: Infinity,
    canExport: true,
  },
  pro_annual: {
    scoutViewsPerDay: Infinity,
    timelineProjects: Infinity,
    pitchCoachPerMonth: Infinity,
    canExport: true,
  },
} as const

// Get price ID for tier and currency
export function getPriceId(tier: SubscriptionTier, currency: Currency): string {
  const priceIds = getPriceIds()
  const priceId = priceIds[tier][currency]

  if (!priceId) {
    // Try GBP fallback
    const gbpFallback = priceIds[tier].gbp
    if (!gbpFallback) {
      throw new Error(
        `Stripe price not configured for tier "${tier}" and currency "${currency}". ` +
          `Please set STRIPE_PRICE_${tier.toUpperCase()}_${currency.toUpperCase()} environment variable.`
      )
    }
    return gbpFallback
  }

  return priceId
}

// Detect currency from locale/country
export function detectCurrency(countryCode?: string): Currency {
  if (!countryCode) return 'gbp'

  const euroCountries = [
    'AT',
    'BE',
    'CY',
    'EE',
    'FI',
    'FR',
    'DE',
    'GR',
    'IE',
    'IT',
    'LV',
    'LT',
    'LU',
    'MT',
    'NL',
    'PT',
    'SK',
    'SI',
    'ES',
  ]

  if (countryCode === 'GB' || countryCode === 'UK') return 'gbp'
  if (countryCode === 'US') return 'usd'
  if (euroCountries.includes(countryCode)) return 'eur'

  // Default to GBP for other countries
  return 'gbp'
}

// Map Stripe subscription status to our tier
export function getEffectiveTier(
  subscriptionStatus: string | null,
  subscriptionTier: string | null
): SubscriptionTier | null {
  if (!subscriptionStatus || !subscriptionTier) return null

  // Only count active or trialing subscriptions
  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
    return null
  }

  // Normalise tier name
  const tier = subscriptionTier.toLowerCase().replace('-', '_')
  if (tier === 'starter' || tier === 'pro' || tier === 'pro_annual') {
    return tier as SubscriptionTier
  }

  return null
}
