/**
 * AnalyticsSettings Component
 * Phase 15: Privacy Guard + Local Mode Support
 *
 * Purpose:
 * - Toggle analytics on/off (localStorage: analytics_enabled)
 * - Display privacy badge when analytics disabled
 * - Explain data collection and privacy
 * - WCAG AA+ accessible
 *
 * Privacy-First Design:
 * - Default: Analytics enabled (opt-out, not opt-in)
 * - When disabled: No data sent to server, local-only mode
 * - Badge display: "local only" in top-right of console
 * - Clear explanation of what's tracked
 *
 * Usage:
 * <AnalyticsSettings
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 * />
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'

const log = logger.scope('AnalyticsSettings')

export interface AnalyticsSettingsProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Get analytics enabled state from localStorage
 */
function getAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return true

  try {
    const setting = localStorage.getItem('analytics_enabled')
    return setting !== 'false' // Default to true
  } catch (error) {
    log.warn('Could not access localStorage for analytics setting', error)
    return true
  }
}

/**
 * Set analytics enabled state in localStorage
 */
function setAnalyticsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('analytics_enabled', enabled ? 'true' : 'false')
    log.info('Analytics setting updated', { enabled })
  } catch (error) {
    log.error('Could not save analytics setting', error)
  }
}

export function AnalyticsSettings({ isOpen, onClose }: AnalyticsSettingsProps) {
  const prefersReducedMotion = useReducedMotion()

  const [analyticsEnabled, setAnalyticsEnabledState] = useState(true)
  const [hasChanged, setHasChanged] = useState(false)

  /**
   * Load setting on mount
   */
  useEffect(() => {
    setAnalyticsEnabledState(getAnalyticsEnabled())
  }, [])

  /**
   * Toggle analytics
   */
  const handleToggle = () => {
    const newValue = !analyticsEnabled
    setAnalyticsEnabledState(newValue)
    setAnalyticsEnabled(newValue)
    setHasChanged(true)

    log.debug('Analytics toggled', { enabled: newValue })
  }

  /**
   * Keyboard shortcut: Esc to close
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  /**
   * Lock body scroll when open
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
            aria-hidden="true"
          />

          {/* Settings Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="analytics-settings-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              zIndex: 51,
              backgroundColor: flowCoreColours.matteBlack,
              border: `2px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '8px',
              padding: '32px',
              fontFamily:
                'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2
                id="analytics-settings-title"
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: flowCoreColours.iceCyan,
                  textTransform: 'lowercase',
                  letterSpacing: '0.3px',
                  margin: '0 0 8px 0',
                }}
              >
                analytics settings
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: flowCoreColours.textSecondary,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                control how your flow state data is collected
              </p>
            </div>

            {/* Toggle Switch */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: flowCoreColours.darkGrey,
                border: `1px solid ${flowCoreColours.borderGrey}`,
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: flowCoreColours.textPrimary,
                    marginBottom: '4px',
                  }}
                >
                  enable analytics
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: flowCoreColours.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {analyticsEnabled
                    ? 'tracking flow state metrics'
                    : 'local-only mode (no data sent)'}
                </div>
              </div>

              <button
                onClick={handleToggle}
                role="switch"
                aria-checked={analyticsEnabled}
                aria-label="Toggle analytics"
                style={{
                  width: '56px',
                  height: '32px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: analyticsEnabled
                    ? flowCoreColours.slateCyan
                    : flowCoreColours.borderGrey,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.24s ease',
                }}
              >
                <motion.div
                  animate={{ x: analyticsEnabled ? 24 : 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: flowCoreColours.matteBlack,
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                  }}
                />
              </button>
            </div>

            {/* What's Tracked Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: flowCoreColours.textPrimary,
                  textTransform: 'lowercase',
                  margin: '0 0 12px 0',
                }}
              >
                what's tracked
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '13px',
                  color: flowCoreColours.textSecondary,
                  lineHeight: 1.8,
                }}
              >
                <li style={{ paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                    •
                  </span>
                  save frequency and timing
                </li>
                <li style={{ paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                    •
                  </span>
                  agent execution counts
                </li>
                <li style={{ paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                    •
                  </span>
                  share actions
                </li>
                <li style={{ paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                    •
                  </span>
                  time in flow state
                </li>
                <li style={{ paddingLeft: '16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                    •
                  </span>
                  tab navigation patterns
                </li>
              </ul>
            </div>

            {/* Privacy Notice */}
            <div
              style={{
                padding: '16px',
                backgroundColor: analyticsEnabled
                  ? 'rgba(58, 169, 190, 0.1)' // Slate Cyan tint
                  : 'rgba(229, 115, 115, 0.1)', // Red tint
                border: `1px solid ${analyticsEnabled ? flowCoreColours.slateCyan : '#E57373'}`,
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: flowCoreColours.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: flowCoreColours.textPrimary }}>
                  privacy-first design:
                </strong>
                <br />
                {analyticsEnabled
                  ? 'Analytics help improve your workflow with adaptive insights. Data is stored securely and never shared with third parties.'
                  : 'Local-only mode: No data is sent to the server. Insights and analytics will not be available.'}
              </div>
            </div>

            {/* Change Notice */}
            {hasChanged && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px 16px',
                  backgroundColor: flowCoreColours.darkGrey,
                  border: `1px solid ${flowCoreColours.iceCyan}`,
                  borderRadius: '4px',
                  marginBottom: '24px',
                  fontSize: '13px',
                  color: flowCoreColours.iceCyan,
                  textAlign: 'center',
                }}
              >
                settings saved! changes take effect immediately
              </motion.div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: flowCoreColours.slateCyan,
                  border: 'none',
                  borderRadius: '4px',
                  color: flowCoreColours.matteBlack,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'lowercase',
                  transition: 'all 0.24s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = flowCoreColours.iceCyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = flowCoreColours.slateCyan
                }}
              >
                close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * PrivacyBadge Component
 * Displays "local only" badge when analytics disabled
 */
export function PrivacyBadge() {
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(true)

  useEffect(() => {
    setAnalyticsEnabledState(getAnalyticsEnabled())

    // Listen for storage changes (when settings updated in another tab)
    const handleStorageChange = () => {
      setAnalyticsEnabledState(getAnalyticsEnabled())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (analyticsEnabled) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 40,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderGrey}`,
        borderRadius: '24px',
        fontSize: '12px',
        fontWeight: 500,
        color: flowCoreColours.textSecondary,
        textTransform: 'lowercase',
        letterSpacing: '0.3px',
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
      role="status"
      aria-label="Analytics disabled, local-only mode"
    >
      {/* Lock icon */}
      <span style={{ fontSize: '14px' }}>🔒</span>
      local only
    </motion.div>
  )
}
