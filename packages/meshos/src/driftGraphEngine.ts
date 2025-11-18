/**
 * MeshOS Drift Graph Engine
 * Builds contradiction graph showing system conflicts and contradictions
 * READ-ONLY: Reads from mesh_drift_reports and other system data
 */

import type {
  MeshContradictionGraph,
  ContradictionEdge,
  ContradictionNode,
  DriftReport,
  MeshSystem,
} from './types';

// ──────────────────────────────────────
// CONTRADICTION DETECTION
// ──────────────────────────────────────

/**
 * Mock function to detect contradictions between systems
 * In production, this would analyze actual system data
 */
async function detectSystemContradictions(): Promise<ContradictionEdge[]> {
  const now = new Date().toISOString();

  // Mock contradictions for demonstration
  const contradictions: ContradictionEdge[] = [
    {
      from: 'Autopilot',
      to: 'CoachOS',
      contradictionType: 'workload_energy_mismatch',
      severity: 'high',
      humanSummary:
        'Autopilot is scheduling intensive outreach campaigns while CoachOS detects low energy and burnout risk',
      detectedAt: now,
      examples: [
        'Autopilot: 50 emails scheduled for tomorrow',
        'CoachOS: Energy score 3/10, burnout risk detected',
      ],
    },
    {
      from: 'MAL',
      to: 'Identity',
      contradictionType: 'lifecycle_identity_drift',
      severity: 'medium',
      humanSummary:
        'MAL suggests scaling and growth phase, but Identity system shows authenticity concerns and brand drift',
      detectedAt: now,
      examples: [
        'MAL: Lifecycle stage = Growth (scale recommended)',
        'Identity: Brand authenticity score decreased 15% this month',
      ],
    },
    {
      from: 'CIS',
      to: 'Scenes',
      contradictionType: 'investment_participation_gap',
      severity: 'medium',
      humanSummary:
        'CIS shows high investment in certain scenes, but Scenes system shows low actual participation',
      detectedAt: now,
      examples: [
        'CIS: 40% of time allocated to indie folk scene',
        'Scenes: Only 2 interactions in indie folk scene this month',
      ],
    },
    {
      from: 'Talent',
      to: 'CMG',
      contradictionType: 'skill_content_mismatch',
      severity: 'low',
      humanSummary:
        'Talent system identifies strong production skills, but CMG content focuses primarily on songwriting',
      detectedAt: now,
      examples: [
        'Talent: Production skills rated 9/10',
        'CMG: 80% of content about songwriting, 5% about production',
      ],
    },
    {
      from: 'RCF',
      to: 'MIG',
      contradictionType: 'relationship_outreach_conflict',
      severity: 'low',
      humanSummary:
        'RCF shows relationship fatigue with certain contacts, but MIG suggests continued outreach',
      detectedAt: now,
      examples: [
        'RCF: Relationship with Contact A marked as "needs space"',
        'MIG: Suggesting follow-up email to Contact A',
      ],
    },
  ];

  return contradictions;
}

// ──────────────────────────────────────
// GRAPH CONSTRUCTION
// ──────────────────────────────────────

/**
 * Builds contradiction graph from detected contradictions
 */
function buildContradictionGraph(edges: ContradictionEdge[]): MeshContradictionGraph {
  // Build nodes: aggregate contradictions per system
  const systemMap = new Map<MeshSystem, { count: number; maxSeverity: ContradictionEdge['severity'] }>();

  edges.forEach((edge) => {
    // Track "from" system
    const fromData = systemMap.get(edge.from) || { count: 0, maxSeverity: 'low' as const };
    fromData.count++;
    if (getSeverityWeight(edge.severity) > getSeverityWeight(fromData.maxSeverity)) {
      fromData.maxSeverity = edge.severity;
    }
    systemMap.set(edge.from, fromData);

    // Track "to" system
    const toData = systemMap.get(edge.to) || { count: 0, maxSeverity: 'low' as const };
    toData.count++;
    if (getSeverityWeight(edge.severity) > getSeverityWeight(toData.maxSeverity)) {
      toData.maxSeverity = edge.severity;
    }
    systemMap.set(edge.to, toData);
  });

  const nodes: ContradictionNode[] = Array.from(systemMap.entries()).map(([system, data]) => ({
    system,
    contradictionCount: data.count,
    severity: data.maxSeverity,
  }));

  return {
    nodes,
    edges,
    generatedAt: new Date().toISOString(),
    totalContradictions: edges.length,
  };
}

