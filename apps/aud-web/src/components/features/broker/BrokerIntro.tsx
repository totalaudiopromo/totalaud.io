'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { OSTheme, THEME_CONFIGS } from '@aud-web/types/themes'
import { audioEngine, getTheme } from '@total-audio/core-theme-engine'
import type { ThemeId } from '@total-audio/core-theme-engine'
import { getBrokerPersonality, getPersonalityLine } from '@total-audio/core-agent-executor/client'

interface BrokerIntroProps {
  selectedMode: OSTheme
  onComplete: () => void
}

export default function BrokerIntro({ selectedMode, onComplete }: BrokerIntroProps) {
  const [visible, setVisible] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const theme = THEME_CONFIGS[selectedMode]
  const themeManifest = getTheme(selectedMode as ThemeId)
  const personality = getBrokerPersonality(selectedMode)
  const themeGreeting = getPersonalityLine(personality, 'openingLines')

  useEffect(() => {
    console.log('[BrokerIntro] Mounted, starting 1.5s timer')

    // Play agent spawn sound using Theme Engine
    audioEngine.play(themeManifest.sounds.agentSpeak)

    // Fade in
    setTimeout(() => setVisible(true), 100)

    // Pulse glow
    const glowInterval = setInterval(() => {
      setGlowIntensity((prev) => {
        if (prev >= 50) return 0
        return prev + 10
      })
    }, 100)

    // Complete intro after 1.5s
    const timer = setTimeout(() => {
      console.log('[BrokerIntro] Timer complete, calling onComplete')
      onComplete()
    }, 1500)

    return () => {
      console.log('[BrokerIntro] Cleanup')
      clearInterval(glowInterval)
      clearTimeout(timer)
    }
  }, [onComplete]) // Removed 'sound' and 'selectedMode' to prevent infinite loop

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${theme.colors.primary}${glowIntensity.toString(16).padStart(2, '0')}, transparent 60%)`,
          transition: 'background 0.1s ease-out',
        }}
      />

      {/* Scanline effect for ASCII mode */}
      {selectedMode === 'operator' && (
        <div className="absolute inset-0 scanline-effect opacity-20 pointer-events-none" />
      )}

      <div className="relative z-10 text-center space-y-6 max-w-2xl px-8">
        {/* Agent icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-7xl mb-4"
        >
          🎙️
        </motion.div>

        {/* Status text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="space-y-3"
        >
          {/* Theme-specific greeting */}
          <div className="font-mono text-lg" style={{ color: theme.colors.primary }}>
            {themeGreeting}
          </div>

          {/* Agent name */}
          <div className="text-3xl font-bold" style={{ color: theme.colors.text }}>
            Agent Broker
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.accent }}
            />
            <span className="text-sm font-mono" style={{ color: theme.colors.text, opacity: 0.7 }}>
              [OK]
            </span>
          </div>

          {/* First message preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-sm italic mt-6"
            style={{ color: theme.colors.text }}
          >
            {personality.opener}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
