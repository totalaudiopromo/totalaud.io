/**
 * Pattern Miner - Fingerprint Extraction Module
 * Phase 22: Universal Creative Memory Graph
 *
 * Deterministic algorithms for extracting creative fingerprints from CMG data.
 */

import { supabase } from '@total-audio/core-supabase';
import { getNodesForUser, getEdgesForUser } from './cmgQuery';
import type {
  CMGNode,
  CMGEdge,
  CreativeFingerprint,
  StructuralFingerprint,
  EmotionalFingerprint,
  OSFingerprint,
  SonicFingerprint,
  OSName,
} from './cmg.types';

// =====================================================================
// Main Fingerprint Computation
// =====================================================================

/**
 * Compute complete creative fingerprint for a user
 */
export async function computeCreativeFingerprint(params: {
  userId: string;
  window: string;
}): Promise<CreativeFingerprint> {
  const { userId, window } = params;

  // Calculate date range
  const toDate = new Date();
  const fromDate = calculateWindowStartDate(toDate, window);

  // Get all nodes and edges
  const nodes = await getNodesForUser(userId, fromDate, toDate);
  const edges = await getEdgesForUser(userId, fromDate, toDate);

  // Mine each fingerprint type
  const structural = mineStructuralFingerprint(nodes, edges);
  const emotional = mineEmotionalFingerprint(nodes);
  const os = mineOSFingerprint(nodes, edges);
  const sonic = mineSonicFingerprint(nodes);

  const fingerprint: CreativeFingerprint = {
    structural,
    emotional,
    os,
    sonic,
    computedAt: new Date().toISOString(),
    window,
  };

  // Optionally save to database
  await saveFingerprintToDB(userId, fingerprint);

  return fingerprint;
}

// =====================================================================
// Structural Fingerprint Mining
// =====================================================================

/**
 * Mine structural fingerprint from nodes and edges
 */
export function mineStructuralFingerprint(
  nodes: CMGNode[],
  edges: CMGEdge[]
): StructuralFingerprint {
  if (nodes.length === 0) {
    return getDefaultStructuralFingerprint();
  }

  // Group nodes by campaign
  const campaigns = groupByCampaign(nodes);

  // Compute metrics across campaigns
  const arcLengths: number[] = [];
  const peakPositions: number[] = [];
  const cycleCounts: number[] = [];
  const threeActFlags: boolean[] = [];

  for (const [campaignId, campaignNodes] of campaigns) {
    const sorted = sortByOccurredAt(campaignNodes);

    // Arc length (number of significant nodes)
    arcLengths.push(sorted.length);

    // Peak position (where highest importance occurs)
    const peakIdx = findPeakIndex(sorted);
    peakPositions.push(peakIdx / Math.max(sorted.length - 1, 1));

    // Cycle count (number of importance peaks)
    cycleCounts.push(countCycles(sorted));

    // Three-act structure detection
    threeActFlags.push(hasThreeActStructure(sorted));
  }

  // Compute rise and fall rates
  const { riseRate, fallRate } = computeRiseFallRates(nodes);

  // Typical complexity (average structural markers per campaign)
  const structuralMarkerCount = nodes.filter((n) => n.nodeType === 'structural_marker').length;
  const typicalComplexity = campaigns.size > 0 ? structuralMarkerCount / campaigns.size : 0;

  return {
    typicalArcLength: average(arcLengths),
    peakPosition: average(peakPositions),
    cycleCount: average(cycleCounts),
    threeActProportion: threeActFlags.filter(Boolean).length / Math.max(threeActFlags.length, 1),
    riseRate,
    fallRate,
    typicalComplexity,
  };
}

// =====================================================================
// Emotional Fingerprint Mining
// =====================================================================

/**
 * Mine emotional fingerprint from nodes
 */
export function mineEmotionalFingerprint(nodes: CMGNode[]): EmotionalFingerprint {
  if (nodes.length === 0) {
    return getDefaultEmotionalFingerprint();
  }

  // Count sentiment types
  const sentimentCounts = {
    positive: nodes.filter((n) => n.sentiment === 'positive').length,
    negative: nodes.filter((n) => n.sentiment === 'negative').length,
    neutral: nodes.filter((n) => n.sentiment === 'neutral').length,
    mixed: nodes.filter((n) => n.sentiment === 'mixed').length,
  };

  const total = nodes.length;

  // Typical resolution pattern
  const resolutionPattern = findTypicalResolutionPattern(nodes);

  // Emotional volatility (std dev of sentiment values)
  const volatility = computeEmotionalVolatility(nodes);

  // Resolution tendency (how often negative is followed by positive)
  const resolutionTendency = computeResolutionTendency(nodes);

  return {
    positiveRatio: sentimentCounts.positive / total,
    negativeRatio: sentimentCounts.negative / total,
    neutralRatio: sentimentCounts.neutral / total,
    mixedRatio: sentimentCounts.mixed / total,
    typicalResolutionPattern: resolutionPattern,
    volatility,
    resolutionTendency,
  };
}

