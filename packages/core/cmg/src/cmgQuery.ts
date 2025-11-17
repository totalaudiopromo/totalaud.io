/**
 * CMG Query Layer - Data Retrieval Module
 * Phase 22: Universal Creative Memory Graph
 *
 * Deterministic query helpers for retrieving and analyzing CMG data.
 */

import { supabase } from '@total-audio/core-supabase';
import type {
  CMGNode,
  CMGEdge,
  OSName,
  GetRelatedMemoriesOptions,
  GetStructuralMotifsParams,
  GetOSDriftParams,
  GetOutcomeCorrelationsParams,
  StructuralMotif,
  OSDriftData,
  OutcomeCorrelation,
  CreativeFingerprint,
  TimelineBucket,
  SentimentType,
} from './cmg.types';

// =====================================================================
// Node & Edge Retrieval
// =====================================================================

/**
 * Get all nodes for a user within a time range
 */
export async function getNodesForUser(
  userId: string,
  fromDate: Date,
  toDate: Date
): Promise<CMGNode[]> {

  const { data, error } = await supabase
    .from('cmg_nodes')
    .select('*')
    .eq('user_id', userId)
    .gte('occurred_at', fromDate.toISOString())
    .lte('occurred_at', toDate.toISOString())
    .order('occurred_at', { ascending: false });

  if (error) {
    console.error('Error fetching nodes:', error);
    return [];
  }

  return data.map(transformNodeFromDB);
}

/**
 * Get all edges for a user within a time range
 */
export async function getEdgesForUser(
  userId: string,
  fromDate: Date,
  toDate: Date
): Promise<CMGEdge[]> {

  // Get edges where nodes are in the time range
  const { data, error } = await supabase
    .from('cmg_edges')
    .select(
      `
      *,
      from_node:cmg_nodes!from_node_id(*),
      to_node:cmg_nodes!to_node_id(*)
    `
    )
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching edges:', error);
    return [];
  }

  // Filter to edges where both nodes are in range
  const filtered = data.filter((edge: any) => {
    const fromDate_ = new Date(edge.from_node.occurred_at);
    const toDate_ = new Date(edge.to_node.occurred_at);
    return (
      fromDate_ >= fromDate &&
      fromDate_ <= toDate &&
      toDate_ >= fromDate &&
      toDate_ <= toDate
    );
  });

  return filtered.map(transformEdgeFromDB);
}

/**
 * Get related memories for a specific node
 */
export async function getRelatedMemories(
  nodeId: string,
  options: GetRelatedMemoriesOptions = {}
): Promise<CMGNode[]> {
  const { limit = 10, edgeTypes, minWeight = 0 } = options;

  // Get edges from this node
  let query = supabase
    .from('cmg_edges')
    .select(
      `
      *,
      to_node:cmg_nodes!to_node_id(*)
    `
    )
    .eq('from_node_id', nodeId)
    .gte('weight', minWeight)
    .order('weight', { ascending: false })
    .limit(limit);

  if (edgeTypes && edgeTypes.length > 0) {
    query = query.in('edge_type', edgeTypes);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related memories:', error);
    return [];
  }

  return data.map((edge: any) => transformNodeFromDB(edge.to_node));
}

/**
 * Get nodes by campaign
 */
export async function getNodesForCampaign(campaignId: string): Promise<CMGNode[]> {

  const { data, error } = await supabase
    .from('cmg_nodes')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('occurred_at', { ascending: true });

  if (error) {
    console.error('Error fetching campaign nodes:', error);
    return [];
  }

  return data.map(transformNodeFromDB);
}

// =====================================================================
// Pattern Mining Queries
// =====================================================================

/**
 * Get structural motifs (recurring patterns)
 */
