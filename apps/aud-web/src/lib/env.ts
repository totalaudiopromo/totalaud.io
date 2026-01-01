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
import { logger } from '@/lib/logger'

const log = logger.scope('Env')

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
    } as Env
  }

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(', ')}`)
      .join('\n')

    log.error('Invalid environment variables', undefined, { errors: errorMessages })

    // In development, continue with warnings
    if (process.env.NODE_ENV === 'development') {
      log.warn('Continuing with invalid env vars in development mode')
      return process.env as unknown as Env
    }

    // In production, throw
    throw new Error('Invalid environment variables')
  }

  return parsed.data
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
