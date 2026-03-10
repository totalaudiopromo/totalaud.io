/**
 * NodePalette Component
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Display available nodes from registry
 * - Support search/filter
 * - Arrow key navigation
 * - Spawn nodes on FlowCanvas
 *
 * @todo: upgrade if legacy component found
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import type { NodeKind, ConsoleTab } from '@/types/console'
import { getNodeDefs, type NodeDefinition } from '@/features/flow/node-registry'

const log = logger.scope('NodePalette')

export interface NodePaletteProps {
  open: boolean
  onClose: () => void
  onSpawnNode: (kind: NodeKind) => void
  activeTab?: ConsoleTab
}

export function NodePalette({ open, onClose, onSpawnNode, activeTab }: NodePaletteProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Get all node definitions
  const allNodes = getNodeDefs()

  // Filter nodes based on search and active tab
  const filteredNodes = allNodes.filter((node: NodeDefinition) => {
    const matchesSearch =
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.kind.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = activeTab ? node.category === activeTab : true

    return matchesSearch && matchesTab
  })

  /**
   * Handle node selection
   */
  const handleSelectNode = useCallback(
    (kind: NodeKind) => {
      log.info('Node selected from palette', { kind })

      trackEvent('save', {
        metadata: {
          action: 'palette_node_selected',
          nodeKind: kind,
          searchQuery: searchQuery || null,
        },
      })

      onSpawnNode(kind)
      onClose()
      setSearchQuery('')
      setSelectedIndex(0)
    },
    [onSpawnNode, onClose, searchQuery, trackEvent]
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
          setSelectedIndex((prev) => Math.min(prev + 1, filteredNodes.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          event.preventDefault()
          if (filteredNodes[selectedIndex]) {
            handleSelectNode(filteredNodes[selectedIndex].kind)
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
  }, [open, selectedIndex, filteredNodes, handleSelectNode, onClose])

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
          source: 'node_palette',
          activeTab: activeTab || 'all',
        },
      })
    }
  }, [open, activeTab, trackEvent])

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
          zIndex: 50,
        }}
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.24,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '60vh',
          backgroundColor: flowCoreColours.darkGrey,
          border: `1px solid ${flowCoreColours.slateCyan}`,
          borderRadius: '8px',
          boxShadow: `0 0 40px rgba(58, 169, 190, 0.2)`,
          zIndex: 51,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: flowCoreColours.iceCyan,
              textTransform: 'lowercase',
              margin: '0 0 12px 0',
            }}
          >
            node palette {activeTab && `— ${activeTab}`}
          </h2>

          {/* Search Input */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search nodes..."
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '4px',
              color: flowCoreColours.textPrimary,
              fontSize: '12px',
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

        {/* Node List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {filteredNodes.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: flowCoreColours.textTertiary,
                fontSize: '12px',
              }}
            >
              no nodes found matching "{searchQuery}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredNodes.map((node: NodeDefinition, index: number) => {
                const isSelected = index === selectedIndex
                return (
                  <button
                    key={node.kind}
                    onClick={() => handleSelectNode(node.kind)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: isSelected
                        ? 'rgba(58, 169, 190, 0.1)'
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
                    <div
                      style={{
                        flexShrink: 0,
                        color: isSelected ? flowCoreColours.iceCyan : flowCoreColours.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <node.icon size={22} strokeWidth={1.6} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: isSelected ? flowCoreColours.iceCyan : flowCoreColours.textPrimary,
                          marginBottom: '4px',
                          textTransform: 'lowercase',
                        }}
                      >
                        {node.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: flowCoreColours.textTertiary,
                          lineHeight: 1.4,
                        }}
                      >
                        {node.description}
                      </div>
                    </div>

                    {/* Hotkey */}
                    {node.hotkey && (
                      <kbd
                        style={{
                          padding: '4px 8px',
                          backgroundColor: flowCoreColours.darkGrey,
                          border: `1px solid ${flowCoreColours.borderGrey}`,
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: flowCoreColours.textSecondary,
                          fontFamily: 'inherit',
                          textTransform: 'uppercase',
                        }}
                      >
                        {node.hotkey}
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
          <kbd>↑↓</kbd> navigate · <kbd>enter</kbd> spawn · <kbd>esc</kbd> close
        </div>
      </motion.div>
    </>
  )
}
