'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useProjectEngine } from './useProjectEngine'
import { useProjectSwitcher } from './useProjectSwitcher'

const backdropClasses =
  'fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm'

const gridClasses =
  'grid w-full max-w-xl grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black/98 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.85)]'

const cardClasses =
  'group relative flex h-28 cursor-pointer flex-col justify-between rounded-xl border border-white/10 bg-white/2 px-4 py-3 text-left text-sm text-slate-100 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

export function ProjectQuickSwitch() {
  const { currentProject, projects, createProject, setProject } = useProjectEngine()
  const { isProjectSwitchOpen, closeProjectSwitch } = useProjectSwitcher()
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.createdAt === b.createdAt) return a.name.localeCompare(b.name)
        return a.createdAt.localeCompare(b.createdAt)
      }),
    [projects],
  )

  const items = useMemo(
    () => [
      ...sortedProjects.map((project) => ({
        kind: 'project' as const,
        project,
      })),
      {
        kind: 'new' as const,
      },
    ],
    [sortedProjects],
  )

  useEffect(() => {
    if (!isProjectSwitchOpen) return

    if (sortedProjects.length === 0) {
      setActiveIndex(items.length - 1)
      return
    }

    const index = sortedProjects.findIndex(
      (project) => project.id === currentProject?.id,
    )
    const baseIndex = index === -1 ? 0 : index
    setActiveIndex(baseIndex)
  }, [currentProject?.id, isProjectSwitchOpen, items.length, sortedProjects])

  useEffect(() => {
    if (!isProjectSwitchOpen) return
    if (!containerRef.current) return
    containerRef.current.focus()
  }, [isProjectSwitchOpen])

  const handleSelectProject = (projectId: string) => {
    play('success')
    setProject(projectId)
    closeProjectSwitch()
  }

  const handleCreateProject = () => {
    const created = createProject('New project')
    play('success')
    setProject(created.id)
    closeProjectSwitch()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isProjectSwitchOpen) return

    if (event.key === 'Escape') {
      event.stopPropagation()
      closeProjectSwitch()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const selected = items[activeIndex]
      if (!selected) return

      if (selected.kind === 'project') {
        handleSelectProject(selected.project.id)
      } else {
        handleCreateProject()
      }
      return
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % items.length)
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + items.length) % items.length)
    }
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: '2-digit',
    })
  }

  return (
    <AnimatePresence>
      {isProjectSwitchOpen && (
        <motion.div
          className={backdropClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.08 : 0.16, ease: 'easeOut' }}
          onClick={closeProjectSwitch}
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Switch project"
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
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  projects
                </span>
                <span className="text-[11px] text-slate-300">
                  Switch creative context without leaving the OS.
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                ⌘⇧P
              </span>
            </div>

            {items.map((item, index) => {
              const isActive = index === activeIndex

              if (item.kind === 'new') {
                return (
                  <motion.button
                    key="new-project"
                    type="button"
                    className={cardClasses}
                    style={{
                      borderStyle: 'dashed',
                      borderColor: isActive ? '#22c55e' : 'rgba(148,163,184,0.4)',
                      background:
                        'radial-gradient(circle at top, rgba(34,197,94,0.2), transparent 55%), rgba(15,23,42,0.96)',
                    }}
                    onClick={handleCreateProject}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            scale: 1.03,
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
                          New project
                        </span>
                        <span className="text-sm font-medium leading-tight">
                          Start a fresh session
                        </span>
                      </div>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/70 text-base leading-none text-emerald-300 shadow-[0_0_18px_rgba(34,197,94,0.75)]">
                        +
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="rounded-full bg-black/40 px-2 py-[2px] text-[10px] uppercase tracking-[0.16em] text-slate-300">
                        Create project
                      </span>
                    </div>
                  </motion.button>
                )
              }

              const project = item.project
              const isCurrent = project.id === currentProject?.id

              return (
                <motion.button
                  key={project.id}
                  type="button"
                  className={cardClasses}
                  style={{
                    borderColor: isActive ? project.colour : 'rgba(148,163,184,0.35)',
                    boxShadow: isActive
                      ? `0 0 0 1px ${project.colour}66, 0 18px 40px rgba(15,23,42,0.9)`
                      : '0 14px 32px rgba(15,23,42,0.9)',
                    background:
                      'radial-gradient(circle at top, rgba(148,163,184,0.26), transparent 55%), rgba(15,23,42,0.96)',
                  }}
                  onClick={() => handleSelectProject(project.id)}
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
                        Project
                      </span>
                      <span className="text-sm font-medium leading-tight">{project.name}</span>
                    </div>
                    <span
                      className="h-6 w-6 rounded-full border border-white/20 shadow-[0_0_24px_rgba(255,255,255,0.1)]"
                      style={{ background: project.colour }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="rounded-full bg-black/40 px-2 py-[2px] text-[10px] uppercase tracking-[0.16em] text-slate-300">
                      {isCurrent ? 'active' : 'ready'}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                      {formatDate(project.createdAt)}
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


