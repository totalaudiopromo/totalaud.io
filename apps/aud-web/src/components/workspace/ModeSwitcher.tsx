'use client'

import { motion } from 'framer-motion'
import { useMode, modeMetadata, type WorkspaceMode } from './ModeContext'

const modes: WorkspaceMode[] = ['ideas', 'timeline', 'pitch']

export function ModeSwitcher() {
  const { mode, setMode } = useMode()

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-900/80 p-1">
      {modes.map((m) => {
        const isActive = mode === m
        const meta = modeMetadata[m]

        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="relative rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-120"
            style={{
              color: isActive ? '#f1f5f9' : '#94a3b8',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 rounded-full bg-slate-700/60"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
