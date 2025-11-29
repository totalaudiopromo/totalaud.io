/**
 * Auth Gate Component
 * Phase 6: Auth + Landing Page
 *
 * Wraps features that require authentication (TAP integrations).
 * Shows a calm sign-up prompt for guest users while allowing
 * authenticated users to access the feature normally.
 *
 * Usage:
 * <AuthGate feature="contact validation">
 *   <ValidateButton onClick={handleValidate} />
 * </AuthGate>
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

interface AuthGateProps {
  /** Content to render when authenticated */
  children: ReactNode
  /** Custom fallback when not authenticated */
  fallback?: ReactNode
  /** Feature name for the sign-up prompt (e.g., "contact validation") */
  feature?: string
  /** Show inline prompt instead of replacing the button */
  inline?: boolean
  /** Custom class for the prompt container */
  className?: string
}

/**
 * Default prompt shown to guests when they try to access a gated feature
 */
function GuestPrompt({ feature, inline }: { feature?: string; inline?: boolean }) {
  if (inline) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Link
          href="/signup"
          style={{
            color: '#3AA9BE',
            textDecoration: 'none',
          }}
        >
          Sign up
        </Link>
        <span>to {feature || 'use this feature'}</span>
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        backgroundColor: 'rgba(58, 169, 190, 0.08)',
        border: '1px solid rgba(58, 169, 190, 0.2)',
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: 1.4,
        }}
      >
        {feature ? `Sign in to ${feature}` : 'Sign in to use this feature'}
      </p>
      <Link
        href="/signup"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 500,
          color: '#0F1113',
          backgroundColor: '#3AA9BE',
          border: 'none',
          borderRadius: 6,
          textDecoration: 'none',
          transition: 'opacity 0.12s ease',
        }}
      >
        Create free account
      </Link>
    </motion.div>
  )
}

export function AuthGate({
  children,
  fallback,
  feature,
  inline = false,
  className,
}: AuthGateProps) {
  const { isAuthenticated, loading } = useAuth()

  // While loading, show nothing to prevent flash
  if (loading) {
    return null
  }

  // If not authenticated, show fallback or default prompt
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className={className}>
        <GuestPrompt feature={feature} inline={inline} />
      </div>
    )
  }

  // Authenticated - render children
  return <>{children}</>
}

/**
 * Hook version for more complex gating logic
 */
export function useAuthGate() {
  const { isAuthenticated, loading, user } = useAuth()

  return {
    /** Whether the user can access gated features */
    canAccess: isAuthenticated,
    /** Whether auth state is still loading */
    loading,
    /** Current user if authenticated */
    user,
    /** Check if user can access, with optional callback */
    requireAuth: (onBlocked?: () => void): boolean => {
      if (!isAuthenticated && onBlocked) {
        onBlocked()
      }
      return isAuthenticated
    },
  }
}
