/**
 * Loop Import Utilities
 * Import loops from JSON
 */

import type { LoopOSNodeInsert, LoopOSNoteInsert } from '@total-audio/loopos-db'
import { z } from 'zod'
import { nanoid } from 'nanoid'

export interface LoopImport {
  version: '1.0'
  exported_at: string
  name: string
  description?: string
  nodes: any[]
  notes?: any[]
  node_id_mapping?: Record<string, string>
}

export interface ImportResult {
  success: boolean
  nodes: LoopOSNodeInsert[]
  notes: LoopOSNoteInsert[]
  errors: string[]
}

const loopImportSchema = z.object({
  version: z.literal('1.0'),
  exported_at: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(z.any()),
  notes: z.array(z.any()).optional(),
  node_id_mapping: z.record(z.string()).optional(),
})

/**
 * Validate and parse imported loop JSON
 */
export function validateLoopImport(json: string): {
  valid: boolean
  data?: LoopImport
  errors: string[]
} {
  const errors: string[] = []

  try {
    const parsed = JSON.parse(json)

    const validation = loopImportSchema.safeParse(parsed)

    if (!validation.success) {
      return {
        valid: false,
        errors: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      }
    }

    return {
      valid: true,
      data: validation.data as LoopImport,
      errors: [],
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Invalid JSON: ${error.message}`)
    } else {
      errors.push('Invalid JSON format')
    }

    return {
      valid: false,
      errors,
    }
  }
}

/**
 * Import loop and prepare for database insertion
 */
export function importLoop(loopData: LoopImport, userId: string): ImportResult {
  const errors: string[] = []

  try {
    // Create new ID mapping (old template IDs -> new UUIDs)
    const newIdMapping: Record<string, string> = {}

    // Generate new IDs for all nodes
    loopData.nodes.forEach((node, index) => {
      const oldId = loopData.node_id_mapping
        ? Object.entries(loopData.node_id_mapping).find(([_, v]) => v === `node-${index}`)?.[0]
        : `node-${index}`

      if (oldId) {
        newIdMapping[oldId] = nanoid()
      } else {
        newIdMapping[`node-${index}`] = nanoid()
      }
    })

    // Prepare nodes with new IDs and remapped dependencies
    const nodes: LoopOSNodeInsert[] = loopData.nodes.map((node, index) => {
      const templateId = `node-${index}`
      const newId = newIdMapping[templateId] || newIdMapping[`node-${index}`]

      // Remap dependencies
      const remappedDependsOn = (node.depends_on || [])
        .map((oldId: string) => newIdMapping[oldId])
        .filter(Boolean)

      return {
        ...node,
        user_id: userId,
        depends_on: remappedDependsOn,
      } as LoopOSNodeInsert
    })

    // Prepare notes with remapped node links
    const notes: LoopOSNoteInsert[] = (loopData.notes || []).map((note) => {
      const remappedLinkedNodes = (note.linked_nodes || [])
        .map((oldId: string) => newIdMapping[oldId])
        .filter(Boolean)

      return {
        ...note,
        user_id: userId,
        linked_nodes: remappedLinkedNodes,
        backlinks: [], // Backlinks will be recalculated
      } as LoopOSNoteInsert
    })

    return {
      success: true,
      nodes,
      notes,
      errors: [],
    }
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Import failed: ${error.message}`)
    } else {
      errors.push('Import failed: Unknown error')
    }

    return {
      success: false,
      nodes: [],
      notes: [],
      errors,
    }
  }
}

/**
 * Read loop from uploaded file
 */
export async function readLoopFromFile(file: File): Promise<{
  success: boolean
  json?: string
  error?: string
}> {
  try {
    const text = await file.text()

    return {
      success: true,
      json: text,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file',
    }
  }
}
