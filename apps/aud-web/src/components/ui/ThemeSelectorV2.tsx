'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence, useReducedMotion } from 'framer-motion'
import { THEME_CONFIGS, type OSTheme } from '@aud-web/types/themes'
import { springPresets, motionTokens } from '@aud-web/tokens/motion'
import { semanticColours, withOpacity } from '@aud-web/tokens/colors'
import { playSound } from '@aud-web/tokens/sounds'

interface ThemeSelectorV2Props {
  onSelect: (theme: OSTheme) => void
  initialTheme?: OSTheme
  autoFocus?: boolean
  muted?: boolean
  onAnalytics?: (event: string, data: Record<string, unknown>) => void
}

const THEMES: OSTheme[] = ['operator', 'guide', 'map', 'timeline', 'tape']

// Theme posture hints (from Theme Refactor Phase 1)
const THEME_POSTURES: Record<OSTheme, string> = {
  operator: 'Fast Lane – Keyboard-first sprints',
  guide: 'Pathfinder – Step-by-step with guardrails',
  map: 'Strategist – Spatial planning & dependencies',
  timeline: 'Sequencer – Time-based execution',
  tape: 'Receipt – Grounded notes become actions',
}

/**
 * ThemeSelectorV2 - Cinematic theme selector matching landing page quality
 *
 * Design principles:
 * - Slate Cyan (#3AA9BE) accent (brand colour)
 * - Sharp 2px borders, no rounded corners
 * - Framer Motion spring physics (120/240/400ms rhythm)
 * - Subtle ambient pulse (12s cycle)
 * - Theme tagline previews
 * - Premium sound design
 * - No brackets, no generic blue, no cheap box shadows
 */
