/**
 * CommandPalette Component
 *
 * Global command launcher with keyboard navigation.
 * Phase 13.0: FlowCore atmosphere integration
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Play,
  BarChart3,
  Link,
  MessageSquare,
  Palette,
  Focus,
  VolumeX,
  Volume2,
  Command,
} from 'lucide-react'
import { useFlowTheme } from '@/hooks/useFlowTheme'

export interface CommandAction {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  commands: CommandAction[]
  theme?: 'dark' | 'light'
}

/**
 * Fuzzy search matcher
 */
function fuzzyMatch(search: string, text: string): boolean {
  const searchLower = search.toLowerCase()
  const textLower = text.toLowerCase()

  let searchIndex = 0
  for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
    if (textLower[i] === searchLower[searchIndex]) {
      searchIndex++
    }
  }

  return searchIndex === searchLower.length
}

/**
 * CommandPalette Component (FlowCore Atmosphere Integration)
 */
export function CommandPalette({ isOpen, onClose, commands, theme = 'dark' }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Get FlowCore atmosphere theming
  const { atmosphere, colours, motion } = useFlowTheme()

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands

    return commands.filter((cmd) => {
      const searchableText = [cmd.label, cmd.description || '', ...(cmd.keywords || [])].join(' ')

      return fuzzyMatch(search, searchableText)
    })
  }, [search, commands])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const executeCommand = useCallback(() => {
    const command = filteredCommands[selectedIndex]
    if (command) {
      console.log('[CommandPalette] Executing:', command.label)
      command.action()
      onClose()
    }
  }, [filteredCommands, selectedIndex, onClose])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0))
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1))
          break

        case 'Enter':
          e.preventDefault()
          executeCommand()
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, executeCommand, onClose])

  // Theme-aware colours from FlowCore atmosphere
  const colors = {
    bg: colours.surface,
    bgSecondary: colours.background,
    border: colours.border,
    accent: colours.accent,
    text: colours.foreground,
    textSecondary: colours.textSecondary || 'rgba(255, 255, 255, 0.6)',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div
              className="rounded-lg shadow-2xl overflow-hidden"
              style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                className="flex items-center gap-3 p-4 border-b"
                style={{ borderColor: colors.border }}
              >
                <Search className="w-5 h-5" style={{ color: colors.textSecondary }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="search commands..."
                  autoFocus
                  className="flex-1 bg-transparent outline-none font-mono text-sm lowercase"
                  style={{ color: colors.text }}
                />
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded font-mono text-xs"
                  style={{
                    backgroundColor: colors.bgSecondary,
                    color: colors.textSecondary,
                  }}
                >
                  <Command className="w-3 h-3" />
                  <span>k</span>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center">
                    <p
                      className="font-mono text-sm lowercase"
                      style={{ color: colors.textSecondary }}
                    >
                      no commands found
                    </p>
                  </div>
                ) : (
                  filteredCommands.map((command, index) => {
                    const Icon = command.icon
                    const isSelected = index === selectedIndex

                    return (
                      <motion.button
                        key={command.id}
                        onClick={() => {
                          setSelectedIndex(index)
                          executeCommand()
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className="w-full flex items-center gap-3 p-4 transition-colors text-left"
                        style={{
                          backgroundColor: isSelected ? colors.bgSecondary : 'transparent',
                          borderLeft: `2px solid ${isSelected ? colors.accent : 'transparent'}`,
                          fontFamily:
                            atmosphere.typographyTweak?.family === 'mono'
                              ? 'var(--font-mono)'
                              : 'var(--font-sans)',
                          fontWeight: atmosphere.typographyTweak?.weight || 400,
                          letterSpacing: `${(atmosphere.typographyTweak?.tracking || 0) * 100}em`,
                        }}
                      >
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded"
                          style={{
                            backgroundColor: isSelected ? `${colors.accent}20` : colors.bgSecondary,
                            color: isSelected ? colors.accent : colors.textSecondary,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold lowercase truncate"
                            style={{ color: colors.text }}
                          >
                            {command.label}
                          </p>
                          {command.description && (
                            <p
                              className="text-xs lowercase truncate"
                              style={{ color: colors.textSecondary }}
                            >
                              {command.description}
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <div
                            className="px-2 py-1 rounded font-mono text-xs"
                            style={{
                              backgroundColor: `${colors.accent}20`,
                              color: colors.accent,
                            }}
                          >
                            ↵
                          </div>
                        )}
                      </motion.button>
                    )
                  })
                )}
              </div>

              <div
                className="flex items-center justify-between p-3 border-t font-mono text-xs"
                style={{
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                  color: colors.textSecondary,
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="lowercase">↑↓ navigate</span>
                  <span className="lowercase">↵ select</span>
                  <span className="lowercase">esc close</span>
                </div>
                <span className="lowercase">
                  {filteredCommands.length} {filteredCommands.length === 1 ? 'command' : 'commands'}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    console.log('[CommandPalette] Opening')
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    console.log('[CommandPalette] Closing')
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

export { Play, BarChart3, Link, MessageSquare, Palette, Focus, VolumeX, Volume2 }
