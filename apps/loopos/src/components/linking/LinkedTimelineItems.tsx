'use client'

/**
 * Phase 32: Creative Continuity — Linked Timeline Items Component
 *
 * Shows timeline nodes linked to a note/card.
 * Displays under each note with "View in timeline" actions.
 */

import type { LinkedNode } from '@loopos/db'

interface LinkedTimelineItemsProps {
  linkedNodes: LinkedNode[]
  onViewNode?: (nodeId: string) => void
  onHighlightNode?: (nodeId: string | null) => void
}

const nodeTypeLabels: Record<string, string> = {
  idea: 'Idea',
  milestone: 'Milestone',
  task: 'Task',
  reference: 'Reference',
  insight: 'Insight',
  decision: 'Decision',
}

export function LinkedTimelineItems({
  linkedNodes,
  onViewNode,
  onHighlightNode,
}: LinkedTimelineItemsProps) {
  if (linkedNodes.length === 0) {
    return null
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        border: '1px solid rgba(var(--colour-accent-rgb), 0.2)',
        borderRadius: '8px',
        backgroundColor: 'rgba(var(--colour-accent-rgb), 0.03)',
      }}
    >
      <h4
        style={{
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--colour-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
        }}
      >
        Linked timeline items
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {linkedNodes.map((node) => (
          <div
            key={node.node_id}
            onMouseEnter={() => onHighlightNode?.(node.node_id)}
            onMouseLeave={() => onHighlightNode?.(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem',
              borderRadius: '6px',
              backgroundColor: 'var(--colour-panel)',
              border: '1px solid var(--colour-border)',
              transition: 'all 120ms ease-out',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--colour-foreground)',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {node.node_title}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--colour-muted)',
                }}
              >
                {nodeTypeLabels[node.node_type] || node.node_type}
              </div>
            </div>

            {onViewNode && (
              <button
                onClick={() => onViewNode(node.node_id)}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'var(--colour-accent)',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(var(--colour-accent-rgb), 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 120ms ease-out',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(var(--colour-accent-rgb), 0.1)'
                  e.currentTarget.style.borderColor = 'var(--colour-accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(var(--colour-accent-rgb), 0.3)'
                }}
              >
                View in timeline
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