export function ThemeSelectorV2({
  onSelect,
  initialTheme = 'operator',
  autoFocus = true,
  muted = false,
  onAnalytics,
}: ThemeSelectorV2Props) {
  const [activeIndex, setActiveIndex] = useState(() =>
    THEMES.indexOf(initialTheme)
  )
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reduced motion support
  const prefersReducedMotion = useReducedMotion()

  // Cursor position for magnetism effect
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  // Smooth spring-based highlight position with back-spring overshoot
  const highlightY = useSpring(activeIndex * 88, {
    ...springPresets.medium,
    // Add slight overshoot for cinematic tactile feel
    stiffness: 140,
    damping: prefersReducedMotion ? 30 : 18, // Less bounce in reduced motion
  })
  const smoothY = useTransform(highlightY, (v) => `${v}px`)

  // Ambient pulse (12s cycle like landing page)
  const [pulsePhase, setPulsePhase] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion) return // Skip animation in reduced motion

    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 360)
    }, 12000 / 360) // 12 second full cycle
    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  const glowOpacity = prefersReducedMotion
    ? 0.08
    : 0.15 + Math.sin((pulsePhase * Math.PI) / 180) * 0.05

  // Keyboard navigation with sound feedback
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isConfirmed) return

      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault()
          setActiveIndex((i) => {
            const newIndex = i > 0 ? i - 1 : THEMES.length - 1
            // Play subtle focus sound
            if (!muted) {
              playSound('task-armed', { volume: 0.08 })
            }
            return newIndex
          })
          break

        case 'ArrowDown':
        case 'j':
          e.preventDefault()
          setActiveIndex((i) => {
            const newIndex = i < THEMES.length - 1 ? i + 1 : 0
            // Play subtle focus sound
            if (!muted) {
              playSound('task-armed', { volume: 0.08 })
            }
            return newIndex
          })
          break

        case 'Enter':
          e.preventDefault()
          setIsConfirmed(true)

          // Play confirmation sound
          if (!muted) {
            playSound('success-soft', { volume: 0.15 })
          }

          // Track analytics
          if (onAnalytics) {
            onAnalytics('theme_select', {
              theme: THEMES[activeIndex],
              method: 'keyboard',
              timestamp: new Date().toISOString(),
            })
          }

          // Delay to show confirmation animation
          setTimeout(() => {
            onSelect(THEMES[activeIndex])
          }, motionTokens.normal)
          break

        case 'Escape':
          e.preventDefault()
          // Optional: close or reset
          break
      }
    },
    [activeIndex, isConfirmed, muted, onSelect, onAnalytics]
  )

  useEffect(() => {
    if (autoFocus) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [autoFocus, handleKeyDown])

  const handleThemeClick = (index: number) => {
    if (isConfirmed) return

    setActiveIndex(index)
    setIsConfirmed(true)

    // Play confirmation sound
    if (!muted) {
      playSound('success-soft', { volume: 0.15 })
    }

    // Track analytics
    if (onAnalytics) {
      onAnalytics('theme_select', {
        theme: THEMES[index],
        method: 'click',
        timestamp: new Date().toISOString(),
      })
    }

    setTimeout(() => {
      onSelect(THEMES[index])
    }, motionTokens.normal)
  }

  // Cursor magnetism tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || prefersReducedMotion) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cursorX.set(x)
    cursorY.set(y)
  }, [cursorX, cursorY, prefersReducedMotion])

  return (
    <div className="theme-selector-v2">
      {/* Ambient background glow */}
      <motion.div
        className="theme-selector-v2__ambient"
        animate={{
          opacity: glowOpacity,
        }}
        transition={{
          duration: 12,
          ease: 'linear',
          repeat: Infinity,
        }}
      />

      <motion.div
        ref={containerRef}
        className="theme-selector-v2__container"
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={springPresets.medium}
      >
        {/* Header */}
        <motion.div
          className="theme-selector-v2__header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: motionTokens.fadeDuration }}
        >
          <div className="theme-selector-v2__title">select your environment</div>
          <div className="theme-selector-v2__subtitle">
            each theme optimises for a different creative posture
          </div>
        </motion.div>

        {/* Theme options */}
        <div className="theme-selector-v2__options">
          {/* Active highlight (follows selection) */}
          <motion.div
            className="theme-selector-v2__highlight"
            style={{ y: smoothY }}
            initial={false}
            transition={springPresets.medium}
          />

          <AnimatePresence mode="sync">
            {THEMES.map((themeId, index) => {
              const config = THEME_CONFIGS[themeId]
              const isActive = index === activeIndex
              const isHovered = index === hoveredIndex

              return (
                <motion.button
                  key={themeId}
                  className={`theme-selector-v2__option ${
                    isActive ? 'theme-selector-v2__option--active' : ''
                  } ${isConfirmed && isActive ? 'theme-selector-v2__option--confirmed' : ''}`}
                  onClick={() => handleThemeClick(index)}
                  onMouseEnter={() => {
                    setHoveredIndex(index)
                    // Play subtle hover sound
                    if (!muted) {
                      playSound('task-armed', { volume: 0.06 })
                    }
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    // Back-spring overshoot: 1.03 → settle to 1.0
                    scale: isActive || isHovered
                      ? prefersReducedMotion
                        ? 1.01
                        : 1.03
                      : 1,
                  }}
                  transition={{
                    ...springPresets.fast,
                    delay: index * 0.05,
                    // Custom spring for overshoot
                    scale: {
                      type: 'spring',
                      stiffness: 150,
                      damping: prefersReducedMotion ? 25 : 15,
                    },
                  }}
                  whileHover={{
                    x: prefersReducedMotion ? 2 : 4,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Glow ripple on hover */}
                  {(isActive || isHovered) && !prefersReducedMotion && (
                    <motion.div
                      className="theme-selector-v2__glow-ripple"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.05, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: motionTokens.slow }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at center, ${semanticColours.accent} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  <div className="theme-selector-v2__option-content">
                    <div className="theme-selector-v2__option-name">
                      {config.displayName}
                    </div>
                    <motion.div
                      className="theme-selector-v2__option-tagline"
                      animate={{
                        opacity: isActive || isHovered ? 1 : 0.5,
                      }}
                      transition={{ duration: motionTokens.fast }}
                    >
                      {config.tagline}
                    </motion.div>
                    {/* Posture hint (microcopy preview) */}
                    {(isActive || isHovered) && (
                      <motion.div
                        className="theme-selector-v2__option-posture"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 0.6, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: motionTokens.fast }}
                      >
                        {THEME_POSTURES[themeId]}
                      </motion.div>
                    )}
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="theme-selector-v2__indicator"
                      layoutId="active-indicator"
                      initial={false}
                      transition={springPresets.fast}
                    />
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Keyboard hints */}
        {!isConfirmed && (
          <motion.div
            className="theme-selector-v2__hints"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.5, duration: motionTokens.slow }}
          >
            <span className="theme-selector-v2__hint">↑↓ or j/k to navigate</span>
            <span className="theme-selector-v2__hint-separator">·</span>
            <span className="theme-selector-v2__hint">enter to confirm</span>
          </motion.div>
        )}

        {/* Confirmation message */}
        <AnimatePresence>
          {isConfirmed && (
            <motion.div
              className="theme-selector-v2__confirmation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={springPresets.fast}
            >
              {THEME_CONFIGS[THEMES[activeIndex]].displayName} selected — initialising
              environment...
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