export async function getStructuralMotifs(
  userId: string,
  params: GetStructuralMotifsParams
): Promise<StructuralMotif[]> {
  const { minRecurrence, window = 'lifetime' } = params;

  // Calculate date range
  const toDate = new Date();
  const fromDate = calculateWindowStartDate(toDate, window);

  // Get all nodes and edges
  const nodes = await getNodesForUser(userId, fromDate, toDate);
  const edges = await getEdgesForUser(userId, fromDate, toDate);

  // Mine patterns
  return mineStructuralPatterns(nodes, edges, minRecurrence);
}

/**
 * Get OS drift over time
 */
export async function getOSDrift(
  userId: string,
  params: GetOSDriftParams
): Promise<OSDriftData> {
  const { os, window } = params;
  const toDate = new Date();
  const fromDate = calculateWindowStartDate(toDate, window);

  // Get all nodes for this OS
  const { data, error } = await supabase
    .from('cmg_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('os', os)
    .gte('occurred_at', fromDate.toISOString())
    .lte('occurred_at', toDate.toISOString())
    .order('occurred_at', { ascending: true });

  if (error) {
    console.error('Error fetching OS drift data:', error);
    return {
      os,
      window,
      timeSeries: [],
      trend: 'stable',
    };
  }

  const nodes = data.map(transformNodeFromDB);

  // Compute time series (group by week)
  const timeSeries = computeOSTimeSeries(nodes);

  // Determine trend
  const trend = computeTrend(timeSeries.map((t) => t.confidence));

  return {
    os,
    window,
    timeSeries,
    trend,
  };
}

/**
 * Get outcome correlations
 */
export async function getOutcomeCorrelations(
  userId: string,
  params: GetOutcomeCorrelationsParams
): Promise<OutcomeCorrelation> {
  const { metric, window = '90d' } = params;
  const toDate = new Date();
  const fromDate = calculateWindowStartDate(toDate, window);

  // Get all outcome nodes
  const { data, error } = await supabase
    .from('cmg_nodes')
    .select('*')
    .eq('user_id', userId)
    .eq('node_type', 'outcome')
    .gte('occurred_at', fromDate.toISOString())
    .lte('occurred_at', toDate.toISOString());

  if (error) {
    console.error('Error fetching outcomes:', error);
    return {
      metric,
      positiveCorrelations: [],
      negativeCorrelations: [],
    };
  }

  const outcomes = data.map(transformNodeFromDB);

  // Compute correlations (simplified version)
  return computeOutcomeCorrelations(outcomes, metric);
}

/**
 * Get fingerprint summary for user
 */
export async function getFingerprintSummary(
  userId: string,
  window: string = '90d'
): Promise<CreativeFingerprint | null> {

  // Try to get cached fingerprint first
  const { data, error } = await supabase
    .from('cmg_fingerprints')
    .select('*')
    .eq('user_id', userId)
    .eq('snapshot_type', 'combined')
    .eq('snapshot_window', window)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!error && data) {
    return data.data as CreativeFingerprint;
  }

  // If no cached fingerprint, return null (caller should compute)
  return null;
}

/**
 * Get timeline buckets for UI
 */
export async function getTimelineBuckets(
  userId: string,
  window: string = '90d'
): Promise<TimelineBucket[]> {
  const toDate = new Date();
  const fromDate = calculateWindowStartDate(toDate, window);

  const nodes = await getNodesForUser(userId, fromDate, toDate);

  // Group by month
  const buckets = groupNodesByMonth(nodes);

  return buckets;
}

// =====================================================================
// Helper Functions
// =====================================================================

/**
 * Calculate start date from window string
 */
function calculateWindowStartDate(toDate: Date, window: string): Date {
  const fromDate = new Date(toDate);

  if (window === 'lifetime') {
    fromDate.setFullYear(2000); // Far past
    return fromDate;
  }

  const match = window.match(/^(\d+)([dwmy])$/);
  if (!match) {
    // Default to 90 days
    fromDate.setDate(fromDate.getDate() - 90);
    return fromDate;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      fromDate.setDate(fromDate.getDate() - value);
      break;
    case 'w':
      fromDate.setDate(fromDate.getDate() - value * 7);
      break;
    case 'm':
      fromDate.setMonth(fromDate.getMonth() - value);
      break;
    case 'y':
      fromDate.setFullYear(fromDate.getFullYear() - value);
      break;
  }

  return fromDate;
}

