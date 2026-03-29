/**
 * Reset Password Page
 * Handles the password reset flow after a user clicks the link in their email.
 *
 * Flow:
 * 1. User arrives with a `code` query param from the reset email
 * 2. Page exchanges the code for a session via Supabase
 * 3. User enters and confirms their new password
 * 4. On success, redirects to /login?message=password-updated
 */

'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('ResetPassword')

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0A0B0C',
          }}
        >
          <p style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.6)' }}>Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const searchParams = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExchanging, setIsExchanging] = useState(true)
  const [exchangeError, setExchangeError] = useState('')
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  // Exchange the code for a session on mount
  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setIsExchanging(false)
      setExchangeError('No reset code found. Please request a new password reset link.')
      return
    }

    const exchangeCode = async () => {
      try {
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeErr) {
          log.error('Code exchange failed', exchangeErr)
          setExchangeError(
            'This reset link has expired or has already been used. Please request a new one.'
          )
          return
        }

        setSessionReady(true)
      } catch (err) {
        log.error('Code exchange threw', err)
        setExchangeError('Something went wrong verifying your reset link. Please try again.')
      } finally {
        setIsExchanging(false)
      }
    }

    exchangeCode()
  }, [searchParams, supabase])

  const validate = (): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters.'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      router.push('/login?message=password-updated')
    } catch (err) {
      log.error('Password update failed', err)
      setError('Unable to update your password. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontSize: 15,
    color: '#F7F8F9',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(58, 169, 190, 0.1)'
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
    e.currentTarget.style.boxShadow = 'none'
  }

  // Loading state while exchanging the code
  if (isExchanging) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#0A0B0C',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <div style={{ marginBottom: 32 }}>
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
          <p
            style={{
              fontSize: 15,
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.6,
            }}
          >
            Verifying your reset link...
          </p>
        </motion.div>
      </div>
    )
  }

  // Error state if code exchange failed
  if (exchangeError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#0A0B0C',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: 420,
            textAlign: 'center',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <div style={{ marginBottom: 32 }}>
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

          <div
            style={{
              padding: '12px 14px',
              marginBottom: 24,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 10,
              fontSize: 14,
              color: '#F87171',
              lineHeight: 1.5,
            }}
          >
            {exchangeError}
          </div>

          <Link
            href="/forgot-password"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Request a new reset link
          </Link>
        </motion.div>
      </div>
    )
  }

  // Main form -- only shown after successful code exchange
  if (!sessionReady) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#0A0B0C',
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          width: '100%',
          maxWidth: 420,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <motion.div
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(58, 169, 190, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Card */}
        <motion.div
          variants={itemVariants}
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '40px 36px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Logo */}
          <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 32 }}>
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
          <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#F7F8F9',
                marginBottom: 10,
                letterSpacing: '-0.03em',
              }}
            >
              Set a new password
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1.5,
              }}
            >
              Choose a strong password for your account
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* New password */}
            <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 8,
                  letterSpacing: '0.01em',
                }}
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </motion.div>

            {/* Confirm password */}
            <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
              <label
                htmlFor="confirm-password"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 8,
                  letterSpacing: '0.01em',
                }}
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px 14px',
                  marginBottom: 20,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 10,
                  fontSize: 13,
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
                fontSize: 15,
                fontWeight: 600,
                color: '#0F1113',
                background: 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
                border: 'none',
                borderRadius: 10,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.2s ease',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 16px rgba(58, 169, 190, 0.25)',
              }}
            >
              {isLoading ? 'Updating...' : 'Update password'}
            </motion.button>
          </form>

          {/* Back to login */}
          <motion.p
            variants={itemVariants}
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Remember your password?{' '}
            <Link
              href="/login"
              style={{
                color: '#3AA9BE',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}
