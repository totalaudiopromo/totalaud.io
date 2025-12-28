/**
 * Login Form Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * Distinctive design: deep black with cyan accents,
 * subtle grid pattern, cinematic motion on load
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('Login')

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createBrowserSupabaseClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        log.error('Auth error', authError)
        throw authError
      }

      // Login successful - check if onboarding is completed
      // Fetch user profile to check onboarding status
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', data.user?.id)
        .single()

      // Redirect based on onboarding status
      if (!profileData?.onboarding_completed) {
        router.push('/onboarding')
      } else {
        router.push('/workspace')
      }
      router.refresh()
    } catch (err) {
      log.error('Login error', err)
      const message = err instanceof Error ? err.message : 'Invalid email or password'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const glowVariants = {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.6, 0.4],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  if (!mounted) {
    return null
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        width: '100%',
        maxWidth: '420px',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Subtle ambient glow behind form */}
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(58, 169, 190, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Card container */}
      <motion.div
        variants={itemVariants}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '40px 36px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Logo */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/">
            <Image
              src="/brand/svg/ta-logo-cyan.svg"
              alt="totalaud.io"
              width={48}
              height={48}
              style={{ opacity: 0.9 }}
            />
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: '10px',
              letterSpacing: '-0.03em',
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: 1.5,
            }}
          >
            Sign in to your creative workspace
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '8px',
                letterSpacing: '0.01em',
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
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                color: '#F7F8F9',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(58, 169, 190, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants} style={{ marginBottom: '28px' }}>
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
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: '0.01em',
                }}
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: '13px',
                  color: 'rgba(58, 169, 190, 0.9)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3AA9BE'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(58, 169, 190, 0.9)'
                }}
              >
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                color: '#F7F8F9',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(58, 169, 190, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 14px',
                marginBottom: '20px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#F87171',
                lineHeight: 1.4,
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#0F1113',
              background: 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
              border: 'none',
              borderRadius: '10px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'opacity 0.2s ease',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 16px rgba(58, 169, 190, 0.25)',
            }}
          >
            {isLoading ? (
              <span
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', width: 16, height: 16 }}
                >
                  ◌
                </motion.span>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '28px 0',
            gap: '16px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
            }}
          />
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>or</span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
            }}
          />
        </motion.div>

        {/* Google Sign In */}
        <motion.button
          variants={itemVariants}
          type="button"
          disabled={isLoading}
          onClick={async () => {
            try {
              setIsLoading(true)
              const supabase = createBrowserSupabaseClient()
              // For OAuth, we redirect to workspace and let the onboarding gate handle it
              // The workspace layout will check onboarding status and redirect if needed
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/workspace`,
                  queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                  },
                },
              })

              if (error) throw error
              // Redirect happens automatically
            } catch (err) {
              log.error('Google Sign In Error', err)
              const message = err instanceof Error ? err.message : 'Failed to sign in with Google'
              setError(message)
              setIsLoading(false)
            }
          }}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
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
        </motion.button>

        {/* Sign up link */}
        <motion.p
          variants={itemVariants}
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
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
        </motion.p>
      </motion.div>

      {/* Keyboard hint */}
      <motion.div
        variants={itemVariants}
        style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.3)',
        }}
      >
        Press{' '}
        <kbd
          style={{
            display: 'inline-block',
            padding: '2px 6px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '11px',
          }}
        >
          Enter
        </kbd>{' '}
        to sign in
      </motion.div>
    </motion.div>
  )
}
