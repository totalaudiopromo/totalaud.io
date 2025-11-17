import { supabase } from './client'
import type {
  AnalogueCard,
  NoteLink,
  NodeOrigin,
  LinkedNode,
  LinkType,
  OriginType,
} from './types'

/**
 * Phase 32: Creative Continuity — Notebook → Timeline Smart Linking
 *
 * Database operations for linking notes/cards to timeline nodes.
 * Philosophy: One unified creative instrument.
 * Tone: "Add to timeline" not "Promote". Calm, British, connected.
 */

// ============================================================================
// ANALOGUE CARDS
// ============================================================================

export const analogueCardDb = {
  /**
   * Create an analogue card
   */
  async create(
    workspaceId: string,
    userId: string,
    data: {
      title: string
      content?: Record<string, unknown>
    }
  ): Promise<AnalogueCard> {
    const { data: card, error } = await supabase
      .from('loopos_analogue_cards')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        title: data.title,
        content: data.content || {},
      })
      .select()
      .single()

    if (error) throw error
    return card
  },

  /**
   * List all cards in a workspace
   */
  async list(workspaceId: string): Promise<AnalogueCard[]> {
    const { data, error } = await supabase
      .from('loopos_analogue_cards')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get a single card
   */
  async get(cardId: string): Promise<AnalogueCard> {
    const { data, error } = await supabase
      .from('loopos_analogue_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update a card
   */
  async update(
    cardId: string,
    updates: Partial<Omit<AnalogueCard, 'id' | 'workspace_id' | 'user_id' | 'created_at'>>
  ): Promise<AnalogueCard> {
    const { data, error } = await supabase
      .from('loopos_analogue_cards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete a card
   */
  async delete(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('loopos_analogue_cards')
      .delete()
      .eq('id', cardId)

    if (error) throw error
  },
}

// ============================================================================
// NOTE LINKS
// ============================================================================

export const noteLinkDb = {
  /**
   * Create a link from a note to a timeline node
   */
  async createFromNote(
    workspaceId: string,
    noteId: string,
    nodeId: string,
    linkType: LinkType = 'origin'
  ): Promise<NoteLink> {
    const { data, error } = await supabase
      .from('loopos_note_links')
      .insert({
        workspace_id: workspaceId,
        note_id: noteId,
        analogue_card_id: null,
        node_id: nodeId,
        link_type: linkType,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create a link from an analogue card to a timeline node
   */
  async createFromCard(
    workspaceId: string,
    cardId: string,
    nodeId: string,
    linkType: LinkType = 'origin'
  ): Promise<NoteLink> {
    const { data, error } = await supabase
      .from('loopos_note_links')
      .insert({
        workspace_id: workspaceId,
        note_id: null,
        analogue_card_id: cardId,
        node_id: nodeId,
        link_type: linkType,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get all nodes linked to a note
   */
  async getLinkedNodesForNote(noteId: string): Promise<LinkedNode[]> {
    const { data, error } = await supabase.rpc('get_note_linked_nodes', {
      p_note_id: noteId,
    })

    if (error) throw error
    return data || []
  },

  /**
   * Get all nodes linked to a card
   */
  async getLinkedNodesForCard(cardId: string): Promise<LinkedNode[]> {
    const { data, error } = await supabase.rpc('get_card_linked_nodes', {
      p_card_id: cardId,
    })

    if (error) throw error
    return data || []
  },

  /**
   * Get origin source for a node
   */
  async getNodeOrigin(nodeId: string): Promise<NodeOrigin | null> {
    const { data, error } = await supabase.rpc('get_node_origin', {
      p_node_id: nodeId,
    })

    if (error) throw error
    return data?.[0] || null
  },

  /**
   * Delete a link
   */
  async delete(linkId: string): Promise<void> {
    const { error } = await supabase
      .from('loopos_note_links')
      .delete()
      .eq('id', linkId)

    if (error) throw error
  },

  /**
   * Delete all links for a node
   */
  async deleteForNode(nodeId: string): Promise<void> {
    const { error } = await supabase
      .from('loopos_note_links')
      .delete()
      .eq('node_id', nodeId)

    if (error) throw error
  },
}

// ============================================================================
// NODE ORIGIN HELPERS
// ============================================================================

export const nodeOriginDb = {
  /**
   * Set origin for a timeline node
   */
  async setOrigin(
    nodeId: string,
    originType: OriginType,
    originId: string,
    confidence?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('loopos_nodes')
      .update({
        origin_type: originType,
        origin_id: originId,
        origin_confidence: confidence || null,
      })
      .eq('id', nodeId)

    if (error) throw error
  },

  /**
   * Clear origin for a timeline node
   */
  async clearOrigin(nodeId: string): Promise<void> {
    const { error } = await supabase
      .from('loopos_nodes')
      .update({
        origin_type: null,
        origin_id: null,
        origin_confidence: null,
      })
      .eq('id', nodeId)

    if (error) throw error
  },

  /**
   * Get all nodes with a specific origin
   */
  async getNodesWithOrigin(
    workspaceId: string,
    originType: OriginType,
    originId: string
  ): Promise<string[]> {
    const { data, error } = await supabase
      .from('loopos_nodes')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('origin_type', originType)
      .eq('origin_id', originId)

    if (error) throw error
    return (data || []).map((n) => n.id)
  },
}

// ============================================================================
// NOTE PROMOTION HELPERS
// ============================================================================

export const notePromotionDb = {
  /**
   * Mark a note as promoted to timeline
   * Works with both loopos_notes and loopos_journal_entries
   */
  async markPromoted(noteId: string, tableName: 'loopos_notes' | 'loopos_journal_entries'): Promise<void> {
    const { error } = await supabase
      .from(tableName)
      .update({ promoted_to_node: true })
      .eq('id', noteId)

    if (error) {
      console.warn('[Linking] Failed to mark note as promoted:', error)
      // Don't throw - this is optional metadata
    }
  },

  /**
   * Unmark a note as promoted (if link is deleted)
   */
  async unmarkPromoted(noteId: string, tableName: 'loopos_notes' | 'loopos_journal_entries'): Promise<void> {
    const { error } = await supabase
      .from(tableName)
      .update({ promoted_to_node: false })
      .eq('id', noteId)

    if (error) {
      console.warn('[Linking] Failed to unmark note as promoted:', error)
      // Don't throw - this is optional metadata
    }
  },
}

export const linkingDb = {
  analogueCard: analogueCardDb,
  noteLink: noteLinkDb,
  nodeOrigin: nodeOriginDb,
  notePromotion: notePromotionDb,
}
