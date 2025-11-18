/**
 * MeshOS Insight Summariser
 * Generates daily summaries of opportunities, conflicts, plans, and drift
 * READ-ONLY: Aggregates data from mesh_* tables
 */

import type {
  DailySummary,
  CrossSystemOpportunity,
  CrossSystemConflict,
  PlanSummary,
  DriftReport,
  MeshSystem,
} from './types';

// ──────────────────────────────────────
// MOCK DATA FETCHERS
// (In production, these would query actual DB tables)
// ──────────────────────────────────────

async function fetchRecentOpportunities(days: number): Promise<CrossSystemOpportunity[]> {
  // Mock: In production, query mesh_opportunities or derived from reasoning cycles
  const baseOpportunities: CrossSystemOpportunity[] = [
    {
      id: 'opp-001',
      systems: ['Autopilot', 'CoachOS'],
      opportunityType: 'workflow_optimization',
      impact: 'high',
      description: 'Align outreach timing with energy patterns for 40% better response rates',
      recommendedActions: [
        'Schedule high-priority emails during peak energy hours (10am-12pm)',
        'Defer low-priority tasks to low-energy periods',
      ],
    },
    {
      id: 'opp-002',
      systems: ['MIG', 'Talent', 'CMG'],
      opportunityType: 'content_strategy',
      impact: 'high',
      description: 'Leverage production expertise in content marketing to stand out',
      recommendedActions: [
        'Create production-focused content series',
        'Share behind-the-scenes production insights',
      ],
    },
    {
      id: 'opp-003',
      systems: ['CIS', 'Scenes', 'RCF'],
      opportunityType: 'relationship_building',
      impact: 'medium',
      description: 'Untapped connections in electronic music scene',
      recommendedActions: ['Attend 2 electronic music events this month', 'Engage with scene leaders'],
    },
    {
      id: 'opp-004',
      systems: ['MAL', 'Identity'],
      opportunityType: 'brand_clarity',
      impact: 'medium',
      description: 'Lifecycle stage transition presents brand refinement opportunity',
      recommendedActions: ['Update brand messaging', 'Clarify value proposition'],
    },
    {
      id: 'opp-005',
      systems: ['Fusion', 'CMG'],
      opportunityType: 'cross_platform_synergy',
      impact: 'low',
      description: 'Cross-platform content repurposing potential',
      recommendedActions: ['Create content templates for multi-platform distribution'],
    },
  ];

  // Filter by recency (mock)
  return days >= 7 ? baseOpportunities : baseOpportunities.slice(0, 3);
}

async function fetchRecentConflicts(days: number): Promise<CrossSystemConflict[]> {
  // Mock: In production, query mesh_conflicts or drift reports
  const baseConflicts: CrossSystemConflict[] = [
    {
      id: 'conflict-001',
      systems: ['Autopilot', 'CoachOS'],
      conflictType: 'workload_energy_mismatch',
      severity: 'high',
      description: 'Automated outreach overwhelming during low-energy periods',
      resolutionSuggestions: [
        'Reduce Autopilot batch size by 50%',
        'Implement energy-aware scheduling',
        'Add manual approval for high-volume campaigns',
      ],
    },
    {
      id: 'conflict-002',
      systems: ['MAL', 'Identity'],
      conflictType: 'growth_authenticity_tension',
      severity: 'high',
      description: 'Scaling pressure conflicts with brand authenticity values',
      resolutionSuggestions: [
        'Define non-negotiable brand principles',
        'Create scaling guidelines that preserve authenticity',
      ],
    },
    {
      id: 'conflict-003',
      systems: ['CIS', 'Scenes'],
      conflictType: 'resource_participation_gap',
      severity: 'medium',
      description: 'Time investment not matching actual scene engagement',
      resolutionSuggestions: ['Reallocate time to active scenes', 'Exit low-engagement scenes'],
    },
    {
      id: 'conflict-004',
      systems: ['RCF', 'MIG'],
      conflictType: 'relationship_outreach_fatigue',
      severity: 'medium',
      description: 'Continuing outreach to contacts showing fatigue signals',
      resolutionSuggestions: ['Implement relationship cooling-off periods', 'Respect "needs space" signals'],
    },
    {
      id: 'conflict-005',
      systems: ['Talent', 'CMG'],
      conflictType: 'skill_content_misalignment',
      severity: 'low',
      description: 'Content strategy not showcasing strongest skills',
      resolutionSuggestions: ['Rebalance content to highlight production expertise'],
    },
  ];

  return days >= 7 ? baseConflicts : baseConflicts.slice(0, 3);
}

async function fetchRecentPlans(days: number): Promise<PlanSummary[]> {
  // Mock: In production, query mesh_plans
  const basePlans: PlanSummary[] = [
    {
      id: 'plan-001',
      title: 'Optimize Autopilot outreach timing based on CoachOS energy patterns',
      systems: ['Autopilot', 'CoachOS'],
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
    },
    {
      id: 'plan-002',
      title: 'Launch production-focused content series',
      systems: ['MIG', 'Talent', 'CMG'],
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
    },
    {
      id: 'plan-003',
      title: 'Refine brand messaging during lifecycle transition',
      systems: ['MAL', 'Identity'],
      status: 'active',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
    },
    {
      id: 'plan-004',
      title: 'Expand electronic music scene engagement',
      systems: ['CIS', 'Scenes', 'RCF'],
      status: 'pending',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
    },
    {
      id: 'plan-005',
      title: 'Implement relationship cooling-off protocol',
      systems: ['RCF', 'MIG'],
      status: 'completed',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
    },
    {
      id: 'plan-006',
      title: 'Cross-platform content distribution system',
      systems: ['Fusion', 'CMG'],
      status: 'pending',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
    },
  ];

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return basePlans.filter((p) => new Date(p.createdAt) >= cutoffDate);
}

