/**
 * CommandPalette Component
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Quick command access via ⌘K
 * - Spawn agents by typing "intel", "pitch", "tracker"
 * - Integration with FlowCanvas spawning
 *
 * @todo: upgrade if legacy component found
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import type { NodeKind } from '@/types/console'
import { getNodeDefs, isNodeKind, type NodeDefinition } from '@/features/flow/node-registry'
import type { LucideIcon } from 'lucide-react'

const log = logger.scope('CommandPalette')

export interface Command {
  id: string
  label: string
  description: string
  keywords: string[]
  icon?: LucideIcon
  hotkey?: string
  action: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onSpawnNode?: (kind: NodeKind) => void
  customCommands?: Command[]
}

export function CommandPalette({
  open,
  onClose,
  onSpawnNode,
  customCommands = [],
}: CommandPaletteProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Build agent spawn commands from registry
  const agentCommands: Command[] = getNodeDefs().map((node: NodeDefinition) => ({
    id: `spawn-${node.kind}`,
    label: `Spawn ${node.title}`,
    description: node.description,
    keywords: [node.kind, node.title.toLowerCase(), 'spawn', 'agent', 'add'],
    icon: node.icon,
    hotkey: node.hotkey,
    action: () => {
      if (onSpawnNode) {
        onSpawnNode(node.kind)
      }
    },
  }))

  // Combine all commands
  const allCommands = [...agentCommands, ...customCommands]

  // Filter commands based on search
  const filteredCommands = allCommands.filter((cmd) => {
    const query = searchQuery.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(query))
    )
  })

  /**
   * Execute selected command
   */
  const executeCommand = useCallback(
    (command: Command) => {
      log.info('Command executed', { commandId: command.id, label: command.label })

      trackEvent('save', {
        metadata: {
          action: 'command_executed',
          commandId: command.id,
          commandLabel: command.label,
        },
      })

      command.action()
      onClose()
      setSearchQuery('')
      setSelectedIndex(0)
    },
    [onClose, trackEvent]
  )

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          event.preventDefault()
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, filteredCommands, executeCommand, onClose])

  /**
   * Global ⌘K shortcut
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        // Ignore if inside input/textarea
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }

        event.preventDefault()
        if (open) {
          onClose()
        } else {
          // Open is handled by parent component
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  /**
   * Focus search input when opened
   */
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [open])

  /**
   * Reset selection when search changes
   */
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  /**
   * Track palette open
   */
  useEffect(() => {
    if (open) {
      trackEvent('save', {
        metadata: {
          action: 'palette_opened',
          source: 'command_palette',
        },
      })
    }
  }, [open, trackEvent])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.12 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
        }}
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: 'fixed',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '640px',
          maxHeight: '70vh',
          backgroundColor: flowCoreColours.darkGrey,
          border: `1px solid ${flowCoreColours.slateCyan}`,
          borderRadius: '8px',
          boxShadow: `0 0 60px rgba(58, 169, 190, 0.3)`,
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
          }}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="type command or agent name..."
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '6px',
              color: flowCoreColours.textPrimary,
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = flowCoreColours.slateCyan
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = flowCoreColours.borderGrey
            }}
          />
        </div>

        {/* Command List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredCommands.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: flowCoreColours.textTertiary,
                fontSize: '13px',
              }}
            >
              {searchQuery ? (
                <>
                  no commands found for "{searchQuery}"
                  <br />
                  <span style={{ fontSize: '11px', marginTop: '8px', display: 'block' }}>
                    try "intel", "pitch", or "tracker"
                  </span>
                </>
              ) : (
                'start typing to search commands...'
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredCommands.map((command, index) => {
                const isSelected = index === selectedIndex
                return (
                  <button
                    key={command.id}
                    onClick={() => executeCommand(command)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px',
                      backgroundColor: isSelected
                        ? 'rgba(58, 169, 190, 0.15)'
                        : flowCoreColours.matteBlack,
                      border: `1px solid ${
                        isSelected ? flowCoreColours.slateCyan : flowCoreColours.borderGrey
                      }`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--flowcore-motion-fast) ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = flowCoreColours.matteBlack
                      }
                    }}
                  >
                    {/* Icon */}
                    {command.icon && (
                      <div
                        style={{
                          flexShrink: 0,
                          color: isSelected
                            ? flowCoreColours.iceCyan
                            : flowCoreColours.textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <command.icon size={22} strokeWidth={1.6} />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isSelected ? flowCoreColours.iceCyan : flowCoreColours.textPrimary,
                          marginBottom: '4px',
                          textTransform: 'lowercase',
                        }}
                      >
                        {command.label}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: flowCoreColours.textTertiary,
                          lineHeight: 1.4,
                        }}
                      >
                        {command.description}
                      </div>
                    </div>

                    {/* Hotkey */}
                    {command.hotkey && (
                      <kbd
                        style={{
                          padding: '6px 10px',
                          backgroundColor: flowCoreColours.darkGrey,
                          border: `1px solid ${flowCoreColours.borderGrey}`,
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: flowCoreColours.textSecondary,
                          fontFamily: 'inherit',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        {command.hotkey}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: `1px solid ${flowCoreColours.borderGrey}`,
            fontSize: '11px',
            color: flowCoreColours.textTertiary,
            textAlign: 'center',
          }}
        >
          <kbd>↑↓</kbd> navigate · <kbd>enter</kbd> execute · <kbd>esc</kbd> close · <kbd>⌘K</kbd>{' '}
          toggle
        </div>
      </motion.div>
    </>
  )
}
