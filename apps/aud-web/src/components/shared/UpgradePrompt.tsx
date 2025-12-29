/**
 * Upgrade Prompt Component
 * totalaud.io - December 2025
 *
 * A soft prompt that appears when users reach their feature limits.
 * Non-blocking - shows as a banner/toast, not a modal.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  type GatedFeature,
  getUpgradePromptMessage,
  FEATURE_DISPLAY_NAMES,
} from '@/hooks/useFeatureGate'
import { useSubscription, type SubscriptionTier } from '@/hooks/useSubscription'

// ============================================================================
// Types
// ============================================================================

interface UpgradePromptProps {
  /** The feature that triggered the prompt */
  feature: GatedFeature
  /** Whether the prompt is visible */
  visible: boolean
  /** Callback to dismiss the prompt */
  onDismiss?: () => void
  /** Optional custom message */
  message?: string
  /** Variant: inline (subtle) or banner (prominent) */
  variant?: 'inline' | 'banner'
  /** Additional CSS class */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function UpgradePrompt({
  feature,
  visible,
  onDismiss,
  message,
  variant = 'inline',
  className = '',
}: UpgradePromptProps) {
  const { tier, isSubscribed } = useSubscription()

  const promptMessage = message || getUpgradePromptMessage(feature, tier)
  const featureName = FEATURE_DISPLAY_NAMES[feature]

  // Determine CTA based on subscription status
  const ctaHref = isSubscribed ? '/pricing' : '/signup'
  const ctaLabel = isSubscribed ? 'Upgrade' : 'Sign up free'

  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={className}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '12px 16px',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 8,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Icon */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(58, 169, 190, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UpgradeIcon />
              </div>

              {/* Message */}
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#F7F8F9',
                  }}
                >
                  {featureName} limit reached
                </p>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 13,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {promptMessage}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* CTA Button */}
              <Link
                href={ctaHref}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3AA9BE',
                  color: '#0F1113',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {ctaLabel}
              </Link>

              {/* Dismiss Button */}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  style={{
                    padding: 8,
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Inline variant - more subtle
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={className}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            backgroundColor: 'rgba(58, 169, 190, 0.08)',
            borderRadius: 6,
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            {promptMessage}
          </span>
          <Link
            href={ctaHref}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#3AA9BE',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none'
            }}
          >
            {ctaLabel}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// Usage Badge Component
// ============================================================================

interface UsageBadgeProps {
  /** The feature to show usage for */
  feature: GatedFeature
  /** Current usage count */
  used: number
  /** Limit (number or 'unlimited') */
  limit: number | 'unlimited'
  /** Additional CSS class */
  className?: string
}

export function UsageBadge({ feature, used, limit, className = '' }: UsageBadgeProps) {
  const isUnlimited = limit === 'unlimited'
  const isNearLimit = !isUnlimited && used >= (limit as number) * 0.8
  const isAtLimit = !isUnlimited && used >= (limit as number)

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        backgroundColor: isAtLimit
          ? 'rgba(239, 68, 68, 0.1)'
          : isNearLimit
            ? 'rgba(251, 191, 36, 0.1)'
            : 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        fontSize: 12,
      }}
    >
      <span
        style={{
          color: isAtLimit ? '#EF4444' : isNearLimit ? '#FBBF24' : 'rgba(255, 255, 255, 0.5)',
        }}
      >
        {isUnlimited ? (
          <>
            <span style={{ fontWeight: 500 }}>{used}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}> used</span>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 500 }}>{used}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>/{limit}</span>
          </>
        )}
      </span>
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

function UpgradeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3AA9BE"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

// ============================================================================
// Near Limit Warning Component
// ============================================================================

interface NearLimitWarningProps {
  /** The feature approaching its limit */
  feature: GatedFeature
  /** Number of remaining uses */
  remaining: number
  /** Whether to show the warning */
  visible: boolean
  /** Additional CSS class */
  className?: string
}

export function NearLimitWarning({
  feature,
  remaining,
  visible,
  className = '',
}: NearLimitWarningProps) {
  const featureName = FEATURE_DISPLAY_NAMES[feature]

  if (!visible || remaining <= 0) return null

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderRadius: 6,
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        fontSize: 12,
        color: '#FBBF24',
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>
        {remaining} {featureName.toLowerCase()} remaining today
      </span>
    </div>
  )
}