// =====================================================================
// OS Fingerprint Mining
// =====================================================================

/**
 * Mine OS fingerprint from nodes and edges
 */
export function mineOSFingerprint(nodes: CMGNode[], edges: CMGEdge[]): OSFingerprint {
  if (nodes.length === 0) {
    return getDefaultOSFingerprint();
  }

  // Count nodes by OS
  const osCounts: Record<OSName, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    daw: 0,
    analogue: 0,
  };

  const osImportance: Record<OSName, number[]> = {
    ascii: [],
    xp: [],
    aqua: [],
    daw: [],
    analogue: [],
  };

  for (const node of nodes) {
    if (node.os) {
      osCounts[node.os]++;
      osImportance[node.os].push(node.importance);
    }
  }

  // Calculate average importance by OS
  const avgOSImportance: Record<OSName, number> = {
    ascii: average(osImportance.ascii),
    xp: average(osImportance.xp),
    aqua: average(osImportance.aqua),
    daw: average(osImportance.daw),
    analogue: average(osImportance.analogue),
  };

  // Dominant OS (most nodes)
  const dominantOS = findDominantOS(osCounts);

  // Resolution OS (appears most in positive sentiment + resolves edges)
  const resolutionOS = findResolutionOS(nodes, edges);

  // Tension OS (appears most in negative sentiment)
  const tensionOS = findTensionOS(nodes);

  // Lead OS (appears first in campaigns most often)
  const leadOS = findLeadOS(nodes);

  return {
    dominantOS,
    resolutionOS,
    tensionOS,
    osDistribution: osCounts,
    osImportance: avgOSImportance,
    leadOS,
  };
}

// =====================================================================
// Sonic Fingerprint Mining
// =====================================================================

/**
 * Mine sonic fingerprint from nodes
 */
export function mineSonicFingerprint(nodes: CMGNode[]): SonicFingerprint {
  if (nodes.length === 0) {
    return getDefaultSonicFingerprint();
  }

  const tempos: number[] = [];
  const densities: number[] = [];
  const harmonicPalettes: string[] = [];
  const dynamicRanges: number[] = [];
  const timbralPreferences: string[] = [];

  // Extract sonic data from payloads
  for (const node of nodes) {
    const payload = node.payload as any;

    if (payload?.tempo) tempos.push(payload.tempo);
    if (payload?.density) densities.push(payload.density);
    if (payload?.harmonicPalette) harmonicPalettes.push(payload.harmonicPalette);
    if (payload?.dynamicRange) dynamicRanges.push(payload.dynamicRange);
    if (payload?.timbral) timbralPreferences.push(payload.timbral);
  }

  // Compute typical values
  const typicalTempoRange: [number, number] =
    tempos.length > 0 ? [Math.min(...tempos), Math.max(...tempos)] : [80, 140];

  const typicalDensity = densities.length > 0 ? average(densities) : 0.5;

  const harmonicPalette =
    (findMostCommon(harmonicPalettes) as SonicFingerprint['harmonicPalette']) || 'neutral';

  const dynamicRange = dynamicRanges.length > 0 ? average(dynamicRanges) : 0.7;

  const timbralPreference =
    (findMostCommon(timbralPreferences) as SonicFingerprint['timbralPreference']) || 'neutral';

  return {
    typicalTempoRange,
    typicalDensity,
    harmonicPalette,
    dynamicRange,
    timbralPreference,
  };
}

// =====================================================================
// Helper Functions
// =====================================================================

function calculateWindowStartDate(toDate: Date, window: string): Date {
  const fromDate = new Date(toDate);

  if (window === 'lifetime') {
    fromDate.setFullYear(2000);
    return fromDate;
  }

  const match = window.match(/^(\d+)([dwmy])$/);
  if (!match) {
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

function groupByCampaign(nodes: CMGNode[]): Map<string, CMGNode[]> {
  const campaigns = new Map<string, CMGNode[]>();

  for (const node of nodes) {
    if (node.campaignId) {
      if (!campaigns.has(node.campaignId)) {
        campaigns.set(node.campaignId, []);
      }
      campaigns.get(node.campaignId)!.push(node);
    }
  }

  return campaigns;
}

function sortByOccurredAt(nodes: CMGNode[]): CMGNode[] {
  return [...nodes].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );
}

function findPeakIndex(nodes: CMGNode[]): number {
  let maxImportance = 0;
  let peakIdx = 0;

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].importance > maxImportance) {
      maxImportance = nodes[i].importance;
      peakIdx = i;
    }
  }

  return peakIdx;
}

