/**
 * CMG Writer - Data Ingestion Module
 * Phase 22: Universal Creative Memory Graph
 *
 * Handles writing CMG nodes and edges from various existing systems.
 */

import { supabase } from '@total-audio/core-supabase';
import type {
  CMGNode,
  CMGEdge,
  CMGNodeType,
  CMGEdgeType,
  OSName,
  SentimentType,
} from './cmg.types';

// =====================================================================
// Types for Integration
// =====================================================================

/**
 * OS Memory structure (from Phase 12A)
 * Minimal interface for what we need
 */
export interface OSMemory {
  id?: string;
  userId: string;
  campaignId?: string;
  os: OSName;
  memoryType: string;
  content: string;
  importance: number;
  sentiment?: SentimentType;
  timestamp: string;
  metadata?: unknown;
}

/**
 * Evolution Event structure (from Phase 13A)
 */
export interface EvolutionEvent {
  id?: string;
  userId: string;
  campaignId?: string;
  os: OSName;
  eventType: string;
  description: string;
  importance: number;
  timestamp: string;
  metadata?: unknown;
}

/**
 * Structural Marker (from Intelligence/Arc systems)
 */
export interface StructuralMarker {
  userId: string;
  campaignId?: string;
  os?: OSName;
  markerType: string;
  label: string;
  position: number; // 0-1 in arc
  importance: number;
  timestamp: string;
  metadata?: unknown;
}

/**
 * Campaign Outcome
 */
export interface CampaignOutcome {
  userId: string;
  campaignId: string;
  outcomeType: 'success' | 'partial' | 'failure' | 'abandoned';
  label: string;
  metrics: {
    cohesion?: number;
    tension?: number;
    responseRate?: number;
    completionRate?: number;
  };
  timestamp: string;
  metadata?: unknown;
}

// =====================================================================
// CMG Writer Functions
// =====================================================================

/**
 * Record an OS memory as a CMG node
 */
export async function recordMemoryNode(memory: OSMemory): Promise<CMGNode | null> {

  const nodeData = {
    user_id: memory.userId,
    campaign_id: memory.campaignId || null,
    node_type: 'memory' as CMGNodeType,
    os: memory.os,
    label: `${memory.memoryType}: ${memory.content.substring(0, 100)}`,
    sentiment: memory.sentiment || null,
    importance: memory.importance,
    payload: {
      memoryType: memory.memoryType,
      content: memory.content,
      metadata: memory.metadata,
    },
    occurred_at: memory.timestamp,
  };

  const { data, error } = await supabase
    .from('cmg_nodes')
    .insert(nodeData)
    .select()
    .single();

  if (error) {
    console.error('Error recording memory node:', error);
    return null;
  }

  return transformNodeFromDB(data);
}

/**
 * Record an evolution event as a CMG node
 */
export async function recordEvolutionEvent(event: EvolutionEvent): Promise<CMGNode | null> {

  const nodeData = {
    user_id: event.userId,
    campaign_id: event.campaignId || null,
    node_type: 'event' as CMGNodeType,
    os: event.os,
    label: `Evolution: ${event.description}`,
    sentiment: null,
    importance: event.importance,
    payload: {
      eventType: event.eventType,
      description: event.description,
      metadata: event.metadata,
    },
    occurred_at: event.timestamp,
  };

  const { data, error } = await supabase
    .from('cmg_nodes')
    .insert(nodeData)
    .select()
    .single();

  if (error) {
    console.error('Error recording evolution event:', error);
    return null;
  }

  return transformNodeFromDB(data);
}

/**
 * Record a structural marker as a CMG node
 */
export async function recordStructuralMarker(marker: StructuralMarker): Promise<CMGNode | null> {

  const nodeData = {
    user_id: marker.userId,
    campaign_id: marker.campaignId || null,
    node_type: 'structural_marker' as CMGNodeType,
    os: marker.os || null,
    label: marker.label,
    sentiment: null,
    importance: marker.importance,
    payload: {
      markerType: marker.markerType,
      position: marker.position,
      metadata: marker.metadata,
    },
    occurred_at: marker.timestamp,
  };

  const { data, error } = await supabase
    .from('cmg_nodes')
    .insert(nodeData)
    .select()
    .single();

  if (error) {
    console.error('Error recording structural marker:', error);
    return null;
  }

  return transformNodeFromDB(data);
}

/**
 * Record a campaign outcome as a CMG node
 */
