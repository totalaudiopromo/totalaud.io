/**
 * Theme Tester Component
 *
 * Visual testing playground for theme personality system.
 * Tests motion, sound, colour, and texture for all themes.
 *
 * Phase 12.4: Theme Fusion - Personality validation
 *
 * Route: /dev/theme
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useFlowTheme } from '@/hooks/useFlowTheme'
import { getAllThemeIds, type ThemeId } from '@/design/core/themes'
import { Volume2, VolumeX, Play } from 'lucide-react'

export function ThemeTester() {
  const { personality, colours, motion, sound, texture, activeTheme, setTheme } = useFlowTheme()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)

  const allThemes = getAllThemeIds()

  // Trigger animation on theme change
  const handleThemeChange = (themeId: ThemeId) => {
    setTheme(themeId)
    setAnimationKey((prev) => prev + 1)
    if (soundEnabled) {
      // Small delay to allow theme to update
      setTimeout(() => sound.playClick(), 50)
    }
  }

  const handlePlayAmbient = () => {
    if (soundEnabled) {
      sound.playAmbient()
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
              transition={motion.transition}
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
        transition={motion.transition}
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
            <p className="text-sm opacity-70">Type: {motion.type}</p>
            <p className="text-sm opacity-70">Duration: {motion.duration}ms</p>
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
              ...motion.transition,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {motion.type}
          </motion.div>
          <div className="flex-1">
            <p className="text-sm opacity-70 mb-2">
              This box animates using the <strong>{motion.type}</strong> motion profile.
            </p>
            <p className="text-sm opacity-70">
              Duration: <strong>{motion.duration}ms</strong>
            </p>
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
              motion: motion.type,
              duration: motion.duration,
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