function countCycles(nodes: CMGNode[]): number {
  if (nodes.length < 3) return 0;

  let cycles = 0;
  let increasing = nodes[1].importance > nodes[0].importance;

  for (let i = 2; i < nodes.length; i++) {
    const nowIncreasing = nodes[i].importance > nodes[i - 1].importance;
    if (nowIncreasing !== increasing) {
      cycles++;
      increasing = nowIncreasing;
    }
  }

  return Math.floor(cycles / 2); // Full cycles
}

function hasThreeActStructure(nodes: CMGNode[]): boolean {
  if (nodes.length < 5) return false;

  const peakIdx = findPeakIndex(nodes);
  const peakPos = peakIdx / (nodes.length - 1);

  // Peak should be in middle third (0.4 - 0.7)
  return peakPos >= 0.4 && peakPos <= 0.7;
}

function computeRiseFallRates(nodes: CMGNode[]): { riseRate: number; fallRate: number } {
  if (nodes.length < 2) return { riseRate: 0, fallRate: 0 };

  const sorted = sortByOccurredAt(nodes);

  let totalRise = 0;
  let totalFall = 0;
  let riseCount = 0;
  let fallCount = 0;

  for (let i = 1; i < sorted.length; i++) {
    const delta = sorted[i].importance - sorted[i - 1].importance;
    const timeDelta =
      (new Date(sorted[i].occurredAt).getTime() - new Date(sorted[i - 1].occurredAt).getTime()) /
      (1000 * 60 * 60 * 24); // Days

    if (timeDelta > 0) {
      const rate = delta / timeDelta;
      if (rate > 0) {
        totalRise += rate;
        riseCount++;
      } else if (rate < 0) {
        totalFall += Math.abs(rate);
        fallCount++;
      }
    }
  }

  return {
    riseRate: riseCount > 0 ? totalRise / riseCount : 0,
    fallRate: fallCount > 0 ? totalFall / fallCount : 0,
  };
}

function findTypicalResolutionPattern(
  nodes: CMGNode[]
): 'positive' | 'negative' | 'neutral' | 'ambiguous' {
  // Look at outcome nodes
  const outcomes = nodes.filter((n) => n.nodeType === 'outcome');

  if (outcomes.length === 0) return 'neutral';

  const sentimentCounts = {
    positive: outcomes.filter((n) => n.sentiment === 'positive').length,
    negative: outcomes.filter((n) => n.sentiment === 'negative').length,
    neutral: outcomes.filter((n) => n.sentiment === 'neutral').length,
    mixed: outcomes.filter((n) => n.sentiment === 'mixed').length,
  };

  const max = Math.max(...Object.values(sentimentCounts));

  if (sentimentCounts.positive === max) return 'positive';
  if (sentimentCounts.negative === max) return 'negative';
  if (sentimentCounts.neutral === max) return 'neutral';
  return 'ambiguous';
}

function computeEmotionalVolatility(nodes: CMGNode[]): number {
  const sentimentValues = nodes
    .filter((n) => n.sentiment)
    .map((n) => {
      switch (n.sentiment) {
        case 'positive':
          return 1;
        case 'negative':
          return -1;
        case 'mixed':
          return 0.5;
        default:
          return 0;
      }
    });

  if (sentimentValues.length === 0) return 0;

  const mean = average(sentimentValues);
  const variance =
    sentimentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sentimentValues.length;

  return Math.sqrt(variance);
}

function computeResolutionTendency(nodes: CMGNode[]): number {
  const sorted = sortByOccurredAt(nodes);

  let resolutions = 0;
  let negatives = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].sentiment === 'negative') {
      negatives++;
      if (sorted[i + 1].sentiment === 'positive' || sorted[i + 1].sentiment === 'neutral') {
        resolutions++;
      }
    }
  }

  return negatives > 0 ? resolutions / negatives : 0.5;
}

function findDominantOS(osCounts: Record<OSName, number>): OSName | null {
  const entries = Object.entries(osCounts) as [OSName, number][];
  if (entries.length === 0) return null;

  const max = Math.max(...entries.map(([, count]) => count));
  if (max === 0) return null;

  return entries.find(([, count]) => count === max)?.[0] || null;
}

