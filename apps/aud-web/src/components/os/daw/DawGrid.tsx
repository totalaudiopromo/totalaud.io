'use client'

import React from 'react'
import { useOptionalMood } from '@/components/mood/useMood'

/**
 * DawGrid
 * Neon bar/beat grid for the DAW surface.
 */
export function DawGrid() {
  const mood = useOptionalMood()

  const opacity =
    mood?.mood === 'charged'
      ? 0.95
      : mood?.mood === 'chaotic'
        ? 1
        : mood?.mood === 'focused'
          ? 0.9
          : mood?.mood === 'idle'
            ? 0.6
            : 0.8

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage: `
          linear-gradient(to right, rgba(58,169,190,0.2) 1px, transparent 1px),
          linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(15,23,42,0.85) 1px, transparent 1px)
        `,
        backgroundSize: '72px 100%, 288px 100%, 100% 96px',
        boxShadow: '0 0 32px rgba(15,23,42,0.85)',
      }}
    />
  )
}


