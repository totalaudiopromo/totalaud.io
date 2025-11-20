'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { OS_ORDER, getOSConfig, OSSlug } from './OSMetadata'
import { useOS } from './useOS'
import { useOptionalAmbient } from '@/components/ambient/useAmbient'

const backdropClasses =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'

const gridClasses =
  'grid w-full max-w-xl grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black/98 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.85)]'

const cardClasses =
  'group relative flex h-28 cursor-pointer flex-col justify-between rounded-xl border border-white/10 bg-white/2 px-4 py-3 text-left text-sm text-slate-100 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

export function OSQuickSwitch() {
  const { currentOS, setOS, isQuickSwitchOpen, closeQuickSwitch } = useOS()
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const ambient = useOptionalAmbient()

  const osList = useMemo(
    () =>
      OS_ORDER.map((slug) => {
        const config = getOSConfig(slug)
        return {
          slug,
          name: config.name,
          color: config.color,
        }
      }),
    [],
  )

  useEffect(() => {
    if (!isQuickSwitchOpen) return

    const index = osList.findIndex((os) => os.slug === currentOS.slug)
    setActiveIndex(index === -1 ? 0 : index)
  }, [currentOS.slug, isQuickSwitchOpen, osList])

  useEffect(() => {
    if (!isQuickSwitchOpen) return
    if (!containerRef.current) return

    containerRef.current.focus()
  }, [isQuickSwitchOpen])

  useEffect(() => {
    if (!isQuickSwitchOpen) return
    play('click')
  }, [isQuickSwitchOpen, play])

  const handleSelect = (slug: OSSlug) => {
    play('success')
    setOS(slug)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isQuickSwitchOpen) return

    if (event.key === 'Escape') {
      event.stopPropagation()
      closeQuickSwitch()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const selected = osList[activeIndex]
      if (selected) {
        handleSelect(selected.slug)
      }
      return
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % osList.length)
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + osList.length) % osList.length)
    }
  }

  return (
    <AnimatePresence>
      {isQuickSwitchOpen && (
        <motion.div
          className={backdropClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.08 : 0.16, ease: 'easeOut' }}
          onClick={closeQuickSwitch}
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Switch OS mode"
            tabIndex={-1}
            className={gridClasses}
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: 0,
                    scale: 0.96,
                    y: 8,
                  }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.96,
                    y: 6,
                  }
            }
            transition={{
              duration: prefersReducedMotion ? 0.12 : 0.18,
              ease: 'easeOut',
            }}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            <div className="col-span-2 mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="uppercase tracking-[0.18em] text-slate-500">ambient</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={ambient?.intensity ?? 0}
                  onChange={(event) => ambient?.setIntensity(Number(event.target.value))}
                  className="h-1 w-32 cursor-pointer appearance-none rounded-full bg-slate-700 outline-none"
                />
              </div>
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {Math.round((ambient?.effectiveIntensity ?? 0) * 100)}%
              </span>
            </div>
            {osList.map((os, index) => {
              const isActive = index === activeIndex
              const isCurrent = os.slug === currentOS.slug

              return (
                <motion.button
                  key={os.slug}
                  type="button"
                  className={cardClasses}
                  style={{
                    borderColor: isActive ? os.color : 'rgba(148,163,184,0.35)',
                    boxShadow: isActive
                      ? `0 0 0 1px ${os.color}66, 0 18px 40px rgba(15,23,42,0.9)`
                      : '0 14px 32px rgba(15,23,42,0.9)',
                    background:
                      'radial-gradient(circle at top, rgba(148,163,184,0.26), transparent 55%), rgba(15,23,42,0.96)',
                  }}
                  onClick={() => handleSelect(os.slug)}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 1.05,
                        }
                  }
                  whileTap={
                    prefersReducedMotion
                      ? { scale: 0.97 }
                      : {
                          scale: 0.97,
                        }
                  }
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                        Creative OS
                      </span>
                      <span className="text-sm font-medium leading-tight">{os.name}</span>
                    </div>
                    <span
                      className="h-6 w-6 rounded-full border border-white/20 shadow-[0_0_24px_rgba(255,255,255,0.1)]"
                      style={{ background: os.color }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="rounded-full bg-black/40 px-2 py-[2px] text-[10px] uppercase tracking-[0.16em] text-slate-300">
                      {isCurrent ? 'active' : 'ready'}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      {index + 1} / {osList.length}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


