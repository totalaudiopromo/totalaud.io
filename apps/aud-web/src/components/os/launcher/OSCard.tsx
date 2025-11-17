'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useOptionalMood } from '@/components/mood/useMood'

type OSType = 'core' | 'studio' | 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

interface OSCardProps {
  os: OSType
  title: string
  subtitle: string
  preview: OSType
}

function AsciiPreview({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/50 bg-[#050708] px-4 py-3 font-mono text-xs text-emerald-300">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen bg-[linear-gradient(to_bottom,transparent_85%,rgba(16,185,129,0.5)_100%)] bg-[length:100%_4px]"
      />
      <motion.div
        aria-hidden
        className="relative inline-flex items-baseline gap-2"
        animate={
          prefersReducedMotion
            ? { opacity: 0.9 }
            : {
                opacity: [0.4, 1, 0.6, 1],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <span className="text-emerald-500">{'>'}</span>
        <span className="text-emerald-300/90">_</span>
      </motion.div>
    </div>
  )
}

function XPPreview({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-sky-400/40 bg-sky-950/40 p-3 text-xs text-slate-100 shadow-[0_12px_32px_rgba(15,23,42,0.7)]">
      <motion.div
        aria-hidden
        className="relative h-16 w-full max-w-xs rounded-lg border border-sky-700/80 bg-sky-900/80 shadow-[0_6px_16px_rgba(15,23,42,0.9)]"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: [0, -4, 0],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <div className="flex h-5 items-center gap-1 rounded-t-lg bg-gradient-to-r from-sky-500 to-blue-600 px-2 text-[10px] font-medium">
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/90" />
          </div>
          <span className="ml-2">XP Workspace</span>
        </div>
        <div className="h-[calc(100%-1.25rem)] rounded-b-lg bg-sky-950/70" />
      </motion.div>
    </div>
  )
}

function AquaPreview({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-300/40 bg-slate-900/60 p-3 text-xs text-slate-50 backdrop-blur-md">
      <motion.div
        aria-hidden
        className="relative mx-auto h-12 w-40 rounded-full border border-cyan-100/60 bg-gradient-to-br from-cyan-200/70 via-sky-200/60 to-slate-100/40 shadow-[0_18px_40px_rgba(8,47,73,0.9)]"
        style={{
          boxShadow:
            '0 18px 40px rgba(8,47,73,0.9), 0 0 0 1px rgba(148,163,184,0.25), 0 0 40px rgba(34,211,238,0.75)',
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: [0, -6, 0],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[2px] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.9), transparent 55%)',
          }}
        />
      </motion.div>
    </div>
  )
}

function DawPreview({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-400/40 bg-slate-950/70 p-3 text-xs text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)',
          backgroundSize: '16px 1px, 1px 16px',
        }}
      />
      <div className="relative h-14 w-full overflow-hidden rounded-lg border border-slate-700/80 bg-slate-900/80">
        <div className="absolute inset-0 flex items-center gap-1 px-3">
          <div className="h-2 w-10 rounded-sm bg-cyan-500/80" />
          <div className="h-2 w-16 rounded-sm bg-emerald-400/80" />
          <div className="h-2 w-8 rounded-sm bg-fuchsia-400/80" />
        </div>
        <motion.div
          aria-hidden
          className="absolute inset-y-1 left-0 w-[2px] bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          animate={
            prefersReducedMotion
              ? { opacity: 0.9 }
              : {
                  x: ['0%', '22%', '48%', '72%', '100%'],
                  opacity: [0.9, 1, 0.9, 1, 0.9],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        />
      </div>
    </div>
  )
}