/**
 * Mine structural patterns from nodes and edges
 */
function mineStructuralPatterns(
  nodes: CMGNode[],
  edges: CMGEdge[],
  minRecurrence: number
): StructuralMotif[] {
  const motifs: StructuralMotif[] = [];

  // Pattern 1: Tension -> Resolution sequences
  const tensionResolutionPattern = findTensionResolutionPatterns(nodes, edges);
  if (tensionResolutionPattern.count >= minRecurrence) {
    motifs.push({
      id: 'tension-resolution',
      name: 'Tension-Resolution Arc',
      description: 'A pattern where negative sentiment is followed by positive resolution',
      recurrenceCount: tensionResolutionPattern.count,
      pattern: [
        { sentiment: 'negative', position: 0.3 },
        { sentiment: 'positive', position: 0.8 },
      ],
      averageStrength: tensionResolutionPattern.avgStrength,
      campaignIds: tensionResolutionPattern.campaigns,
    });
  }

  // Pattern 2: Build-up sequences (increasing importance)
  const buildUpPattern = findBuildUpPatterns(nodes);
  if (buildUpPattern.count >= minRecurrence) {
    motifs.push({
      id: 'build-up',
      name: 'Gradual Build-Up',
      description: 'Progressive increase in importance/tension',
      recurrenceCount: buildUpPattern.count,
      pattern: buildUpPattern.pattern,
      averageStrength: buildUpPattern.avgStrength,
      campaignIds: buildUpPattern.campaigns,
    });
  }

  return motifs;
}

function findTensionResolutionPatterns(nodes: CMGNode[], edges: CMGEdge[]) {
  let count = 0;
  let totalStrength = 0;
  const campaigns = new Set<string>();

  // Look for negative -> positive sentiment transitions
  for (const edge of edges) {
    if (edge.edgeType === 'resolves') {
      const fromNode = nodes.find((n) => n.id === edge.fromNodeId);
      const toNode = nodes.find((n) => n.id === edge.toNodeId);

      if (
        fromNode?.sentiment === 'negative' &&
        (toNode?.sentiment === 'positive' || toNode?.sentiment === 'neutral')
      ) {
        count++;
        totalStrength += edge.weight;
        if (fromNode.campaignId) campaigns.add(fromNode.campaignId);
      }
    }
  }

  return {
    count,
    avgStrength: count > 0 ? totalStrength / count : 0,
    campaigns: Array.from(campaigns),
  };
}

function findBuildUpPatterns(nodes: CMGNode[]) {
  let count = 0;
  let totalStrength = 0;
  const campaigns = new Set<string>();
  const pattern: Array<{ nodeType?: string; sentiment?: SentimentType; position: number }> = [];

  // Group nodes by campaign
  const byCampaign = new Map<string, CMGNode[]>();
  for (const node of nodes) {
    if (node.campaignId) {
      if (!byCampaign.has(node.campaignId)) {
        byCampaign.set(node.campaignId, []);
      }
      byCampaign.get(node.campaignId)!.push(node);
    }
  }

  // Look for increasing importance patterns
  for (const [campaignId, campaignNodes] of byCampaign) {
    const sorted = [...campaignNodes].sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );

    if (sorted.length >= 3) {
      let increasing = true;
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].importance < sorted[i - 1].importance) {
          increasing = false;
          break;
        }
      }

      if (increasing) {
        count++;
        totalStrength += sorted.reduce((sum, n) => sum + n.importance, 0) / sorted.length / 5;
        campaigns.add(campaignId);
      }
    }
  }

  return {
    count,
    avgStrength: count > 0 ? totalStrength / count : 0,
    campaigns: Array.from(campaigns),
    pattern,
  };
}

