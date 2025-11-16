/**
 * Showreel Caption Bar
 * Phase 17: Lower-third cinematic captions
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ShowreelScene } from '@totalaud/showreel'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

interface ShowreelCaptionBarProps {
  scene: ShowreelScene
  sceneElapsed: number
}

export function ShowreelCaptionBar({ scene, sceneElapsed }: ShowreelCaptionBarProps) {
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const captions = scene.captions || []

  useEffect(() => {
    // Reset when scene changes
    setCurrentCaptionIndex(0)
    setIsVisible(false)

    if (captions.length === 0) return

    // Calculate caption timing
    const captionDuration = scene.durationSeconds / captions.length
    const currentCaptionIdx = Math.min(
      Math.floor(sceneElapsed / captionDuration),
      captions.length - 1
    )

    setCurrentCaptionIndex(currentCaptionIdx)

    // Show caption for 80% of its duration, hide for 20%
    const showDuration = captionDuration * 0.8
    const elapsedInCaption = sceneElapsed % captionDuration

    setIsVisible(elapsedInCaption < showDuration)
  }, [scene, sceneElapsed, captions.length])

  if (captions.length === 0) return null

  const currentCaption = captions[currentCaptionIndex]

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '800px',
        width: '90%',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="wait">
        {isVisible && currentCaption && (
          <motion.div
            key={`${scene.id}-${currentCaptionIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: '20px 32px',
              backgroundColor: `${flowCoreColours.matteBlack}f0`,
              border: `1px solid ${flowCoreColours.slateCyan}40`,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: flowCoreColours.textPrimary,
                lineHeight: 1.6,
                textShadow: `0 0 10px ${flowCoreColours.matteBlack}`,
              }}
            >
              {currentCaption}
            </div>

            {/* Progress dots */}
            {captions.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                }}
              >
                {captions.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: idx === currentCaptionIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor:
                        idx === currentCaptionIndex
                          ? flowCoreColours.slateCyan
                          : `${flowCoreColours.textTertiary}40`,
                      transition: 'all 240ms ease',
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
