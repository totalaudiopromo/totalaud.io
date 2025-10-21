"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { OSTheme, THEME_CONFIGS } from "@aud-web/types/themes"
import { audioEngine, getTheme } from "@total-audio/core-theme-engine"
import type { ThemeId } from "@total-audio/core-theme-engine"

interface OSTransitionProps {
  selectedMode: OSTheme
  onComplete?: () => void
}

const BOOT_MESSAGES: Record<OSTheme, string[]> = {
  ascii: [
    "INITIALIZING AGENT INTERFACE…",
    "LOADING SKILLS_ENGINE.DLL",
    "SYNCHRONIZING RESEARCH CONTACTS…",
    "CONNECTING TO SUPABASE::OK",
    "SYSTEM READY_"
  ],
  xp: [
    "Loading VST plugins...",
    "Rendering GUI assets...",
    "Initializing creative workspace...",
    "Ready."
  ],
  aqua: [
    "Mounting volumes...",
    "Connecting iChat Agent...",
    "Initializing Aqua interface...",
    "Welcome to your studio."
  ],
  daw: [
    "INIT: MIDI ROUTES",
    "LOAD: SESSION CLIPS",
    "SYNC: AGENT SEQUENCER",
    "PLAYBACK READY…"
  ],
  analogue: [
    "Warming up the signal…",
    "Loading tape emulation…",
    "Adjusting gain staging…",
    "Ready to record."
  ]
}

