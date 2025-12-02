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
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

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
        console.error('Auth error:', authError)
        throw authError
      }

      console.log('Login successful:', data.user?.email)

      // Successful login - redirect to workspace
      router.push('/workspace')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
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
        </motion.div>

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
