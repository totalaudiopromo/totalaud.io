'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { THEME_CONFIGS, type OSTheme } from '@aud-web/types/themes'
import { springPresets, motionTokens } from '@aud-web/tokens/motion'

interface ThemeSelectorV2Props {
  onSelect: (theme: OSTheme) => void
  initialTheme?: OSTheme
  autoFocus?: boolean
}

const THEMES: OSTheme[] = ['operator', 'guide', 'map', 'timeline', 'tape']

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
}: ThemeSelectorV2Props) {
  const [activeIndex, setActiveIndex] = useState(() =>
    THEMES.indexOf(initialTheme)
  )
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Smooth spring-based highlight position
  const highlightY = useSpring(activeIndex * 88, springPresets.medium)
  const smoothY = useTransform(highlightY, (v) => `${v}px`)

  // Ambient pulse (12s cycle like landing page)
  const [pulsePhase, setPulsePhase] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 360)
    }, 12000 / 360) // 12 second full cycle
    return () => clearInterval(interval)
  }, [])

  const glowOpacity = 0.15 + Math.sin((pulsePhase * Math.PI) / 180) * 0.05

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isConfirmed) return

      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault()
          setActiveIndex((i) => (i > 0 ? i - 1 : THEMES.length - 1))
          break

        case 'ArrowDown':
        case 'j':
          e.preventDefault()
          setActiveIndex((i) => (i < THEMES.length - 1 ? i + 1 : 0))
          break

        case 'Enter':
          e.preventDefault()
          setIsConfirmed(true)
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
    [activeIndex, isConfirmed, onSelect]
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
    setTimeout(() => {
      onSelect(THEMES[index])
    }, motionTokens.normal)
  }

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
        className="theme-selector-v2__container"
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
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: isActive || isHovered ? 1.01 : 1,
                  }}
                  transition={{
                    ...springPresets.fast,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    x: 4,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                >
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
