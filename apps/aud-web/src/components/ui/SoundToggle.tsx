'use client'

/**
 * SoundToggle Component
 *
 * Global audio control for ambient sound and UI effects
 * Addresses UX pain point: constant audible hum in dashboard
 *
 * Flow Studio Usability - Sound Director
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'

export interface SoundToggleProps {
  /**
   * Position of the toggle
   * @default 'bottom-left'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  /**
   * Show label alongside icon
   * @default false
   */
  showLabel?: boolean
}

export function SoundToggle({ position = 'bottom-left', showLabel = false }: SoundToggleProps) {
  // Get sound preference from workspace store
  const soundEnabled = useWorkspaceStore((state) => state.uiPreferences?.soundEnabled ?? true)
  const setSoundEnabled = (enabled: boolean) => {
    useWorkspaceStore.setState((state) => ({
      uiPreferences: {
        ...state.uiPreferences,
        soundEnabled: enabled,
      },
    }))
  }

  const [localEnabled, setLocalEnabled] = useState(soundEnabled)

  // Sync with store
  useEffect(() => {
    setLocalEnabled(soundEnabled)
  }, [soundEnabled])

  const handleToggle = () => {
    const newState = !localEnabled
    setLocalEnabled(newState)
    setSoundEnabled(newState)

    // Optional: Play a confirmation sound when enabling
    if (newState && typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.value = 523 // C5 note
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    }
  }

  // Position classes
  const positionClasses = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-24', // Offset from Operator Command Palette trigger
  }

  return (
    <motion.button
      onClick={handleToggle}
      className={`
        fixed ${positionClasses[position]} z-40
        flex items-center gap-2 px-3 py-2
        bg-background/90 border border-border rounded-lg
        shadow-lg hover:shadow-xl transition-all backdrop-blur-sm
        group
      `}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label={localEnabled ? 'Mute sounds' : 'Unmute sounds'}
      title={
        localEnabled ? 'Mute ambient sound and UI effects' : 'Enable ambient sound and UI effects'
      }
    >
      {localEnabled ? (
        <Volume2 className="w-4 h-4 text-accent transition-colors group-hover:text-accent/80" />
      ) : (
        <VolumeX className="w-4 h-4 text-muted transition-colors group-hover:text-foreground" />
      )}

      {showLabel && (
        <span className="text-sm text-foreground font-medium">
          {localEnabled ? 'Sound On' : 'Sound Off'}
        </span>
      )}

      {/* Indicator dot */}
      <motion.div
        className={`
          absolute -top-1 -right-1 w-2 h-2 rounded-full
          ${localEnabled ? 'bg-accent' : 'bg-muted'}
        `}
        animate={{
          scale: localEnabled ? [1, 1.2, 1] : 1,
          opacity: localEnabled ? [1, 0.7, 1] : 0.5,
        }}
        transition={{
          duration: 2,
          repeat: localEnabled ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  )
}

/**
 * Hook for checking sound enabled state
 */
export function useSoundEnabled() {
  const soundEnabled = useWorkspaceStore((state) => state.uiPreferences?.soundEnabled ?? true)

  return soundEnabled
}
