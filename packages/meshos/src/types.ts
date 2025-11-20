/**
 * MeshOS Phase 13: Scheduled Reasoning, Contradiction Graph & Insight Summaries
 * READ-ONLY meta-coordination layer
 */

// ──────────────────────────────────────
// CORE SYSTEMS
// ──────────────────────────────────────

export type MeshSystem =
  | 'Autopilot'
  | 'MAL'
  | 'CoachOS'
  | 'CIS'
  | 'Scenes'
  | 'Talent'
  | 'MIG'
  | 'CMG'
  | 'Identity'
  | 'RCF'
  | 'Fusion';

// ──────────────────────────────────────
// SCHEDULED REASONING
// ──────────────────────────────────────

export type ReasoningMode = 'hourly' | 'daily' | 'weekly';

export interface ScheduledReasoningResult {
  mode: ReasoningMode;
  startedAt: string; // ISO timestamp
  finishedAt: string; // ISO timestamp
  opportunitiesCount: number;
  conflictsCount: number;
  driftCount: number;
  windowStart: string; // ISO timestamp
  windowEnd: string; // ISO timestamp
  insights: string[]; // Human-readable insights
}

// ──────────────────────────────────────
// CONTRADICTION GRAPH
// ──────────────────────────────────────

export interface ContradictionEdge {
  from: MeshSystem;
  to: MeshSystem;
  contradictionType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  humanSummary: string;
  detectedAt: string; // ISO timestamp
  examples?: string[]; // Example contradictions
}

export interface ContradictionNode {
  system: MeshSystem;
  contradictionCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MeshContradictionGraph {
  nodes: ContradictionNode[];
  edges: ContradictionEdge[];
  generatedAt: string; // ISO timestamp
  totalContradictions: number;
}

// ──────────────────────────────────────
// DRIFT REPORTS
// ──────────────────────────────────────

export interface DriftReport {
  id: string;
  systemsInvolved: MeshSystem[];
  contradictionType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  humanSummary: string;
  detectedAt: string;
  details?: Record<string, any>;
}

// ──────────────────────────────────────
// INSIGHT SUMMARIES
// ──────────────────────────────────────

export interface CrossSystemOpportunity {
  id: string;
  systems: MeshSystem[];
  opportunityType: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  recommendedActions?: string[];
}

export interface CrossSystemConflict {
  id: string;
  systems: MeshSystem[];
  conflictType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolutionSuggestions?: string[];
}

export interface PlanSummary {
  id: string;
  title: string;
  systems: MeshSystem[];
  status: 'pending' | 'active' | 'completed' | 'blocked';
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  generatedAt: string; // ISO timestamp

  // Top insights
  opportunities: CrossSystemOpportunity[];
  conflicts: CrossSystemConflict[];

  // Plan tracking
  plans: {
    last7d: PlanSummary[];
    last30d: PlanSummary[];
    last90d: PlanSummary[];
  };

  // Drift tracking
  drifts: DriftReport[];

  // High-level metrics
  metrics: {
    totalOpportunities: number;
    totalConflicts: number;
    totalPlans: number;
    totalDrifts: number;
    criticalIssues: number;
  };
}

// ──────────────────────────────────────
// MESH STATE
// ──────────────────────────────────────

export interface MeshStateEntry {
  key: string;
  value: any;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// ──────────────────────────────────────
// API TYPES
// ──────────────────────────────────────

export interface RunReasoningRequest {
  mode: ReasoningMode;
}

export interface RunReasoningResponse {
  success: boolean;
  result?: ScheduledReasoningResult;
  error?: string;
}

export interface GetContradictionGraphResponse {
  success: boolean;
  graph?: MeshContradictionGraph;
  error?: string;
}

export interface GetSummaryResponse {
  success: boolean;
  summary?: DailySummary;
  error?: string;
}
