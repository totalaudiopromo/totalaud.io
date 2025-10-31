'use client'

/**
 * Operator Command Palette
 *
 * Unified ⌘K interface for executing workspace actions
 * Provides fuzzy search, keyboard navigation, and instant feedback
 *
 * Operator Command Palette - Experience Composer
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command as CommandIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { searchCommands, type Command } from '@aud-web/operator/commands'
import { useCommandService } from '@aud-web/operator/CommandService'
import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { tokens } from '@/themes/tokens'

export interface OperatorCommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackType = 'idle' | 'success' | 'error'

interface ExecutionFeedback {
  type: FeedbackType
  message: string
}

export function OperatorCommandPalette({ isOpen, onClose }: OperatorCommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([])
  const [feedback, setFeedback] = useState<ExecutionFeedback>({
    type: 'idle',
    message: '',
  })
  const [isExecuting, setIsExecuting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { execute, canExecute, context } = useCommandService()
  const currentTab = useWorkspaceStore((state) => state.activeTab)

  // Filter commands based on query
  useEffect(() => {
    const results = searchCommands(query, currentTab)
    setFilteredCommands(results)
    setSelectedIndex(0) // Reset selection when results change
  }, [query, currentTab])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setFeedback({ type: 'idle', message: '' })
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement
      selectedItem?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : prev))
          break

        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break

        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            handleExecute(filteredCommands[selectedIndex])
          }
          break

        case 'Escape':
          e.preventDefault()
          onClose()
          break

        default:
          break
      }
    },
    [filteredCommands, selectedIndex, onClose]
  )

  // Execute command
  const handleExecute = async (command: Command) => {
    // Check if command can be executed
    const { canExecute: executable, reason } = canExecute(command.id)

    if (!executable) {
      setFeedback({
        type: 'error',
        message: reason || 'Command cannot be executed',
      })
      return
    }

    setIsExecuting(true)
    setFeedback({ type: 'idle', message: '' })

    try {
      const result = await execute(command.id)

      if (result.success) {
        setFeedback({
          type: 'success',
          message: result.message,
        })

        // Close palette after successful navigation commands
        if (command.category === 'navigation') {
          setTimeout(() => {
            onClose()
          }, 500)
        }
      } else {
        setFeedback({
          type: 'error',
          message: result.message,
        })
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Command execution failed',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  // Backdrop click handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-palette-title"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Palette Container */}
          <motion.div
            className="relative w-full max-w-2xl bg-background border border-border rounded-lg shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/50">
              <CommandIcon className="w-5 h-5 text-accent flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search commands…"
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted text-base"
                aria-label="Command search input"
                aria-autocomplete="list"
                aria-controls="command-list"
                aria-activedescendant={
                  filteredCommands[selectedIndex]
                    ? `command-${filteredCommands[selectedIndex].id}`
                    : undefined
                }
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-border/50 rounded transition-colors"
                aria-label="Close command palette"
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              id="command-list"
              className="max-h-96 overflow-y-auto"
              role="listbox"
              aria-label="Available commands"
            >
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted">
                  {query ? 'No commands found' : 'Type to search commands'}
                </div>
              ) : (
                filteredCommands.map((command, index) => {
                  const Icon = command.icon
                  const isSelected = index === selectedIndex
                  const { canExecute: executable, reason } = canExecute(command.id)

                  return (
                    <motion.button
                      key={command.id}
                      id={`command-${command.id}`}
                      onClick={() => handleExecute(command)}
                      disabled={!executable || isExecuting}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-left transition-all
                        ${isSelected ? 'bg-accent/10 border-l-2 border-accent' : 'border-l-2 border-transparent'}
                        ${!executable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/5 cursor-pointer'}
                      `}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={!executable}
                      whileHover={executable ? { x: 5 } : undefined}
                      transition={{ duration: 0.15 }}
                    >
                      <Icon className="w-5 h-5 text-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">{command.label}</div>
                        <div className="text-sm text-muted truncate">
                          {!executable && reason ? reason : command.description}
                        </div>
                      </div>
                      {command.requiresCampaign && !context.campaignId && (
                        <AlertCircle className="w-4 h-4 text-muted flex-shrink-0" />
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>

            {/* Feedback Bar */}
            <AnimatePresence>
              {feedback.type !== 'idle' && (
                <motion.div
                  className={`
                    flex items-center gap-2 px-4 py-3 border-t border-border
                    ${feedback.type === 'success' ? 'bg-green-500/10 text-green-600' : ''}
                    ${feedback.type === 'error' ? 'bg-red-500/10 text-red-600' : ''}
                  `}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {feedback.type === 'success' && (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  )}
                  {feedback.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-sm font-medium">{feedback.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-background/30 text-xs text-muted">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-border/50 font-mono">↑↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-border/50 font-mono">↵</kbd> Execute
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-border/50 font-mono">Esc</kbd> Close
                </span>
              </div>
              {context.campaignId && <span className="text-accent">Campaign active ✓</span>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Operator Command Palette Trigger Button
 *
 * Small hint in the corner showing ⌘K shortcut
 */
export function OperatorCommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-3 py-2 bg-background/90 border border-border rounded-lg shadow-lg hover:shadow-xl transition-all backdrop-blur-sm z-40"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <CommandIcon className="w-4 h-4 text-accent" />
      <span className="text-sm text-foreground font-medium">Operator</span>
      <kbd className="px-1.5 py-0.5 rounded bg-border/50 font-mono text-xs text-muted">⌘K</kbd>
    </motion.button>
  )
}

/**
 * Hook for global ⌘K keyboard shortcut
 */
export function useOperatorCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }
}
