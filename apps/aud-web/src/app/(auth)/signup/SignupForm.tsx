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
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

// Feature-specific contextual headers
const FEATURE_HEADERS: Record<string, { title: string; subtitle: string }> = {
  validate: {
    title: 'Create a free account',
    subtitle: 'to validate contacts with TAP Intel',
  },
  'pitch-generator': {
    title: 'Create a free account',
    subtitle: 'to generate pitches with AI',
  },
  'tracker-sync': {
    title: 'Create a free account',
    subtitle: 'to log submissions to TAP Tracker',
  },
}

const DEFAULT_HEADER = {
  title: 'Create your account',
  subtitle: 'Start building your music career',
}

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  // Get feature from URL params for contextual messaging
  const feature = searchParams.get('feature')
  const headerContent =
    feature && FEATURE_HEADERS[feature] ? FEATURE_HEADERS[feature] : DEFAULT_HEADER

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

      // Check if user was created successfully
      if (data.user) {
        // Redirect to workspace on successful signup
        router.push('/workspace')
      } else {
        // This shouldn't happen with email verification disabled
        setError('Account created. Please check your email to verify.')
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
            color: feature ? '#3AA9BE' : 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.5,
            fontWeight: feature ? 500 : 400,
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
