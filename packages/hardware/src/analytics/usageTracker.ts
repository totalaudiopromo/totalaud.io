/**
 * Usage Tracker
 * Tracks hardware input usage for analytics and heatmaps
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NormalizedInputEvent } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('UsageTracker');

export interface UsageData {
  inputId: string;
  count: number;
  averageVelocity: number;
  lastUsedAt: Date;
  gestureDetected: boolean;
  gestureType?: string;
}

export interface HeatmapData {
  inputId: string;
  usageCount: number;
  avgVelocity: number;
  intensity: number; // 0-1 normalised
}

export class UsageTracker {
  private supabase: SupabaseClient;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private localCache: Map<string, UsageData> = new Map();

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Set current session
   */
  setSession(sessionId: string, userId: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    this.localCache.clear();

    log.info('Usage tracking session set', { sessionId });
  }

  /**
   * Track input usage
   */
  async trackInput(
    event: NormalizedInputEvent,
    gestureType?: string
  ): Promise<void> {
    if (!this.sessionId || !this.userId) {
      return;
    }

    const inputId = event.inputId;

    // Update local cache
    const existing = this.localCache.get(inputId);
    if (existing) {
      existing.count++;
      existing.averageVelocity =
        (existing.averageVelocity * (existing.count - 1) + (event.velocity || 0)) /
        existing.count;
      existing.lastUsedAt = new Date();
      if (gestureType) {
        existing.gestureDetected = true;
        existing.gestureType = gestureType;
      }
    } else {
      this.localCache.set(inputId, {
        inputId,
        count: 1,
        averageVelocity: event.velocity || 0,
        lastUsedAt: new Date(),
        gestureDetected: !!gestureType,
        gestureType,
      });
    }

    // Persist to database (async, don't wait)
    this.persistUsage(event, gestureType).catch((error) => {
      log.error('Failed to persist usage', error);
    });
  }

  /**
   * Persist usage to database
   */
  private async persistUsage(
    event: NormalizedInputEvent,
    gestureType?: string
  ): Promise<void> {
    if (!this.sessionId || !this.userId) return;

    try {
      await this.supabase.rpc('increment_hardware_usage', {
        p_session_id: this.sessionId,
        p_user_id: this.userId,
        p_input_type: event.inputType,
        p_input_id: event.inputId,
        p_velocity: event.velocity || null,
        p_gesture_type: gestureType || null,
      });
    } catch (error) {
      log.error('Failed to increment usage', error);
    }
  }

  /**
   * Get heatmap data
   */
  async getHeatmap(sessionId?: string): Promise<HeatmapData[]> {
    if (!this.userId) {
      return [];
    }

    try {
      const { data, error } = await this.supabase.rpc('get_hardware_usage_heatmap', {
        p_user_id: this.userId,
        p_session_id: sessionId || null,
      });

      if (error) throw error;

      // Normalise intensity (0-1 based on max usage)
      const maxUsage = Math.max(...data.map((d: any) => d.usage_count), 1);

      return data.map((item: any) => ({
        inputId: item.input_id,
        usageCount: item.usage_count,
        avgVelocity: item.avg_velocity || 0,
        intensity: item.usage_count / maxUsage,
      }));
    } catch (error) {
      log.error('Failed to get heatmap', error);
      return [];
    }
  }

  /**
   * Calculate creative flow score
   */
  async calculateFlowScore(sessionId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('calculate_flow_score', {
        p_session_id: sessionId,
      });

      if (error) throw error;

      return data || 0;
    } catch (error) {
      log.error('Failed to calculate flow score', error);
      return 0;
    }
  }

  /**
   * Get usage statistics
   */
  getLocalStats(): {
    totalInputs: number;
    uniqueInputs: number;
    mostUsedInputs: UsageData[];
  } {
    const usageArray = Array.from(this.localCache.values());

    return {
      totalInputs: usageArray.reduce((sum, item) => sum + item.count, 0),
      uniqueInputs: usageArray.length,
      mostUsedInputs: usageArray.sort((a, b) => b.count - a.count).slice(0, 10),
    };
  }
}
