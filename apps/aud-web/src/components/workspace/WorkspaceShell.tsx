'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ModeSwitcher } from './ModeSwitcher'
import { useMode } from './ModeContext'

interface WorkspaceShellProps {
  children: ReactNode
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const { modeDescription } = useMode()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2327] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[14px] font-semibold tracking-[-0.01em] text-[#E8EAED]">
              totalaud.io
            </h1>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#4B5563]">Workspace</p>
          </div>
        </div>

        <ModeSwitcher />

        {/* Hide description on mobile */}
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-[10px] uppercase tracking-[0.1em] text-[#6B7280]">
            {modeDescription}
          </span>
        </div>
      </header>

      {/* Main content area */}
      <motion.main
        className="flex-1 overflow-hidden bg-[#0F1113]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </div>
  )
}
