"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { OSTheme, THEME_CONFIGS } from "@/types/themes"
import { useUISound } from "@/hooks/useUISound"

interface BrokerIntroProps {
  selectedMode: OSTheme
  onComplete: () => void
}

const THEME_GREETINGS: Record<OSTheme, string> = {
  ascii: "⟩ agent broker online_",
  xp: "► Broker.exe initialized",
  aqua: "• Hey, Broker here.",
  ableton: "● BROKER: ONLINE",
  punk: "✦ YO. BROKER. LET'S GO."
}

export default function BrokerIntro({ selectedMode, onComplete }: BrokerIntroProps) {
  const [visible, setVisible] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(0)
  const sound = useUISound()
  const theme = THEME_CONFIGS[selectedMode]

  useEffect(() => {
    // Play agent spawn sound
    if (sound.config.enabled) {
      sound.agentStart()
    }

    // Fade in
    setTimeout(() => setVisible(true), 100)

    // Pulse glow
    const glowInterval = setInterval(() => {
      setGlowIntensity(prev => {
        if (prev >= 50) return 0
        return prev + 10
      })
    }, 100)

    // Complete intro after 1.5s
    const timer = setTimeout(() => {
      onComplete()
    }, 1500)

    return () => {
      clearInterval(glowInterval)
      clearTimeout(timer)
    }
  }, [onComplete, sound, selectedMode])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fontFamily
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${theme.colors.primary}${glowIntensity.toString(16).padStart(2, '0')}, transparent 60%)`,
          transition: 'background 0.1s ease-out'
        }}
      />

      {/* Scanline effect for ASCII mode */}
      {selectedMode === 'ascii' && (
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
          <div
            className="font-mono text-lg"
            style={{ color: theme.colors.primary }}
          >
            {THEME_GREETINGS[selectedMode]}
          </div>

          {/* Agent name */}
          <div
            className="text-3xl font-bold"
            style={{ color: theme.colors.text }}
          >
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
            <span
              className="text-sm font-mono"
              style={{ color: theme.colors.text, opacity: 0.7 }}
            >
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
            Right… before we start, who am I talking to?
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