function AnaloguePreview({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-700/40 bg-[#111827] p-3 text-xs text-amber-900">
      <div className="relative h-16 w-full">
        <motion.div
          aria-hidden
          className="absolute inset-y-1 left-1/4 w-[60%] rounded-[18px] border border-[#e1c96b] bg-[#fff7c9] text-[10px] shadow-[0_14px_30px_rgba(15,23,42,0.55)]"
          animate={
            prefersReducedMotion
              ? { rotate: 0 }
              : {
                  rotate: [-1.4, 0.9, -0.6, 0.4, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        >
          <div className="flex items-center justify-between px-3 pt-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#433319]">
              analogue notes
            </span>
            <span className="h-3 w-3 rounded-full bg-[#f97316] shadow-[0_0_0_2px_rgba(51,33,20,0.9)]" />
          </div>
          <p className="px-3 pb-2 text-[9px] leading-snug text-[#433319cc]">
            Sticky ideas, scribbles, half-finished hooks.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function CorePreview({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-400/60 bg-slate-950/80 p-3 text-xs text-slate-50">
      <motion.div
        aria-hidden
        className="relative h-16 w-full rounded-lg border border-slate-700/80 bg-slate-900/80"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [1, 1.02, 1],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <div className="absolute inset-0 flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.18em] text-emerald-200/90">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          <span>Core OS · mission control</span>
        </div>
      </motion.div>
    </div>
  )
}

function StudioPreview({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-400/60 bg-slate-950/80 p-3 text-xs text-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at top, rgba(52,211,153,0.28), transparent 55%), radial-gradient(circle at bottom, rgba(15,23,42,0.9), transparent 60%)',
        }}
      />
      <div className="relative flex flex-col gap-2">
        <div className="h-[3px] w-full rounded-full bg-slate-900/90">
          <motion.div
            aria-hidden
            className="h-[3px] w-10 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    x: ['0%', '40%', '75%', '100%'],
                  }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: 1.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400/90 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span className="h-2 w-2 rounded-full bg-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
            <span className="h-2 w-2 rounded-full bg-fuchsia-400/80 shadow-[0_0_10px_rgba(244,114,182,0.9)]" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">
            loops in orbit
          </p>
        </div>
      </div>
    </div>
  )
}

function renderPreview(preview: OSType, prefersReducedMotion: boolean) {
  switch (preview) {
    case 'core':
      return <CorePreview prefersReducedMotion={prefersReducedMotion} />
    case 'studio':
      return <StudioPreview prefersReducedMotion={prefersReducedMotion} />
    case 'ascii':
      return <AsciiPreview prefersReducedMotion={prefersReducedMotion} />
    case 'xp':
      return <XPPreview prefersReducedMotion={prefersReducedMotion} />
    case 'aqua':
      return <AquaPreview prefersReducedMotion={prefersReducedMotion} />
    case 'daw':
      return <DawPreview prefersReducedMotion={prefersReducedMotion} />
    case 'analogue':
      return <AnaloguePreview prefersReducedMotion={prefersReducedMotion} />
    default:
      return null
  }
}

const cardBase =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1113]'

const osThemeClasses: Record<
  OSType,
  {
    border: string
    background: string
    shadow: string
  }
> = {
  core: {
    border: 'border-emerald-400/70',
    background:
      'bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.24),_transparent_55%)] bg-slate-950',
    shadow: 'shadow-[0_24px_60px_rgba(6,95,70,0.95)]',
  },
  studio: {
    border: 'border-emerald-400/70',
    background:
      'bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.22),_transparent_55%)] bg-slate-950',
    shadow: 'shadow-[0_22px_56px_rgba(6,95,70,0.95)]',
  },
  ascii: {
    border: 'border-emerald-500/50',
    background:
      'bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_55%)] bg-[#050708]',
    shadow: 'shadow-[0_18px_40px_rgba(0,0,0,0.85)]',
  },
  xp: {
    border: 'border-sky-400/50',
    background:
      'bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_55%)] bg-slate-950/80',
    shadow: 'shadow-[0_18px_46px_rgba(15,23,42,0.9)]',
  },
  aqua: {
    border: 'border-cyan-200/60',
    background:
      'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%)] bg-slate-950/60 backdrop-blur-xl',
    shadow: 'shadow-[0_24px_60px_rgba(15,23,42,0.95)]',
  },
  daw: {
    border: 'border-cyan-400/55',
    background:
      'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_55%)] bg-slate-950',
    shadow: 'shadow-[0_22px_52px_rgba(15,23,42,0.98)]',
  },
  analogue: {
    border: 'border-amber-700/65',
    background:
      'bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.26),_transparent_55%)] bg-[#111827]',
    shadow: 'shadow-[0_20px_48px_rgba(15,23,42,0.95)]',
  },
}

export function OSCard({ os, title, subtitle, preview }: OSCardProps) {
  const router = useRouter()
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const mood = useOptionalMood()

  const theme = osThemeClasses[os]

  const handleClick = () => {
    play('click')
    router.push(`/os/${os}`)
  }

  const ariaLabel = `Open ${title}`

  const hoverScale =
    mood?.mood === 'charged' || mood?.mood === 'chaotic'
      ? 1.06
      : mood?.mood === 'focused'
        ? 1.04
        : 1.03

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`${cardBase} ${theme.background} ${theme.border} ${theme.shadow}`}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -4,
            scale: hoverScale,
            }
      }
      whileTap={
        prefersReducedMotion
          ? { scale: 0.97 }
          : {
              scale: 0.97,
              y: 0,
            }
      }
      transition={{
        type: 'tween',
        duration: 0.18,
        ease: 'easeOut',
      }}
    >
      {/* Ambient border glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 blur-xl transition-opacity duration-150 group-hover:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-transparent to-emerald-400/10" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4 p-5 md:p-6">
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
            Creative OS
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
            {title}
          </h2>
          <p className="max-w-xs text-sm text-slate-300/90">{subtitle}</p>
        </div>

        <div className="mt-2">{renderPreview(preview, prefersReducedMotion ?? false)}</div>
      </div>
    </motion.button>
  )
}



