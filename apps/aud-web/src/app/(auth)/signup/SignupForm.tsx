/**
 * Signup Form Component
 * Phase 6: Auth + Landing Page
 *
 * Supabase email/password signup with instant access (no email verification).
 * User metadata includes display_name for personalisation.
 */

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// Feature-specific contextual headers
const FEATURE_HEADERS: Record<string, { title: string; subtitle: string }> = {
  'pitch-generator': {
    title: 'Create a free account',
    subtitle: 'to generate pitches with AI',
  },
}

// Tier-specific headers for pricing flow
const TIER_HEADERS: Record<string, { title: string; subtitle: string }> = {
  starter: {
    title: 'Get started with Starter',
    subtitle: '£5/month — all the essentials',
  },
  pro: {
    title: 'Get started with Pro',
    subtitle: '£19/month — unlimited everything',
  },
  pro_annual: {
    title: 'Get started with Pro Annual',
    subtitle: '£149/year — save 35%',
  },
  power: {
    title: 'Get started with Power',
    subtitle: '£79/month — for labels & agencies',
  },
  power_annual: {
    title: 'Get started with Power Annual',
    subtitle: '£649/year — save 32%',
  },
}

const DEFAULT_HEADER = {
  title: 'Create your account',
  subtitle: 'Start building your music career',
}

// Valid tier values
const VALID_TIERS = ['starter', 'pro', 'pro_annual', 'power', 'power_annual'] as const
type ValidTier = (typeof VALID_TIERS)[number]

function isValidTier(value: string | null): value is ValidTier {
  return value !== null && VALID_TIERS.includes(value as ValidTier)
}

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  // Get feature or tier from URL params for contextual messaging
  const feature = searchParams.get('feature')
  const tier = searchParams.get('tier')

  // Determine header content: tier takes precedence, then feature, then default
  const headerContent = isValidTier(tier)
    ? TIER_HEADERS[tier]
    : feature && FEATURE_HEADERS[feature]
      ? FEATURE_HEADERS[feature]
      : DEFAULT_HEADER

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Sign up with Supabase (email verification disabled in Supabase dashboard)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            display_name: name,
          },
        },
      })

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered')) {
          setError('This email is already registered. Try signing in instead.')
        } else if (signUpError.message.includes('password')) {
          setError('Password must be at least 8 characters.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      // Check if user was created and session established
      if (data.user && data.session) {
        // If a tier was specified, redirect to checkout
        if (isValidTier(tier)) {
          // Trigger checkout flow for the selected tier
          try {
            const response = await fetch('/api/stripe/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tier }),
            })

            const checkoutData = await response.json()

            if (checkoutData.url) {
              // Redirect to Stripe Checkout
              window.location.href = checkoutData.url
              return
            } else {
              // Checkout API didn't return URL - go to workspace with error param
              console.error('Checkout API did not return URL:', checkoutData)
              router.push('/workspace?checkout=error')
              return
            }
          } catch (checkoutError) {
            // If checkout fails, go to workspace (not onboarding) so they can retry from settings
            console.error('Checkout redirect failed:', checkoutError)
            router.push('/workspace?checkout=error')
            return
          }
        }

        // No tier specified - redirect to onboarding for profile setup
        router.push('/onboarding')
      } else if (data.user && !data.session) {
        // Email confirmation required -- user needs to check their inbox
        setError('Account created. Please check your email to verify, then sign in.')
      } else {
        setError('Something went wrong creating your account. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    color: '#F7F8F9',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    fontFamily: 'inherit',
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#3AA9BE'
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Link href="/">
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={48}
            height={48}
            style={{ opacity: 0.9 }}
          />
        </Link>
      </div>

      {/* Header - Contextual based on ?feature= param */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#F7F8F9',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          {headerContent.title}
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: isValidTier(tier) || feature ? '#3AA9BE' : 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.5,
            fontWeight: isValidTier(tier) || feature ? 500 : 400,
          }}
        >
          {headerContent.subtitle}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px',
            }}
          >
            Artist / Project name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your artist name"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px',
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px',
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="At least 8 characters"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <p
            style={{
              marginTop: '8px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Must be at least 8 characters
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#EF4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: 600,
            color: '#0F1113',
            backgroundColor: '#3AA9BE',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.opacity = '0.9'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.opacity = '1'
            }
          }}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>

        {/* Terms */}
        <p
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          By creating an account, you agree to our{' '}
          <Link
            href="/terms"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'underline',
            }}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'underline',
            }}
          >
            Privacy Policy
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '32px 0',
          gap: '16px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          or
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
      </div>

      {/* Google Sign Up */}
      <button
        type="button"
        disabled={isLoading}
        onClick={async () => {
          try {
            setIsLoading(true)
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'consent',
                },
              },
            })
            if (oauthError) throw oauthError
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
            setIsLoading(false)
          }
        }}
        style={{
          width: '100%',
          padding: '14px 24px',
          fontSize: '15px',
          fontWeight: 500,
          color: '#F7F8F9',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      {/* Sign in link */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          style={{
            color: '#3AA9BE',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'opacity 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
            padding: '0 4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
