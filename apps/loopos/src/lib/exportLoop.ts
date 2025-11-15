/**
 * Loop Export Utilities
 * Export loops as JSON for sharing and backup
 */

import type { LoopOSNode, LoopOSNote } from '@total-audio/loopos-db'
import { z } from 'zod'

export interface LoopExport {
  version: '1.0'
  exported_at: string
  name: string
  description?: string
  nodes: Omit<LoopOSNode, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
  notes?: Omit<LoopOSNote, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
  node_id_mapping?: Record<string, string> // old_id -> new_id for dependencies
}

/**
 * Export loop to JSON
 */
export function exportLoop(
  nodes: LoopOSNode[],
  notes: LoopOSNote[] = [],
  name: string,
  description?: string
): LoopExport {
  // Create ID mapping for dependencies
  const nodeIdMapping: Record<string, string> = {}
  nodes.forEach((node, index) => {
    nodeIdMapping[node.id] = `node-${index}`
  })

  // Clean nodes (remove user-specific fields)
  const cleanNodes = nodes.map((node) => {
    const { id, user_id, created_at, updated_at, ...rest } = node

    // Remap dependency IDs
    const remappedDependsOn = rest.depends_on.map((depId) => nodeIdMapping[depId] || depId)

    return {
      ...rest,
      depends_on: remappedDependsOn,
    }
  })

  // Clean notes
  const cleanNotes = notes.map((note) => {
    const { id, user_id, created_at, updated_at, ...rest } = note

    // Remap linked node IDs
    const remappedLinkedNodes = rest.linked_nodes.map(
      (nodeId) => nodeIdMapping[nodeId] || nodeId
    )

    return {
      ...rest,
      linked_nodes: remappedLinkedNodes,
    }
  })

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    name,
    description,
    nodes: cleanNodes,
    notes: cleanNotes,
    node_id_mapping: nodeIdMapping,
  }
}

/**
 * Download loop as JSON file
 */
export function downloadLoopAsJSON(loopExport: LoopExport): void {
  const json = JSON.stringify(loopExport, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${loopExport.name.replace(/\s+/g, '-').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Copy loop JSON to clipboard
 */
export async function copyLoopToClipboard(loopExport: LoopExport): Promise<boolean> {
  try {
    const json = JSON.stringify(loopExport, null, 2)
    await navigator.clipboard.writeText(json)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
