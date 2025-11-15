/**
 * Node Search Modal
 * Phase 18: Lightweight node search with ⌘F
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useReactFlow, type Node } from 'reactflow'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useFlowCanvasStore } from '@/store/flowCanvasStore'

interface NodeSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function NodeSearch({ isOpen, onClose }: NodeSearchProps) {
  const [query, setQuery] = useState('')
  const nodes = useFlowCanvasStore((state) => state.nodes)
  const { setCenter, fitView } = useReactFlow()

  const filteredNodes = query.trim()
    ? nodes.filter((node) => {
        const searchText = query.toLowerCase()
        const nodeLabel = (node.data as { kind?: string })?.kind?.toLowerCase() ?? ''
        const nodeId = node.id.toLowerCase()
        return nodeLabel.includes(searchText) || nodeId.includes(searchText)
      })
    : []

  const handleSelectNode = useCallback(
    (node: Node) => {
      // Center viewport on node
      setCenter(node.position.x + 180, node.position.y + 100, { zoom: 1, duration: 300 })

      // Highlight briefly (via React Flow's selected state)
      useFlowCanvasStore.getState().setNodes((nodes) =>
        nodes.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      )

      // Clear after 2s
      setTimeout(() => {
        useFlowCanvasStore.getState().setNodes((nodes) =>
          nodes.map((n) => ({
            ...n,
            selected: false,
          }))
        )
      }, 2000)

      onClose()
    },
    [setCenter, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '120px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: flowCoreColours.overlayStrong,
          border: `1px solid ${flowCoreColours.borderGrey}`,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${flowCoreColours.borderGrey}` }}>
          <input
            type="text"
            placeholder="Search nodes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '6px',
              color: flowCoreColours.textPrimary,
              fontFamily: 'var(--flowcore-font-mono)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Results */}
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {filteredNodes.length === 0 && query.trim() && (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: flowCoreColours.textTertiary,
                fontFamily: 'var(--flowcore-font-mono)',
                fontSize: '13px',
              }}
            >
              no nodes found
            </div>
          )}

          {filteredNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => handleSelectNode(node)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
                color: flowCoreColours.textPrimary,
                fontFamily: 'var(--flowcore-font-mono)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background-color 120ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = flowCoreColours.overlaySoft
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <div style={{ color: flowCoreColours.slateCyan, marginBottom: '4px' }}>
                {(node.data as { kind?: string })?.kind ?? 'unknown'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: flowCoreColours.textTertiary,
                }}
              >
                {node.id}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

