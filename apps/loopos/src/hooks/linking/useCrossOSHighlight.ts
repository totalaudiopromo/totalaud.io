/**
 * Phase 32: Creative Continuity — Cross-OS Highlight System
 *
 * Lightweight postMessage bridge for highlighting linked items across surfaces.
 * No WebSockets. No heavy state. Just soft visual links.
 *
 * Philosophy: Hover timeline node → note glows. Hover note → node glows.
 */

import { useEffect, useCallback } from 'react'

export type HighlightMessageType =
  | 'highlight-note'
  | 'highlight-node'
  | 'highlight-card'
  | 'clear-highlight'

export interface HighlightMessage {
  type: HighlightMessageType
  id: string | null
  source: 'loopos' | 'aud-web' | 'analogue'
}

interface UseCrossOSHighlightOptions {
  onHighlightNote?: (noteId: string | null) => void
  onHighlightNode?: (nodeId: string | null) => void
  onHighlightCard?: (cardId: string | null) => void
  enabled?: boolean
}

/**
 * Hook for cross-OS highlighting
 *
 * Usage:
 * ```ts
 * const { highlightNote, highlightNode, clearHighlight } = useCrossOSHighlight({
 *   onHighlightNote: (id) => setHighlightedNoteId(id),
 *   onHighlightNode: (id) => setHighlightedNodeId(id),
 * })
 *
 * // Hover note → tell other OS to highlight node
 * <div onMouseEnter={() => highlightNode(linkedNodeId)}
 *      onMouseLeave={clearHighlight}>
 *   Note content
 * </div>
 * ```
 */
export function useCrossOSHighlight({
  onHighlightNote,
  onHighlightNode,
  onHighlightCard,
  enabled = true,
}: UseCrossOSHighlightOptions = {}) {
  // Listen for highlight messages from other surfaces
  useEffect(() => {
    if (!enabled) return

    function handleMessage(event: MessageEvent) {
      // Validate message structure
      if (
        !event.data ||
        typeof event.data !== 'object' ||
        !event.data.type
      ) {
        return
      }

      const message = event.data as HighlightMessage

      // Handle highlight messages
      switch (message.type) {
        case 'highlight-note':
          onHighlightNote?.(message.id)
          break

        case 'highlight-node':
          onHighlightNode?.(message.id)
          break

        case 'highlight-card':
          onHighlightCard?.(message.id)
          break

        case 'clear-highlight':
          onHighlightNote?.(null)
          onHighlightNode?.(null)
          onHighlightCard?.(null)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [enabled, onHighlightNote, onHighlightNode, onHighlightCard])

  // Send highlight message to other surfaces
  const sendHighlight = useCallback(
    (type: HighlightMessageType, id: string | null, source: 'loopos' | 'aud-web' | 'analogue') => {
      if (!enabled) return

      const message: HighlightMessage = { type, id, source }
      window.postMessage(message, '*')
    },
    [enabled]
  )

  // Highlight a note (called from timeline node hover)
  const highlightNote = useCallback(
    (noteId: string | null) => {
      sendHighlight('highlight-note', noteId, 'loopos')
    },
    [sendHighlight]
  )

  // Highlight a node (called from note hover)
  const highlightNode = useCallback(
    (nodeId: string | null) => {
      sendHighlight('highlight-node', nodeId, 'loopos')
    },
    [sendHighlight]
  )

  // Highlight a card (called from node hover)
  const highlightCard = useCallback(
    (cardId: string | null) => {
      sendHighlight('highlight-card', cardId, 'analogue')
    },
    [sendHighlight]
  )

  // Clear all highlights
  const clearHighlight = useCallback(() => {
    sendHighlight('clear-highlight', null, 'loopos')
  }, [sendHighlight])

  return {
    highlightNote,
    highlightNode,
    highlightCard,
    clearHighlight,
  }
}

/**
 * Helper: Apply glow style when highlighted
 *
 * Usage:
 * ```ts
 * const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null)
 * useCrossOSHighlight({ onHighlightNote: setHighlightedNoteId })
 *
 * <div style={getHighlightStyle(highlightedNoteId === note.id)}>
 *   Note content
 * </div>
 * ```
 */
export function getHighlightStyle(isHighlighted: boolean): React.CSSProperties {
  if (!isHighlighted) return {}

  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    boxShadow: '0 0 0 2px var(--colour-accent), 0 0 20px rgba(var(--colour-accent-rgb), 0.3)',
    transform: prefersReducedMotion ? 'none' : 'scale(1.01)',
    transition: prefersReducedMotion ? 'box-shadow 120ms ease-out' : 'all 120ms ease-out',
    zIndex: 10,
  }
}

/**
 * Helper: Apply pulse animation when highlighted (alternative to scale)
 *
 * Usage:
 * ```ts
 * <div style={getPulseStyle(isHighlighted)}>
 *   Note content
 * </div>
 * ```
 */
export function getPulseStyle(isHighlighted: boolean): React.CSSProperties {
  if (!isHighlighted) return {}

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    boxShadow: '0 0 0 2px var(--colour-accent), 0 0 20px rgba(var(--colour-accent-rgb), 0.3)',
    opacity: prefersReducedMotion ? 1 : 0.95,
    transition: 'all 120ms ease-out',
    zIndex: 10,
  }
}
