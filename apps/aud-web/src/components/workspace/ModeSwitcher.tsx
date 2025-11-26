'use client'

import { motion } from 'framer-motion'
import { useMode, modeMetadata, type WorkspaceMode } from './ModeContext'

const modes: WorkspaceMode[] = ['ideas', 'timeline', 'pitch']

export function ModeSwitcher() {
  const { mode, setMode } = useMode()

  return (
    <div className="flex items-center gap-1 rounded-[6px] border border-[#1F2327] bg-[#131619] p-1">
      {modes.map((m) => {
        const isActive = mode === m
        const meta = modeMetadata[m]

        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="relative rounded-[4px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-all duration-[120ms]"
            style={{
              color: isActive ? '#E8EAED' : '#6B7280',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 rounded-[4px] bg-[#1A1D21]"
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