export default function OSTransition({ selectedMode, onComplete }: OSTransitionProps) {
  const [phase, setPhase] = useState<'fadeout' | 'boot' | 'fadein'>('fadeout')
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const theme = THEME_CONFIGS[selectedMode]
  const themeManifest = getTheme(selectedMode as ThemeId)

  useEffect(() => {
    console.log('[OSTransition] Mounted with mode:', selectedMode)
    
    // Play boot sound using Theme Engine audio synthesis
    audioEngine.play(themeManifest.sounds.boot)

    // Transition phases
    const timeline = [
      { delay: 0, action: () => {
        console.log('[OSTransition] Phase: fadeout')
        setPhase('fadeout')
      }},
      { delay: 500, action: () => {
        console.log('[OSTransition] Phase: boot')
        setPhase('boot')
      }},
      { delay: 5500, action: () => {
        console.log('[OSTransition] Phase: fadein')
        setPhase('fadein')
      }},
      { 
        delay: 6500, 
        action: () => {
          console.log('[OSTransition] Redirecting...')
          if (onComplete) {
            onComplete()
          } else {
            router.push(`/onboarding/broker?mode=${selectedMode}`)
          }
        }
      }
    ]

    const timers = timeline.map(({ delay, action }) =>
      setTimeout(action, delay)
    )

    return () => {
      console.log('[OSTransition] Cleanup')
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode, router, onComplete])

  // Animate boot messages line by line
  useEffect(() => {
    if (phase !== 'boot') return

    const messages = BOOT_MESSAGES[selectedMode]
    let currentLine = 0

    const interval = setInterval(() => {
      if (currentLine < messages.length) {
        setVisibleLines(prev => prev + 1)
        currentLine++
      } else {
        clearInterval(interval)
      }
    }, selectedMode === 'analogue' || selectedMode === 'ascii' ? 200 : 400)

    return () => clearInterval(interval)
  }, [phase, selectedMode])

  // Animate progress bar for XP mode
  useEffect(() => {
    if (phase !== 'boot' || selectedMode !== 'xp') return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 80)

    return () => clearInterval(interval)
  }, [phase, selectedMode])

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        backgroundColor: theme.colors.background,
        fontFamily: theme.fontFamily
      }}
    >
      {/* Texture Overlay - Optional, fails gracefully */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-transparent via-current to-transparent"
        style={{
          backgroundImage: theme.textures.overlay ? `url(/textures/${theme.textures.overlay}.png)` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1
        }}
      />

      {/* Theme-Specific Effects */}
      {theme.effects?.scanlines && (
        <div className="absolute inset-0 scanline-effect opacity-30 pointer-events-none" />
      )}

      {theme.effects?.noise && theme.textures.pattern && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url(/textures/${theme.textures.pattern}.png)`,
            backgroundSize: '256px 256px',
            backgroundRepeat: 'repeat',
            animation: 'noise 0.2s steps(10) infinite'
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {/* Phase 1: Fade Out */}
        {phase === 'fadeout' && (
          <motion.div
            key="fadeout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />
        )}

        {/* Phase 2: Boot Sequence */}
        {phase === 'boot' && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div className="max-w-3xl w-full space-y-6">
              {/* ASCII Terminal Mode */}
              {selectedMode === 'ascii' && (
                <div className="space-y-3">
                  <pre className="text-xs text-green-400 leading-tight mb-6 opacity-60">
{`┌────────────────────────────────────┐
│  TOTALAUD.IO BOOT SEQUENCE v1.0.0  │
└────────────────────────────────────┘`}
                  </pre>
                  {BOOT_MESSAGES.ascii.slice(0, visibleLines).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-green-400 text-sm flex items-center gap-2"
                    >
                      <span className="text-green-600">⟩</span>
                      {line}
                      {i === visibleLines - 1 && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="text-green-500"
                        >
                          █
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Windows XP Mode */}
              {selectedMode === 'xp' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      💾
                    </motion.div>
                    <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                      Windows XP Studio
                    </h2>
                  </div>

                  {BOOT_MESSAGES.xp.slice(0, visibleLines).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm"
                      style={{ color: theme.colors.text }}
                    >
                      {line}
                    </motion.div>
                  ))}

                  {/* Progress Bar */}
                  <div className="mt-8">
                    <div
                      className="h-6 rounded-lg overflow-hidden border-2"
                      style={{ borderColor: theme.colors.primary }}
                    >
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        className="h-full flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: theme.colors.primary,
                          color: theme.colors.background
                        }}
                      >
                        {progress > 10 && `${progress}%`}
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mac OS Aqua Mode */}
              {selectedMode === 'aqua' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🍎
                    </motion.div>
                    <h2
                      className="text-2xl font-bold"
                      style={{
                        color: theme.colors.primary,
                        textShadow: `0 2px 10px ${theme.colors.primary}40`
                      }}
                    >
                      Mac OS Retro
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {BOOT_MESSAGES.aqua.slice(0, visibleLines).map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                        style={{ color: theme.colors.text }}
                      >
                        {line}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* DAW Mode */}
              {selectedMode === 'daw' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <h2
                      className="text-xl font-bold tracking-wider"
                      style={{ color: theme.colors.text }}
                    >
                      DAW WORKSTATION
                    </h2>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>

                  <div className="font-mono space-y-2">
                    {BOOT_MESSAGES.daw.slice(0, visibleLines).map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                        <span style={{ color: theme.colors.text }}>{line}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center gap-1 mt-8">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [`${20 + Math.random() * 30}%`, `${40 + Math.random() * 60}%`]
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.05,
                          repeatType: "reverse"
                        }}
                        className="w-1 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Analogue Studio Mode */}
              {selectedMode === 'analogue' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      ⚡
                    </motion.div>
                    <h2
                      className="text-3xl font-bold uppercase"
                      style={{
                        color: theme.colors.primary,
                        textShadow: `3px 3px 0 ${theme.colors.secondary}`
                      }}
                    >
                      ANALOGUE STUDIO
                    </h2>
                  </div>

                  <div className="space-y-3 font-mono">
                    {BOOT_MESSAGES.analogue.slice(0, visibleLines).map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: Math.random() > 0.5 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0, rotate: Math.random() * 2 - 1 }}
                        className="text-center text-lg"
                        style={{ color: theme.colors.text }}
                      >
                        {line.split('').map((char, charIndex) => (
                          <motion.span
                            key={charIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: charIndex * 0.03 }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </motion.div>
                    ))}
                  </div>

                  {/* Punk stickers */}
                  <div className="flex justify-center gap-4 mt-8">
                    {['✊', '🎸', '📻', '⚡'].map((emoji, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          rotate: [0, Math.random() * 10 - 5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 0.5, delay: i * 0.2, repeat: Infinity }}
                        className="text-4xl"
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Phase 3: Fade In to App */}
        {phase === 'fadein' && (
          <motion.div
            key="fadein"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-black"
          />
        )}
      </AnimatePresence>

      {/* Easter egg memory check for ASCII mode */}
      {selectedMode === 'ascii' && phase === 'boot' && visibleLines >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="absolute bottom-4 left-4 font-mono text-xs text-green-600"
        >
          &gt; Checking RAM... 32GB detected. Show-off.
        </motion.div>
      )}

      {/* Debug skip button (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => router.push(`/?mode=${selectedMode}`)}
          className="absolute top-4 right-4 text-xs opacity-30 hover:opacity-100 transition-opacity px-3 py-1 rounded bg-white/10"
        >
          Skip →
        </button>
      )}
    </div>
  )
}

