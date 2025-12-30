/**
 * Command Palette Component
 *
 * Global command palette (⌘K / Ctrl+K) for quick navigation and actions.
 * Platform-aware keyboard shortcuts (Mac: ⌘, Windows/Linux: Ctrl).
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import {
  Lightbulb,
  Compass,
  CalendarDays,
  MessageSquare,
  Settings,
  LogOut,
  FileDown,
  Plus,
  Search,
  Command,
} from 'lucide-react'
import { transition, variants, duration } from '@/lib/motion'

interface CommandItem {
  id: string
  label: string
  shortcut?: string
  icon: React.ReactNode
  action: () => void
  category: 'navigation' | 'action' | 'settings'
}

interface CommandPaletteProps {
  /** Optional callback when palette opens */
  onOpen?: () => void
  /** Optional callback when palette closes */
  onClose?: () => void
}

export function CommandPalette({ onOpen, onClose }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Platform detection (follows useIdeasUndo.ts pattern)
  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'

  // Define commands
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-ideas',
      label: 'Go to Ideas',
      shortcut: `${modKey}1`,
      icon: <Lightbulb className="w-4 h-4" />,
      action: () => router.push('/workspace/ideas'),
      category: 'navigation',
    },
    {
      id: 'nav-scout',
      label: 'Go to Scout',
      shortcut: `${modKey}2`,
      icon: <Compass className="w-4 h-4" />,
      action: () => router.push('/workspace/scout'),
      category: 'navigation',
    },
    {
      id: 'nav-timeline',
      label: 'Go to Timeline',
      shortcut: `${modKey}3`,
      icon: <CalendarDays className="w-4 h-4" />,
      action: () => router.push('/workspace/timeline'),
      category: 'navigation',
    },
    {
      id: 'nav-pitch',
      label: 'Go to Pitch',
      shortcut: `${modKey}4`,
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/workspace/pitch'),
      category: 'navigation',
    },
    // Actions
    {
      id: 'action-new-idea',
      label: 'New Idea',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        router.push('/workspace/ideas')
        // Dispatch custom event for Ideas mode to handle
        window.dispatchEvent(new CustomEvent('command:new-idea'))
      },
      category: 'action',
    },
    {
      id: 'action-export',
      label: 'Export Current View',
      icon: <FileDown className="w-4 h-4" />,
      action: () => {
        // Dispatch custom event for current mode to handle export
        window.dispatchEvent(new CustomEvent('command:export'))
      },
      category: 'action',
    },
    // Settings
    {
      id: 'settings-account',
      label: 'Account Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/console/settings'),
      category: 'settings',
    },
    {
      id: 'settings-logout',
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      action: () => router.push('/auth/logout'),
      category: 'settings',
    },
  ]

  // Filter commands based on query
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  )

  // Group commands by category
  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = []
      }
      acc[cmd.category].push(cmd)
      return acc
    },
    {} as Record<string, CommandItem[]>
  )

  // Get flat list for keyboard navigation
  const flatCommands = Object.values(groupedCommands).flat()

  // Handle opening/closing
  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
    onOpen?.()
  }, [onOpen])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
    onClose?.()
  }, [onClose])

  // Execute selected command
  const executeCommand = useCallback(
    (command: CommandItem) => {
      close()
      // Small delay to allow animation to complete
      setTimeout(() => {
        command.action()
      }, 50)
    },
    [close]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // ⌘K / Ctrl+K to toggle
      if (modifier && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          close()
        } else {
          open()
        }
        return
      }

      // Mode shortcuts (⌘1-4)
      if (modifier && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault()
        const modeCommands = commands.filter((c) => c.category === 'navigation')
        const index = parseInt(e.key) - 1
        if (modeCommands[index]) {
          modeCommands[index].action()
        }
        return
      }

      // Only handle these when palette is open
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          close()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < flatCommands.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatCommands.length - 1))
          break
        case 'Enter':
          e.preventDefault()
          if (flatCommands[selectedIndex]) {
            executeCommand(flatCommands[selectedIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isMac, selectedIndex, flatCommands, commands, open, close, executeCommand])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigate',
    action: 'Actions',
    settings: 'Settings',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition.fast}
            onClick={close}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
            {...variants.scaleIn}
            transition={transition.normal}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div
              className="bg-[#1A1D21] border border-[#2A2D31] rounded-xl shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A2D31]">
                <Search className="w-5 h-5 text-[#6B7280]" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[#F7F8F9] placeholder-[#6B7280] focus:outline-none text-sm"
                  style={{ fontFamily: 'var(--font-geist-sans), system-ui, sans-serif' }}
                />
                <kbd className="hidden sm:flex items-center gap-1 text-xs text-[#6B7280] bg-[#2A2D31] px-2 py-1 rounded">
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>

              {/* Commands list */}
              <div className="max-h-80 overflow-y-auto py-2">
                {Object.entries(groupedCommands).length > 0 ? (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="mb-2 last:mb-0">
                      <div className="px-4 py-1.5 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        {categoryLabels[category] || category}
                      </div>
                      {items.map((cmd) => {
                        const globalIndex = flatCommands.findIndex((c) => c.id === cmd.id)
                        const isSelected = globalIndex === selectedIndex

                        return (
                          <button
                            key={cmd.id}
                            onClick={() => executeCommand(cmd)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors ${
                              isSelected ? 'bg-[#3AA9BE]/10 text-[#3AA9BE]' : 'text-[#E5E7EB]'
                            }`}
                            style={{
                              transitionDuration: `${duration.fast * 1000}ms`,
                            }}
                          >
                            <span className={`${isSelected ? 'text-[#3AA9BE]' : 'text-[#6B7280]'}`}>
                              {cmd.icon}
                            </span>
                            <span
                              className="flex-1 text-sm"
                              style={{
                                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                              }}
                            >
                              {cmd.label}
                            </span>
                            {cmd.shortcut && (
                              <kbd className="text-xs text-[#6B7280] bg-[#2A2D31] px-2 py-0.5 rounded">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-[#6B7280]">
                    No commands found
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-[#2A2D31] flex items-center gap-4 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <kbd className="bg-[#2A2D31] px-1.5 py-0.5 rounded">↑</kbd>
                  <kbd className="bg-[#2A2D31] px-1.5 py-0.5 rounded">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-[#2A2D31] px-1.5 py-0.5 rounded">↵</kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-[#2A2D31] px-1.5 py-0.5 rounded">esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
