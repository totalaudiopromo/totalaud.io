/**
 * Console Export Utilities
 * Prepare LoopOS tasks for future Console integration
 */

import type { LoopOSNode, LoopOSNote, ExportType } from '@total-audio/loopos-db'

export interface ConsoleExportPayload {
  type: ExportType
  content: string
  metadata: {
    source: 'loopos'
    source_id: string
    source_type: 'node' | 'note' | 'sequence' | 'daily_action'
    title?: string
    tags?: string[]
    [key: string]: any
  }
  suggested_date?: string
}

/**
 * Convert a LoopOS node to Console export payload
 */
export function nodeToConsoleExport(node: LoopOSNode): ConsoleExportPayload {
  // Determine export type based on node type
  let exportType: ExportType
  switch (node.node_type) {
    case 'promotional':
      exportType = 'promotion'
      break
    case 'analysis':
      exportType = 'analysis'
      break
    case 'planning':
      exportType = 'planning'
      break
    case 'creative':
      exportType = 'creative'
      break
    default:
      exportType = 'planning'
  }

  return {
    type: exportType,
    content: `${node.title}\n\n${node.description || ''}`.trim(),
    metadata: {
      source: 'loopos',
      source_id: node.id,
      source_type: 'node',
      title: node.title,
      tags: node.tags,
      node_type: node.node_type,
      momentum_value: node.momentum_value,
    },
    suggested_date: node.due_date || undefined,
  }
}

/**
 * Convert a LoopOS note to Console export payload
 */
export function noteToConsoleExport(note: LoopOSNote, exportType: ExportType = 'planning'): ConsoleExportPayload {
  return {
    type: exportType,
    content: `${note.title}\n\n${note.content}`,
    metadata: {
      source: 'loopos',
      source_id: note.id,
      source_type: 'note',
      title: note.title,
      tags: note.tags,
      ai_summary: note.ai_summary,
      ai_themes: note.ai_themes,
    },
  }
}

/**
 * Convert a sequence of nodes to Console export payload
 */
export function sequenceToConsoleExport(
  nodes: LoopOSNode[],
  sequenceName: string
): ConsoleExportPayload {
  const nodeDescriptions = nodes
    .map((n, i) => `${i + 1}. ${n.title}${n.description ? `: ${n.description}` : ''}`)
    .join('\n')

  const allTags = Array.from(new Set(nodes.flatMap((n) => n.tags)))

  return {
    type: 'planning',
    content: `Sequence: ${sequenceName}\n\nNodes:\n${nodeDescriptions}`,
    metadata: {
      source: 'loopos',
      source_id: nodes[0]?.id || '',
      source_type: 'sequence',
      title: sequenceName,
      tags: allTags,
      node_count: nodes.length,
      node_ids: nodes.map((n) => n.id),
    },
  }
}

/**
 * Validate export payload
 */
export function validateExportPayload(payload: ConsoleExportPayload): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!payload.type) {
    errors.push('Export type is required')
  }

  if (!payload.content || payload.content.trim().length === 0) {
    errors.push('Content cannot be empty')
  }

  if (!payload.metadata.source) {
    errors.push('Source metadata is required')
  }

  if (!payload.metadata.source_id) {
    errors.push('Source ID is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