function findResolutionOS(nodes: CMGNode[], edges: CMGEdge[]): OSName | null {
  const resolutionCounts: Record<OSName, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    daw: 0,
    analogue: 0,
  };

  // Find 'resolves' edges
  const resolutionEdges = edges.filter((e) => e.edgeType === 'resolves');

  for (const edge of resolutionEdges) {
    const toNode = nodes.find((n) => n.id === edge.toNodeId);
    if (toNode?.os) {
      resolutionCounts[toNode.os]++;
    }
  }

  return findDominantOS(resolutionCounts);
}

function findTensionOS(nodes: CMGNode[]): OSName | null {
  const tensionCounts: Record<OSName, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    daw: 0,
    analogue: 0,
  };

  const tensionNodes = nodes.filter((n) => n.sentiment === 'negative');

  for (const node of tensionNodes) {
    if (node.os) {
      tensionCounts[node.os]++;
    }
  }

  return findDominantOS(tensionCounts);
}

function findLeadOS(nodes: CMGNode[]): OSName | null {
  const campaigns = groupByCampaign(nodes);
  const leadCounts: Record<OSName, number> = {
    ascii: 0,
    xp: 0,
    aqua: 0,
    daw: 0,
    analogue: 0,
  };

  for (const [, campaignNodes] of campaigns) {
    const sorted = sortByOccurredAt(campaignNodes);
    const firstNode = sorted[0];
    if (firstNode?.os) {
      leadCounts[firstNode.os]++;
    }
  }

  return findDominantOS(leadCounts);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function findMostCommon(values: string[]): string | null {
  if (values.length === 0) return null;

  const counts = new Map<string, number>();
  for (const val of values) {
    counts.set(val, (counts.get(val) || 0) + 1);
  }

  let maxCount = 0;
  let mostCommon: string | null = null;

  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = val;
    }
  }

  return mostCommon;
}

// =====================================================================
// Default Fingerprints
// =====================================================================

function getDefaultStructuralFingerprint(): StructuralFingerprint {
  return {
    typicalArcLength: 10,
    peakPosition: 0.6,
    cycleCount: 2,
    threeActProportion: 0.5,
    riseRate: 0.5,
    fallRate: 0.3,
    typicalComplexity: 3,
  };
}

function getDefaultEmotionalFingerprint(): EmotionalFingerprint {
  return {
    positiveRatio: 0.4,
    negativeRatio: 0.2,
    neutralRatio: 0.3,
    mixedRatio: 0.1,
    typicalResolutionPattern: 'neutral',
    volatility: 0.5,
    resolutionTendency: 0.5,
  };
}

function getDefaultOSFingerprint(): OSFingerprint {
  return {
    dominantOS: null,
    resolutionOS: null,
    tensionOS: null,
    osDistribution: { ascii: 0, xp: 0, aqua: 0, daw: 0, analogue: 0 },
    osImportance: { ascii: 0, xp: 0, aqua: 0, daw: 0, analogue: 0 },
    leadOS: null,
  };
}

function getDefaultSonicFingerprint(): SonicFingerprint {
  return {
    typicalTempoRange: [80, 140],
    typicalDensity: 0.5,
    harmonicPalette: 'neutral',
    dynamicRange: 0.7,
    timbralPreference: 'neutral',
  };
}

// =====================================================================
// Database Storage
// =====================================================================

async function saveFingerprintToDB(
  userId: string,
  fingerprint: CreativeFingerprint
): Promise<void> {

  // Save combined fingerprint
  await supabase.from('cmg_fingerprints').insert({
    user_id: userId,
    snapshot_type: 'combined',
    snapshot_window: fingerprint.window,
    data: fingerprint,
  });

  // Also save individual types for easier querying
  await supabase.from('cmg_fingerprints').insert([
    {
      user_id: userId,
      snapshot_type: 'structural',
      snapshot_window: fingerprint.window,
      data: fingerprint.structural,
    },
    {
      user_id: userId,
      snapshot_type: 'emotional',
      snapshot_window: fingerprint.window,
      data: fingerprint.emotional,
    },
    {
      user_id: userId,
      snapshot_type: 'os',
      snapshot_window: fingerprint.window,
      data: fingerprint.os,
    },
    {
      user_id: userId,
      snapshot_type: 'sonic',
      snapshot_window: fingerprint.window,
      data: fingerprint.sonic,
    },
  ]);
}
