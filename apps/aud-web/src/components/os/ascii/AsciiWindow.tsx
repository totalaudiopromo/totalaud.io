/**
 * ASCII Window Component
 * Terminal-style window with monospace borders and title bar
 * 
 * Features:
 * - ASCII art borders (box-drawing characters)
 * - Title bar with controls
 * - Clean terminal aesthetic
 */

'use client'

import { useThemeAudio } from '@/hooks/useThemeAudio'

interface AsciiWindowProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function AsciiWindow({ title, children, className = '' }: AsciiWindowProps) {
  const { play } = useThemeAudio()

  const handleClose = () => {
    play('click')
  }

  const handleMinimize = () => {
    play('click')
  }

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Top border with title */}
      <div className="flex items-center gap-2 text-[#00ff99] font-mono text-sm">
        <span>╔</span>
        <span className="flex-1 border-t border-[#00ff99]" />
        <span className="px-2">{title}</span>
        <span className="flex-1 border-t border-[#00ff99]" />
        <button
          onClick={handleMinimize}
          className="hover:text-[#1affb2] transition-colors"
          aria-label="Minimize"
        >
          ▬
        </button>
        <button
          onClick={handleClose}
          className="hover:text-[#ff0066] transition-colors"
          aria-label="Close"
        >
          ×
        </button>
        <span>╗</span>
      </div>

      {/* Content area */}
      <div className="flex-1 border-l border-r border-[#00ff99]">{children}</div>

      {/* Bottom border */}
      <div className="flex items-center text-[#00ff99] font-mono text-sm">
        <span>╚</span>
        <span className="flex-1 border-b border-[#00ff99]" />
        <span>╝</span>
      </div>
    </div>
  )
}

