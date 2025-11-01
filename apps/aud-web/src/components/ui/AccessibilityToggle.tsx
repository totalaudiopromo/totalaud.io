/**
 * Accessibility Toggle Component
 *
 * Provides quick access to accessibility features:
 * - Calm Mode (reduced motion)
 * - Mute Sounds
 * - High Contrast (future)
 *
 * Integrates with user preferences and system settings.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'
import { prefersReducedMotion } from '@/components/themes/motionProfiles'

interface AccessibilityToggleProps {
  className?: string
}

export function AccessibilityToggle({ className = '' }: AccessibilityToggleProps) {
  const { prefs, updatePrefs } = useUserPrefs(null)
  const [isOpen, setIsOpen] = useState(false)
  const [systemReducedMotion, setSystemReducedMotion] = useState(false)

  // Monitor system reduced motion preference
  useEffect(() => {
    setSystemReducedMotion(prefersReducedMotion())

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Determine if calm mode is active
  const calmModeActive = prefs?.reduced_motion || systemReducedMotion

  // Toggle calm mode
  const toggleCalmMode = async () => {
    await updatePrefs({ reduced_motion: !prefs?.reduced_motion })
  }

  // Toggle sound
  const toggleSound = async () => {
    await updatePrefs({ mute_sounds: !prefs?.mute_sounds })
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-[var(--theme-bg-secondary)]
          border border-[var(--theme-border-subtle)]
          text-[var(--theme-text)]
          hover:bg-[var(--theme-bg-tertiary)]
          hover:border-[var(--theme-accent)]
          transition-colors duration-200
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Accessibility Settings"
        aria-expanded={isOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4m0-4h.01" />
        </svg>
        <span className="text-sm font-medium">Accessibility</span>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute right-0 mt-2 w-72 p-4
              bg-[var(--theme-bg)]
              border border-[var(--theme-border)]
              rounded-lg shadow-lg
              z-50
            `}
          >
            <h3 className="text-sm font-semibold text-[var(--theme-text)] mb-3">Accessibility</h3>

            {/* Calm Mode Toggle */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-[var(--theme-border-subtle)]">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <label
                    htmlFor="calm-mode"
                    className="text-sm font-medium text-[var(--theme-text)]"
                  >
                    Calm Mode
                  </label>
                  {systemReducedMotion && (
                    <span className="text-xs text-[var(--theme-text-tertiary)]">(System)</span>
                  )}
                </div>
                <p className="text-xs text-[var(--theme-text-secondary)]">
                  Reduces motion by 80%, replaces springs with fades
                </p>
              </div>
              <button
                id="calm-mode"
                onClick={toggleCalmMode}
                disabled={systemReducedMotion}
                className={`
                  relative flex-shrink-0 w-11 h-6 ml-3
                  rounded-full transition-colors duration-200
                  ${calmModeActive ? 'bg-[var(--theme-accent)]' : 'bg-[var(--theme-border-subtle)]'}
                  ${systemReducedMotion ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                role="switch"
                aria-checked={calmModeActive}
                aria-label="Toggle Calm Mode"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5
                    bg-white rounded-full shadow-sm
                    transition-transform duration-200
                    ${calmModeActive ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Mute Sounds Toggle */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-[var(--theme-border-subtle)]">
              <div className="flex-1">
                <label
                  htmlFor="mute-sounds"
                  className="text-sm font-medium text-[var(--theme-text)] block mb-1"
                >
                  Mute Sounds
                </label>
                <p className="text-xs text-[var(--theme-text-secondary)]">
                  Disables all UI sounds and audio feedback
                </p>
              </div>
              <button
                id="mute-sounds"
                onClick={toggleSound}
                className={`
                  relative flex-shrink-0 w-11 h-6 ml-3
                  rounded-full transition-colors duration-200 cursor-pointer
                  ${
                    prefs?.mute_sounds
                      ? 'bg-[var(--theme-accent)]'
                      : 'bg-[var(--theme-border-subtle)]'
                  }
                `}
                role="switch"
                aria-checked={prefs?.mute_sounds}
                aria-label="Toggle Sound"
              >
                <span
                  className={`
                    absolute top-0.5 left-0.5 w-5 h-5
                    bg-white rounded-full shadow-sm
                    transition-transform duration-200
                    ${prefs?.mute_sounds ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>

            {/* Info Footer */}
            <div className="text-xs text-[var(--theme-text-tertiary)]">
              <p>
                These settings sync across devices.{' '}
                {systemReducedMotion && 'System-level motion preferences detected.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
