/**
 * Stripe Configuration
 * totalaud.io - December 2025
 *
 * Server-side Stripe client and pricing utilities
 */

import Stripe from 'stripe'

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Subscription tiers
export type SubscriptionTier = 'starter' | 'pro' | 'pro_annual'
export type Currency = 'gbp' | 'usd' | 'eur'

// Price configuration
export const PRICE_IDS: Record<SubscriptionTier, Record<Currency, string>> = {
  starter: {
    gbp: process.env.STRIPE_PRICE_STARTER_GBP!,
    usd: process.env.STRIPE_PRICE_STARTER_USD!,
    eur: process.env.STRIPE_PRICE_STARTER_EUR!,
  },
  pro: {
    gbp: process.env.STRIPE_PRICE_PRO_GBP!,
    usd: process.env.STRIPE_PRICE_PRO_USD!,
    eur: process.env.STRIPE_PRICE_PRO_EUR!,
  },
  pro_annual: {
    gbp: process.env.STRIPE_PRICE_PRO_ANNUAL_GBP!,
    usd: process.env.STRIPE_PRICE_PRO_ANNUAL_USD!,
    eur: process.env.STRIPE_PRICE_PRO_ANNUAL_EUR!,
  },
}

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
  const priceId = PRICE_IDS[tier][currency]
  if (!priceId || priceId.startsWith('price_TODO')) {
    // Fallback to GBP if currency not configured
    return PRICE_IDS[tier].gbp
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