function getSeverityWeight(severity: ContradictionEdge['severity']): number {
  const weights = { low: 1, medium: 2, high: 3, critical: 4 };
  return weights[severity];
}

// ──────────────────────────────────────
// DRIFT REPORT INTEGRATION
// ──────────────────────────────────────

/**
 * Converts drift reports into contradiction edges
 */
export function driftReportsToContradictions(reports: DriftReport[]): ContradictionEdge[] {
  return reports
    .filter((r) => r.systemsInvolved.length >= 2)
    .map((report) => ({
      from: report.systemsInvolved[0],
      to: report.systemsInvolved[1],
      contradictionType: report.contradictionType,
      severity: report.severity,
      humanSummary: report.humanSummary,
      detectedAt: report.detectedAt,
      examples: report.details?.examples,
    }));
}

// ──────────────────────────────────────
// MAIN API
// ──────────────────────────────────────

/**
 * Get current contradiction graph snapshot
 */
export async function getContradictionGraphSnapshot(): Promise<MeshContradictionGraph> {
  console.log('[MeshOS DriftGraph] Building contradiction graph...');

  // In production, this would:
  // 1. Read from mesh_drift_reports
  // 2. Query system states for real-time contradictions
  // 3. Analyze cross-system data patterns

  const contradictions = await detectSystemContradictions();
  const graph = buildContradictionGraph(contradictions);

  console.log(
    `[MeshOS DriftGraph] Graph built: ${graph.nodes.length} systems, ${graph.totalContradictions} contradictions`
  );

  return graph;
}

/**
 * Save contradiction graph to drift reports
 */
export async function saveContradictionGraph(
  graph: MeshContradictionGraph,
  saveFn: (report: DriftReport) => Promise<void>
): Promise<void> {
  // Convert graph edges to drift reports
  for (const edge of graph.edges) {
    const report: DriftReport = {
      id: `drift-${Date.now()}-${edge.from}-${edge.to}`,
      systemsInvolved: [edge.from, edge.to],
      contradictionType: edge.contradictionType,
      severity: edge.severity,
      humanSummary: edge.humanSummary,
      detectedAt: edge.detectedAt,
      details: {
        examples: edge.examples,
        graphGenerated: graph.generatedAt,
      },
    };

    await saveFn(report);
  }

  console.log(`[MeshOS DriftGraph] Saved ${graph.edges.length} drift reports`);
}

/**
 * Filter graph by severity threshold
 */
export function filterGraphBySeverity(
  graph: MeshContradictionGraph,
  minSeverity: ContradictionEdge['severity']
): MeshContradictionGraph {
  const severityWeight = getSeverityWeight(minSeverity);
  const filteredEdges = graph.edges.filter((e) => getSeverityWeight(e.severity) >= severityWeight);

  return buildContradictionGraph(filteredEdges);
}

/**
 * Get systems with highest contradiction counts
 */
export function getTopConflictSystems(graph: MeshContradictionGraph, limit: number = 5): ContradictionNode[] {
  return [...graph.nodes].sort((a, b) => b.contradictionCount - a.contradictionCount).slice(0, limit);
}

/**
 * Get most severe contradictions
 */
export function getTopSevereContradictions(graph: MeshContradictionGraph, limit: number = 5): ContradictionEdge[] {
  return [...graph.edges]
    .sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity))
    .slice(0, limit);
}
