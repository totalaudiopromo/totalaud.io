'use client'

/**
 * Fusion Mode Canvas
 * Radial layout showing all 5 OS perspectives collaborating
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFusion } from '@totalaud/os-state/campaign'
import type { ThemeId, FusionOutput } from '@totalaud/os-state/campaign'
import { X, Sparkles } from 'lucide-react'
import { FusionOSBubble } from './FusionOSBubble'
import { FusionOutputRenderer } from './FusionOutputRenderer'

interface FusionModeCanvasProps {
  isOpen: boolean
  onClose: () => void
  fusionOutput?: FusionOutput | null
  onCreateFusionCard?: () => void
}

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

const OS_POSITIONS: Record<ThemeId, { x: number; y: number }> = {
  ascii: { x: 0, y: -200 }, // Top
  xp: { x: 190, y: -60 }, // Top right
  aqua: { x: 120, y: 160 }, // Bottom right
  daw: { x: -120, y: 160 }, // Bottom left
  analogue: { x: -190, y: -60 }, // Top left
}

export function FusionModeCanvas({
  isOpen,
  onClose,
  fusionOutput,
  onCreateFusionCard,
}: FusionModeCanvasProps) {
  const { fusion } = useFusion()
  const [activeOS, setActiveOS] = useState<ThemeId | null>(null)

  if (!isOpen) return null

  const currentSession = fusion.currentSession
  const osContributors = currentSession?.osContributors || [
    'ascii',
    'xp',
    'aqua',
    'daw',
    'analogue',
  ]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-centre justify-centre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Main Canvas */}
        <motion.div
          className="relative z-10 h-[90vh] w-[90vw] max-w-6xl rounded-lg border border-[var(--flowcore-colour-border)] bg-[var(--flowcore-colour-bg)] shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex items-centre justify-between border-b border-[var(--flowcore-colour-border)] p-4">
            <div className="flex items-centre gap-3">
              <Sparkles
                size={24}
                className="text-[var(--flowcore-colour-accent)]"
              />
              <div>
                <h2 className="font-mono text-lg font-semibold text-[var(--flowcore-colour-fg)]">
                  Fusion Mode
                </h2>
                <p className="font-mono text-xs text-[var(--flowcore-colour-fg)]/70">
                  5 OS Perspectives Collaborating
                </p>
              </div>
            </div>

            <div className="flex items-centre gap-2">
              {onCreateFusionCard && fusionOutput && (
                <button
                  onClick={onCreateFusionCard}
                  className="rounded bg-[var(--flowcore-colour-accent)] px-4 py-2 font-mono text-sm font-semibold text-white transition-all hover:opacity-90"
                >
                  Create Fusion Card
                </button>
              )}

              <button
                onClick={onClose}
                className="rounded p-2 text-[var(--flowcore-colour-fg)]/70 transition-colours hover:bg-[var(--flowcore-colour-fg)]/10 hover:text-[var(--flowcore-colour-fg)]"
                aria-label="Close fusion mode"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex h-[calc(100%-80px)] flex-col">
            {/* Radial OS Layout */}
            <div className="relative flex-1">
              {/* Centre Focus */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="flex h-32 w-32 items-centre justify-centre rounded-full border-2 border-[var(--flowcore-colour-accent)] bg-[var(--flowcore-colour-accent)]/10"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <p className="text-centre font-mono text-sm font-semibold uppercase text-[var(--flowcore-colour-accent)]">
                    {currentSession?.focusType || 'Focus'}
                  </p>
                </motion.div>
              </div>

              {/* OS Bubbles in Radial Layout */}
              {osContributors.map((os, index) => {
                const position = OS_POSITIONS[os]
                const colour = OS_COLOURS[os]
                const contribution = fusionOutput?.perOS[os]

                return (
                  <motion.div
                    key={os}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {/* Connection Line to Centre */}
                    <svg
                      className="pointer-events-none absolute left-1/2 top-1/2"
                      style={{
                        width: Math.abs(position.x) * 2 + 100,
                        height: Math.abs(position.y) * 2 + 100,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <motion.line
                        x1="50%"
                        y1="50%"
                        x2={position.x > 0 ? '0%' : '100%'}
                        y2={position.y > 0 ? '0%' : '100%'}
                        stroke={colour}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                      />
                    </svg>

                    <FusionOSBubble
                      os={os}
                      contribution={contribution}
                      isActive={activeOS === os}
                      onClick={() => setActiveOS(activeOS === os ? null : os)}
                    />
                  </motion.div>
                )
              })}
            </div>

            {/* Output Renderer (Bottom Panel) */}
            {fusionOutput && (
              <div className="border-t border-[var(--flowcore-colour-border)] p-4">
                <FusionOutputRenderer fusionOutput={fusionOutput} activeOS={activeOS} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
