/**
 * Theme Tester Component
 *
 * Visual testing playground for theme personality system.
 * Tests motion, sound, colour, and texture for all themes.
 *
 * Phase 12.4: Theme Fusion - Personality validation
 * Phase 13.0.3: Ambient cross-fade showcase + motion timing display
 *
 * Route: /dev/theme
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useFlowTheme } from '@/hooks/useFlowTheme'
import { getAllThemeIds, type ThemeId } from '@/design/core/themes'
import { Volume2, VolumeX, Play, Music, Zap } from 'lucide-react'
import { getAmbientPlayer } from '@/design/core/sounds/ambient'
import { getAtmosphere } from '@/design/core/themes/atmospheres'

export function ThemeTester() {
  const {
    personality,
    colours,
    motion: themeMotion,
    sound,
    texture,
    activeTheme,
    setTheme,
    atmosphere,
  } = useFlowTheme()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)
  const [ambientEnabled, setAmbientEnabled] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const ambientPlayer = useRef(getAmbientPlayer())

  const allThemes = getAllThemeIds()

  // Initialize ambient player on mount
  useEffect(() => {
    ambientPlayer.current.initialize().catch((error) => {
      console.warn('[ThemeTester] Failed to initialize ambient player:', error)
    })
  }, [])

  // Trigger animation on theme change
  const handleThemeChange = (themeId: ThemeId) => {
    setTheme(themeId)
    setAnimationKey((prev) => prev + 1)

    // Visual transition indicator
    setIsTransitioning(true)
    setTimeout(() => setIsTransitioning(false), 800)

    // Play UI sound
    if (soundEnabled) {
      setTimeout(() => sound.playClick(), 50)
    }

    // Cross-fade ambient if enabled
    if (ambientEnabled) {
      ambientPlayer.current.play(themeId, 600).catch((error) => {
        console.warn('[ThemeTester] Failed to cross-fade ambient:', error)
      })
    }
  }

  const handlePlayAmbient = () => {
    if (soundEnabled) {
      sound.playAmbient()
    }
  }

  // Toggle ambient playback
  const handleAmbientToggle = () => {
    if (!ambientEnabled) {
      // Start ambient for current theme
      setAmbientEnabled(true)
      ambientPlayer.current.play(activeTheme, 600).catch((error) => {
        console.warn('[ThemeTester] Failed to start ambient:', error)
      })
    } else {
      // Stop ambient
      setAmbientEnabled(false)
      ambientPlayer.current.stop(600)
    }
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: colours.background,
        color: colours.foreground,
      }}
    >
      {/* Header */}
      <header className="mb-12">
        <h1
          className="text-4xl font-bold mb-2"
          style={{
            color: colours.accent,
          }}
        >
          Theme Personality Tester
        </h1>
        <p className="text-lg opacity-70">Phase 12.4 - FlowCore Theme Fusion</p>
      </header>

      {/* Theme Selector */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: colours.accent }}>
          Select Theme
        </h2>
        <div className="flex gap-4 flex-wrap">
          {allThemes.map((themeId) => (
            <motion.button
              key={themeId}
              onClick={() => handleThemeChange(themeId)}
              className="px-6 py-3 font-medium rounded-lg border-2 transition-all"
              style={{
                background: activeTheme === themeId ? colours.accent : colours.surface,
                borderColor: colours.accent,
                color: activeTheme === themeId ? colours.background : colours.foreground,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={themeMotion.transition}
            >
              {themeId}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Active Theme Info */}
      <motion.section
        key={animationKey}
        className="mb-12 p-8 rounded-lg"
        style={{
          background: colours.surface,
          border: `${texture.border} ${colours.border}`,
          borderRadius: texture.radius,
          boxShadow: texture.glow,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={themeMotion.transition}
      >
        <h2 className="text-3xl font-bold mb-2" style={{ color: colours.accent }}>
          {personality.name}
        </h2>
        <p className="text-xl mb-4 opacity-80">{personality.tagline}</p>
        <p className="mb-6 opacity-70">
          <strong>Tone:</strong> {personality.tone}
        </p>

        {/* Personality Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Motion */}
          <div>
            <h3 className="font-semibold mb-2" style={{ color: colours.accent }}>
              Motion
            </h3>
            <p className="text-sm opacity-70">Type: {themeMotion.type}</p>
            <p className="text-sm opacity-70">Duration: {themeMotion.duration}ms</p>
          </div>

          {/* Sound */}
          <div>
            <h3 className="font-semibold mb-2" style={{ color: colours.accent }}>
              Sound
            </h3>
            <p className="text-sm opacity-70">{sound.description}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => soundEnabled && sound.playClick()}
                className="px-3 py-1 text-xs rounded border"
                style={{
                  borderColor: colours.accent,
                  color: colours.accent,
                }}
              >
                <Volume2 className="w-4 h-4 inline mr-1" />
                UI Click
              </button>
              <button
                onClick={handlePlayAmbient}
                className="px-3 py-1 text-xs rounded border"
                style={{
                  borderColor: colours.accent,
                  color: colours.accent,
                }}
              >
                <Play className="w-4 h-4 inline mr-1" />
                Ambient
              </button>
            </div>
          </div>

          {/* Texture */}
          <div>
            <h3 className="font-semibold mb-2" style={{ color: colours.accent }}>
              Texture
            </h3>
            <p className="text-sm opacity-70">Type: {texture.type}</p>
            <p className="text-sm opacity-70">Shadow: {texture.shadow}</p>
          </div>

          {/* Colours */}
          <div>
            <h3 className="font-semibold mb-2" style={{ color: colours.accent }}>
              Colours
            </h3>
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded"
                style={{ background: colours.accent }}
                title="Accent"
              />
              <div
                className="w-8 h-8 rounded"
                style={{ background: colours.surface }}
                title="Surface"
              />
              <div
                className="w-8 h-8 rounded border"
                style={{ background: colours.background, borderColor: colours.border }}
                title="Background"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Animation Test */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: colours.accent }}>
          Motion Test
        </h2>
        <div className="flex gap-4 items-center">
          <motion.div
            key={`anim-${animationKey}`}
            className="w-32 h-32 rounded-lg flex items-center justify-center font-bold"
            style={{
              background: colours.accent,
              color: colours.background,
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              ...themeMotion.transition,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {themeMotion.type}
          </motion.div>
          <div className="flex-1">
            <p className="text-sm opacity-70 mb-2">
              This box animates using the <strong>{themeMotion.type}</strong> motion profile.
            </p>
            <p className="text-sm opacity-70">
              Duration: <strong>{themeMotion.duration}ms</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Ambient Cross-fade Showcase (Phase 13.0.3) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: colours.accent }}>
          Ambient Cross-fade Showcase
        </h2>
        <div
          className="p-6 rounded-lg border-2"
          style={{
            background: colours.surface,
            borderColor: ambientEnabled ? colours.accent : colours.border,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6" style={{ color: colours.accent }} />
              <div>
                <p className="font-semibold">Live Ambient Soundscape</p>
                <p className="text-sm opacity-70">
                  {ambientEnabled
                    ? `Playing ${activeTheme} ambient • 600ms cross-fade`
                    : 'Start ambient to hear theme transitions'}
                </p>
              </div>
            </div>
            <button
              onClick={handleAmbientToggle}
              className="px-4 py-2 rounded-lg border-2 font-medium transition-all"
              style={{
                borderColor: colours.accent,
                background: ambientEnabled ? colours.accent : 'transparent',
                color: ambientEnabled ? colours.background : colours.accent,
              }}
            >
              {ambientEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 inline mr-2" />
                  Playing
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 inline mr-2" />
                  Start Ambient
                </>
              )}
            </button>
          </div>

          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded"
              style={{
                background: `${colours.accent}15`,
                color: colours.accent,
              }}
            >
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Cross-fading to {activeTheme}...</span>
            </motion.div>
          )}

          {ambientEnabled && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: colours.border }}>
              <p className="text-xs opacity-70 mb-2">
                Try switching themes to hear the cross-fade:
              </p>
              <div className="flex gap-2 flex-wrap">
                {allThemes.map((themeId) => (
                  <button
                    key={themeId}
                    onClick={() => handleThemeChange(themeId)}
                    className="px-3 py-1 text-xs rounded border"
                    style={{
                      borderColor: activeTheme === themeId ? colours.accent : colours.border,
                      background: activeTheme === themeId ? `${colours.accent}20` : 'transparent',
                      color: activeTheme === themeId ? colours.accent : colours.foreground,
                    }}
                  >
                    {themeId}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Motion Timing Display (Phase 13.0.3) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: colours.accent }}>
          Motion Timing Signature
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Atmosphere Motion Profile */}
          <div
            className="p-6 rounded-lg"
            style={{
              background: colours.surface,
              border: `2px solid ${colours.border}`,
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: colours.accent }}>
              Atmosphere Timings
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="opacity-70">Lighting Cross-fade:</span>
                <span className="font-semibold">600ms</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Panel Breathe:</span>
                <span className="font-semibold">240ms</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Audio Cross-fade:</span>
                <span className="font-semibold">600ms</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Total Transition:</span>
                <span className="font-semibold" style={{ color: colours.accent }}>
                  800ms
                </span>
              </div>
            </div>
          </div>

          {/* Theme Motion Profile */}
          <div
            className="p-6 rounded-lg"
            style={{
              background: colours.surface,
              border: `2px solid ${colours.border}`,
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: colours.accent }}>
              Theme Motion Profile
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="opacity-70">Type:</span>
                <span className="font-semibold">{themeMotion.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Duration:</span>
                <span className="font-semibold">{themeMotion.duration}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Easing:</span>
                <span className="font-semibold text-xs">
                  {JSON.stringify(themeMotion.transition.ease)}
                </span>
              </div>
            </div>

            {/* Visual timing indicator */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: colours.border }}>
              <motion.div
                key={`timing-${animationKey}`}
                className="h-2 rounded-full"
                style={{ background: colours.accent }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: themeMotion.duration / 1000,
                  ease: themeMotion.transition.ease,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
              <p className="text-xs opacity-70 mt-2 text-center">
                {themeMotion.duration}ms timing visualization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sound Toggle */}
      <section className="mb-12">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2"
          style={{
            borderColor: colours.accent,
            background: soundEnabled ? colours.accent : 'transparent',
            color: soundEnabled ? colours.background : colours.accent,
          }}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-5 h-5" />
              Sound Enabled
            </>
          ) : (
            <>
              <VolumeX className="w-5 h-5" />
              Sound Disabled
            </>
          )}
        </button>
      </section>

      {/* Technical Info */}
      <section className="p-6 rounded-lg" style={{ background: colours.surface }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: colours.accent }}>
          Technical Details
        </h2>
        <pre className="text-xs opacity-70 overflow-auto">
          {JSON.stringify(
            {
              id: personality.id,
              motion: themeMotion.type,
              duration: themeMotion.duration,
              sound: {
                ui: `${sound.ui.type} wave @ ${sound.ui.frequency}Hz`,
                ambient: `${sound.ambient.type} wave @ ${sound.ambient.frequency}Hz`,
              },
              texture: texture.type,
              colours: {
                accent: colours.accent,
                surface: colours.surface,
              },
            },
            null,
            2
          )}
        </pre>
      </section>
    </div>
  )
}

export default ThemeTester
