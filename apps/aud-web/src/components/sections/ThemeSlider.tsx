/**
 * Theme Slider - Five Creative Environments
 *
 * Minimal, tactile theme preview slider.
 * No carousel clutter - clean click-through interaction.
 * Cross-fades between theme videos with smooth transitions.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const themes = [
  {
    name: 'ASCII',
    colour: '#3AE1C2',
    src: '/videos/theme-ascii.mp4',
    tagline: 'type. test. repeat.',
  },
  {
    name: 'XP',
    colour: '#3A7AFE',
    src: '/videos/theme-xp.mp4',
    tagline: 'click. bounce. smile.',
  },
  {
    name: 'Aqua',
    colour: '#00B8E6',
    src: '/videos/theme-aqua.mp4',
    tagline: 'craft with clarity.',
  },
  {
    name: 'DAW',
    colour: '#FF6B35',
    src: '/videos/theme-daw.mp4',
    tagline: 'sync. sequence. create.',
  },
  {
    name: 'Analogue',
    colour: '#C47E34',
    src: '/videos/theme-analogue.mp4',
    tagline: 'touch the signal.',
  },
]

// Motion grammar - consistent with landing page
const easeCubic = [0.22, 1, 0.36, 1] as const

export function ThemeSlider() {
  const [index, setIndex] = useState(0)
  const currentTheme = themes[index]

  const next = () => setIndex((i) => (i + 1) % themes.length)
  const prev = () => setIndex((i) => (i - 1 + themes.length) % themes.length)

  return (
    <section className="py-24 border-t border-[#2A2F33]/80 text-center px-4">
      <h2
        className="text-lg font-medium text-neutral-400 mb-2"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        Five creative environments
      </h2>
      <p className="text-sm text-neutral-500 mb-8" style={{ fontFamily: 'var(--font-geist-mono)' }}>
        {currentTheme.tagline}
      </p>

      {/* Video container */}
      <div className="relative aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden border border-[#2A2F33]/60 shadow-inner/30">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: easeCubic }}
            className="absolute inset-0"
          >
            {/* TODO: Replace with actual theme videos once exported */}
            {/* <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={currentTheme.src} type="video/mp4" />
            </video> */}

            {/* Temporary placeholder */}
            <div className="w-full h-full bg-[#1A1D21] flex items-center justify-center">
              <div className="text-center">
                <div
                  className="text-4xl md:text-6xl font-semibold mb-4"
                  style={{ colour: currentTheme.colour }}
                >
                  {currentTheme.name}
                </div>
                <p
                  className="text-neutral-500 text-sm"
                  style={{ fontFamily: 'var(--font-geist-mono)' }}
                >
                  {currentTheme.tagline}
                </p>
                <p className="text-neutral-600 text-xs mt-4">
                  (Export {currentTheme.name} theme video to {currentTheme.src})
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="px-4 py-2 border border-[#2A2F33] rounded-md text-neutral-400 hover:text-[#3AA9BE] hover:border-[#3AA9BE]/40 transition-all"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          ← Previous
        </button>

        {/* Theme indicator dots */}
        <div className="flex gap-2">
          {themes.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? 'bg-[#3AA9BE] w-8' : 'bg-neutral-600 hover:bg-neutral-500'
              }`}
              aria-label={`Go to ${themes[i].name} theme`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="px-4 py-2 border border-[#2A2F33] rounded-md text-neutral-400 hover:text-[#3AA9BE] hover:border-[#3AA9BE]/40 transition-all"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          Next →
        </button>
      </div>

      {/* Current theme name */}
      <motion.p
        key={currentTheme.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-neutral-500 text-sm"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      >
        {index + 1} / {themes.length} — {currentTheme.name}
      </motion.p>
    </section>
  )
}
