/**
 * Forgot Password Page
 * Phase 12: Critical Pre-Launch Fixes
 *
 * Allows users to request a password reset email via Supabase Auth.
 */

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

const log = logger.scope('ForgotPassword')

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setIsSuccess(true)
    } catch (error) {
      // Log the actual error for debugging while showing a user-friendly message
      log.error('Reset request failed', error)
      setError('Unable to send reset email. Please check your connection and try again.')
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

  if (isSuccess) {
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
          {/* Logo */}
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

          {/* Success icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '2px solid rgba(58, 169, 190, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 28,
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}
          >
            Check your email
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            We've sent a password reset link to <span style={{ color: '#3AA9BE' }}>{email}</span>
          </p>

          <Link
            href="/login"
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
            ← Back to sign in
          </Link>
        </motion.div>
      </div>
    )
  }

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
              Reset your password
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: 1.5,
              }}
            >
              Enter your email and we'll send you a reset link
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: 8,
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
                  fontSize: 15,
                  color: '#F7F8F9',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
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
              {isLoading ? 'Sending...' : 'Send reset link'}
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