export async function recordOutcomeNode(outcome: CampaignOutcome): Promise<CMGNode | null> {

  // Determine sentiment based on outcome type
  let sentiment: SentimentType = 'neutral';
  if (outcome.outcomeType === 'success') sentiment = 'positive';
  else if (outcome.outcomeType === 'failure') sentiment = 'negative';
  else if (outcome.outcomeType === 'partial') sentiment = 'mixed';

  // Determine importance based on metrics
  let importance = 3;
  if (outcome.outcomeType === 'success' && (outcome.metrics.completionRate ?? 0) > 0.8) {
    importance = 5;
  } else if (outcome.outcomeType === 'failure') {
    importance = 4;
  }

  const nodeData = {
    user_id: outcome.userId,
    campaign_id: outcome.campaignId,
    node_type: 'outcome' as CMGNodeType,
    os: null,
    label: outcome.label,
    sentiment,
    importance,
    payload: {
      outcomeType: outcome.outcomeType,
      metrics: outcome.metrics,
      metadata: outcome.metadata,
    },
    occurred_at: outcome.timestamp,
  };

  const { data, error } = await supabase
    .from('cmg_nodes')
    .insert(nodeData)
    .select()
    .single();

  if (error) {
    console.error('Error recording outcome node:', error);
    return null;
  }

  return transformNodeFromDB(data);
}

/**
 * Link two nodes with an edge
 */
export async function linkNodes(
  fromId: string,
  toId: string,
  edgeType: CMGEdgeType,
  weight: number,
  userId: string
): Promise<CMGEdge | null> {

  const edgeData = {
    user_id: userId,
    from_node_id: fromId,
    to_node_id: toId,
    edge_type: edgeType,
    weight: Math.max(0, Math.min(1, weight)), // Clamp to 0-1
  };

  const { data, error } = await supabase
    .from('cmg_edges')
    .insert(edgeData)
    .select()
    .single();

  if (error) {
    console.error('Error linking nodes:', error);
    return null;
  }

  return transformEdgeFromDB(data);
}

/**
 * Batch insert multiple nodes
 */
export async function recordMultipleNodes(
  nodes: Array<Omit<CMGNode, 'id' | 'createdAt'>>
): Promise<CMGNode[]> {

  const nodeData = nodes.map((node) => ({
    user_id: node.userId,
    campaign_id: node.campaignId || null,
    node_type: node.nodeType,
    os: node.os || null,
    label: node.label,
    sentiment: node.sentiment || null,
    importance: node.importance,
    payload: node.payload,
    occurred_at: node.occurredAt,
  }));

  const { data, error } = await supabase.from('cmg_nodes').insert(nodeData).select();

  if (error) {
    console.error('Error recording multiple nodes:', error);
    return [];
  }

  return data.map(transformNodeFromDB);
}

/**
 * Batch insert multiple edges
 */
export async function linkMultipleNodes(
  edges: Array<{
    fromId: string;
    toId: string;
    edgeType: CMGEdgeType;
    weight: number;
    userId: string;
  }>
): Promise<CMGEdge[]> {

  const edgeData = edges.map((edge) => ({
    user_id: edge.userId,
    from_node_id: edge.fromId,
    to_node_id: edge.toId,
    edge_type: edge.edgeType,
    weight: Math.max(0, Math.min(1, edge.weight)),
  }));

  const { data, error } = await supabase.from('cmg_edges').insert(edgeData).select();

  if (error) {
    console.error('Error linking multiple nodes:', error);
    return [];
  }

  return data.map(transformEdgeFromDB);
}

// =====================================================================
// Helper Functions
// =====================================================================

/**
 * Transform DB node to CMGNode type
 */
function transformNodeFromDB(dbNode: any): CMGNode {
  return {
    id: dbNode.id,
    userId: dbNode.user_id,
    campaignId: dbNode.campaign_id,
    nodeType: dbNode.node_type,
    os: dbNode.os,
    label: dbNode.label,
    sentiment: dbNode.sentiment,
    importance: dbNode.importance,
    payload: dbNode.payload,
    occurredAt: dbNode.occurred_at,
    createdAt: dbNode.created_at,
  };
}

/**
 * Transform DB edge to CMGEdge type
 */
function transformEdgeFromDB(dbEdge: any): CMGEdge {
  return {
    id: dbEdge.id,
    userId: dbEdge.user_id,
    fromNodeId: dbEdge.from_node_id,
    toNodeId: dbEdge.to_node_id,
    edgeType: dbEdge.edge_type,
    weight: dbEdge.weight,
    createdAt: dbEdge.created_at,
  };
}
