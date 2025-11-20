'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useOptionalPersona } from '@/components/persona/usePersona'
import { useOptionalCompanion } from '@/components/companion/useCompanion'

import type { AnalogueTabId } from './AnalogueTabs'

export type AnalogueCardAccent = 'yellow' | 'blue' | 'pink'

export interface AnalogueCardData {
  id: string
  title: string
  body: string
  section: AnalogueTabId
  completed?: boolean
  highlighted?: boolean
  accent?: AnalogueCardAccent
  tag?: 'idea' | 'campaign' | 'note'
  starred?: boolean
  sentTo?: 'aqua' | 'daw' | 'both' | null
}

interface AnalogueCardProps {
  card: AnalogueCardData
  onToggleHighlight?: () => void
  onToggleStar?: () => void
  onSendToAqua?: () => void
  onSendToDaw?: () => void
  onSendToXp?: () => void
  onSendToAscii?: () => void
  onAskScout?: () => void
  onAskCreativeTeam?: () => void
}

/**
 * AnalogueCard
 * Sticky note / index card living on the notebook surface
 */
export function AnalogueCard({
  card,
  onToggleHighlight,
  onToggleStar,
  onSendToAqua,
  onSendToDaw,
  onSendToXp,
  onSendToAscii,
  onAskScout,
  onAskCreativeTeam,
}: AnalogueCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const persona = useOptionalPersona()
  const companion = useOptionalCompanion()

  const accent: AnalogueCardAccent = card.accent ?? 'yellow'

  const baseStyles =
    'relative w-full rounded-[18px] border px-4 py-3 text-sm shadow-[0_14px_30px_rgba(15,23,42,0.34)]'

  const accentStyles: Record<AnalogueCardAccent, string> = {
    yellow:
      'border-[#e1c96b] bg-[#fff7c9] text-[#433319] shadow-[0_16px_32px_rgba(146,118,52,0.45)]',
    blue: 'border-[#92b5d9] bg-[#e4f0ff] text-[#213049] shadow-[0_16px_32px_rgba(71,104,147,0.45)]',
    pink: 'border-[#e29ab3] bg-[#ffe5f0] text-[#4e2231] shadow-[0_16px_32px_rgba(153,79,106,0.45)]',
  }

  const ring = card.highlighted
    ? 'ring-2 ring-offset-2 ring-[#f97316]/70 ring-offset-[#faf3e8]'
    : 'ring-0'

  const pinColour =
    accent === 'yellow' ? 'bg-[#f97316]' : accent === 'blue' ? 'bg-[#3b82f6]' : 'bg-[#ec4899]'

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onToggleHighlight}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onToggleHighlight?.()
        }
      }}
      className={`${baseStyles} ${accentStyles[accent]} ${ring} group text-left`}
      style={
        persona?.persona?.aesthetic?.accent
          ? {
              borderColor: persona.persona.aesthetic.accent,
            }
          : undefined
      }
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -2,
              rotate: card.highlighted ? 0 : 0.6,
            }
      }
      whileTap={prefersReducedMotion ? undefined : { y: 1, scale: 0.98 }}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              type: 'spring',
              stiffness: 260,
              damping: 22,
            }
      }
    >
      {/* Pin / clip */}
      <div className="pointer-events-none absolute -left-3 -top-3 flex items-center gap-1">
        <div
          className={`h-4 w-4 rounded-full ${pinColour} shadow-[0_0_0_2px_rgba(51,33,20,0.85)]`}
        />
        <div className="h-5 w-7 rounded-full border border-black/10 bg-black/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]" />
      </div>

      {/* Subtle ruled lines on card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[18px]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 24px)',
        }}
      />

      <div className="relative z-10 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase">{card.title}</h3>
            {card.tag && (
              <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-[1px] text-[10px] uppercase tracking-[0.16em] text-black/55">
                {card.tag}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {card.completed && (
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-black/60">
                done
              </span>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleStar?.()
              }}
              className="text-[12px]"
              aria-label={card.starred ? 'Unstar card' : 'Star card'}
            >
              <span className={card.starred ? 'text-amber-500' : 'text-black/30'}>
                {card.starred ? '★' : '☆'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-[12px] leading-relaxed text-black/70">{card.body}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSendToAqua?.()
            }}
            className="rounded-full border border-[#3b82f6]/60 bg-[#eff6ff] px-2 py-[2px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#1d4ed8] hover:bg-[#dbeafe]"
          >
            send to aqua
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSendToDaw?.()
            }}
            className="rounded-full border border-[#a855f7]/60 bg-[#f5e1ff] px-2 py-[2px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#6b21a8] hover:bg-[#e9d5ff]"
          >
            send to daw
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSendToXp?.()
            }}
            className="rounded-full border border-[#22c55e]/60 bg-[#dcfce7] px-2 py-[2px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#166534] hover:bg-[#bbf7d0]"
          >
            send to xp
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSendToAscii?.()
            }}
            className="rounded-full border border-[#00ff99]/60 bg-[#022c22] px-2 py-[2px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#a7f3d0] hover:bg-[#064e3b]"
          >
            log to ascii
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onAskScout?.()
            }}
            className="rounded-full border border-[#22c55e]/60 bg-[#ecfdf3] px-2 py-[2px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#15803d] hover:bg-[#bbf7d0]"
          >
            {companion?.activeCompanion
              ? `ask ${companion.activeCompanion.name.split(' ')[0]} about this idea`
              : 'ask scout for ideas'}
          </button>
          {onAskCreativeTeam && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onAskCreativeTeam()
              }}
              className="rounded-full border border-[#22c55e]/70 bg-[#ecfdf3] px-2 py-[2px] text-[10px] font-medium uppercase tracking-[0.16em] text-[#166534] hover:bg-[#bbf7d0]"
            >
              ask creative team
            </button>
          )}

          {card.sentTo && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-[2px] text-[9px] uppercase tracking-[0.18em] text-black/60">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              {card.sentTo === 'both'
                ? 'Marked for Aqua + DAW'
                : card.sentTo === 'aqua'
                  ? 'Marked for Aqua'
                  : 'Marked for DAW'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
