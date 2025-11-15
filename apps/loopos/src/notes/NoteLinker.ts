/**
 * Note Linker
 * Manages backlinks and note-to-note/note-to-node relationships
 */

import type { LoopOSNote, LoopOSNode } from '@total-audio/loopos-db'

export interface NoteLink {
  from_note_id: string
  to_note_id: string
  link_type: 'reference' | 'backlink'
}

export interface NoteNodeLink {
  note_id: string
  node_id: string
}

export class NoteLinker {
  /**
   * Extract note references from content
   * Supports [[Note Title]] syntax
   */
  static extractNoteReferences(content: string, allNotes: LoopOSNote[]): string[] {
    const referencePattern = /\[\[([^\]]+)\]\]/g
    const matches = [...content.matchAll(referencePattern)]

    if (matches.length === 0) return []

    const notesByTitle = new Map(allNotes.map((n) => [n.title.toLowerCase(), n.id]))
    const references: string[] = []

    for (const match of matches) {
      const title = match[1].toLowerCase()
      const noteId = notesByTitle.get(title)
      if (noteId) {
        references.push(noteId)
      }
    }

    return Array.from(new Set(references)) // Unique references
  }

  /**
   * Extract node references from content
   * Supports @NodeTitle syntax
   */
  static extractNodeReferences(content: string, allNodes: LoopOSNode[]): string[] {
    const referencePattern = /@([A-Za-z0-9\s]+)/g
    const matches = [...content.matchAll(referencePattern)]

    if (matches.length === 0) return []

    const nodesByTitle = new Map(
      allNodes.map((n) => [n.title.toLowerCase().trim(), n.id])
    )
    const references: string[] = []

    for (const match of matches) {
      const title = match[1].toLowerCase().trim()
      const nodeId = nodesByTitle.get(title)
      if (nodeId) {
        references.push(nodeId)
      }
    }

    return Array.from(new Set(references))
  }

  /**
   * Calculate backlinks for a note
   * Returns notes that reference this note
   */
  static calculateBacklinks(noteId: string, allNotes: LoopOSNote[]): string[] {
    const backlinks: string[] = []

    for (const note of allNotes) {
      if (note.id === noteId) continue

      const references = this.extractNoteReferences(note.content, allNotes)
      if (references.includes(noteId)) {
        backlinks.push(note.id)
      }
    }

    return backlinks
  }

  /**
   * Update note with auto-detected links
   */
  static updateNoteLinks(
    note: LoopOSNote,
    allNotes: LoopOSNote[],
    allNodes: LoopOSNode[]
  ): {
    backlinks: string[]
    linked_nodes: string[]
  } {
    const noteReferences = this.extractNoteReferences(note.content, allNotes)
    const nodeReferences = this.extractNodeReferences(note.content, allNodes)
    const backlinks = this.calculateBacklinks(note.id, allNotes)

    return {
      backlinks,
      linked_nodes: nodeReferences,
    }
  }

  /**
   * Get all notes that link to a specific note
   */
  static getNotesLinkingTo(targetNoteId: string, allNotes: LoopOSNote[]): LoopOSNote[] {
    return allNotes.filter((note) => {
      const references = this.extractNoteReferences(note.content, allNotes)
      return references.includes(targetNoteId)
    })
  }

  /**
   * Get note network (all connected notes within N degrees)
   */
  static getNoteNetwork(
    startNoteId: string,
    allNotes: LoopOSNote[],
    maxDegrees: number = 2
  ): Set<string> {
    const network = new Set<string>()
    const visited = new Set<string>()

    function traverse(noteId: string, degree: number) {
      if (degree > maxDegrees) return
      if (visited.has(noteId)) return

      visited.add(noteId)
      network.add(noteId)

      const note = allNotes.find((n) => n.id === noteId)
      if (!note) return

      // Follow forward links
      const references = NoteLinker.extractNoteReferences(note.content, allNotes)
      for (const refId of references) {
        traverse(refId, degree + 1)
      }

      // Follow backlinks
      for (const backlink of note.backlinks) {
        traverse(backlink, degree + 1)
      }
    }

    traverse(startNoteId, 0)
    network.delete(startNoteId) // Remove starting note from network

    return network
  }

  /**
   * Suggest related notes based on tags and content
   */
  static suggestRelatedNotes(
    note: LoopOSNote,
    allNotes: LoopOSNote[],
    limit: number = 5
  ): LoopOSNote[] {
    const scores = new Map<string, number>()

    for (const otherNote of allNotes) {
      if (otherNote.id === note.id) continue

      let score = 0

      // Tag overlap
      const commonTags = note.tags.filter((tag) => otherNote.tags.includes(tag))
      score += commonTags.length * 3

      // Theme overlap
      const commonThemes = (note.ai_themes || []).filter((theme) =>
        (otherNote.ai_themes || []).includes(theme)
      )
      score += commonThemes.length * 2

      // Already linked
      if (note.backlinks.includes(otherNote.id)) score += 5
      if (otherNote.backlinks.includes(note.id)) score += 5

      if (score > 0) {
        scores.set(otherNote.id, score)
      }
    }

    // Sort by score and return top N
    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)

    return allNotes.filter((n) => sorted.includes(n.id))
  }
}
