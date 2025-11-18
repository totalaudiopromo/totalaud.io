/**
 * Tests for MeshOS Insight Summariser
 */

import {
  generateDailySummary,
  getDailySummaryStateKey,
  saveDailySummary,
  getTopOpportunities,
  getTopConflicts,
  getActivePlans,
  getHighPriorityPlans,
  hasCriticalIssues,
} from '../insightSummariser';
import type { DailySummary } from '../types';

describe('MeshOS Insight Summariser', () => {
  describe('generateDailySummary', () => {
    it('should generate a daily summary', async () => {
      const summary = await generateDailySummary();

      expect(summary).toBeDefined();
      expect(summary.date).toBeDefined();
      expect(summary.generatedAt).toBeDefined();
      expect(summary.opportunities).toBeInstanceOf(Array);
      expect(summary.conflicts).toBeInstanceOf(Array);
      expect(summary.plans).toBeDefined();
      expect(summary.drifts).toBeInstanceOf(Array);
      expect(summary.metrics).toBeDefined();
    });

    it('should use provided date', async () => {
      const testDate = new Date('2025-11-18');
      const summary = await generateDailySummary(testDate);

      expect(summary.date).toBe('2025-11-18');
    });

    it('should limit opportunities to max 5', async () => {
      const summary = await generateDailySummary();

      expect(summary.opportunities.length).toBeLessThanOrEqual(5);
    });

    it('should limit conflicts to max 5', async () => {
      const summary = await generateDailySummary();

      expect(summary.conflicts.length).toBeLessThanOrEqual(5);
    });

    it('should have valid opportunity structure', async () => {
      const summary = await generateDailySummary();

      summary.opportunities.forEach((opp) => {
        expect(opp.id).toBeDefined();
        expect(opp.systems).toBeInstanceOf(Array);
        expect(opp.systems.length).toBeGreaterThan(0);
        expect(opp.opportunityType).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(opp.impact);
        expect(opp.description).toBeDefined();
      });
    });

    it('should have valid conflict structure', async () => {
      const summary = await generateDailySummary();

      summary.conflicts.forEach((conflict) => {
        expect(conflict.id).toBeDefined();
        expect(conflict.systems).toBeInstanceOf(Array);
        expect(conflict.systems.length).toBeGreaterThan(0);
        expect(conflict.conflictType).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(conflict.severity);
        expect(conflict.description).toBeDefined();
      });
    });

    it('should have valid plan structure', async () => {
      const summary = await generateDailySummary();

      const allPlans = [
        ...summary.plans.last7d,
        ...summary.plans.last30d,
        ...summary.plans.last90d,
      ];

      allPlans.forEach((plan) => {
        expect(plan.id).toBeDefined();
        expect(plan.title).toBeDefined();
        expect(plan.systems).toBeInstanceOf(Array);
        expect(['pending', 'active', 'completed', 'blocked']).toContain(plan.status);
        expect(plan.createdAt).toBeDefined();
      });
    });

    it('should have valid drift structure', async () => {
      const summary = await generateDailySummary();

      summary.drifts.forEach((drift) => {
        expect(drift.id).toBeDefined();
        expect(drift.systemsInvolved).toBeInstanceOf(Array);
        expect(drift.contradictionType).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(drift.severity);
        expect(drift.humanSummary).toBeDefined();
        expect(drift.detectedAt).toBeDefined();
      });
    });

    it('should calculate metrics correctly', async () => {
      const summary = await generateDailySummary();

      expect(summary.metrics.totalOpportunities).toBe(summary.opportunities.length);
      expect(summary.metrics.totalConflicts).toBe(summary.conflicts.length);
      expect(summary.metrics.totalPlans).toBe(summary.plans.last7d.length);
      expect(summary.metrics.totalDrifts).toBe(summary.drifts.length);
      expect(typeof summary.metrics.criticalIssues).toBe('number');
      expect(summary.metrics.criticalIssues).toBeGreaterThanOrEqual(0);
    });

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();
      await generateDailySummary();
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('getDailySummaryStateKey', () => {
    it('should generate correct state key format', () => {
      const date = new Date('2025-11-18');
      const key = getDailySummaryStateKey(date);

      expect(key).toBe('daily_summary:2025-11-18');
    });

    it('should generate unique keys for different dates', () => {
      const date1 = new Date('2025-11-18');
      const date2 = new Date('2025-11-19');

      const key1 = getDailySummaryStateKey(date1);
      const key2 = getDailySummaryStateKey(date2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('saveDailySummary', () => {
    it('should call save function with correct key and value', async () => {
      const mockSave = jest.fn();
      const summary = await generateDailySummary(new Date('2025-11-18'));

      await saveDailySummary(summary, mockSave);

      expect(mockSave).toHaveBeenCalledTimes(1);
      const [key, value] = mockSave.mock.calls[0];

      expect(key).toBe('daily_summary:2025-11-18');
      expect(value).toEqual(summary);
    });
  });

  describe('getTopOpportunities', () => {
    let testSummary: DailySummary;

    beforeEach(async () => {
      testSummary = await generateDailySummary();
    });

    it('should return top 5 opportunities by default', () => {
      const top = getTopOpportunities(testSummary);

      expect(top.length).toBeLessThanOrEqual(5);
    });

    it('should return opportunities ordered by impact', () => {
      const top = getTopOpportunities(testSummary);

      const impactWeight = { low: 1, medium: 2, high: 3 };

      for (let i = 1; i < top.length; i++) {
        expect(impactWeight[top[i - 1].impact]).toBeGreaterThanOrEqual(
          impactWeight[top[i].impact]
        );
      }
    });

    it('should respect custom limit', () => {
      const top3 = getTopOpportunities(testSummary, 3);

      expect(top3.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getTopConflicts', () => {
    let testSummary: DailySummary;

    beforeEach(async () => {
      testSummary = await generateDailySummary();
    });

    it('should return top 5 conflicts by default', () => {
      const top = getTopConflicts(testSummary);

      expect(top.length).toBeLessThanOrEqual(5);
    });

    it('should return conflicts ordered by severity', () => {
      const top = getTopConflicts(testSummary);

      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };

      for (let i = 1; i < top.length; i++) {
        expect(severityWeight[top[i - 1].severity]).toBeGreaterThanOrEqual(
          severityWeight[top[i].severity]
        );
      }
    });

    it('should respect custom limit', () => {
      const top3 = getTopConflicts(testSummary, 3);

      expect(top3.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getActivePlans', () => {
    let testSummary: DailySummary;

    beforeEach(async () => {
      testSummary = await generateDailySummary();
    });

    it('should return only active and pending plans', () => {
      const activePlans = getActivePlans(testSummary);

      activePlans.forEach((plan) => {
        expect(['active', 'pending']).toContain(plan.status);
      });
    });

    it('should filter out completed and blocked plans', () => {
      const activePlans = getActivePlans(testSummary);
      const allPlans = testSummary.plans.last7d;

      expect(activePlans.length).toBeLessThanOrEqual(allPlans.length);
    });
  });

  describe('getHighPriorityPlans', () => {
    let testSummary: DailySummary;

    beforeEach(async () => {
      testSummary = await generateDailySummary();
    });

    it('should return only high priority plans', () => {
      const highPriorityPlans = getHighPriorityPlans(testSummary);

      highPriorityPlans.forEach((plan) => {
        expect(plan.priority).toBe('high');
      });
    });
  });

  describe('hasCriticalIssues', () => {
    let testSummary: DailySummary;

    beforeEach(async () => {
      testSummary = await generateDailySummary();
    });

    it('should return boolean', () => {
      const result = hasCriticalIssues(testSummary);

      expect(typeof result).toBe('boolean');
    });

    it('should match metrics.criticalIssues > 0', () => {
      const result = hasCriticalIssues(testSummary);

      expect(result).toBe(testSummary.metrics.criticalIssues > 0);
    });
  });

  describe('Integration test', () => {
    it('should generate, analyze, and save summary', async () => {
      const savedData: { key: string; value: any }[] = [];
      const mockSave = async (key: string, value: any) => {
        savedData.push({ key, value });
      };

      // Generate summary
      const summary = await generateDailySummary(new Date('2025-11-18'));
      expect(summary).toBeDefined();

      // Analyze summary
      const topOpps = getTopOpportunities(summary, 3);
      expect(topOpps.length).toBeGreaterThan(0);

      const topConflicts = getTopConflicts(summary, 3);
      expect(topConflicts.length).toBeGreaterThan(0);

      const activePlans = getActivePlans(summary);
      expect(activePlans).toBeInstanceOf(Array);

      const highPriorityPlans = getHighPriorityPlans(summary);
      expect(highPriorityPlans).toBeInstanceOf(Array);

      const critical = hasCriticalIssues(summary);
      expect(typeof critical).toBe('boolean');

      // Save summary
      await saveDailySummary(summary, mockSave);
      expect(savedData.length).toBe(1);
      expect(savedData[0].key).toBe('daily_summary:2025-11-18');
    });
  });
});
