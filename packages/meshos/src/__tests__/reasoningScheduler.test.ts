/**
 * Tests for MeshOS Reasoning Scheduler
 */

import {
  runScheduledCycle,
  getScheduledReasoningStateKey,
  saveScheduledReasoningResult,
} from '../reasoningScheduler';
import type { ReasoningMode, ScheduledReasoningResult } from '../types';

describe('MeshOS Reasoning Scheduler', () => {
  describe('runScheduledCycle', () => {
    it('should run hourly cycle with correct time window', async () => {
      const result = await runScheduledCycle('hourly');

      expect(result.mode).toBe('hourly');
      expect(result.startedAt).toBeDefined();
      expect(result.finishedAt).toBeDefined();
      expect(result.windowStart).toBeDefined();
      expect(result.windowEnd).toBeDefined();
      expect(result.insights).toBeInstanceOf(Array);

      // Check time window is approximately 1 hour
      const windowStart = new Date(result.windowStart);
      const windowEnd = new Date(result.windowEnd);
      const hoursDiff = (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(1, 1);
    });

    it('should run daily cycle with correct time window', async () => {
      const result = await runScheduledCycle('daily');

      expect(result.mode).toBe('daily');

      // Check time window is approximately 24 hours
      const windowStart = new Date(result.windowStart);
      const windowEnd = new Date(result.windowEnd);
      const hoursDiff = (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(24, 1);
    });

    it('should run weekly cycle with correct time window', async () => {
      const result = await runScheduledCycle('weekly');

      expect(result.mode).toBe('weekly');

      // Check time window is approximately 168 hours (7 days)
      const windowStart = new Date(result.windowStart);
      const windowEnd = new Date(result.windowEnd);
      const hoursDiff = (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60);
      expect(hoursDiff).toBeCloseTo(168, 1);
    });

    it('should detect more opportunities in longer time windows', async () => {
      const hourly = await runScheduledCycle('hourly');
      const daily = await runScheduledCycle('daily');
      const weekly = await runScheduledCycle('weekly');

      // Weekly should detect more or equal opportunities than daily
      expect(weekly.opportunitiesCount).toBeGreaterThanOrEqual(daily.opportunitiesCount);

      // Daily should detect more or equal opportunities than hourly
      expect(daily.opportunitiesCount).toBeGreaterThanOrEqual(hourly.opportunitiesCount);
    });

    it('should detect more conflicts in longer time windows', async () => {
      const hourly = await runScheduledCycle('hourly');
      const daily = await runScheduledCycle('daily');
      const weekly = await runScheduledCycle('weekly');

      expect(weekly.conflictsCount).toBeGreaterThanOrEqual(daily.conflictsCount);
      expect(daily.conflictsCount).toBeGreaterThanOrEqual(hourly.conflictsCount);
    });

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();
      await runScheduledCycle('hourly');
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should generate human-readable insights', async () => {
      const result = await runScheduledCycle('daily');

      expect(result.insights.length).toBeGreaterThan(0);
      result.insights.forEach((insight) => {
        expect(typeof insight).toBe('string');
        expect(insight.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getScheduledReasoningStateKey', () => {
    it('should generate correct state key format', () => {
      const date = new Date('2025-11-18');
      const key = getScheduledReasoningStateKey('daily', date);

      expect(key).toBe('scheduled_reasoning:daily:2025-11-18');
    });

    it('should generate unique keys for different modes', () => {
      const date = new Date('2025-11-18');

      const hourlyKey = getScheduledReasoningStateKey('hourly', date);
      const dailyKey = getScheduledReasoningStateKey('daily', date);
      const weeklyKey = getScheduledReasoningStateKey('weekly', date);

      expect(hourlyKey).not.toBe(dailyKey);
      expect(dailyKey).not.toBe(weeklyKey);
      expect(hourlyKey).not.toBe(weeklyKey);
    });

    it('should generate unique keys for different dates', () => {
      const date1 = new Date('2025-11-18');
      const date2 = new Date('2025-11-19');

      const key1 = getScheduledReasoningStateKey('daily', date1);
      const key2 = getScheduledReasoningStateKey('daily', date2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('saveScheduledReasoningResult', () => {
    it('should call save function with correct key and value', async () => {
      const mockSave = jest.fn();
      const result: ScheduledReasoningResult = {
        mode: 'daily',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        opportunitiesCount: 5,
        conflictsCount: 3,
        driftCount: 2,
        windowStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        windowEnd: new Date().toISOString(),
        insights: ['Test insight'],
      };

      await saveScheduledReasoningResult(result, mockSave);

      expect(mockSave).toHaveBeenCalledTimes(1);
      const [key, value] = mockSave.mock.calls[0];

      expect(key).toMatch(/^scheduled_reasoning:daily:\d{4}-\d{2}-\d{2}$/);
      expect(value).toEqual(result);
    });
  });

  describe('Integration test', () => {
    it('should run full cycle and save result', async () => {
      const savedData: { key: string; value: any }[] = [];
      const mockSave = async (key: string, value: any) => {
        savedData.push({ key, value });
      };

      // Run cycle
      const result = await runScheduledCycle('hourly');

      // Save result
      await saveScheduledReasoningResult(result, mockSave);

      // Verify saved data
      expect(savedData.length).toBe(1);
      expect(savedData[0].key).toMatch(/^scheduled_reasoning:hourly:/);
      expect(savedData[0].value).toEqual(result);
    });
  });
});
