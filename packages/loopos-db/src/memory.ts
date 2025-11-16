/**
 * LoopOS Memory Graph Database Helpers
 * Semantic memory system that learns from all LoopOS content
 */

import { z } from 'zod'
import { getSupabaseClient } from './client'

// =====================================================
// SCHEMAS
// =====================================================

export const MemoryNodeKindSchema = z.enum([
  'theme',
  'tone',
  'visual_motif',
  'audience',
  'value',
  'skill',
  'goal',
  'collaborator',
  'genre',
  'instrument',
  'technique',
])

export type MemoryNodeKind = z.infer<typeof MemoryNodeKindSchema>

export const MemoryNodeSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  kind: MemoryNodeKindSchema,
  label: z.string(),
  summary: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  occurrences: z.number().int().default(1),
  first_seen_at: z.string(),
  last_seen_at: z.string(),
  embedding_model: z.string().nullable(),
  embedding: z.any().nullable(), // Vector type
  created_at: z.string(),
  updated_at: z.string(),
})

export type MemoryNode = z.infer<typeof MemoryNodeSchema>

export const MemoryEdgeRelationSchema = z.enum([
  'relates_to',
  'contrasts_with',
  'inspires',
  'caused_by',
  'part_of',
  'similar_to',
])

export type MemoryEdgeRelation = z.infer<typeof MemoryEdgeRelationSchema>

export const MemoryEdgeSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  from_node_id: z.string().uuid(),
  to_node_id: z.string().uuid(),
  relation: MemoryEdgeRelationSchema,
  strength: z.number().min(0).max(1),
  evidence: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type MemoryEdge = z.infer<typeof MemoryEdgeSchema>

export const MemorySourceTypeSchema = z.enum([
  'journal',
  'coach',
  'timeline',
  'designer',
  'pack',
  'moodboard',
  'usage',
])

export type MemorySourceType = z.infer<typeof MemorySourceTypeSchema>

export const MemorySourceSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  node_id: z.string().uuid(),
  source_type: MemorySourceTypeSchema,
  source_id: z.string().uuid(),
  excerpt: z.string().nullable(),
  created_at: z.string(),
})

export type MemorySource = z.infer<typeof MemorySourceSchema>

export const MemorySnapshotSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  snapshot_type: z.enum(['auto', 'manual']),
  summary: z.string(),
  stats: z.record(z.any()).default({}),
  created_at: z.string(),
})

export type MemorySnapshot = z.infer<typeof MemorySnapshotSchema>

export const ArtistIdentitySchema = z.object({
  themes: z.array(z.object({ label: z.string(), confidence: z.number() })).nullable(),
  tones: z.array(z.object({ label: z.string(), confidence: z.number() })).nullable(),
  values: z.array(z.object({ label: z.string(), confidence: z.number() })).nullable(),
  visual_motifs: z.array(z.object({ label: z.string(), confidence: z.number() })).nullable(),
  node_count: z.number().nullable(),
  edge_count: z.number().nullable(),
})

export type ArtistIdentity = z.infer<typeof ArtistIdentitySchema>

// =====================================================
// MEMORY NODES
// =====================================================

