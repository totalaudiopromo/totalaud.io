/**
 * Login Form Component
 * 2025 Brand Pivot - Cinematic Editorial
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // TODO: Integrate with Supabase auth
      // For now, redirect to workspace
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push('/workspace')
    } catch {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Header */}
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
          Welcome back
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 1.5,
          }}
        >
          Sign in to continue to your workspace
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
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
            style={{
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
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3AA9BE'
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{
                fontSize: '14px',
                color: '#3AA9BE',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
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
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3AA9BE'
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'
            }}
          />
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
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
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

      {/* Sign up link */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '15px',
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
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
          Create one
        </Link>
      </p>
    </div>
  )
}
