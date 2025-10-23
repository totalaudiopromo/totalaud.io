'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSSelection, type OSTheme } from '@aud-web/hooks/useOSSelection'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'
import { AmbientSound } from '@aud-web/components/ui/ambient'

interface OSSelectorProps {
  onConfirm: (theme: OSTheme) => void
}

/**
 * Phase 2: Interactive OS selection with arrow-key navigation.
 * User selects their creative environment.
 */
export function OSSelector({ onConfirm }: OSSelectorProps) {
  const { updatePrefs } = useUserPrefs()
  const { options, activeIndex, selectedTheme, isConfirmed, handleKeyPress } = useOSSelection(
    async (theme) => {
      // Persist theme selection to user preferences
      await updatePrefs({ preferred_theme: theme })
      onConfirm(theme)
    }
  )

  // Attach keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      handleKeyPress(e)
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handleKeyPress])

  return (
    <div className="os-selector">
      <AmbientSound type="operator-hum" autoPlay />

      <motion.div
        className="os-selector__window"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="os-selector__content">
          <motion.div
            className="os-selector__header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            operator&gt; one last thing — choose your environment.
          </motion.div>

          <div className="os-selector__options">
            <AnimatePresence mode="sync">
              {options.map((option, index) => {
                const isActive = index === activeIndex
                const isSelected = selectedTheme === option.id

                return (
                  <motion.div
                    key={option.id}
                    className={`os-selector__option ${isActive ? 'os-selector__option--active' : ''} ${isSelected ? 'os-selector__option--selected' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: isActive ? 1 : 0.5,
                      x: 0,
                      scale: isActive ? 1.02 : 1,
                    }}
                    transition={{
                      duration: 0.2,
                      opacity: { duration: isActive ? 1 : 0.3 },
                    }}
                  >
                    <span className="os-selector__bracket">[</span>
                    <span className="os-selector__label">{option.label}</span>
                    <span className="os-selector__bracket">]</span>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {!isConfirmed && (
            <motion.div
              className="os-selector__hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              use ↑↓ to navigate, enter to confirm
            </motion.div>
          )}

          {isConfirmed && selectedTheme && (
            <motion.div
              className="os-selector__confirmation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              operator&gt; {selectedTheme} selected. initialising...
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