/**
 * Compute OS time series
 */
function computeOSTimeSeries(nodes: CMGNode[]) {
  // Group by week
  const weeks = new Map<string, CMGNode[]>();

  for (const node of nodes) {
    const date = new Date(node.occurredAt);
    const weekKey = getWeekKey(date);

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, []);
    }
    weeks.get(weekKey)!.push(node);
  }

  // Compute metrics for each week
  const timeSeries = [];
  for (const [weekKey, weekNodes] of weeks) {
    const avgImportance = weekNodes.reduce((sum, n) => sum + n.importance, 0) / weekNodes.length;
    const positiveRatio =
      weekNodes.filter((n) => n.sentiment === 'positive').length / weekNodes.length;

    timeSeries.push({
      timestamp: weekKey,
      confidence: avgImportance / 5, // Normalize to 0-1
      empathy: positiveRatio,
      risk: 1 - avgImportance / 5, // Inverse of confidence
    });
  }

  return timeSeries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Compute trend from time series
 */
function computeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';

  // Simple linear regression slope
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (slope > 0.01) return 'increasing';
  if (slope < -0.01) return 'decreasing';
  return 'stable';
}

/**
 * Compute outcome correlations
 */
function computeOutcomeCorrelations(outcomes: CMGNode[], metric: string): OutcomeCorrelation {
  // Simplified correlation computation
  const positive: Array<{ feature: string; correlation: number }> = [];
  const negative: Array<{ feature: string; correlation: number }> = [];

  // Example: correlate with importance
  const successOutcomes = outcomes.filter(
    (o: any) => o.payload?.outcomeType === 'success'
  );
  const failureOutcomes = outcomes.filter(
    (o: any) => o.payload?.outcomeType === 'failure'
  );

  if (successOutcomes.length > 0) {
    const avgSuccessImportance =
      successOutcomes.reduce((sum, o) => sum + o.importance, 0) / successOutcomes.length;
    positive.push({ feature: 'high_importance', correlation: avgSuccessImportance / 5 });
  }

  if (failureOutcomes.length > 0) {
    const avgFailureImportance =
      failureOutcomes.reduce((sum, o) => sum + o.importance, 0) / failureOutcomes.length;
    negative.push({ feature: 'low_importance', correlation: -avgFailureImportance / 5 });
  }

  return {
    metric,
    positiveCorrelations: positive,
    negativeCorrelations: negative,
  };
}

/**
 * Group nodes by month for timeline
 */
function groupNodesByMonth(nodes: CMGNode[]): TimelineBucket[] {
  const months = new Map<string, CMGNode[]>();

  for (const node of nodes) {
    const date = new Date(node.occurredAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!months.has(monthKey)) {
      months.set(monthKey, []);
    }
    months.get(monthKey)!.push(node);
  }

  const buckets: TimelineBucket[] = [];
  for (const [monthKey, monthNodes] of months) {
    const [year, month] = monthKey.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const sentimentCounts = {
      positive: monthNodes.filter((n) => n.sentiment === 'positive').length,
      negative: monthNodes.filter((n) => n.sentiment === 'negative').length,
      neutral: monthNodes.filter((n) => n.sentiment === 'neutral').length,
      mixed: monthNodes.filter((n) => n.sentiment === 'mixed').length,
    };

    const dominantSentiment =
      (Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as SentimentType) ||
      'neutral';

    const osCounts: Partial<Record<OSName, number>> = {};
    for (const node of monthNodes) {
      if (node.os) {
        osCounts[node.os] = (osCounts[node.os] || 0) + 1;
      }
    }

    buckets.push({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      label: startDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      nodes: monthNodes,
      stats: {
        totalNodes: monthNodes.length,
        averageImportance:
          monthNodes.reduce((sum, n) => sum + n.importance, 0) / monthNodes.length,
        dominantSentiment,
        osCounts,
      },
    });
  }

  return buckets.sort((a, b) => a.startDate.localeCompare(b.startDate));
}

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
