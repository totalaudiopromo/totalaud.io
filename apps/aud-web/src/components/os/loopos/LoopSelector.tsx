'use client'

import React, { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useLoopOSLocalStore } from './useLoopOSLocalStore'
import { useProjectEngine } from '@/components/projects/useProjectEngine'

interface LoopSelectorProps {
  onCreateLoop: (name: string) => void
  onRenameLoop: (id: string, newName: string) => void
  onDeleteLoop: (id: string) => void
  onSetActiveLoop: (id: string) => void
}

export function LoopSelector({
  onCreateLoop,
  onRenameLoop,
  onDeleteLoop,
  onSetActiveLoop,
}: LoopSelectorProps) {
  const { availableLoops, activeLoopId } = useLoopOSLocalStore()
  const { currentProject } = useProjectEngine()
  const { play } = useThemeAudio()
  const prefersReducedMotion = useReducedMotion()
  const [isRenamingId, setIsRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const activeLoop = useMemo(
    () => availableLoops.find((loop) => loop.id === activeLoopId) ?? null,
    [activeLoopId, availableLoops],
  )

  const handleCreate = () => {
    const baseName = currentProject ? `${currentProject.name} loop` : 'New loop'
    onCreateLoop(baseName)
    play('success')
  }

  const handleRenameSubmit = (id: string) => {
    const trimmed = renameValue.trim()
    if (!trimmed) {
      setIsRenamingId(null)
      setRenameValue('')
      return
    }
    onRenameLoop(id, trimmed)
    play('click')
    setIsRenamingId(null)
    setRenameValue('')
  }

  return (
    <div className="flex items-center gap-3 text-[11px] text-slate-200">
      <div className="flex flex-col">
        <span className="uppercase tracking-[0.18em] text-slate-400">Loop</span>
        <div className="flex items-center gap-2">
          <select
            className="min-w-[140px] rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-100 outline-none"
            value={activeLoopId ?? ''}
            onChange={(event) => {
              const nextId = event.target.value
              if (!nextId) return
              onSetActiveLoop(nextId)
              play('click')
            }}
          >
            {availableLoops.length === 0 && <option value="">No loops yet</option>}
            {availableLoops.map((loop) => (
              <option key={loop.id} value={loop.id}>
                {loop.name}
              </option>
            ))}
          </select>
          <motion.button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-200"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            <span className="mr-1 text-base leading-none">+</span>
            New
          </motion.button>
        </div>
      </div>

      {activeLoop && (
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          {isRenamingId === activeLoop.id ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleRenameSubmit(activeLoop.id)
              }}
              className="flex items-center gap-1"
            >
              <input
                autoFocus
                className="rounded-full border border-slate-600 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-100 outline-none"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                onBlur={() => handleRenameSubmit(activeLoop.id)}
              />
            </form>
          ) : (
            <>
              <span className="rounded-full bg-slate-900/80 px-2 py-[1px] text-[10px] text-slate-300">
                {currentProject ? currentProject.name : 'No project'} · {activeLoop.name}
              </span>
              <button
                type="button"
                className="text-[10px] text-slate-400 hover:text-slate-100"
                onClick={() => {
                  setIsRenamingId(activeLoop.id)
                  setRenameValue(activeLoop.name)
                }}
              >
                rename
              </button>
              <button
                type="button"
                className="text-[10px] text-rose-400 hover:text-rose-200"
                onClick={() => {
                  onDeleteLoop(activeLoop.id)
                  play('click')
                }}
              >
                delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}


