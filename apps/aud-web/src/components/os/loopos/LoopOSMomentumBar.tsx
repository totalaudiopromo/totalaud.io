'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useOptionalPersona } from '@/components/persona/usePersona'
import type { MomentumResult } from './engines/momentumEngine'
import type { LoopOSLane } from './useLoopOSLocalStore'

interface LoopOSMomentumBarProps {
  momentum: MomentumResult | null
}

function getMomentumLabel(score: number, label: MomentumResult['label']): {
  label: string
  tone: 'good' | 'ok' | 'low'
} {
  if (label === 'high' || score >= 0.7) return { label: 'Loop momentum high', tone: 'good' }
  if (label === 'medium' || score >= 0.4) return { label: 'Loop momentum steady', tone: 'ok' }
  return { label: 'Loop momentum low', tone: 'low' }
}

const laneColours: Record<LoopOSLane, string> = {
  creative: 'bg-cyan-400/80',
  action: 'bg-emerald-400/80',
  promo: 'bg-amber-400/80',
  analysis: 'bg-violet-400/80',
  refine: 'bg-sky-400/80',
}

export function LoopOSMomentumBar({ momentum }: LoopOSMomentumBarProps) {
  const prefersReducedMotion = useReducedMotion()
  const score = momentum?.score ?? 0
  const clamped = Math.max(0, Math.min(1, score))
  const { label, tone } = getMomentumLabel(clamped, momentum?.label ?? 'low')
  const persona = useOptionalPersona()

  const personaLabel =
    persona?.persona && persona.activePersonaId === 'lana_glass'
      ? tone === 'good'
        ? 'Midnight signal strong'
        : tone === 'ok'
          ? 'Signal holding'
          : 'Signal fading'
      : null

  const toneClass =
    tone === 'good'
      ? 'from-emerald-400/90 via-[#22c55e]/70 to-emerald-300/80'
      : tone === 'ok'
        ? 'from-amber-400/90 via-[#facc15]/70 to-amber-300/80'
        : 'from-red-500/90 via-[#f97373]/70 to-red-400/80'

  return (
    <div className="relative z-10 border-t border-slate-800/80 bg-black/80 px-4 py-2">
      <div className="flex items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-900/80">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${toneClass}`}
            style={{ width: `${clamped * 100}%` }}
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    type: 'spring',
                    stiffness: 140,
                    damping: 32,
                  }
            }
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_transparent_70%)]" />
          {momentum && (
            <div className="pointer-events-none absolute inset-0 flex">
              {(
                Object.entries(momentum.laneWeights) as Array<
                  [LoopOSLane, number]
                >
              )
                .filter(([, weight]) => weight > 0.01)
                .map(([lane, weight]) => (
                  <div
                    key={lane}
                    className={`${laneColours[lane]} h-full`}
                    style={{ width: `${weight * 100}%` }}
                  />
                ))}
            </div>
          )}
        </div>

        <div className="flex flex-col text-[10px] leading-tight text-slate-300">
          <span className="uppercase tracking-[0.22em] text-slate-400">Momentum</span>
          <span className="text-slate-100">{personaLabel ?? label}</span>
        </div>

        <span className="ml-1 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-[2px] text-[10px] tabular-nums text-slate-300">
          {clamped.toFixed(2)}
        </span>
      </div>
    </div>
  )
}


