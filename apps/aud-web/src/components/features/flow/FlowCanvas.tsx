/**
 * FlowCanvas Component
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Provide infinite canvas for node-based workflow
 * - Support node spawning from registry
 * - Manage node positioning and connections
 * - Edge glow affordance on drag
 *
 * @todo: upgrade if legacy component found
 */

'use client'

import { useState, useCallback, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import type { NodeKind } from '@/types/console'
import { getNodeByKind } from '@/features/flow/node-registry'

const log = logger.scope('FlowCanvas')

export interface NodePosition {
  x: number
  y: number
}

export interface SpawnedNode {
  id: string
  kind: NodeKind
  position: NodePosition
  element: ReactNode
}

export interface FlowCanvasProps {
  campaignId?: string
  userId?: string
  children?: ReactNode
  onNodeSpawned?: (kind: NodeKind, nodeId: string) => void
}

export function FlowCanvas({ campaignId, userId, children, onNodeSpawned }: FlowCanvasProps) {
  const prefersReducedMotion = useReducedMotion()
  const { trackEvent } = useFlowStateTelemetry()
  const canvasRef = useRef<HTMLDivElement>(null)

  const [spawnedNodes, setSpawnedNodes] = useState<SpawnedNode[]>([])
  const [edgeGlowActive, setEdgeGlowActive] = useState(false)
  const [cursorPosition, setCursorPosition] = useState<NodePosition>({ x: 0, y: 0 })

  /**
   * Spawn a node at the specified position (or cursor position)
   */
  const spawnNode = useCallback(
    (kind: NodeKind, at?: NodePosition) => {
      try {
        const nodeDef = getNodeByKind(kind)
        if (!nodeDef) {
          log.warn('Node kind not found in registry', { kind })
          return null
        }

        const position = at || cursorPosition
        const nodeId = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

        log.info('Spawning node', { kind, nodeId, position })

        // Spawn the node element using the factory
        const element = nodeDef.spawn({
          campaignId,
          userId,
        })

        const newNode: SpawnedNode = {
          id: nodeId,
          kind,
          position,
          element,
        }

        setSpawnedNodes((prev) => [...prev, newNode])

        // Track telemetry
        trackEvent('save', {
          metadata: {
            action: 'node_spawned',
            nodeKind: kind,
            nodeId,
            campaignId: campaignId || 'global',
          },
        })

        // Edge glow affordance
        setEdgeGlowActive(true)
        setTimeout(() => setEdgeGlowActive(false), 400)

        if (onNodeSpawned) {
          onNodeSpawned(kind, nodeId)
        }

        return nodeId
      } catch (error) {
        log.error('Failed to spawn node', error, { kind })
        return null
      }
    },
    [cursorPosition, campaignId, userId, trackEvent, onNodeSpawned]
  )

  /**
   * Remove a spawned node
   */
  const removeNode = useCallback((nodeId: string) => {
    log.info('Removing node', { nodeId })
    setSpawnedNodes((prev) => prev.filter((node) => node.id !== nodeId))
  }, [])

  /**
   * Track cursor position for placement
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }, [])

  return (
    <div
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '600px',
        backgroundColor: flowCoreColours.matteBlack,
        backgroundImage: `
          linear-gradient(${flowCoreColours.borderGrey} 1px, transparent 1px),
          linear-gradient(90deg, ${flowCoreColours.borderGrey} 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        overflow: 'hidden',
        transition: edgeGlowActive ? 'box-shadow 0.24s ease' : 'none',
        boxShadow: edgeGlowActive
          ? `inset 0 0 40px rgba(58, 169, 190, 0.2), 0 0 20px rgba(58, 169, 190, 0.1)`
          : 'none',
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Spawned nodes */}
      <AnimatePresence mode="popLayout">
        {spawnedNodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              maxWidth: '480px',
              zIndex: 10,
            }}
          >
            {/* Close button */}
            <button
              onClick={() => removeNode(node.id)}
              aria-label={`Remove ${node.kind} agent`}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: `1px solid ${flowCoreColours.borderGrey}`,
                backgroundColor: flowCoreColours.darkGrey,
                color: flowCoreColours.textSecondary,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = flowCoreColours.warningOrange
                e.currentTarget.style.color = flowCoreColours.matteBlack
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = flowCoreColours.darkGrey
                e.currentTarget.style.color = flowCoreColours.textSecondary
              }}
            >
              ✕
            </button>

            {/* Node element */}
            {node.element}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Children (custom content) */}
      {children}
    </div>
  )
}

/**
 * Export spawnNode as a standalone function for external use
 * This allows other components to trigger node spawning
 */
export type SpawnNodeFunction = (kind: NodeKind, at?: NodePosition) => string | null