export const memoryNodesDb = {
  /**
   * Get all nodes for a workspace
   */
  async list(workspaceId: string, limit = 100): Promise<MemoryNode[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_nodes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('confidence', { ascending: false })
      .order('occurrences', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to list memory nodes: ${error.message}`)
    }

    return z.array(MemoryNodeSchema).parse(data)
  },

  /**
   * Get nodes by kind
   */
  async listByKind(
    workspaceId: string,
    kind: MemoryNodeKind,
    limit = 50
  ): Promise<MemoryNode[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_nodes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('kind', kind)
      .order('confidence', { ascending: false })
      .order('occurrences', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to list memory nodes by kind: ${error.message}`)
    }

    return z.array(MemoryNodeSchema).parse(data)
  },

  /**
   * Get single node by ID
   */
  async get(nodeId: string): Promise<MemoryNode | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_nodes')
      .select('*')
      .eq('id', nodeId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to get memory node: ${error.message}`)
    }

    return MemoryNodeSchema.parse(data)
  },

  /**
   * Create or update node (upsert)
   */
  async upsert(
    workspaceId: string,
    kind: MemoryNodeKind,
    label: string,
    summary?: string,
    confidence = 0.5
  ): Promise<string> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.rpc('loopos_upsert_memory_node', {
      p_workspace_id: workspaceId,
      p_kind: kind,
      p_label: label,
      p_summary: summary || null,
      p_confidence: confidence,
    })

    if (error) {
      throw new Error(`Failed to upsert memory node: ${error.message}`)
    }

    return z.string().uuid().parse(data)
  },

  /**
   * Get top nodes by kind (using database function)
   */
  async getTopByKind(
    workspaceId: string,
    kind: MemoryNodeKind,
    limit = 10
  ): Promise<Array<Pick<MemoryNode, 'id' | 'label' | 'summary' | 'confidence' | 'occurrences'>>> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.rpc('loopos_get_top_nodes', {
      p_workspace_id: workspaceId,
      p_kind: kind,
      p_limit: limit,
    })

    if (error) {
      throw new Error(`Failed to get top nodes: ${error.message}`)
    }

    return z
      .array(
        z.object({
          id: z.string().uuid(),
          label: z.string(),
          summary: z.string().nullable(),
          confidence: z.number(),
          occurrences: z.number(),
        })
      )
      .parse(data)
  },

  /**
   * Delete node
   */
  async delete(nodeId: string): Promise<void> {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('loopos_memory_nodes').delete().eq('id', nodeId)

    if (error) {
      throw new Error(`Failed to delete memory node: ${error.message}`)
    }
  },
}

// =====================================================
// MEMORY EDGES
// =====================================================

export const memoryEdgesDb = {
  /**
   * List edges for a workspace
   */
  async list(workspaceId: string, limit = 100): Promise<MemoryEdge[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_edges')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('strength', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to list memory edges: ${error.message}`)
    }

    return z.array(MemoryEdgeSchema).parse(data)
  },

  /**
   * Get edges for a specific node
   */
  async getForNode(nodeId: string): Promise<MemoryEdge[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_edges')
      .select('*')
      .or(`from_node_id.eq.${nodeId},to_node_id.eq.${nodeId}`)

    if (error) {
      throw new Error(`Failed to get edges for node: ${error.message}`)
    }

    return z.array(MemoryEdgeSchema).parse(data)
  },

  /**
   * Get node graph (node with all connections)
   */
  async getNodeGraph(
    nodeId: string
  ): Promise<
    Array<{
      node_id: string
      node_label: string
      edge_id: string | null
      relation: string | null
      connected_node_id: string | null
      connected_node_label: string | null
      strength: number | null
    }>
  > {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.rpc('loopos_get_node_graph', {
      p_node_id: nodeId,
    })

    if (error) {
      throw new Error(`Failed to get node graph: ${error.message}`)
    }

    return z
      .array(
        z.object({
          node_id: z.string().uuid(),
          node_label: z.string(),
          edge_id: z.string().uuid().nullable(),
          relation: z.string().nullable(),
          connected_node_id: z.string().uuid().nullable(),
          connected_node_label: z.string().nullable(),
          strength: z.number().nullable(),
        })
      )
      .parse(data)
  },

  /**
   * Create edge
   */
  async create(
    workspaceId: string,
    fromNodeId: string,
    toNodeId: string,
    relation: MemoryEdgeRelation,
    strength = 0.5,
    evidence?: string
  ): Promise<string> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.rpc('loopos_create_memory_edge', {
      p_workspace_id: workspaceId,
      p_from_node_id: fromNodeId,
      p_to_node_id: toNodeId,
      p_relation: relation,
      p_strength: strength,
      p_evidence: evidence || null,
    })

    if (error) {
      throw new Error(`Failed to create memory edge: ${error.message}`)
    }

    return z.string().uuid().parse(data)
  },

  /**
   * Delete edge
   */
  async delete(edgeId: string): Promise<void> {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('loopos_memory_edges').delete().eq('id', edgeId)

    if (error) {
      throw new Error(`Failed to delete memory edge: ${error.message}`)
    }
  },
}

// =====================================================
// MEMORY SOURCES
// =====================================================

export const memorySourcesDb = {
  /**
   * List sources for a node
   */
  async listForNode(nodeId: string, limit = 50): Promise<MemorySource[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_sources')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to list memory sources: ${error.message}`)
    }

    return z.array(MemorySourceSchema).parse(data)
  },

  /**
   * Create source link
   */
  async create(
    workspaceId: string,
    nodeId: string,
    sourceType: MemorySourceType,
    sourceId: string,
    excerpt?: string
  ): Promise<string> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_sources')
      .insert({
        workspace_id: workspaceId,
        node_id: nodeId,
        source_type: sourceType,
        source_id: sourceId,
        excerpt: excerpt || null,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create memory source: ${error.message}`)
    }

    return z.string().uuid().parse(data.id)
  },

  /**
   * Delete source
   */
  async delete(sourceId: string): Promise<void> {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('loopos_memory_sources').delete().eq('id', sourceId)

    if (error) {
      throw new Error(`Failed to delete memory source: ${error.message}`)
    }
  },
}

// =====================================================
// MEMORY SNAPSHOTS
// =====================================================

export const memorySnapshotsDb = {
  /**
   * List snapshots for workspace
   */
  async list(workspaceId: string, limit = 20): Promise<MemorySnapshot[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_snapshots')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to list memory snapshots: ${error.message}`)
    }

    return z.array(MemorySnapshotSchema).parse(data)
  },

  /**
   * Create snapshot
   */
  async create(
    workspaceId: string,
    summary: string,
    stats: Record<string, unknown> = {},
    snapshotType: 'auto' | 'manual' = 'auto'
  ): Promise<string> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_snapshots')
      .insert({
        workspace_id: workspaceId,
        snapshot_type: snapshotType,
        summary,
        stats,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create memory snapshot: ${error.message}`)
    }

    return z.string().uuid().parse(data.id)
  },

  /**
   * Get latest snapshot
   */
  async getLatest(workspaceId: string): Promise<MemorySnapshot | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('loopos_memory_snapshots')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to get latest snapshot: ${error.message}`)
    }

    return MemorySnapshotSchema.parse(data)
  },
}

// =====================================================
// ARTIST IDENTITY
// =====================================================

export const artistIdentityDb = {
  /**
   * Get artist identity summary
   */
  async get(workspaceId: string): Promise<ArtistIdentity> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.rpc('loopos_get_artist_identity', {
      p_workspace_id: workspaceId,
    })

    if (error) {
      throw new Error(`Failed to get artist identity: ${error.message}`)
    }

    return ArtistIdentitySchema.parse(data)
  },
}

// =====================================================
// EXPORTS
// =====================================================

export const memoryDb = {
  nodes: memoryNodesDb,
  edges: memoryEdgesDb,
  sources: memorySourcesDb,
  snapshots: memorySnapshotsDb,
  identity: artistIdentityDb,
}
