'use client'

import React from 'react'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'
import { useOptionalPersona } from '@/components/persona/usePersona'

interface StudioContainerProps {
  children: React.ReactNode
}

/**
 * StudioContainer
 * Matte-black constellation surface for browsing loops as a creative system.
 * Uses ambient + persona accents to create a subtle halo around the workspace.
 */
export function StudioContainer({ children }: StudioContainerProps) {
  const ambient = useOptionalAmbient()
  const persona = useOptionalPersona()

  const ambientIntensity = ambient?.effectiveIntensity ?? 0.4
  const osAccent = ambient?.osAccent ?? 0.6
  const personaAccent = persona?.persona?.aesthetic.accent ?? '#3b82f6'

  const haloOpacity = 0.35 + ambientIntensity * 0.25
  const ringOpacity = 0.18 + osAccent * 0.3

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-slate-50">
      {/* Ambient + persona halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-12rem] h-[22rem]"
        style={{
          background:
            'radial-gradient(circle at center, rgba(15,23,42,1) 0, rgba(15,23,42,0.94) 40%, transparent 75%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: haloOpacity,
          backgroundImage: `radial-gradient(circle at top, ${personaAccent}33, transparent 55%), radial-gradient(circle at top right, ${personaAccent}22, transparent 65%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* Constellation grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-screen"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(30,64,175,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Vignette to keep focus in centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0, rgba(0,0,0,0.65) 70%)',
        }}
      />

      {/* Orbit ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-24 h-96 w-96 rounded-full border border-slate-700/40"
        style={{
          boxShadow: `0 0 120px ${personaAccent}33`,
          opacity: ringOpacity,
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 py-4 md:px-6 md:py-6 lg:px-10 lg:py-8">
        {children}
      </div>
    </div>
  )
}