async function fetchRecentDrifts(days: number): Promise<DriftReport[]> {
  // Mock: In production, query mesh_drift_reports
  const baseDrifts: DriftReport[] = [
    {
      id: 'drift-001',
      systemsInvolved: ['Autopilot', 'CoachOS'],
      contradictionType: 'workload_energy_mismatch',
      severity: 'high',
      humanSummary: 'Autopilot scheduling conflicts with CoachOS burnout warnings',
      detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'drift-002',
      systemsInvolved: ['MAL', 'Identity'],
      contradictionType: 'lifecycle_identity_drift',
      severity: 'high',
      humanSummary: 'Growth phase pressures conflicting with brand authenticity',
      detectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'drift-003',
      systemsInvolved: ['CIS', 'Scenes'],
      contradictionType: 'investment_participation_gap',
      severity: 'medium',
      humanSummary: 'Resource allocation mismatched with actual scene activity',
      detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return baseDrifts.filter((d) => new Date(d.detectedAt) >= cutoffDate);
}

// ──────────────────────────────────────
// SUMMARY GENERATION
// ──────────────────────────────────────

export async function generateDailySummary(date: Date = new Date()): Promise<DailySummary> {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  console.log(`[MeshOS Insights] Generating daily summary for ${dateStr}...`);

  // Fetch data in parallel
  const [opportunities7d, opportunities30d, opportunities90d, conflicts, plans7d, plans30d, plans90d, drifts] =
    await Promise.all([
      fetchRecentOpportunities(7),
      fetchRecentOpportunities(30),
      fetchRecentOpportunities(90),
      fetchRecentConflicts(7),
      fetchRecentPlans(7),
      fetchRecentPlans(30),
      fetchRecentPlans(90),
      fetchRecentDrifts(7),
    ]);

  // Get top opportunities (max 5)
  const topOpportunities = opportunities7d.slice(0, 5);

  // Get top conflicts (max 5)
  const topConflicts = conflicts.slice(0, 5);

  // Calculate metrics
  const criticalIssues = [...drifts, ...conflicts].filter((item) => item.severity === 'critical').length;

  const summary: DailySummary = {
    date: dateStr,
    generatedAt: new Date().toISOString(),
    opportunities: topOpportunities,
    conflicts: topConflicts,
    plans: {
      last7d: plans7d,
      last30d: plans30d,
      last90d: plans90d,
    },
    drifts,
    metrics: {
      totalOpportunities: opportunities7d.length,
      totalConflicts: conflicts.length,
      totalPlans: plans7d.length,
      totalDrifts: drifts.length,
      criticalIssues,
    },
  };

  console.log(`[MeshOS Insights] Summary generated: ${summary.metrics.totalOpportunities} opps, ${summary.metrics.totalConflicts} conflicts, ${summary.metrics.totalPlans} plans, ${summary.metrics.totalDrifts} drifts`);

  return summary;
}

// ──────────────────────────────────────
// STATE PERSISTENCE
// ──────────────────────────────────────

export function getDailySummaryStateKey(date: Date): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `daily_summary:${dateStr}`;
}

export async function saveDailySummary(
  summary: DailySummary,
  saveFn: (key: string, value: any) => Promise<void>
): Promise<void> {
  const key = getDailySummaryStateKey(new Date(summary.date));
  await saveFn(key, summary);
  console.log(`[MeshOS Insights] Saved daily summary to mesh_state: ${key}`);
}

// ──────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────

/**
 * Get top opportunities by impact
 */
export function getTopOpportunities(summary: DailySummary, limit: number = 5): CrossSystemOpportunity[] {
  const impactWeight = { low: 1, medium: 2, high: 3 };
  return [...summary.opportunities]
    .sort((a, b) => impactWeight[b.impact] - impactWeight[a.impact])
    .slice(0, limit);
}

/**
 * Get top conflicts by severity
 */
export function getTopConflicts(summary: DailySummary, limit: number = 5): CrossSystemConflict[] {
  const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };
  return [...summary.conflicts]
    .sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity])
    .slice(0, limit);
}

/**
 * Get active plans (status = 'active' or 'pending')
 */
export function getActivePlans(summary: DailySummary): PlanSummary[] {
  return summary.plans.last7d.filter((p) => p.status === 'active' || p.status === 'pending');
}

/**
 * Get high-priority plans
 */
export function getHighPriorityPlans(summary: DailySummary): PlanSummary[] {
  return summary.plans.last7d.filter((p) => p.priority === 'high');
}

/**
 * Check if there are critical issues requiring immediate attention
 */
export function hasCriticalIssues(summary: DailySummary): boolean {
  return summary.metrics.criticalIssues > 0;
}
