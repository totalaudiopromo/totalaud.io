/**
 * ASCII OS Container
 * Full-screen terminal-style creative workspace
 * 
 * Features:
 * - Matte black background with scanlines
 * - Terminal green accent colors
 * - Noise texture overlay
 * - Centered terminal layout
 */

'use client'

import { JetBrains_Mono } from 'next/font/google'
import { motion, useReducedMotion } from 'framer-motion'
import { AsciiWindow } from './AsciiWindow'
import { AsciiCommandBar } from './AsciiCommandBar'
import { AsciiButton } from './AsciiButton'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import type { OSSlug } from '@/components/os/navigation/OSMetadata'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'

const mono = JetBrains_Mono({ subsets: ['latin'], weight: '400' })

interface AsciiOSContainerProps {
  onSetOS?: (slug: OSSlug) => void
}

export function AsciiOSContainer({ onSetOS }: AsciiOSContainerProps) {
  const { play } = useThemeAudio()
  const ambient = useOptionalAmbient()
  const prefersReducedMotion = useReducedMotion()

  const intensity = ambient?.effectiveIntensity ?? 0
  const glow = prefersReducedMotion ? intensity * 0.1 : intensity
  const vignetteOpacity = 0.08 + glow * 0.18

  return (
    <div
      className={
        mono.className +
        ' relative min-h-screen w-full overflow-hidden bg-[#0F1113] text-[#00ff99] font-mono'
      }
    >
      {/* Noise texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-[url('/textures/noise.png')]" />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none 
        bg-[linear-gradient(to_bottom,transparent_95%,rgba(0,255,100,0.4)_100%)] 
        bg-[length:100%_4px]"
        style={{ opacity: 0.04 + glow * 0.08 }}
      />

      {/* Ambient vignette pulse */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 0, rgba(0,0,0,0.9) 70%)',
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                opacity: [vignetteOpacity, vignetteOpacity + 0.06],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }
        }
      />

      {/* Center column */}
      <div className="relative w-full flex justify-center pt-10">
        <div className="max-w-3xl w-full px-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>SYSTEM</span>
              <span className="opacity-60">v1.0.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span className="opacity-60">ONLINE</span>
            </div>
          </div>

          {/* Main workspace */}
          <AsciiWindow title="WORKSPACE">
            <div className="p-4 space-y-4">
              <p className="text-sm leading-relaxed">
                Welcome to ASCII OS — your terminal-inspired creative workspace.
              </p>
              <p className="text-sm leading-relaxed opacity-60">
                This is a low-fi environment designed for focus and flow.
              </p>
              <div className="pt-4 flex gap-4">
                <AsciiButton onClick={() => play('click')}>START SESSION</AsciiButton>
                <AsciiButton onClick={() => play('click')} variant="secondary">
                  SETTINGS
                </AsciiButton>
              </div>
            </div>
          </AsciiWindow>

          {/* Status panel */}
          <AsciiWindow title="STATUS">
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="opacity-60">CPU</span>
                <span>12%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">MEM</span>
                <span>4.2GB</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">UPTIME</span>
                <span>02:34:17</span>
              </div>
              <div className="pt-2 border-t border-[#00ff9933]">
                <span className="opacity-60">PROCESSES</span>
                <div className="mt-2 space-y-1">
                  <div>→ audio.engine</div>
                  <div>→ flow.manager</div>
                  <div>→ theme.daemon</div>
                </div>
              </div>
            </div>
          </AsciiWindow>

          {/* Command bar at bottom */}
          <AsciiCommandBar onSetOS={onSetOS} />
        </div>
      </div>
    </div>
  )
}

