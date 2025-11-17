/**
 * Creative Memory Graph (CMG) Types
 * Phase 22: Universal Creative Memory Graph
 *
 * Types for cross-campaign creative memory, pattern mining, and long-term adaptation.
 */

// =====================================================================
// Core CMG Types
// =====================================================================

export type CMGNodeType =
  | 'memory'
  | 'clip'
  | 'event'
  | 'os_profile'
  | 'structural_marker'
  | 'outcome';

export type CMGEdgeType =
  | 'influences'
  | 'precedes'
  | 'resolves'
  | 'contradicts'
  | 'amplifies'
  | 'relates';

export type OSName = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue';

export type SentimentType = 'positive' | 'neutral' | 'negative' | 'mixed';

// =====================================================================
// CMG Node
// =====================================================================

export interface CMGNode {
  id: string;
  userId: string;
  campaignId?: string | null;
  nodeType: CMGNodeType;
  os?: OSName;
  label: string;
  sentiment?: SentimentType;
  importance: number; // 1-5
  payload: unknown;
  occurredAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
}

// =====================================================================
// CMG Edge
// =====================================================================

export interface CMGEdge {
  id: string;
  userId: string;
  fromNodeId: string;
  toNodeId: string;
  edgeType: CMGEdgeType;
  weight: number; // 0-1
  createdAt: string; // ISO timestamp
}

// =====================================================================
// Structural Fingerprint
// =====================================================================

export interface StructuralFingerprint {
  /** Average arc length in timeline units (e.g., scenes, minutes) */
  typicalArcLength: number;
  /** Average position of peak tension (0-1, where 0.5 is middle) */
  peakPosition: number;
  /** Number of rise/fall cycles in typical arc */
  cycleCount: number;
  /** Proportion of arcs with clear three-act structure (0-1) */
  threeActProportion: number;
  /** Average rate of tension increase (arbitrary units) */
  riseRate: number;
  /** Average rate of tension decrease (arbitrary units) */
  fallRate: number;
  /** Typical complexity (number of structural markers per arc) */
  typicalComplexity: number;
}

// =====================================================================
// Emotional Fingerprint
// =====================================================================

export interface EmotionalFingerprint {
  /** Proportion of positive sentiment memories (0-1) */
  positiveRatio: number;
  /** Proportion of negative sentiment memories (0-1) */
  negativeRatio: number;
  /** Proportion of neutral sentiment memories (0-1) */
  neutralRatio: number;
  /** Proportion of mixed sentiment memories (0-1) */
  mixedRatio: number;
  /** Most common resolution pattern */
  typicalResolutionPattern: 'positive' | 'negative' | 'neutral' | 'ambiguous';
  /** Average emotional volatility (std dev of sentiment changes) */
  volatility: number;
  /** Tendency to resolve tension (0-1) */
  resolutionTendency: number;
}

// =====================================================================
// OS Fingerprint
// =====================================================================

export interface OSFingerprint {
  /** Which OS appears most often as source of important nodes */
  dominantOS: OSName | null;
  /** Which OS most often resolves tension */
  resolutionOS: OSName | null;
  /** Which OS most often introduces conflict/tension */
  tensionOS: OSName | null;
  /** Distribution of node counts by OS */
  osDistribution: Record<OSName, number>;
  /** Average importance by OS */
  osImportance: Record<OSName, number>;
  /** OS that typically leads campaigns */
  leadOS: OSName | null;
}

// =====================================================================
// Sonic Fingerprint
// =====================================================================

export interface SonicFingerprint {
  /** Average tempo range [min, max] in BPM */
  typicalTempoRange: [number, number];
  /** Average density (events per unit time) */
  typicalDensity: number;
  /** Preferred harmonic palette (if available in payload) */
  harmonicPalette: 'warm' | 'cold' | 'dark' | 'bright' | 'neutral';
  /** Average dynamic range (if available) */
  dynamicRange: number;
  /** Typical timbral preference (if available) */
  timbralPreference: 'organic' | 'synthetic' | 'hybrid' | 'neutral';
}

// =====================================================================
// Combined Creative Fingerprint
// =====================================================================

