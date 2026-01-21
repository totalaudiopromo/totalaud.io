/**
 * Environment Variable Validation
 * totalaud.io - December 2025
 *
 * Validates required environment variables at startup.
 * Use this module instead of accessing process.env directly.
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const apiKey = env.ANTHROPIC_API_KEY
 */

import { z } from 'zod'

// ============================================
// Schema Definition
// ============================================

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required').optional(),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_')
    .optional(),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_')
    .optional(),

  // Stripe Price IDs (optional - only needed for billing)
  STRIPE_PRICE_STARTER_GBP: z.string().optional(),
  STRIPE_PRICE_STARTER_USD: z.string().optional(),
  STRIPE_PRICE_STARTER_EUR: z.string().optional(),
  STRIPE_PRICE_PRO_GBP: z.string().optional(),
  STRIPE_PRICE_PRO_USD: z.string().optional(),
  STRIPE_PRICE_PRO_EUR: z.string().optional(),
  STRIPE_PRICE_PRO_ANNUAL_GBP: z.string().optional(),
  STRIPE_PRICE_PRO_ANNUAL_USD: z.string().optional(),
  STRIPE_PRICE_PRO_ANNUAL_EUR: z.string().optional(),
  STRIPE_PRICE_POWER_GBP: z.string().optional(),
  STRIPE_PRICE_POWER_USD: z.string().optional(),
  STRIPE_PRICE_POWER_EUR: z.string().optional(),
  STRIPE_PRICE_POWER_ANNUAL_GBP: z.string().optional(),
  STRIPE_PRICE_POWER_ANNUAL_USD: z.string().optional(),
  STRIPE_PRICE_POWER_ANNUAL_EUR: z.string().optional(),

  // AI Provider
  ANTHROPIC_API_KEY: z
    .string()
    .startsWith('sk-ant-', 'ANTHROPIC_API_KEY must start with sk-ant-')
    .optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_').optional(),

  // Sentry Error Monitoring
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Coming Soon / Preview Access
  PREVIEW_ACCESS_KEY: z
    .string()
    .min(8, 'PREVIEW_ACCESS_KEY must be at least 8 characters')
    .optional(),

  // ConvertKit (totalaud.io waitlist - separate from TAP)
  NEXT_PUBLIC_CONVERTKIT_FORM_ID: z.string().optional(),
  NEXT_PUBLIC_CONVERTKIT_API_KEY: z.string().optional(),

  // TAP (Total Audio Platform) Integration
  TAP_API_KEY: z.string().optional(),
  TAP_API_KEY_INTEL: z.string().optional(),
  TAP_API_KEY_PITCH: z.string().optional(),
  TAP_API_KEY_TRACKER: z.string().optional(),
  TAP_API_URL: z.string().url().optional(),
  TAP_INTEL_URL: z.string().url().optional(),
  TAP_PITCH_URL: z.string().url().optional(),
  TAP_TRACKER_URL: z.string().url().optional(),

  // Dev Flags
  NEXT_PUBLIC_ENABLE_DEV_MOCK_AUTH: z
    .preprocess((val) => val === 'true', z.boolean())
    .default(false),
  NEXT_PUBLIC_DEV_AUTH_USER_ID: z.string().uuid().optional(),
  NEXT_PUBLIC_DEV_AUTH_EMAIL: z.string().email().optional(),
})

// ============================================
// Type Inference
// ============================================

export type Env = z.infer<typeof envSchema>

// ============================================
// Validation
// ============================================

function validateEnv(): Env {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    // On client, return only public env vars
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_CONVERTKIT_FORM_ID: process.env.NEXT_PUBLIC_CONVERTKIT_FORM_ID,
      NEXT_PUBLIC_CONVERTKIT_API_KEY: process.env.NEXT_PUBLIC_CONVERTKIT_API_KEY,
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      NEXT_PUBLIC_ENABLE_DEV_MOCK_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEV_MOCK_AUTH === 'true',
      NEXT_PUBLIC_DEV_AUTH_USER_ID: process.env.NEXT_PUBLIC_DEV_AUTH_USER_ID,
      NEXT_PUBLIC_DEV_AUTH_EMAIL: process.env.NEXT_PUBLIC_DEV_AUTH_EMAIL,
    } as Env
  }

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
      .join('\n')

    console.error('❌ Invalid environment variables:\n' + errorMessages)

    // In development, continue with warnings
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Continuing with invalid env vars in development mode')
      return process.env as unknown as Env
    }

    // In production, throw
    throw new Error('Invalid environment variables')
  }

  return parsed.data as Env
}

// ============================================
// Export
// ============================================

export const env = validateEnv()

// ============================================
// Helpers
// ============================================

/**
 * Get a required environment variable (throws if missing)
 */
export function getRequiredEnv(key: keyof Env): string {
  const value = env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value as string
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production'
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development'
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET
}

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  return !!env.ANTHROPIC_API_KEY
}

/**
 * Check if Email (Resend) is configured
 */
export function isEmailConfigured(): boolean {
  return !!env.RESEND_API_KEY
}

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  return !!env.SENTRY_DSN
}

/**
 * Check if TAP (Total Audio Platform) Pitch service is configured
 * Requires both API key AND URL to be functional
 */
export function isTAPPitchConfigured(): boolean {
  return !!(env.TAP_API_KEY_PITCH || env.TAP_API_KEY) && !!env.TAP_PITCH_URL
}

/**
 * Check if TAP Intel service is configured
 * Requires both API key AND URL to be functional
 */
export function isTAPIntelConfigured(): boolean {
  return !!(env.TAP_API_KEY_INTEL || env.TAP_API_KEY) && !!env.TAP_INTEL_URL
}

/**
 * Check if TAP Tracker service is configured
 * Requires both API key AND URL to be functional
 */
export function isTAPTrackerConfigured(): boolean {
  return !!(env.TAP_API_KEY_TRACKER || env.TAP_API_KEY) && !!env.TAP_TRACKER_URL
}