export interface CreativeFingerprint {
  structural: StructuralFingerprint;
  emotional: EmotionalFingerprint;
  os: OSFingerprint;
  sonic: SonicFingerprint;
  /** When this fingerprint was computed */
  computedAt: string; // ISO timestamp
  /** Window used for computation (e.g., '30d', '90d', 'lifetime') */
  window: string;
}

// =====================================================================
// Structural Motif (Recurring Pattern)
// =====================================================================

export interface StructuralMotif {
  /** Unique identifier for this motif */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of the pattern */
  description: string;
  /** Number of times this pattern recurs */
  recurrenceCount: number;
  /** Sequence of node types or sentiment changes */
  pattern: Array<{
    nodeType?: CMGNodeType;
    sentiment?: SentimentType;
    position: number; // 0-1
  }>;
  /** Average strength/importance of this motif */
  averageStrength: number;
  /** Campaigns where this motif appeared */
  campaignIds: string[];
}

// =====================================================================
// Long-Term Adaptation Profile
// =====================================================================

export interface LongTermAdaptationProfile {
  /** Adjustments to default arc shape */
  preferredArcAdjustments: {
    peakShift: number; // -0.2 to +0.2 (shift peak earlier/later)
    lengthBias: number; // -0.2 to +0.2 (prefer shorter/longer arcs)
    complexityBias: number; // -0.2 to +0.2 (prefer simpler/more complex)
  };
  /** Default tempo range based on history */
  defaultTempoRange: [number, number];
  /** Default tension tolerance (how much tension user typically accepts) */
  defaultTensionTolerance: number; // 0-1
  /** OS role biases (which OS tends to do what) */
  osRoleBiases: {
    leadBias: Partial<Record<OSName, number>>; // 0-1 for each OS
    resolveBias: Partial<Record<OSName, number>>;
    tensionBias: Partial<Record<OSName, number>>;
  };
  /** Palette biases based on sonic fingerprint */
  paletteBiases: {
    harmonic: 'warm' | 'cold' | 'dark' | 'bright' | 'neutral';
    timbral: 'organic' | 'synthetic' | 'hybrid' | 'neutral';
  };
  /** When this profile was computed */
  computedAt: string; // ISO timestamp
}

// =====================================================================
// Query Parameters
// =====================================================================

export interface GetRelatedMemoriesOptions {
  limit?: number;
  edgeTypes?: CMGEdgeType[];
  minWeight?: number;
}

export interface GetStructuralMotifsParams {
  minRecurrence: number;
  window?: string;
}

export interface GetOSDriftParams {
  os: OSName;
  window: string; // e.g., '30d', '90d'
}

export interface OSDriftData {
  os: OSName;
  window: string;
  /** Time series of confidence/empathy/risk scores */
  timeSeries: Array<{
    timestamp: string;
    confidence: number;
    empathy: number;
    risk: number;
  }>;
  /** Overall trend direction */
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface GetOutcomeCorrelationsParams {
  metric: 'cohesion' | 'tension' | 'response_rate';
  window?: string;
}

export interface OutcomeCorrelation {
  metric: string;
  /** Structural features that correlate with positive outcomes */
  positiveCorrelations: Array<{
    feature: string;
    correlation: number; // -1 to 1
  }>;
  /** Structural features that correlate with negative outcomes */
  negativeCorrelations: Array<{
    feature: string;
    correlation: number;
  }>;
}

// =====================================================================
// Timeline Bucket (for UI)
// =====================================================================

export interface TimelineBucket {
  /** Start of time bucket */
  startDate: string; // ISO timestamp
  /** End of time bucket */
  endDate: string; // ISO timestamp
  /** Label for display (e.g., "November 2025", "Campaign 3") */
  label: string;
  /** Nodes in this bucket */
  nodes: CMGNode[];
  /** Summary stats */
  stats: {
    totalNodes: number;
    averageImportance: number;
    dominantSentiment: SentimentType;
    osCounts: Partial<Record<OSName, number>>;
  };
}

// =====================================================================
// Export Types
// =====================================================================

export interface FingerprintExportOptions {
  format: 'json' | 'markdown';
  includeSummary?: boolean;
  window?: string;
}
